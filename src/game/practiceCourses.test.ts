import {test} from 'node:test';
import assert from 'node:assert/strict';
import {practiceCourses,practiceCourseIds} from '../data/practiceCourses';
import {practiceEquipment,practiceRivals} from '../data/practiceRivals';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {townVenues,townBlocks,townSpawn,townWalkBounds,modelShops} from '../data/world';
import {findWalkingPath} from './navigation';
import {machinePerformance,createDrivingState,startDriving,stepDriving} from './driving';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {createRaceState} from './race';
import {recordRaceTimes,decodeTimeHistory,migrateTimeHistory,currentRaceRulesVersion} from './timeRecords';
import {courseIntroduction} from './raceIntro';
function drive(id:CircuitId,e=practiceEquipment(id as keyof typeof practiceCourses),lane=2){const t=getCircuitTrack(id),p=machinePerformance(e,{motorSeconds:60,batterySeconds:0});let s=startDriving(createDrivingState());for(let i=0;i<120*400&&s.status==='running';i++)s=stepDriving(s,p,0,lane,t.circuit.surface,t);return s;}
test('street courses complete five laps through all lanes with real non-sovereign builds',()=>{
 assert.equal(practiceCourseIds.length,11);const shapes=new Set<string>();
 for(const id of practiceCourseIds){const t=getCircuitTrack(id);shapes.add(Array.from({length:20},(_,i)=>{const p=t.sampleCircuit(i/20*t.circuitLength);return `${p.x.toFixed(2)},${p.z.toFixed(2)},${p.elevation.toFixed(2)}`;}).join('|'));
  for(let i=0;i<120;i++){const p=t.sampleLanePath(i/120*t.circuitLength,2);for(const n of [p.x,p.y,p.z,p.curvature,p.pathScale,p.pitch])assert.ok(Number.isFinite(n),id);}
  const result=drive(id);assert.equal(result.status,'finished',id);
  assert.equal(t.circuit.laps,5);assert.equal(t.fairLanes,false);
  const times=[];
  for(let lane=0;lane<5;lane++){
   const lanes=new Set(Array.from({length:5},(_,lap)=>t.sampleLanePath((lap+.1)*t.circuitLength,lane).lane));assert.equal(lanes.size,5,id);
   const run=drive(id,practiceEquipment(id),lane);assert.equal(run.status,'finished',`${id}/lane-${lane}`);times.push(run.time);
  }
  // 全レーンを一巡するため、開始位置による時間差は1%未満に収まる。
  assert.ok((Math.max(...times)-Math.min(...times))/Math.min(...times)<.01,id);
  for(const r of practiceRivals(id))assert.equal(drive(id,r.equipment).status,'finished',`${id}/${r.id}`);
  const race=createRaceState(practiceEquipment(id),42,undefined,false,id);assert.equal(race.racers.length,5);assert.ok(race.racers.every(r=>!Object.values(r.equipment).some(id=>id.includes('sovereign'))));assert.ok(courseIntroduction(id).feature);
 }
 assert.equal(shapes.size,11);
});
test('full offroad is full offroad and hill courses have repeated real elevation and slope forces',()=>{
 for(const id of ['park-sand','park-gravel','park-ridge'] as const){const t=getCircuitTrack(id);for(let i=0;i<100;i++)assert.ok(t.surfaceAt(i/100*t.circuitLength).roughness>0);}
 for(const id of ['park-climb','park-waves','park-ridge'] as const){const t=getCircuitTrack(id),p=machinePerformance(practiceEquipment(id));assert.ok(t.hasHills);const samples=Array.from({length:240},(_,i)=>({d:i/240*t.circuitLength,p:t.sampleLanePath(i/240*t.circuitLength,2)}));assert.ok(Math.max(...samples.map(s=>s.p.y))-Math.min(...samples.map(s=>s.p.y))>practiceCourses[id].height*.95);
  const uphill=samples.find(s=>s.p.pitch>.1)!;assert.ok(uphill);const s={...startDriving(createDrivingState()),distance:uphill.d,speed:2};const hill=stepDriving(s,p,0,2,t.circuit.surface,t),flat=stepDriving(s,p,0,2,t.circuit.surface,{...t,hasHills:false});assert.ok(hill.speed<flat.speed,id);
 }
 const t=getCircuitTrack('park-velocity');assert.ok(t.sampleCircuit(t.startDistance+t.circuitLength*.1).curvature<.0001);
});
test('street entrances are reachable; independent races and records save without unlocking main-story events',()=>{
 const before=useGame.getState();try{const obstacles=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
 for(const id of practiceCourseIds){assert.ok(townVenues.some(v=>v.id===id&&v.kind==='outdoor'));assert.ok(findWalkingPath(townSpawn('library'),townSpawn(id),obstacles,townWalkBounds).length>0,id);
  useGame.setState({...useGame.getInitialState(),location:'town',openingStep:9,tutorialStage:'done'},true);useGame.getState().startOutdoorRace(id);assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().outdoorCourse,id);assert.equal(useGame.getState().overlay,'race');
  const state=useGame.getState(),race=createRaceState(practiceEquipment(id),42,undefined,false,id);race.phase='finished';race.playerStartOffset=0;race.racers[0].driving={...drive(id),status:'finished'};const history=recordRaceTimes({},race,state.raceAttempt,123);
  assert.ok(history[id]?.length);assert.deepEqual(decodeTimeHistory(history),history);useGame.getState().settleRace(state.raceAttempt,race);assert.equal(useGame.getState().legendRaceCompleted,false);assert.equal(useGame.getState().officialQualified,false);useGame.setState({timeHistory:history});const saved=decodeSave({version:1,savedAt:1,game:snapshotGame(useGame.getState())}).game;assert.equal(saved.location,'town');assert.equal(saved.townReturnVenue,id);assert.equal(saved.lastShop,'komorebi');assert.ok(!('outdoorCourse' in saved));useGame.getState().close();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().outdoorCourse,null);assert.equal(useGame.getState().overlay,null);assert.equal(saved.legendRaceCompleted,false);assert.equal(saved.officialQualified,false);assert.equal(modelShops[id].exclusiveParts?.length,0);
 }
 }finally{useGame.setState(before,true);}
});

