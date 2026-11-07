import type {StoreApi} from 'zustand';
import {useGame,type GameState} from './store';
import type {RaceAdviceContext} from './raceAdvice';
import {parts} from '../data/parts';
import {batteryCharge} from './condition';
export interface AdviceWorker{
 onmessage:((event:MessageEvent<{text?:string;error?:boolean}>)=>void)|null;
 onerror:((event:ErrorEvent)=>void)|null;
 postMessage:(context:RaceAdviceContext)=>void;
 terminate:()=>void;
}
const pending=new WeakMap<StoreApi<GameState>,()=>void>();
function quickAdvice(context:RaceAdviceContext){
 const motor=parts.find(p=>p.id===context.equipment.motor)!;
 return ['今のマシンを見てみたよ。',context.review?.text,
 motor.specs.wear===0?'このモーターは消耗なし・慣らし不要だよ。':context.motorSeconds<60?'モーターは約60秒まで慣らすと好調になるよ。慣らしで電池残量は減らないから、作業台で試してみよう。':context.motorSeconds>180?'モーターが摩耗しているね。新品への交換も考えてみよう。':'モーターの慣らしは十分だね。',
 batteryCharge(context.equipment.battery,context.batterySeconds)<.5?'電池残量が少ないね。レース前に新品への交換を考えよう。':'電池の状態はまだ良さそうだよ。',
 'コーナーではタイヤ・ローラー・シャーシの組み合わせも大切。一つずつ替えて、同じコースで試走してみよう。'].filter(Boolean).join('\n\n');
}
/** 会話を先に描画し、重い試走比較は別スレッドへ。閉じた会話の回答は戻さない。 */
export function startAdviceConversation(context:RaceAdviceContext,store:StoreApi<GameState>=useGame,createWorker:()=>AdviceWorker=()=>new Worker(new URL('./raceAdvice.worker.ts',import.meta.url),{type:'module'})){
 pending.get(store)?.();
 let active=true,worker:AdviceWorker|null=null,unsubscribe=()=>{};
 const dispose=()=>{if(!active)return false;active=false;unsubscribe();worker?.terminate();if(pending.get(store)===cancel)pending.delete(store);return true;};
 const cancel=()=>{if(dispose()&&store.getState().adviceThinking)store.setState({adviceThinking:false});};
 const finish=(text:string)=>{
  if(!dispose())return;
  const state=store.getState();
  if(state.overlay==='dialogue'&&state.speaker==='佐伯 匠'&&state.adviceThinking)store.setState({dialogue:text,adviceThinking:false});
 };
 pending.set(store,cancel);
 store.setState({overlay:'dialogue',speaker:'佐伯 匠',dialogue:'うーん…今のマシンを見ているよ。\n速く走れるパーツの組み合わせは…ちょっと待ってね。',adviceThinking:true,dialogueStage:'none',shopAfter:false});
 unsubscribe=store.subscribe(state=>{if(state.overlay!=='dialogue'||state.speaker!=='佐伯 匠'||!state.adviceThinking)cancel();});
 try{
  worker=createWorker();
  worker.onmessage=event=>finish(typeof event.data.text==='string'?event.data.text:quickAdvice(context));
  worker.onerror=event=>{event.preventDefault();finish(quickAdvice(context));};
  worker.postMessage(structuredClone(context));
 }catch{finish(quickAdvice(context));}
 return cancel;
}
