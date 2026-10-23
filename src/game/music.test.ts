import { test } from 'node:test';
import assert from 'node:assert/strict';
import { packMusic, unpackMusic } from './musicPackage';
import { MusicPlayer } from './MusicPlayer';
import { useAudioSettings } from './audioSettings';

test('BGMコンテナは元データを復元でき、形式不正・改ざんを拒否する',async()=>{
  const raw=new Uint8Array([73,68,51,1,2,3,4]);
  const packed=await packMusic(raw);
  assert.notDeepEqual(packed.slice(0,3),raw.slice(0,3));
  assert.deepEqual(new Uint8Array(await unpackMusic(packed.buffer)),raw);
  await assert.rejects(unpackMusic(new ArrayBuffer(5)));
  packed[packed.length-1]^=1;await assert.rejects(unpackMusic(packed.buffer));
});

test('音量は0〜100%に制限し、ミュートをシーン間で共有する',()=>{
  const original=useAudioSettings.getState();
  try{
    original.setVolume(3);assert.equal(useAudioSettings.getState().volume,1);
    original.setVolume(-1);assert.equal(useAudioSettings.getState().volume,0);
    original.setVolume(NaN);assert.equal(useAudioSettings.getState().volume,.35);
    original.toggle();assert.equal(useAudioSettings.getState().enabled,!original.enabled);
  }finally{useAudioSettings.setState(original);}
});

test('初回操作後だけ再生。ロード中のシーン切替で旧BGMが鳴らず、背景休止・ミュート・破棄に対応',async()=>{
  const originalContext=Object.getOwnPropertyDescriptor(globalThis,'AudioContext'),originalFetch=globalThis.fetch;
  const contexts:FakeContext[]=[];
  const pending=new Map<string,(response:Response)=>void>();
  class FakeContext {
    currentTime=0;destination={};state='suspended';onstatechange:(()=>void)|null=null;sources:Array<{started:boolean;stopped:boolean;loop:boolean}>=[];
    constructor(){contexts.push(this);}
    createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){}};}
    resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
    decodeAudioData(){return Promise.resolve({});}
    createBufferSource(){const source={started:false,stopped:false,loop:false,buffer:null,connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};this.sources.push(source);return source;}
  }
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:FakeContext});
  globalThis.fetch=(url)=>new Promise<Response>(resolve=>pending.set(String(url),resolve));
  const player=new MusicPlayer({shop:{url:'shop'},race:{url:'race'}},()=>{});
  const settle=()=>new Promise(resolve=>setTimeout(resolve,25));
  try{
    assert.equal(contexts.length,0);player.unlock();await settle();
    assert.ok(pending.has('shop'));player.setScene('race');await settle();
    const packed=await packMusic(new Uint8Array([1,2,3]));
    pending.get('shop')!(new Response(packed));await settle();
    assert.equal(contexts[0].sources.length,0);
    pending.get('race')!(new Response(packed));await settle();
    assert.equal(contexts[0].sources.length,1);assert.equal(contexts[0].sources[0].loop,true);
    player.setVisible(false);assert.equal(contexts[0].state,'suspended');
    player.setVisible(true);await settle();assert.equal(contexts[0].state,'running');
    player.setSettings(false,.2);player.setScene('shop');await settle();assert.equal(contexts[0].sources[0].stopped,true);
    player.setSettings(true,.2);await settle();assert.equal(contexts[0].sources.length,2);
    contexts[0].state='interrupted';contexts[0].onstatechange?.();await settle();assert.equal(contexts[0].state,'running');
    player.dispose();assert.equal(contexts[0].state,'closed');assert.equal(contexts[0].sources[1].stopped,true);
  }finally{
    player.dispose();globalThis.fetch=originalFetch;
    if(originalContext)Object.defineProperty(globalThis,'AudioContext',originalContext);else Reflect.deleteProperty(globalThis,'AudioContext');
  }
});

test('Safariで最初のresumeが未解決でも次の操作で再試行し、BGMを1本だけ再生する',async()=>{
  const descriptor=Object.getOwnPropertyDescriptor(globalThis,'AudioContext'),originalFetch=globalThis.fetch;
  let context:Context,firstResume:()=>void=()=>{};
  const packed=await packMusic(new Uint8Array([1,2,3]));
  class Context{
    state='suspended';currentTime=0;destination={};onstatechange:(()=>void)|null=null;requests=0;starts=0;
    constructor(){context=this;}
    createGain(){return {gain:{value:0,setTargetAtTime(){}},connect(){}};}
    resume(){this.requests++;if(this.requests===1)return new Promise<void>(resolve=>{firstResume=resolve;});this.state='running';return Promise.resolve();}
    close(){this.state='closed';return Promise.resolve();}
    decodeAudioData(){return Promise.resolve({});}
    createBufferSource(){return {buffer:null,loop:false,onended:null,connect(){},disconnect(){},start(){context.starts++;},stop(){}};}
  }
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:Context});
  globalThis.fetch=async()=>new Response(packed);
  const player=new MusicPlayer({shop:{url:'shop'},race:{url:'race'}},()=>{});
  const flush=()=>new Promise(resolve=>setTimeout(resolve,25));
  try{
    player.unlock();assert.equal(context!.requests,1);
    player.unlock();await flush();assert.equal(context!.requests,2);assert.equal(context!.starts,1);
    firstResume();await flush();assert.equal(context!.starts,1);
    player.setSettings(false,.35);player.unlock();assert.equal(context!.requests,2);
  }finally{player.dispose();globalThis.fetch=originalFetch;if(descriptor)Object.defineProperty(globalThis,'AudioContext',descriptor);else Reflect.deleteProperty(globalThis,'AudioContext');}
});
