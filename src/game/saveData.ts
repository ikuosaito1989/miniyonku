import { parts } from '../data/parts';
import { createStarterInventory, equipmentSlots, type Equipment, type EquipmentSlot } from '../data/machine';
import { hintBooks, nextShopRace } from '../data/shopHints';
import type { GameState } from './store';
import type { UnitInventory } from './condition';
import { modelShops, type WorldLocation, type ShopId } from '../data/world';

export type SavedGame=Pick<GameState,'money'|'inventory'|'equipment'|'units'|'selectedUnits'|'unitSerial'|'proficiencyPoints'|'unlockedRaces'|'hintBookIndex'|'legendEventSeen'|'cheatUsed'|'location'|'lastShop'|'legendRaceCompleted'|'aozoraWon'|'villainDefeated'>;
export interface SaveData { version:1; savedAt:number; game:SavedGame }
export function snapshotGame(state:SavedGame):SavedGame{
  return structuredClone({money:state.money,inventory:state.inventory,equipment:state.equipment,units:state.units,selectedUnits:state.selectedUnits,unitSerial:state.unitSerial,proficiencyPoints:state.proficiencyPoints,unlockedRaces:state.unlockedRaces,hintBookIndex:state.hintBookIndex,legendEventSeen:state.legendEventSeen,cheatUsed:state.cheatUsed,location:state.location,lastShop:state.lastShop,legendRaceCompleted:state.legendRaceCompleted,aozoraWon:state.aozoraWon,villainDefeated:state.villainDefeated});
}
function object(value:unknown):Record<string,unknown>{
  if(!value||typeof value!=='object'||Array.isArray(value))throw new Error('セーブデータの形式が不正です。');
  return value as Record<string,unknown>;
}
function number(value:unknown,integer=false):number{
  if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>Number.MAX_SAFE_INTEGER||(integer&&!Number.isSafeInteger(value)))throw new Error('セーブ内の数値が不正です。');
  return value;
}
export function decodeSave(value:unknown):SaveData{
  const root=object(value);
  if(root.version!==1)throw new Error('このバージョンのセーブデータには対応していません。');
  const savedAt=number(root.savedAt,true),game=object(root.game),inventory:Record<string,number>={};
  const byId=new Map(parts.map(p=>[p.id,p]));
  for(const [id,count]of Object.entries(object(game.inventory))){
    if(!byId.has(id))throw new Error('未知のパーツが含まれています。');
    inventory[id]=number(count,true);
    if(inventory[id]>100000)throw new Error('所持数が上限を超えています。');
  }
  for(const [id,count]of Object.entries(createStarterInventory()))if(!(id==='motor-rescue'&&inventory[id]===undefined)&&(inventory[id]??0)<count)throw new Error('初期パーツが不足しています。');
  const equipment=object(game.equipment),counts:Record<string,number>={};
  if(Object.keys(equipment).length!==Object.keys(equipmentSlots).length)throw new Error('装備枠が不正です。');
  for(const slot of Object.keys(equipmentSlots) as EquipmentSlot[]){
    const id=equipment[slot],part=typeof id==='string'?byId.get(id):undefined;
    if(!part||part.category!==equipmentSlots[slot].category)throw new Error('装備の種類が不正です。');
    // Roller inventory counts complete sets; one set equips every position.
    if(part.category==='roller')counts[part.id]=1;
    else counts[part.id]=(counts[part.id]??0)+1;
    if(counts[part.id]>(inventory[part.id]??0))throw new Error('未所持のパーツを装備しています。');
  }
  const units:UnitInventory={},ids=new Set<string>();let maxSerial=0;
  for(const [id,list]of Object.entries(object(game.units))){
    const part=byId.get(id);
    if(!part||!['motor','battery'].includes(part.category)||!Array.isArray(list)||list.length!==(inventory[id]??0))throw new Error('個体と所持数が一致しません。');
    units[id]=list.map(value=>{
      const unit=object(value);
      if(typeof unit.id!=='string'||!unit.id||unit.id.length>80||ids.has(unit.id))throw new Error('個体IDが不正です。');
      ids.add(unit.id);maxSerial=Math.max(maxSerial,Number(unit.id.match(/^unit-(\d+)$/)?.[1]??0));
      return {id:unit.id,seconds:number(unit.seconds)};
    });
  }
  for(const [id,count]of Object.entries(inventory))if(['motor','battery'].includes(byId.get(id)!.category)&&count!==(units[id]?.length??0))throw new Error('電池かモーターの個体が不足しています。');
  const selected=object(game.selectedUnits),selectedUnits={} as SavedGame['selectedUnits'];
  for(const slot of ['motor','battery'] as const){
    const id=selected[slot];
    if(typeof id!=='string'||!units[equipment[slot] as string]?.some(u=>u.id===id))throw new Error('使用個体が見つかりません。');
    selectedUnits[slot]=id;
  }
  const unitSerial=number(game.unitSerial,true);
  if(unitSerial<maxSerial)throw new Error('個体番号の連番が不正です。');
  if(!Array.isArray(game.unlockedRaces)||game.unlockedRaces.some(id=>id!==nextShopRace.id)||new Set(game.unlockedRaces).size!==game.unlockedRaces.length)throw new Error('参加資格が不正です。');
  const hintBookIndex=number(game.hintBookIndex,true);
  if(hintBookIndex>=hintBooks.length)throw new Error('本棚のページが不正です。');
  // 追加以前のセーブにも無料予備を付与。財布や装備・既存個体には触れない。
  if(inventory['motor-rescue']===undefined){
    let id='starter-rescue-motor';while(ids.has(id))id+='-free';
    inventory['motor-rescue']=1;units['motor-rescue']=[{id,seconds:0}];
  }
  if(game.legendEventSeen!==undefined&&typeof game.legendEventSeen!=='boolean')throw new Error('イベント記録が不正です。');
  if(game.cheatUsed!==undefined&&typeof game.cheatUsed!=='boolean')throw new Error('裏技記録が不正です。');
  if(game.legendRaceCompleted!==undefined&&typeof game.legendRaceCompleted!=='boolean')throw new Error('兄弟レースの記録が不正です。');
  const location=game.location??'komorebi',lastShop=game.lastShop??'komorebi';
  if(typeof location!=='string'||location!=='town'&&!Object.hasOwn(modelShops,location)||typeof lastShop!=='string'||!Object.hasOwn(modelShops,lastShop))throw new Error('現在地が不正です。');
  const legendRaceCompleted=game.legendRaceCompleted===true;
  if((legendRaceCompleted||location!=='komorebi'||lastShop!=='komorebi')&&(!game.unlockedRaces.includes(nextShopRace.id)||!legendRaceCompleted))throw new Error('街の解放条件を満たしていません。');
  for(const key of ['aozoraWon','villainDefeated'])if(game[key]!==undefined&&typeof game[key]!=='boolean')throw new Error('あおぞらのイベント記録が不正です。');
  const aozoraWon=game.aozoraWon===true,villainDefeated=game.villainDefeated===true;
  if(aozoraWon&&!legendRaceCompleted||villainDefeated&&!aozoraWon||(location==='hinata'||lastShop==='hinata')&&!villainDefeated)throw new Error('ひなた模型店の解放条件を満たしていません。');
  return {version:1,savedAt,game:{money:number(game.money,true),inventory,equipment:{...equipment} as Equipment,units,selectedUnits,unitSerial,proficiencyPoints:number(game.proficiencyPoints),unlockedRaces:[...game.unlockedRaces] as string[],hintBookIndex,legendEventSeen:game.legendEventSeen===true,cheatUsed:game.cheatUsed===true,location:location as WorldLocation,lastShop:lastShop as ShopId,legendRaceCompleted,aozoraWon,villainDefeated}};
}
