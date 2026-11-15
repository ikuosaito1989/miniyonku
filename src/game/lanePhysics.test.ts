import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
import {starterEquipment} from '../data/machine';
import {seniorEquipment} from '../data/officialRace';
import {zenithEquipment} from '../data/zenithRace';
import {createDrivingState,machinePerformance,startDriving,stepDriving,FIXED_STEP} from './driving';

test('一本道の5レーンは描画経路の長さで走行距離を更新する',()=>{
 for(const id of ['grandprix','forge'] as const){
  const track=getCircuitTrack(id),performance=machinePerformance(starterEquipment),distance=track.circuitLength*.3;
  for(let lane=0;lane<5;lane++){
   const path=track.sampleLanePath(distance,lane),e=.005,a=track.sampleLanePath(distance-e,lane),b=track.sampleLanePath(distance+e,lane);
   const measured=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/(2*e);
   assert.ok(Math.abs(path.pathScale-measured)<.15,`${id}/${lane}: ${path.pathScale} ${measured}`);
   const state={...startDriving(createDrivingState()),distance,speed:2};
   const next=stepDriving(state,performance,0,lane,track.circuit.surface,track);
   assert.ok(Math.abs((next.distance-distance)*path.pathScale-next.speed*FIXED_STEP)<1e-8,`${id}/${lane}`);
  }
 }
});

test('緑川は5周で全レーンを走り3構成とも開始位置による差が小さい',()=>{
 const track=getCircuitTrack('grandprix');assert.equal(track.circuit.laps,5);assert.equal(track.open,false);
 for(let lane=0;lane<5;lane++){
  const visited=new Set<number>();
  for(let lap=0;lap<5;lap++)visited.add(track.sampleLanePath((lap+.2)*track.circuitLength,lane).lane);
  assert.equal(visited.size,5);
 }
 for(const equipment of [starterEquipment,seniorEquipment,zenithEquipment]){
  const performance=machinePerformance(equipment,{motorSeconds:60,batterySeconds:0}),times:number[]=[];
  for(let lane=0;lane<5;lane++){
   let state=startDriving(createDrivingState());
   for(let i=0;i<120*400&&state.status==='running';i++)state=stepDriving(state,performance,0,lane,track.circuit.surface,track);
   assert.equal(state.status,'finished',`lane ${lane}`);times.push(state.time);
  }
  assert.ok((Math.max(...times)-Math.min(...times))/Math.min(...times)<.001);
 }
});

test('緑川の全区間で物理の経路長は描画位置の微分と一致する',()=>{
 const track=getCircuitTrack('grandprix'),e=.002;
 for(let lane=0;lane<5;lane++)for(let i=1;i<1000;i++){
  const d=track.circuitLength*i/1000,p=track.sampleLanePath(d,lane),a=track.sampleLanePath(d-e,lane),b=track.sampleLanePath(d+e,lane);
  const scale=Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z)/(2*e);
  assert.ok(Math.abs(p.pathScale-scale)<1e-7,`${lane}/${i}`);
 }
});
