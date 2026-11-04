import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterEquipment} from '../data/machine';
import {getCircuitTrack} from '../data/circuit';
import {createDrivingState,startDriving,stepDriving,machinePerformance,DIRT_CRAWL_SPEED} from './driving';
import {dirtSetupWarning} from './dirtSetup';
const dirtEquipment={...starterEquipment,body:'body-champion',motor:'motor-trail',gear:'gear-4',tire:'tire-trail',chassis:'chassis-trail',accessory:'accessory-damper',rollerFront:'roller-double',rollerSide:'roller-double',rollerRear:'roller-double',terminal:'terminal-1',battery:'battery-endurance'};
test('ノーマル装備もひなたの全路面で停止せず超低速で前進する',()=>{
 const track=getCircuitTrack('sun'),performance=machinePerformance(starterEquipment);
 for(const portion of [.1,.3,.5,.8]){
  const start=track.circuitLength*portion;let driving={...startDriving(createDrivingState()),distance:start};
  for(let i=0;i<600;i++)driving=stepDriving(driving,performance,0,2,track.circuit.surface,track);
  assert.equal(driving.status,'running');assert.ok(driving.distance>start+.25);assert.ok(driving.speed>0&&driving.speed<=DIRT_CRAWL_SPEED);
 }
});
test('悪路向け装備は通常速度で大きく先へ進み、電池切れや無駆動を救済しない',()=>{
 const track=getCircuitTrack('sun'),performance=machinePerformance(dirtEquipment,{motorSeconds:60,batterySeconds:0});let state=startDriving(createDrivingState());
 for(let i=0;i<600;i++)state=stepDriving(state,performance,0,2,track.circuit.surface,track);
 assert.ok(state.distance>5);assert.ok(state.speed>DIRT_CRAWL_SPEED*5);
 const empty=stepDriving(startDriving(createDrivingState()),{...performance,batterySeconds:1e9},0,2,track.circuit.surface,track);assert.equal(empty.status,'out');assert.equal(empty.speed,0);
 const noDrive=stepDriving(startDriving(createDrivingState()),{...performance,stallForce:0},0,2,track.circuit.surface,track);assert.equal(noDrive.distance,0);
});
test('ダートの不向きな装備を判定し、適正装備や舗装路には警告を出さない',()=>{
 const normal=machinePerformance(starterEquipment),suitable=machinePerformance(dirtEquipment,{motorSeconds:60,batterySeconds:0});
 assert.equal(dirtSetupWarning(normal,'sun')?.severe,true);assert.match(dirtSetupWarning(normal,'sun')!.advice,/ブロックタイヤ/);assert.equal(dirtSetupWarning(suitable,'sun'),null);assert.equal(dirtSetupWarning(normal,'leaf'),null);assert.equal(dirtSetupWarning(normal,'zenith'),null);
});
