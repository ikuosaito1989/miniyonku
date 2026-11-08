import {test} from 'node:test';
import assert from 'node:assert/strict';
import {specialtyParts,specialtyShopIds,specialtyStock} from '../data/specialtyParts';
import {modelShops,townVenues,townBlocks,townSpawn,townWalkBounds,canEnterShop,townRoads} from '../data/world';
import {isStocked} from '../data/progression';
import {searchLibrary,librarySource} from '../data/library';
import {parts} from '../data/parts';
import {starterEquipment} from '../data/machine';
import {zenithEquipment} from '../data/zenithRace';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {machinePerformance,createDrivingState,startDriving,stepDriving} from './driving';
import {useGame} from './store';
import {decodeSave,snapshotGame} from './saveData';
import {canStand,findWalkingPath} from './navigation';
import {buildMachineModel} from './MachineModel';
test('four specialty shops have exclusive stock, catalog entries and reachable street entrances',()=>{
 assert.equal(specialtyParts.length,40);
 const obstacles=[...townVenues.map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...townBlocks.map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}))];
 for(const id of specialtyShopIds){
  assert.equal(specialtyStock(id).length,10);assert.ok(canEnterShop(id,{legendRaceCompleted:false,villainDefeated:false}));
  const v=townVenues.find(v=>v.id===id)!;assert.ok(v);
  for(const road of townRoads.vertical)assert.ok(road<v.x-43||road>v.x+v.w+43);
  assert.ok(canStand(townSpawn(id),obstacles,townWalkBounds));
  assert.ok(findWalkingPath(townSpawn('library'),townSpawn(id),obstacles,townWalkBounds).length>0,id);
  for(const pid of specialtyStock(id)){
   const part=parts.find(p=>p.id===pid)!;assert.ok(searchLibrary('all',part.name).some(p=>p.id===pid));assert.match(librarySource(part),new RegExp(modelShops[id].name));
   for(const shop of Object.values(modelShops))assert.equal(isStocked(part,shop),shop.id===id);
  }
 }
});
test('buy, equip and save in every new shop without changing story progression or allowing shop races',()=>{
 const original=useGame.getState();try{for(const id of specialtyShopIds){
  useGame.setState({...useGame.getInitialState(),location:'town',money:100000,openingStep:9,tutorialStage:'done'},true);
  useGame.getState().enterShop(id);assert.equal(useGame.getState().location,id);
  for(const pid of specialtyStock(id))useGame.getState().buy(pid);
  const state=useGame.getState();for(const pid of specialtyStock(id))assert.equal(state.inventory[pid],1);
  assert.equal(state.legendRaceCompleted,false);assert.equal(state.officialQualified,false);
  const saved=decodeSave({version:1,savedAt:1,game:snapshotGame(state)}).game;assert.equal(saved.location,id);assert.deepEqual(saved.equipment,state.equipment);
  useGame.getState().close();useGame.getState().startTrial();assert.notEqual(useGame.getState().overlay,'race');
 }}finally{useGame.setState(original,true);}
});
function drive(id:CircuitId,gear:string,tire:string){const t=getCircuitTrack(id),p=machinePerformance({...zenithEquipment,motor:'motor-special-torque-pull',gear,tire},{motorSeconds:60,batterySeconds:0});let d=startDriving(createDrivingState());for(let i=0;i<120*150&&d.status==='running';i++)d=stepDriving(d,p,0,2,t.circuit.surface,t);return d;}
test('speed and offroad combinations reverse their advantage on actual race physics',()=>{
 const speed={gear:'gear-special-velocity-high',tire:'tire-special-velocity-slick'},dirt={gear:'gear-special-terrain-rally',tire:'tire-special-terrain-block'};
 const a=drive('sprint',speed.gear,speed.tire),b=drive('sprint',dirt.gear,dirt.tire);assert.equal(a.status,'finished');assert.equal(b.status,'finished');assert.ok(a.time<b.time);
 const c=drive('sun',speed.gear,speed.tire),d=drive('sun',dirt.gear,dirt.tire);assert.equal(d.status,'finished');assert.ok(c.status==='running'||c.time>d.time);
 const high=machinePerformance({...starterEquipment,motor:'motor-special-velocity-dash'}),torque=machinePerformance({...starterEquipment,motor:'motor-special-torque-pull'});assert.ok(high.freeSpeed>torque.freeSpeed);assert.ok(high.stallForce<torque.stallForce);
});
test('specialist accessories and FM chassis appear on the installed machine',()=>{
 const car=buildMachineModel(0xffffff,{...starterEquipment,chassis:'chassis-special-terrain-flex',accessory:'accessory-special-torque-drive',accessory2:'accessory-special-velocity-bearing',accessory3:'accessory-special-terrain-damper'});
 assert.ok(car.getObjectByName('front-motor-can'));for(const id of ['accessory-special-torque-drive','accessory-special-velocity-bearing','accessory-special-terrain-damper']){let count=0;car.traverse(o=>{if(o.userData.partId===id)count++;});assert.ok(count>0,id);}
});
