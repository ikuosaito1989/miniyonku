import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordRaceSpeeds,decodeSpeedHistory,speedKmh} from './speedRecords';
import {createRaceState} from './race';
import {starterEquipment} from '../data/machine';
import {createDrivingState,startDriving,stepDriving,machinePerformance} from './driving';
import {useGame} from './store';
import {decodeSave,snapshotGame} from './saveData';
import {modelShops} from '../data/world';
import {speedBoardPlacement,speedBoardObstacle} from '../data/speedBoard';
import {shopLayout} from '../data/shopLayout';
import {room,shopExit} from '../data/shop';
import {canStand,canTravel,findWalkingPath} from './navigation';

function finishedRace(course:'leaf'|'wind'='leaf'){
 const race=createRaceState(starterEquipment,42,undefined,false,course);
 return {...race,phase:'finished' as const,racers:race.racers.map((r,index)=>({...r,driving:{...r.driving,status:'finished' as const,time:50+index,speed:0,peakSpeed:[4,7,5,9,6][index]}}))};
}
test('瞬間最高速度を走行中に保持し、電池切れで停止しても失わない',()=>{
 const performance=machinePerformance(starterEquipment);let state=startDriving(createDrivingState());
 for(let i=0;i<120&&state.status==='running';i++)state=stepDriving(state,performance);
 assert.ok(state.peakSpeed!>0);assert.ok(state.peakSpeed!>=state.speed);
 const stopped=stepDriving({...state,status:'running'},{...performance,batterySeconds:1e9});
 assert.equal(stopped.speed,0);assert.equal(stopped.peakSpeed,state.peakSpeed);
});
test('過去レースを含め実測最高速度3件を保存し、コースを分け、最終速度0でも記録する',()=>{
 const race=finishedRace(),first=recordRaceSpeeds({},race,1,1000);
 assert.deepEqual(first.leaf!.map(r=>r.speed),[9,7,6]);assert.equal(speedKmh(first.leaf![0].speed),'32.4');
 const next={...race,racers:race.racers.map(r=>({...r,driving:{...r.driving,peakSpeed:8}}))};
 const second=recordRaceSpeeds(first,next,2,2000);assert.deepEqual(second.leaf!.map(r=>r.speed),[9,8,8]);
 const other=recordRaceSpeeds(second,finishedRace('wind'),3,3000);assert.deepEqual(other.leaf,second.leaf);assert.equal(other.wind!.length,3);
 assert.deepEqual(recordRaceSpeeds(first,race,1,1000),first);
});
test('記録の保存復元・旧セーブ・不正値の検証。二重精算では記録を増やさない',()=>{
 const previous=useGame.getState();try{
  useGame.setState(useGame.getInitialState());useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt,race=finishedRace();
  useGame.getState().settleRace(attempt,race);const history=structuredClone(useGame.getState().speedHistory);
  useGame.getState().settleRace(attempt,race);assert.deepEqual(useGame.getState().speedHistory,history);
  assert.deepEqual(decodeSave({version:1,savedAt:10,game:snapshotGame(useGame.getState())}).game.speedHistory,history);
  const legacy:Record<string,unknown>=snapshotGame(useGame.getState());delete legacy.speedHistory;
  assert.deepEqual(decodeSave({version:1,savedAt:10,game:legacy}).game.speedHistory,{});
  assert.throws(()=>decodeSpeedHistory({unknown:[]}));assert.throws(()=>decodeSpeedHistory({leaf:[{...history.leaf![0],speed:Infinity}]}));
  assert.throws(()=>decodeSpeedHistory({leaf:[history.leaf![0],history.leaf![0]]}));
 }finally{useGame.setState(previous,true);}
});
test('看板は各店のコース端にあり、看板前と出口へ歩いて移動できる',()=>{
 for(const shop of Object.values(modelShops).filter(s=>s.id!=='atelier')){
  const spot=speedBoardPlacement(shop.id),obstacles=[...shopLayout(shop.id).map(f=>({x:f.target.x,y:f.target.y,width:f.target.w,height:f.target.h})),speedBoardObstacle(shop.id)];
  for(const target of [{x:spot.x+spot.w/2,y:spot.y+spot.h+15},{x:shopExit.x+shopExit.width/2,y:shopExit.y+2}]){
   assert.ok(canStand(target,obstacles));const route=findWalkingPath(room.spawn,target,obstacles);assert.ok(route.length>0);assert.deepEqual(route.at(-1),target);let before=room.spawn;for(const point of route){assert.ok(canTravel(before,point,obstacles));before=point;}
  }
 }
});
