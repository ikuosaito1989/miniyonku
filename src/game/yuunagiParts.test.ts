import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {legacyCup,cupProgression} from './cup';
import {equippedCondition,type MachineCondition} from './condition';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {parts} from '../data/parts';
import {modelShops} from '../data/world';
import {isStocked} from '../data/progression';
import {starterEquipment,type Equipment} from '../data/machine';
import {partGuidance} from '../data/partGuidance';
import {purchase} from './purchase';
import {equipPart} from './equipment';
import {machinePerformance} from './driving';
import {createRaceState,startRace,stepRace,launchPlayer} from './race';
import {buildMachineModel} from './MachineModel';
const ids=['accessory-slide-rear','roller-ceramic','roller-lowdouble','motor-surge','wheel-floating','tire-landing'];
const old:Equipment={...starterEquipment,body:'body-arrow',motor:'motor-torque',gear:'gear-4',tire:'tire-1',chassis:'chassis-low',wheel:'wheel-light',rollerFront:'roller-1',rollerRear:'roller-1',accessory:'accessory-weight',accessory2:'accessory-support',accessory3:'accessory-damper-light',battery:'battery-endurance',terminal:'terminal-1'};
const wakaba:Equipment={...old,body:'body-champion',motor:'motor-rally',tire:'tire-turn',chassis:'chassis-turn',wheel:'wheel-diff',rollerFront:'roller-2',rollerSide:'roller-2',rollerRear:'roller-2',accessory:'accessory-stabilizer',shaft:'shaft-1'};
const upgraded:Equipment={...wakaba,motor:'motor-surge',tire:'tire-landing',wheel:'wheel-floating',accessory3:'accessory-slide-rear',rollerFront:'roller-ceramic',rollerSide:'roller-ceramic',rollerRear:'roller-lowdouble'};
function run(e:Equipment,seed=42,condition:MachineCondition={motorSeconds:60,batterySeconds:0}){let race=startRace(createRaceState(e,seed,condition,false,'trail'));while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);for(let i=0;i<120*100&&race.phase!=='finished';i++)race=stepRace(race);return race;}
test('新作6種類はLv6のゆうなぎで購入でき、説明・注意点があり、旧店舗には並ばない',()=>{
 let wallet={money:20000,inventory:{} as Record<string,number>};
 for(const id of ids){const part=parts.find(p=>p.id===id)!;assert.equal(part.level,6);for(const shop of Object.values(modelShops))assert.equal(isStocked(part,shop),shop.id==='yuunagi');const result=purchase(wallet,id,modelShops.yuunagi);assert.ok(result.success);wallet=result.wallet;assert.ok(partGuidance(part).use.length>20);assert.ok(partGuidance(part).tradeoff.length>20);}
 let equipment={...starterEquipment};for(const slot of ['rollerFront','rollerSide','rollerRear'] as const)equipment=equipPart(equipment,wallet.inventory,'roller-ceramic',slot);
 assert.equal(wallet.inventory['roller-ceramic'],1);assert.ok(['rollerFront','rollerSide','rollerRear'].every(slot=>equipment[slot as keyof Equipment]==='roller-ceramic'));
 equipment=equipPart(equipment,wallet.inventory,'accessory-slide-rear','accessory3');assert.equal(equipment.accessory3,'accessory-slide-rear');assert.equal(equipPart(equipment,wallet.inventory,'accessory-slide-rear','accessory2').accessory2,'accessory-none');
});
test('スライドと新作ローラーは制振・安定・抵抗に効き、過去の市販装備を生かして40秒を切れる',()=>{
 const before=machinePerformance(wakaba),after=machinePerformance(upgraded);assert.ok(after.damping>before.damping);assert.ok(after.lateralLimit>before.lateralLimit);assert.ok(after.drag<before.drag);assert.ok(after.cornerDrag<before.cornerDrag);
 const previous=run(wakaba);assert.equal(previous.racers[0].driving.status,'finished');assert.ok(previous.racers[0].driving.time>40);
 for(const seed of [1,42,999]){const race=run(upgraded,seed),player=race.racers[0];assert.equal(player.driving.status,'finished');assert.equal(player.driving.landings,1);assert.ok(player.driving.time>38&&player.driving.time<40);}
 for(const slot of ['motor','tire','wheel','rollerFront','rollerSide','rollerRear','accessory3'] as const){const race=run({...wakaba,[slot]:upgraded[slot]});assert.equal(race.racers[0].driving.status,'finished');assert.ok(race.racers[0].driving.time<=previous.racers[0].driving.time,slot+' must not slow the same setup');}
});
test('スライドはウイング下に付き、リヤ欄で選んだローラーを可動ステーへ取り付ける',()=>{
 for(const slot of ['accessory','accessory2','accessory3'] as const){const e={...old,body:'body-champion',[slot]:'accessory-slide-rear',rollerRear:'roller-lowdouble'},model=buildMachineModel(0xffffff,e);
 const carriage=model.getObjectByName('rear-slide-carriage')!,roller=model.getObjectByName('roller-rollerRear-roller-lowdouble')!;
 assert.equal(roller.parent,carriage);assert.ok(model.getObjectByName('rear-slide-return-spring'));assert.ok(model.getObjectByName('double-roller-upper'));assert.equal(model.getObjectByName('roller-rollerFront-roller-1')?.parent,model);
 const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.x<.22&&size.z<.3&&size.y<.13);
 model.traverse(o=>{if(o instanceof THREE.Mesh){for(const value of o.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));o.geometry.dispose();o.material.dispose();}});
 }
});

test('新作を実際に購入・装着してタイムアタックをクリアし、装備と出場権を保存・再開できる',async()=>{
 const previous=useGame.getState();try{
  const wk=legacyCup(true,true),technical={entered:true,pending:null,results:[{...wk.results[0],circuitId:'comet' as const}]};
  useGame.setState({...useGame.getInitialState(),...cupProgression(wk,technical,true),legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:['aozora-entry'],location:'yuunagi',lastShop:'yuunagi',doctorGiftReceived:true,inventory:{...useGame.getInitialState().inventory,'body-champion':1},money:40000});
  for(const id of new Set([...ids,...Object.values(upgraded)]))if(id!=='accessory-none')useGame.getState().buy(id);
  for(const [slot,id] of Object.entries(upgraded))useGame.getState().equip(id,slot as keyof Equipment);
  assert.deepEqual(useGame.getState().equipment,upgraded);
  useGame.getState().openSetting();useGame.getState().breakIn();useGame.getState().breakIn();useGame.getState().close();useGame.getState().startTrial();
  const s=useGame.getState(),race=run(s.equipment,42,equippedCondition(s.equipment,s.units,s.selectedUnits));
  assert.equal(race.racers[0].driving.status,'finished');assert.ok(race.racers[0].driving.time<40);useGame.getState().settleRace(s.raceAttempt,race);assert.equal(useGame.getState().finalQualified,true);
  const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>save,write:async()=>{}});
  assert.deepEqual(useGame.getState().equipment,upgraded);assert.equal(useGame.getState().finalQualified,true);
  for(const id of ids)assert.equal(useGame.getState().inventory[id],1);
 }finally{useGame.setState(previous,true);}
});
