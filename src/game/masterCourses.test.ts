import {prizesForCircuit} from '../data/economy';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {masterCourseIds,masterCourses} from '../data/masterCourses';
import {getCircuitTrack} from '../data/circuit';
import {practiceEquipment,practiceRivals} from '../data/practiceRivals';
import {townVenues,townBlocks,townSpawn,townWalkBounds,canEnterShop} from '../data/world';
import {townCrowdObstacles} from '../data/townCrowd';
import {outdoorAdvisors} from '../data/outdoorAdvisors';
import {outdoorTimeBoardPlacement} from '../data/timeBoard';
import {machinePerformance,createDrivingState,startDriving,stepDriving} from './driving';
import {recordOpponentUnlocked} from './raceOpponents';
import {useGame} from './store';
import {createRaceState} from './race';
import {findWalkingPath,canStand} from './navigation';
import {decodeTimeHistory,recordRaceTimes} from './timeRecords';
import type {Equipment} from '../data/machine';
function drive(id:typeof masterCourseIds[number],equipment:Equipment,lane=2){
 const t=getCircuitTrack(id),p=machinePerformance(equipment,{motorSeconds:60,batterySeconds:0});let s=startDriving(createDrivingState());
 for(let tick=0;tick<120*400&&s.status==='running';tick++)s=stepDriving(s,p,0,lane,t.circuit.surface,t);
 return s;
}
test('four distinct master courses contain real mixed surfaces, vertical loops, banks, hills and physical jumps',()=>{
 const shapes=new Set<string>();
 for(const id of masterCourseIds){
  const t=getCircuitTrack(id);assert.equal(t.open,true);assert.equal(t.circuit.laps,1);assert.equal(prizesForCircuit(id)[0],8000);assert.ok(t.circuitLength>600);assert.ok(t.jumps.length>=2);
  const points=Array.from({length:1200},(_,i)=>t.sampleLanePath((i+.5)/1200*t.circuitLength,2));
  for(const p of points)for(const v of [p.x,p.y,p.z,p.pitch,p.curvature,p.pathScale,p.upX,p.upY,p.upZ])assert.ok(Number.isFinite(v),id);
  assert.ok(points.some(p=>p.loopRadius>0&&p.upY<-.7),id);assert.ok(points.some(p=>!p.loopRadius&&Math.abs(p.sideY)>.3),id);assert.ok(points.some(p=>p.pitch>.1),id);
  const surfaces=new Set(points.map((_,i)=>t.surfaceAt((i+.5)/1200*t.circuitLength).name));assert.equal(surfaces.size,3,id);
  assert.ok(t.jumps.every(j=>t.isJumpGap(j.takeoff+j.gap/2)),id);
  shapes.add(points.filter((_,i)=>i%100===0).map(p=>`${p.x.toFixed(1)},${p.z.toFixed(1)},${p.y.toFixed(1)}`).join('|'));
 }
 assert.equal(shapes.size,4);
});
test('all race entry points stay locked until Zenith clear; records use their own new course IDs',()=>{
 const before=useGame.getState();try{
  for(const id of masterCourseIds){
   for(const cleared of [false,true]){
    useGame.setState({...useGame.getInitialState(),location:'town',openingStep:9,openingActive:false,tutorialStage:'done',zenithCleared:cleared},true);
    assert.equal(canEnterShop(id,useGame.getState()),cleared);assert.equal(recordOpponentUnlocked(id,cleared),cleared);
    useGame.getState().startOutdoorRace(id);assert.equal(useGame.getState().overlay,cleared?'race':null);
    useGame.setState({overlay:null});useGame.getState().openRaceChoice(id);assert.equal(useGame.getState().overlay,cleared?'race-opponents':null);
    useGame.setState({overlay:'race-opponents',raceChoiceCircuit:id});useGame.getState().startMobTrial(id);assert.equal(useGame.getState().overlay,cleared?'race':'race-opponents');
   }
   const race=createRaceState(practiceEquipment(id),42,undefined,false,id);race.phase='finished';race.playerStartOffset=0;race.racers[0].driving={...race.racers[0].driving,status:'finished',time:150};
   const history=recordRaceTimes({},race,1,123);assert.equal(history[id]![0].rulesVersion,3);assert.deepEqual(decodeTimeHistory(history),history);
  }
 }finally{useGame.setState(before,true);}
});
test('giant outdoor courses have accessible gates, boards and advisers without moving old facilities',()=>{
 const obstacles=[...[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...townCrowdObstacles];
 const start=townSpawn('komorebi');
 for(const id of masterCourseIds){
  const v=townVenues.find(v=>v.id===id)!;assert.ok(v.w*v.h>=180*110*12,id);
  const advisor=outdoorAdvisors.find(p=>p.courseId===id)!;assert.ok(advisor);const board=outdoorTimeBoardPlacement(v);
  for(const goal of [townSpawn(id),{x:board.x+board.w/2,y:board.y+board.h+28},{x:advisor.x,y:advisor.y+32}]){
   assert.ok(canStand(goal,obstacles,townWalkBounds),id);
   const route=findWalkingPath(start,goal,obstacles,townWalkBounds),end=route.at(-1);assert.ok(end&&Math.hypot(end.x-goal.x,end.y-goal.y)<22,id);
  }
  assert.equal(v.name,masterCourses[id].name);
 }
});
test('non-sovereign recipes complete every course and each course rewards different equipment choices',()=>{
 const winners=new Set<string>();
 for(const id of masterCourseIds){
  const recipe=practiceEquipment(id),reference=drive(id,recipe);
  const race=createRaceState(recipe,42,undefined,false,id);for(const cpu of race.racers.filter(r=>r.id!=='player'))assert.deepEqual(cpu.performance,machinePerformance(cpu.equipment,{motorSeconds:60,batterySeconds:0}),id);assert.equal(reference.status,'finished',id);assert.ok(reference.landings!>=2,id);
  for(const lane of [0,4])assert.deepEqual(drive(id,recipe,lane),reference,id);
  for(const r of practiceRivals(id))assert.equal(drive(id,r.equipment).status,'finished',`${id}/${r.id}`);
  const results=masterCourseIds.map(build=>({build,result:drive(id,practiceEquipment(build))})).filter(r=>r.result.status==='finished').sort((a,b)=>a.result.time-b.result.time);
  assert.ok(results.length>=2,id);winners.add(results[0].build);
 }
 assert.ok(winners.size>=2,'a single tested setup must not be fastest across all four master courses');
});
