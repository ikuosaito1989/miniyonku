import {test} from 'node:test';import assert from 'node:assert/strict';
import {startAdviceConversation,type AdviceWorker} from './adviceConversation';
import {useGame} from './store';import {snapshotGame} from './saveData';import type {RaceAdviceContext} from './raceAdvice';
class TestWorker implements AdviceWorker{
 onmessage:AdviceWorker['onmessage']=null;onerror:AdviceWorker['onerror']=null;stopped=0;sent:RaceAdviceContext|null=null;
 postMessage(context:RaceAdviceContext){this.sent=context;}
 terminate(){this.stopped++;}
 answer(text:string){this.onmessage?.({data:{text}} as MessageEvent);}
}
const context=():RaceAdviceContext=>{const s=useGame.getInitialState();return {shopId:'komorebi',equipment:s.equipment,inventory:s.inventory,money:s.money,motorSeconds:0,batterySeconds:0,review:null};};
test('話しかけた直後に考え中を開き、計算結果だけを入れ替える。待機状態は保存しない',()=>{
 const before=useGame.getState();try{
 useGame.setState(useGame.getInitialState(),true);const saved=snapshotGame(useGame.getState()),worker=new TestWorker(),ctx=context();startAdviceConversation(ctx,useGame,()=>worker);
 assert.equal(useGame.getState().overlay,'dialogue');assert.equal(useGame.getState().speaker,'佐伯 匠');assert.equal(useGame.getState().adviceThinking,true);assert.match(useGame.getState().dialogue,/ちょっと待って/);assert.deepEqual(snapshotGame(useGame.getState()),saved);assert.notEqual(worker.sent?.equipment,ctx.equipment);
 worker.answer('今の装備なら、ギアを見直そう！');assert.equal(useGame.getState().dialogue,'今の装備なら、ギアを見直そう！');assert.equal(useGame.getState().adviceThinking,false);assert.equal(worker.stopped,1);
 }finally{useGame.setState(before,true);}
});
test('考え中でも閉じられ、遅れて届いた回答で会話を再表示しない',()=>{
 const before=useGame.getState();try{
 useGame.setState(useGame.getInitialState(),true);const worker=new TestWorker();startAdviceConversation(context(),useGame,()=>worker);useGame.getState().close();assert.equal(worker.stopped,1);assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().adviceThinking,false);
 useGame.getState().talk('店主','いらっしゃい');worker.answer('古いアドバイス');assert.equal(useGame.getState().speaker,'店主');assert.equal(useGame.getState().dialogue,'いらっしゃい');
 }finally{useGame.setState(before,true);}
});
test('再相談で前の計算を中止し、新しい回答だけを表示する',()=>{
 const before=useGame.getState();try{
 useGame.setState(useGame.getInitialState(),true);const first=new TestWorker(),second=new TestWorker();startAdviceConversation(context(),useGame,()=>first);startAdviceConversation(context(),useGame,()=>second);assert.equal(first.stopped,1);
 first.answer('古い結果');assert.equal(useGame.getState().adviceThinking,true);second.answer('新しい結果');assert.equal(useGame.getState().dialogue,'新しい結果');assert.equal(second.stopped,1);
 }finally{useGame.setState(before,true);}
});
test('計算を開始できない環境でも待機し続けず、その装備の助言を表示する',()=>{
 const before=useGame.getState();try{
 useGame.setState(useGame.getInitialState(),true);startAdviceConversation(context(),useGame,()=>{throw new Error('unsupported');});assert.equal(useGame.getState().adviceThinking,false);assert.match(useGame.getState().dialogue,/約60秒/);assert.equal(useGame.getState().overlay,'dialogue');
 const worker=new TestWorker();startAdviceConversation(context(),useGame,()=>worker);worker.onmessage?.({data:{error:true}} as MessageEvent);assert.equal(useGame.getState().adviceThinking,false);assert.equal(worker.stopped,1);
 }finally{useGame.setState(before,true);}
});
