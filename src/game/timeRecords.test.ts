import {test} from 'node:test';
import assert from 'node:assert/strict';
import {recordRaceTimes,decodeTimeHistory,formatRecordTime} from './timeRecords';
import {createRaceState} from './race';
import {starterEquipment} from '../data/machine';
import {useGame} from './store';
import {decodeSave,snapshotGame} from './saveData';
import {modelShops} from '../data/world';
import {timeBoardPlacement,timeBoardObstacle} from '../data/timeBoard';
import {shopLayout} from '../data/shopLayout';
import {room,shopExit} from '../data/shop';
import {canStand,canTravel,findWalkingPath} from './navigation';
import {personSpriteSize} from './PeopleArt';

function finishedRace(course:'leaf'|'wind'='leaf'){
 const race=createRaceState(starterEquipment,42,undefined,false,course);
 return {...race,playerStartOffset:0,falseStartPenalty:0,phase:'finished' as const,racers:race.racers.map((r,index)=>({...r,driving:{...r.driving,status:'finished' as const,time:50+index,speed:0}}))};
}
test('完走のみを記録し、主人公の反応時間と早出ペナルティを含める',()=>{
 const race=finishedRace();
 const penalized={...race,playerStartOffset:3.25,falseStartPenalty:1.5,racers:race.racers.map(r=>r.id==='player'?r:{...r,driving:{...r.driving,status:'out' as const,time:1}})};
 const history=recordRaceTimes({},penalized,1,1000);assert.equal(history.leaf!.length,1);assert.equal(history.leaf![0].time,54.75);
 assert.equal(formatRecordTime(65.129),'01:05.12');assert.equal(formatRecordTime(59.999,true),'01:00.00');
});
test('過去レースを含め短い公式タイム5件を保存し、コースを分ける',()=>{
 const race=finishedRace(),first=recordRaceTimes({},race,1,1000);
 assert.deepEqual(first.leaf!.map(r=>r.time),[50,51,52,53,54]);assert.equal(formatRecordTime(first.leaf![0].time),'00:50.00');
 const next={...race,racers:race.racers.map(r=>({...r,driving:{...r.driving,time:50.5}}))};
 const second=recordRaceTimes(first,next,2,2000);assert.deepEqual(second.leaf!.map(r=>r.time),[50,50.5,50.5,50.5,50.5]);
 const other=recordRaceTimes(second,finishedRace('wind'),3,3000);assert.deepEqual(other.leaf,second.leaf);assert.equal(other.wind!.length,5);
 assert.deepEqual(recordRaceTimes(first,race,1,1000),first);
});
test('記録の保存復元・旧セーブ・不正値の検証。二重精算では記録を増やさない',()=>{
 const previous=useGame.getState();try{
  useGame.setState(useGame.getInitialState());useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt,race=finishedRace();
  useGame.getState().settleRace(attempt,race);const history=structuredClone(useGame.getState().timeHistory);
  useGame.getState().settleRace(attempt,race);assert.deepEqual(useGame.getState().timeHistory,history);
  assert.deepEqual(decodeSave({version:1,savedAt:10,game:snapshotGame(useGame.getState())}).game.timeHistory,history);
  const legacy:Record<string,unknown>=snapshotGame(useGame.getState());delete legacy.timeHistory;legacy.speedHistory={leaf:[{speed:30}]};
  assert.deepEqual(decodeSave({version:1,savedAt:10,game:legacy}).game.timeHistory,{});
  assert.throws(()=>decodeTimeHistory({unknown:[]}));assert.throws(()=>decodeTimeHistory({leaf:[{...history.leaf![0],time:Infinity}]}));
  assert.throws(()=>decodeTimeHistory({leaf:[history.leaf![0],history.leaf![0]]}));
 }finally{useGame.setState(previous,true);}
});
test('看板は各店のコース端にあり、看板前と出口へ歩いて移動できる',()=>{
 for(const shop of Object.values(modelShops).filter(s=>s.id!=='atelier')){
  const spot=timeBoardPlacement(shop.id),obstacles=[...shopLayout(shop.id).map(f=>({x:f.target.x,y:f.target.y,width:f.target.w,height:f.target.h})),timeBoardObstacle(shop.id)];
  assert.ok(spot.w<=personSpriteSize.displayWidth*2.5&&spot.h<=personSpriteSize.displayHeight,'店内記録板を人物に対して過大にしない');
  for(const target of [{x:spot.x+spot.w/2,y:spot.y+spot.h+15},{x:shopExit.x+shopExit.width/2,y:shopExit.y+2}]){
   assert.ok(canStand(target,obstacles));const route=findWalkingPath(room.spawn,target,obstacles);assert.ok(route.length>0);assert.deepEqual(route.at(-1),target);let before=room.spawn;for(const point of route){assert.ok(canTravel(before,point,obstacles));before=point;}
  }
 }
});
