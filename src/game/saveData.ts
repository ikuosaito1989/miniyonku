import {yuunagiTimeLimit} from '../data/yuunagiCircuit';
import {emptyCup,legacyCup,decodeCup,cupProgression} from './cup';
import type { RaceReview } from './raceAdvice';
import { parts } from '../data/parts';
import { createStarterInventory, equipmentSlots, type Equipment, type EquipmentSlot } from '../data/machine';
import { hintBooks, nextShopRace } from '../data/shopHints';
import type { GameState } from './store';
import type { UnitInventory } from './condition';
import { modelShops, type WorldLocation, type ShopId } from '../data/world';

export type SavedGame=Pick<GameState,'yuunagiUnlocked'|'yuunagiBestTime'|'finalQualified'|'wakabaCup'|'technicalCup'|'gameOver'|'wakabaUnlocked'|'thirdOfficialQualified'|'townReturnVenue'|'officialQualified'|'officialWon'|'officialSpeedWon'|'officialDirtWon'|'money'|'inventory'|'equipment'|'units'|'selectedUnits'|'unitSerial'|'proficiencyPoints'|'unlockedRaces'|'hintBookIndex'|'legendEventSeen'|'cheatUsed'|'location'|'lastShop'|'legendRaceCompleted'|'aozoraWon'|'villainDefeated'|'lastRaceReview'|'doctorGiftReceived'>;
export interface SaveData { version:1; savedAt:number; game:SavedGame }
export function snapshotGame(state:SavedGame):SavedGame{
  return structuredClone({yuunagiUnlocked:state.yuunagiUnlocked,yuunagiBestTime:state.yuunagiBestTime,finalQualified:state.finalQualified,wakabaCup:state.wakabaCup,technicalCup:state.technicalCup,gameOver:state.gameOver,wakabaUnlocked:state.wakabaUnlocked,thirdOfficialQualified:state.thirdOfficialQualified,townReturnVenue:state.townReturnVenue,officialSpeedWon:state.officialSpeedWon,officialDirtWon:state.officialDirtWon,officialQualified:state.officialQualified,officialWon:state.officialWon,doctorGiftReceived:state.doctorGiftReceived,lastRaceReview:state.lastRaceReview,money:state.money,inventory:state.inventory,equipment:state.equipment,units:state.units,selectedUnits:state.selectedUnits,unitSerial:state.unitSerial,proficiencyPoints:state.proficiencyPoints,unlockedRaces:state.unlockedRaces,hintBookIndex:state.hintBookIndex,legendEventSeen:state.legendEventSeen,cheatUsed:state.cheatUsed,location:state.location,lastShop:state.lastShop,legendRaceCompleted:state.legendRaceCompleted,aozoraWon:state.aozoraWon,villainDefeated:state.villainDefeated});
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
  for(const [id,count]of Object.entries(createStarterInventory()))if(!['motor','battery'].includes(byId.get(id)!.category)&&(inventory[id]??0)<count)throw new Error('初期パーツが不足しています。');
  const equipment={...object(game.equipment)};
  // 旧セーブの補助パーツを①に保持し、追加枠は空で復元する。
  if(equipment.accessory2===undefined)equipment.accessory2='accessory-none';
  if(equipment.accessory3===undefined)equipment.accessory3='accessory-none';
  const counts:Record<string,number>={};
  if(Object.keys(equipment).length!==Object.keys(equipmentSlots).length)throw new Error('装備枠が不正です。');
  for(const slot of Object.keys(equipmentSlots) as EquipmentSlot[]){
    const id=equipment[slot],part=typeof id==='string'?byId.get(id):undefined;
    if(!part||part.category!==equipmentSlots[slot].category)throw new Error('装備の種類が不正です。');
    // Roller inventory counts complete sets; one set equips every position.
    if(part.id==='accessory-none')continue;
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
  // モーター・電池は種類ごとに1個。装着中は選択した個体と消耗を保持する。
  for(const slot of ['motor','battery'] as const){
    for(const part of parts)if(part.category===slot&&inventory[part.id]>0){
      const retained=part.id===equipment[slot]?units[part.id].find(unit=>unit.id===selectedUnits[slot])!:units[part.id][0];
      inventory[part.id]=1;units[part.id]=[retained];
    }
  }
  let lastRaceReview:RaceReview|null=null;
  if(game.lastRaceReview!==undefined&&game.lastRaceReview!==null){
    const review=object(game.lastRaceReview);
    if(!['leaf','wind','sun','sprint','grove','comet','trail'].includes(review.circuitId as string)||typeof review.text!=='string'||review.text.length>4000)throw new Error('レース相談の記録が不正です。');
    lastRaceReview={circuitId:review.circuitId as RaceReview['circuitId'],text:review.text};
  }
  if(game.legendEventSeen!==undefined&&typeof game.legendEventSeen!=='boolean')throw new Error('イベント記録が不正です。');
  if(game.cheatUsed!==undefined&&typeof game.cheatUsed!=='boolean')throw new Error('裏技記録が不正です。');
  if(game.legendRaceCompleted!==undefined&&typeof game.legendRaceCompleted!=='boolean')throw new Error('兄弟レースの記録が不正です。');
  const location=game.location??'komorebi',lastShop=game.lastShop??'komorebi';
  if(typeof location!=='string'||location!=='town'&&location!=='stadium-5'&&location!=='stadium-9'&&!Object.hasOwn(modelShops,location)||typeof lastShop!=='string'||!Object.hasOwn(modelShops,lastShop))throw new Error('現在地が不正です。');
  const legendRaceCompleted=game.legendRaceCompleted===true;
  if(game.doctorGiftReceived!==undefined&&typeof game.doctorGiftReceived!=='boolean')throw new Error('博士の贈呈記録が不正です。');
  const doctorGiftReceived=game.doctorGiftReceived===true;
  if(doctorGiftReceived&&(!legendRaceCompleted||!(inventory['body-champion']>=1)))throw new Error('博士の贈呈条件を満たしていません。');
  if((legendRaceCompleted||(location!=='komorebi'&&location!=='atelier'&&location!=='town')||(lastShop!=='komorebi'&&lastShop!=='atelier'))&&(!game.unlockedRaces.includes(nextShopRace.id)||!legendRaceCompleted))throw new Error('街の解放条件を満たしていません。');
  for(const key of ['finalQualified','yuunagiUnlocked','gameOver','wakabaUnlocked','thirdOfficialQualified','officialSpeedWon','officialDirtWon','officialQualified','officialWon','aozoraWon','villainDefeated'])if(game[key]!==undefined&&typeof game[key]!=='boolean')throw new Error('あおぞらのイベント記録が不正です。');
  const aozoraWon=game.aozoraWon===true,villainDefeated=game.villainDefeated===true;
  if(aozoraWon&&!legendRaceCompleted||villainDefeated&&!aozoraWon||(location==='hinata'||lastShop==='hinata')&&!villainDefeated)throw new Error('ひなた模型店の解放条件を満たしていません。');
  if(game.officialQualified===true&&!villainDefeated||game.officialWon===true&&game.officialQualified!==true)throw new Error('公式レースの出場条件を満たしていません。');
  const wakabaCup=decodeCup(game.wakabaCup,'wakaba',legacyCup(game.officialSpeedWon===true,game.officialDirtWon===true,game.officialWon===true));
  const technicalCup=decodeCup(game.technicalCup,'technical',emptyCup());
  const progression=cupProgression(wakabaCup,technicalCup,game.thirdOfficialQualified===true);
  if((wakabaCup.entered||technicalCup.entered)&&game.officialQualified!==true)throw new Error('公式会場の入場条件を満たしていません。');
  if(progression.thirdOfficialQualified&&!progression.wakabaUnlocked)throw new Error('第3公式大会の出場条件を満たしていません。');
  if((location==='wakaba'||lastShop==='wakaba')&&!progression.wakabaUnlocked)throw new Error('わかば模型店の解放条件を満たしていません。');
  const yuunagiBestTime=game.yuunagiBestTime??null;
  if(yuunagiBestTime!==null&&(typeof yuunagiBestTime!=='number'||!Number.isFinite(yuunagiBestTime)||yuunagiBestTime<=0||yuunagiBestTime>1e6))throw new Error('夕凪のタイム記録が不正です。');
  if((location==='yuunagi'||lastShop==='yuunagi'||yuunagiBestTime!==null)&&!progression.yuunagiUnlocked)throw new Error('ゆうなぎ模型店の解放条件を満たしていません。');
  const finalQualified=progression.yuunagiUnlocked&&yuunagiBestTime!==null&&yuunagiBestTime<=yuunagiTimeLimit;
  const townReturnVenue=game.townReturnVenue??null;
  if(townReturnVenue!==null&&townReturnVenue!=='stadium-5'&&townReturnVenue!=='stadium-9'||(location==='stadium-5'||townReturnVenue==='stadium-5')&&game.officialQualified!==true||(location==='stadium-9'||townReturnVenue==='stadium-9')&&!progression.thirdOfficialQualified)throw new Error('公式会場の入場条件を満たしていません。');
  const officialSpeedWon=progression.officialSpeedWon,officialDirtWon=progression.officialDirtWon;
  return {version:1,savedAt,game:{...progression,yuunagiBestTime,finalQualified,townReturnVenue,officialSpeedWon,officialDirtWon,officialQualified:game.officialQualified===true,doctorGiftReceived,lastRaceReview,money:number(game.money,true),inventory,equipment:{...equipment} as Equipment,units,selectedUnits,unitSerial,proficiencyPoints:number(game.proficiencyPoints),unlockedRaces:[...game.unlockedRaces] as string[],hintBookIndex,legendEventSeen:game.legendEventSeen===true,cheatUsed:game.cheatUsed===true,location:location as WorldLocation,lastShop:lastShop as ShopId,legendRaceCompleted,aozoraWon,villainDefeated}};
}
