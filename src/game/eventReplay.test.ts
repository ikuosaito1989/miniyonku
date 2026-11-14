import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {snapshotGame} from './saveData';
import {replayEvents} from './eventReplay';
import {startAutoSave} from './autoSave';

test('イベント移動は裏技モード限定で、体験中も元の進行を保存する',()=>{
 const original=useGame.getState();
 try{
  useGame.setState({...useGame.getInitialState(),overlay:'cheat',cheatUsed:false},true);
  useGame.getState().startEventReplay('doctor');assert.equal(useGame.getState().eventReplay,null);
  useGame.setState({cheatUsed:true,money:12345});
  const baseline=snapshotGame(useGame.getState());
  for(const event of replayEvents){
   useGame.getState().startEventReplay(event.id);
   assert.ok(useGame.getState().eventReplay,event.id);
   assert.deepEqual(snapshotGame(useGame.getState()),baseline,event.id);
   assert.notEqual(useGame.getState().overlay,'cheat',event.id);
   useGame.setState({money:7});assert.deepEqual(snapshotGame(useGame.getState()),baseline,event.id);
   useGame.getState().endEventReplay();assert.deepEqual(snapshotGame(useGame.getState()),baseline,event.id);
   assert.equal(useGame.getState().overlay,'cheat');
  }
 }finally{useGame.setState(original,true);}
});
test('体験中に手動セーブしても本来のデータと大会前チェックポイントを保存する',async()=>{
 const original=useGame.getState();
 try{
  useGame.setState({...useGame.getInitialState(),cheatUsed:true,overlay:'cheat'},true);
  const baseline=snapshotGame(useGame.getState()),checkpoint=structuredClone({...baseline,money:321});
  useGame.setState({retryCheckpoint:checkpoint});
  let saved:unknown;const autoSave=startAutoSave({read:async()=>undefined,write:async data=>{saved=data;}},()=>{});
  useGame.getState().startEventReplay('wakaba-cup');useGame.setState({money:9,retryCheckpoint:structuredClone({...baseline,money:999})});
  await autoSave.flush();autoSave.stop();
  assert.deepEqual((saved as {game:unknown}).game,baseline);assert.deepEqual((saved as {checkpoint:unknown}).checkpoint,checkpoint);
  useGame.getState().endEventReplay();assert.deepEqual(useGame.getState().retryCheckpoint,checkpoint);
 }finally{useGame.setState(original,true);}
});
test('博士の贈呈からセイラン演出へ進め、元の所持品は変わらない',()=>{
 const original=useGame.getState();
 try{
  useGame.setState({...useGame.getInitialState(),cheatUsed:true,overlay:'cheat'},true);
  const baseline=snapshotGame(useGame.getState());useGame.getState().startEventReplay('doctor');
  useGame.getState().completeArrival();assert.equal(useGame.getState().inventory['body-champion'],1);
  useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'doctor-reveal');
  useGame.getState().endEventReplay();assert.deepEqual(snapshotGame(useGame.getState()),baseline);
 }finally{useGame.setState(original,true);}
});
