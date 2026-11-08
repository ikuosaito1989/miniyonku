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
import {recordRaceTimes,decodeTimeHistory} from './timeRecords';
import {courseIntroduction} from './raceIntro';
function drive(id:CircuitId,e=practiceEquipment(id as keyof typeof practiceCourses),lane=2){const t=getCircuitTrack(id),p=machinePerformance(e,{motorSeconds:60,batterySeconds:0});let s=startDriving(createDrivingState());for(let i=0;i<120*400&&s.status==='running';i++)s=stepDriving(s,p,0,lane,t.circuit.surface,t);return s;}
test('ten distinct course geometries are finite, lane-fair, and completable by real non-sovereign builds',()=>{
 assert.equal(practiceCourseIds.length,11);const shapes=new Set<string>();
 for(const id of practiceCourseIds){const t=getCircuitTrack(id);shapes.add(Array.from({length:20},(_,i)=>{const p=t.sampleCircuit(i/20*t.circuitLength);return `${p.x.toFixed(2)},${p.z.toFixed(2)},${p.elevation.toFixed(2)}`;}).join('|'));
  for(let i=0;i<120;i++){const p=t.sampleLanePath(i/120*t.circuitLength,2);for(const n of [p.x,p.y,p.z,p.curvature,p.pathScale,p.pitch])assert.ok(Number.isFinite(n),id);}
  const result=drive(id);assert.equal(result.status,'finished',id);assert.deepEqual(drive(id,practiceEquipment(id),0),drive(id,practiceEquipment(id),4),id);
  for(const r of practiceRivals(id))assert.equal(drive(id,r.equipment).status,'finished',`${id}/${r.id}`);
  const race=createRaceState(practiceEquipment(id),42,undefined,false,id);assert.equal(race.racers.length,5);assert.ok(race.racers.every(r=>!Object.values(r.equipment).some(id=>id.includes('sovereign'))));assert.ok(courseIntroduction(id).feature);
 }
 assert.equal(shapes.size,11);
});
test('full offroad is full offroad and hill courses have repeated real elevation and slope forces',()=>{
 for(const id of ['park-sand','park-gravel','park-ridge'] as const){const t=getCircuitTrack(id);for(let i=0;i<100;i++)assert.ok(t.surfaceAt(i/100*t.circuitLength).roughness>0);}
 for(const id of ['park-climb','park-waves','park-ridge'] as const){const t=getCircuitTrack(id),p=machinePerformance(practiceEquipment(id));assert.ok(t.hasHills);const samples=Array.from({length:240},(_,i)=>({d:i/240*t.circuitLength,p:t.sampleLanePath(i/240*t.circuitLength,2)}));assert.ok(Math.max(...samples.map(s=>s.p.y))-Math.min(...samples.map(s=>s.p.y))>1);
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
