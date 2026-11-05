import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parts,categories} from '../data/parts';
import {sovereignPartIds,sovereignEquipment,isSovereignPart} from '../data/sovereignParts';
import {equipmentSlots,type Equipment} from '../data/machine';
import {modelShops} from '../data/world';
import {isStocked} from '../data/progression';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {machinePerformance,createDrivingState,startDriving,stepDriving} from './driving';
import {batteryCharge,motorFactor} from './condition';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {partGuidance} from '../data/partGuidance';
import {searchLibrary} from '../data/library';
function drive(id:CircuitId,e=sovereignEquipment){const t=getCircuitTrack(id),p=machinePerformance(e,{motorSeconds:60,batterySeconds:0});let d=startDriving(createDrivingState());for(let i=0;i<120*240&&d.status==='running';i++)d=stepDriving(d,p,0,2,t.circuit.surface,t);assert.equal(d.status,'finished',id);return d.time;}
test('星皇は11カテゴリ・13品、工房専売・各25万円。全装備枠を異なる補助3品と共用ローラーで満たす',()=>{
 const list=parts.filter(p=>isSovereignPart(p.id));assert.equal(list.length,13);assert.equal(new Set(list.map(p=>p.category)).size,Object.keys(categories).length);assert.equal(new Set(sovereignPartIds).size,13);
 for(const p of list){assert.equal(p.price,250000);assert.equal(p.level,10);assert.ok(partGuidance(p).use.includes('星皇'));assert.ok(searchLibrary('all','星皇').some(r=>r.id===p.id));for(const shop of Object.values(modelShops))assert.equal(isStocked(p,shop),shop.id==='atelier');}
 for(const [slot,id] of Object.entries(sovereignEquipment))assert.equal(parts.find(p=>p.id===id)!.category,equipmentSlots[slot as keyof Equipment].category);
 assert.equal(new Set([sovereignEquipment.accessory,sovereignEquipment.accessory2,sovereignEquipment.accessory3]).size,3);
});
test('回転数・トルク・効率・軽量性などの主要性能は各種の最上位。ギア比と悪路追従は選び分ける',()=>{
 for(const [id,key,better] of [['motor-sovereign','rpm','max'],['motor-sovereign','torque','max'],['chassis-sovereign','efficiency','max'],['chassis-sovereign','stability','max'],['chassis-sovereign','weight','min'],['body-sovereign','drag','min'],['body-sovereign','stability','max'],['body-sovereign','weight','min'],['battery-sovereign','power','max'],['battery-sovereign','weight','min'],['tire-sovereign','grip','max'],['tire-sovereign','weight','min'],['wheel-sovereign','cornerDrag','min'],['roller-sovereign','friction','min'],['roller-sovereign','stability','max'],['shaft-sovereign','weight','min'],['terminal-sovereign','efficiency','max'],['gear-sovereign','weight','min'],['accessory-sovereign-drive','efficiency','max'],['accessory-sovereign-gyro','stability','max'],['accessory-sovereign-damper','damping','max']] as const){
  const p=parts.find(p=>p.id===id)!,others=parts.filter(r=>r.category===p.category&&!isSovereignPart(r.id)&&r.specs[key]!==undefined).map(r=>r.specs[key]);assert.ok(better==='max'?p.specs[key]>=Math.max(...others):p.specs[key]<=Math.min(...others),`${id}:${key}`);
 }
 assert.equal(motorFactor(100000,'motor-sovereign'),1);assert.equal(batteryCharge('battery-sovereign',100000),1);
});
test('星皇一式は全コース完走し、悪路タイヤ混成はダートで速く、舗装では星皇スリックが速い',()=>{
 for(const id of ['leaf','wind','sun','grove','comet','trail','grandprix','forge','zenith'] as const)drive(id);
 const mixed={...sovereignEquipment,tire:'tire-dunepro'};
 const dirt=drive('sun'),mixedDirt=drive('sun',mixed),paved=drive('wind'),mixedPaved=drive('wind',mixed);
 assert.ok(mixedDirt<dirt*.97,`${mixedDirt} < ${dirt}`);assert.ok(paved<mixedPaved*.95,`${paved} < ${mixedPaved}`);
 // Different ratios still matter even with the strongest lightweight gear.
 assert.ok(drive('wind',{...sovereignEquipment,gear:'gear-3.5'})<paved);
});
test('初期から全品を購入・装着・保存再開でき、所持数と財布・主進行を維持する',async()=>{
 const original=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',money:3250000,openingStep:9,tutorialStage:'done'},true);useGame.getState().enterShop('atelier');for(const id of sovereignPartIds)useGame.getState().buy(id);assert.equal(useGame.getState().money,0);
  for(const [slot,id] of Object.entries(sovereignEquipment))useGame.getState().equip(id,slot as keyof Equipment);assert.deepEqual(useGame.getState().equipment,sovereignEquipment);for(const id of sovereignPartIds)assert.equal(useGame.getState().inventory[id],1);
  const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>save,write:async()=>{}});assert.deepEqual(useGame.getState().equipment,sovereignEquipment);assert.equal(useGame.getState().money,0);assert.equal(useGame.getState().legendRaceCompleted,false);assert.equal(useGame.getState().finalQualified,false);
 }finally{useGame.setState(original,true);}
});
