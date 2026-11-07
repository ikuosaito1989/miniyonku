import {test} from 'node:test';
import assert from 'node:assert/strict';
import {openingScenes,OPENING_END,openingIndex,openingSpawn,openingDoor,openingMentorSpot,createOpeningWalk,stepOpeningWalk} from './opening';
import {townVenues,townBlocks,townWalkBounds} from '../data/world';
import {shopLayout} from '../data/shopLayout';
import {shopCast} from '../data/shopCast';
import {timeBoardObstacle} from '../data/timeBoard';
import {canTravel,walkBounds} from './navigation';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';

test('町の通りから模型店の入口まで、店内は人物と家具を避けて匠のそばまで歩く',()=>{
 const cast=shopCast('komorebi'),board=timeBoardObstacle('komorebi');
 const cases=[{step:2,obstacles:[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),bounds:townWalkBounds,goal:openingDoor()},{step:4,obstacles:[...shopLayout('komorebi').map(({target:f})=>({x:f.x,y:f.y,width:f.w,height:f.h})),...[cast.rival,...cast.visitors].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21})),board],bounds:walkBounds,goal:openingMentorSpot}];
 for(const c of cases){let walk=createOpeningWalk(c.step,openingSpawn(c.step),c.obstacles),frames=0,distance=0;while(!walk.done&&frames++<1000){const before=walk;walk=stepOpeningWalk(walk,40);assert.ok(canTravel(before.position,walk.position,c.obstacles,c.bounds));distance+=Math.hypot(walk.position.x-before.position.x,walk.position.y-before.position.y);}assert.ok(walk.done);assert.ok(frames>20&&distance>100);assert.ok(Math.hypot(walk.position.x-c.goal.x,walk.position.y-c.goal.y)<.01);assert.equal(stepOpeningWalk(walk,40),walk);}
});
test('新規導入は町→入店→匠の案内。連打や古い歩行完了通知で飛ばず、所持金やパーツを変えない',()=>{
 const original=useGame.getState();try{
  useGame.setState(useGame.getInitialState());const wallet={money:useGame.getState().money,inventory:structuredClone(useGame.getState().inventory)};
  useGame.getState().startOpening();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().overlay,'opening');
  for(let step=0;step<OPENING_END-1;step++){const state=useGame.getState();assert.equal(openingIndex(state),step);if(openingScenes[step].kind.includes('walk'))state.completeOpeningWalk(step);else state.advanceOpening(step);useGame.getState().advanceOpening(step);useGame.getState().completeOpeningWalk(step);assert.equal(openingIndex(useGame.getState()),step+1);}
  assert.equal(useGame.getState().location,'komorebi');useGame.getState().finishOpening(true);assert.equal(useGame.getState().openingStep,OPENING_END);assert.equal(useGame.getState().overlay,'setting');assert.equal(useGame.getState().money,wallet.money);assert.deepEqual(useGame.getState().inventory,wallet.inventory);
  useGame.getState().startOpening();assert.equal(useGame.getState().openingActive,false);
 }finally{useGame.setState(original,true);}
});
test('導入途中を保存・再開でき、旧セーブに導入を強制せず、異常な進行を拒否する',async()=>{
 const original=useGame.getState();try{
  useGame.setState(useGame.getInitialState());useGame.getState().startOpening();useGame.getState().advanceOpening(0);useGame.getState().advanceOpening(1);const data={version:1,savedAt:1000,game:snapshotGame(useGame.getState())};
  await loadSavedGame({read:async()=>data,write:async()=>{}});assert.equal(useGame.getState().openingStep,2);assert.equal(useGame.getState().openingActive,false);useGame.getState().startOpening();assert.equal(useGame.getState().openingStep,2);assert.equal(useGame.getState().location,'town');
  const legacy=structuredClone(data) as typeof data&{game:Record<string,unknown>};delete (legacy.game as Record<string,unknown>).openingStep;assert.equal(decodeSave(legacy).game.openingStep,OPENING_END);
  for(const step of [-1,.5,OPENING_END+1,Infinity])assert.throws(()=>decodeSave({...data,game:{...data.game,openingStep:step}}));
 }finally{useGame.setState(original,true);}
});
test('設定から見直す導入は進行・保存場所を上書きせず、元の場所と設定画面に戻る',()=>{
 const original=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),openingStep:OPENING_END,location:'town',lastShop:'komorebi',money:9876});const before=snapshotGame(useGame.getState());useGame.getState().startOpening(true);useGame.getState().advanceOpening(0);useGame.getState().advanceOpening(1);useGame.getState().completeOpeningWalk(2);
  assert.equal(useGame.getState().location,'komorebi');assert.deepEqual(snapshotGame(useGame.getState()),before);useGame.getState().finishOpening();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().overlay,'settings');assert.deepEqual(snapshotGame(useGame.getState()),before);
 }finally{useGame.setState(original,true);}
});
