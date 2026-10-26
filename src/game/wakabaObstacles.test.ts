import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
import {starterEquipment} from '../data/machine';
import {machinePerformance,stepDriving,type DrivingState} from './driving';
const track=getCircuitTrack('grove'),performance=machinePerformance({...starterEquipment,motor:'motor-turn',gear:'gear-4',chassis:'chassis-turn',tire:'tire-turn'},{motorSeconds:60,batterySeconds:0});
const running=(distance:number,speed=3):DrivingState=>({time:0,distance,speed,stress:0,status:'running'});
test('若葉は約500m、高低差のある1周半スパイラルを持ち、他コースには障害物を増やさない',()=>{
 assert.ok(track.circuitLength*5>=490);assert.ok(track.obstacles);
 const samples=Array.from({length:1000},(_,i)=>track.sampleLanePath(i*track.circuitLength/1000,2));
 assert.ok(Math.max(...samples.map(p=>p.y))>1.6);assert.ok(samples.some(p=>p.pitch>.1)&&samples.some(p=>p.pitch<-.1));
 assert.ok(samples.some((p,i)=>samples.some((q,j)=>j>i+150&&Math.hypot(p.x-q.x,p.z-q.z)<.15&&Math.abs(p.y-q.y)>.8)),'上下に重なる立体旋回がある');
 for(const id of ['leaf','wind','sun','sprint','comet'] as const)assert.equal(getCircuitTrack(id).obstacles,null);
});
test('坂の登りは駆動力を消費し、下りは加速を助ける',()=>{
 const hill=track.obstacles!.hill,flat={...track,obstacles:null};
 for(const [fraction,uphill] of [[.25,true],[.75,false]] as const){
  const state=running(hill.start+hill.length*fraction,1),grade=stepDriving(state,performance,0,2,track.circuit.surface,track),level=stepDriving(state,performance,0,2,track.circuit.surface,flat);
  assert.ok(uphill?grade.speed<level.speed:grade.speed>level.speed);
 }
});
test('ジャンプは離陸・放物運動・着地し、飛距離不足ならリタイアする',()=>{
 const jump=track.obstacles!.jump;
 let state=stepDriving(running(jump.takeoff-.003),performance,0,2,track.circuit.surface,track);assert.ok(state.flightY!==undefined&&state.flightY>.4);
 for(let i=0;i<240&&state.flightY!==undefined&&state.status==='running';i++)state=stepDriving(state,performance,0,2,track.circuit.surface,track);
 assert.equal(state.status,'running');assert.equal(state.flightY,undefined);assert.equal(state.landings,1);
 let slow=stepDriving(running(jump.takeoff-.0001,.1),performance,0,2,track.circuit.surface,track);
 for(let i=0;i<240&&slow.status==='running';i++)slow=stepDriving(slow,performance,0,2,track.circuit.surface,track);
 assert.equal(slow.stopReason,'jump');
});
test('ダンパーの制振は着地の減速と姿勢の乱れを軽減する',()=>{
 const jump=track.obstacles!.jump,state={...running(jump.takeoff+jump.gap+.1),flightY:.001,flightVelocity:-2};
 const hard=stepDriving(state,{...performance,damping:0},0,2,track.circuit.surface,track),soft=stepDriving(state,{...performance,damping:.65},0,2,track.circuit.surface,track);
 assert.equal(hard.landings,1);assert.equal(soft.landings,1);assert.ok(soft.speed>hard.speed);assert.ok(soft.stress<hard.stress);
});
