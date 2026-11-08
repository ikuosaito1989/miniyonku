import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRaceState,type RaceState} from './race';
import {starterEquipment} from '../data/machine';
import {getCircuitTrack} from '../data/circuit';
import {RaceSoundEvents,racerSoundProfile,type RaceSoundPerspective} from './raceSoundscape';
const view:RaceSoundPerspective={track:getCircuitTrack('leaf'),listener:{x:0,y:0,z:0},right:{x:1,y:0,z:0}};
const move=(state:RaceState,id:string,values:Partial<RaceState['racers'][number]['driving']>):RaceState=>({...state,phase:'running',racers:state.racers.map(r=>r.id===id?{...r,driving:{...r.driving,...values}}:r)});

test('発進と着地の効果音は実状態の変化から一度だけ発生し、再開時に過去の音を再生しない',()=>{
 const events=new RaceSoundEvents();let state=createRaceState(starterEquipment);events.update(state);
 state=move(state,'player',{status:'running',speed:4,time:2,distance:3});assert.deepEqual(events.update(state).map(e=>e.kind),['launch']);assert.deepEqual(events.update(state),[]);
 state=move(state,'player',{landings:1});assert.deepEqual(events.update(state).map(e=>e.kind),['land']);assert.deepEqual(events.update(state),[]);
 assert.deepEqual(new RaceSoundEvents().update(state),[]);
});
test('プレイヤー付近で進捗が交差した車だけ通過音を出し、同じフレームでは重ねない',()=>{
 const events=new RaceSoundEvents();let state=createRaceState(starterEquipment),rival=state.racers[1].id;
 state=move(state,'player',{status:'running',speed:5,time:2,distance:3});state=move(state,rival,{status:'running',speed:6,time:2,distance:2.8});state={...state,time:2};
 const p=view.track.sampleLanePath(3,state.racers[0].lane),local={...view,listener:p};events.update(state,local);
 state=move({...state,time:2.1},rival,{distance:3.15});assert.ok(events.update(state,local).some(e=>e.kind==='pass'&&e.id===rival));assert.deepEqual(events.update(state,local),[]);
});
test('距離で小さくなり左右を描き分け、空中では転がり音を止め、路面と装備で音色が変わる',()=>{
 const race=createRaceState(starterEquipment),racer={...race.racers[0],driving:{...race.racers[0].driving,status:'running' as const,speed:5,distance:3}},p=view.track.sampleLanePath(3,racer.lane);
 const near=racerSoundProfile(racer,view.track,{...view,listener:{x:p.x-1,y:p.y,z:p.z}}),far=racerSoundProfile(racer,view.track,{...view,listener:{x:p.x-15,y:p.y,z:p.z}}),left=racerSoundProfile(racer,view.track,{...view,listener:{x:p.x+1,y:p.y,z:p.z}});
 assert.ok(near.level>far.level*20);assert.ok(near.pan>0&&left.pan<0);
 assert.equal(racerSoundProfile({...racer,driving:{...racer.driving,flightY:p.y+.2}},view.track).rolling,0);
 assert.ok(racerSoundProfile(racer,getCircuitTrack('park-sand')).roughness>near.roughness);
 assert.ok(racerSoundProfile({...racer,performance:{...racer.performance,freeSpeed:racer.performance.freeSpeed*2}},view.track).frequency>near.frequency);
});