test('random outdoor placement spans both axes, is stable by seed, and migrates old indoor saves to town',()=>{
 const parks=townVenues.filter(v=>v.kind==='outdoor');assert.equal(parks.length,11);assert.ok(new Set(parks.map(v=>Math.floor(v.x/500))).size>=4);assert.ok(new Set(parks.map(v=>Math.floor(v.y/400))).size>=3);
 const old={...snapshotGame(useGame.getInitialState()),location:'park-sand',lastShop:'park-sand'};
 const migrated=decodeSave({version:1,savedAt:1,game:old}).game;assert.equal(migrated.location,'town');assert.equal(migrated.townReturnVenue,'park-sand');assert.equal(migrated.lastShop,'komorebi');
});

test('five-lap layouts retain previous race distances and approximate duration',()=>{
 const before={
  'park-switchback':[499.896,114.924], 'park-hairpin':[407.123,92.919],
  'park-slalom':[500.415,114.457], 'park-sand':[443.001,100.487],
  'park-gravel':[512.184,109.316], 'park-climb':[475.963,103.612],
  'park-waves':[521.839,113.430], 'park-ridge':[522.340,119.108],
  'park-velocity':[500.530,113.629], 'park-jump':[503.803,108.453],
  'park-endurance':[1743.703,370.301],
 };
 for(const id of practiceCourseIds){
  const t=getCircuitTrack(id),[distance,time]=before[id];
  assert.ok(Math.abs(t.circuitLength*5-distance)<.01,id);
  assert.ok(Math.abs(drive(id).time/time-1)<.1,id);
  const lengths=Array.from({length:5},(_,lane)=>{
   let length=0;for(let i=0;i<2500;i++)length+=t.sampleLanePath((i+.5)/500*t.circuitLength,lane).pathScale*t.circuitLength/500;
   return length;
  });
  assert.ok(Math.max(...lengths)-Math.min(...lengths)<1e-5,id);
 }
});

test('street layout revision archives old street times while preserving story times',()=>{
 const race=createRaceState(practiceEquipment('park-sand'),42,undefined,false,'park-sand');
 race.phase='finished';race.playerStartOffset=0;race.racers[0].driving={...drive('park-sand'),status:'finished'};
 const history=recordRaceTimes({},race,1,123),record=history['park-sand']![0];
 assert.equal(record.rulesVersion,3);assert.equal(currentRaceRulesVersion('leaf'),2);
 const oldStreet={...record,rulesVersion:2};
 const migrated=migrateTimeHistory({'park-sand':[oldStreet],leaf:[oldStreet]});
 assert.deepEqual(migrated.timeHistory['park-sand'],[]);
 assert.deepEqual(migrated.legacyTimeHistory['park-sand'],[oldStreet]);
 assert.deepEqual(migrated.timeHistory.leaf,[oldStreet]);
 assert.deepEqual(decodeTimeHistory(history),history);
});
