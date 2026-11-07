import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raceSoundCue, RaceAudio } from './RaceAudio';
import { createRaceState, startRace, stepRace, COUNTDOWN_TICKS } from './race';
import { starterEquipment } from '../data/machine';

test('電子音は3・2・1・GOの順。描画頻度によらずカウントの変化を識別する',()=>{
  let race=startRace(createRaceState(starterEquipment));
  const cues=new Set<string>();
  for(let i=0;i<=COUNTDOWN_TICKS;i++){cues.add(raceSoundCue(race));race=stepRace(race);}
  assert.deepEqual([...cues],['3','2','1','go']);
  assert.equal(raceSoundCue({...race,phase:'finished'}),'finished');
});

test('音声非対応環境でunlockに失敗してもゲームを妨げない',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false,addEventListener(){},removeEventListener(){}}});
  try{
    const audio=new RaceAudio();
    assert.doesNotThrow(()=>{audio.unlock();audio.update(startRace(createRaceState(starterEquipment)));audio.setEnabled(false);audio.dispose();});
  }finally{
    if(previous)Object.defineProperty(globalThis,'document',previous);else Reflect.deleteProperty(globalThis,'document');
  }
});

test('復帰後に音ONのまま再生を再開し、非同期解除中に消えたカウント音を鳴らす',async()=>{
  const originals=['document','window','AudioContext'].map(key=>[key,Object.getOwnPropertyDescriptor(globalThis,key)] as const);
  const contexts:Context[]=[],notes:number[]=[],levels:number[]=[];
  const events=new EventTarget();
  const param=()=>({value:0,setTargetAtTime(){},setValueAtTime(){},linearRampToValueAtTime(value:number){levels.push(value);}});
  const node=()=>({connect(other:unknown){return other;},disconnect(){}});
  class Context{
    state='suspended';currentTime=0;sampleRate=100;destination={};onstatechange:(()=>void)|null=null;
    constructor(){contexts.push(this);}
    resume(){this.state='running';return Promise.resolve();}suspend(){this.state='suspended';return Promise.resolve();}close(){this.state='closed';return Promise.resolve();}
    createGain(){return {...node(),gain:param()};}
    createDynamicsCompressor(){return {...node(),threshold:param(),knee:param(),ratio:param(),attack:param(),release:param()};}
    createBuffer(){return {getChannelData(){return new Float32Array(200);}};}
    createBufferSource(){return {...node(),buffer:null,loop:false,start(){},stop(){}};}
    createBiquadFilter(){return {...node(),type:'',frequency:param(),Q:param()};}
    createOscillator(){const frequency=param();return {...node(),frequency,type:'',start(){if(frequency.value>=880)notes.push(frequency.value);},stop(){},onended:null};}
  }
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false,addEventListener(){},removeEventListener(){}}});
  Object.defineProperty(globalThis,'window',{configurable:true,value:events});
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:Context});
  const flush=()=>new Promise(resolve=>setTimeout(resolve,0));
  try{
    const audio=new RaceAudio(),race=startRace(createRaceState(starterEquipment));
    audio.update(race);assert.equal(notes.length,0);
    audio.unlock();await flush();assert.deepEqual(notes,[880]);assert.ok(levels.includes(.26));
    contexts[0].state='interrupted';contexts[0].onstatechange?.();await flush();
    assert.equal(contexts[0].state,'running');
    audio.setEnabled(false);contexts[0].state='suspended';events.dispatchEvent(new Event('pointerdown'));await flush();assert.equal(contexts[0].state,'suspended');
    audio.setEnabled(true);await flush();assert.equal(contexts[0].state,'running');
    audio.update({...race,phase:'running'});assert.ok(notes.includes(1760));assert.ok(levels.includes(.34));
    audio.dispose();assert.equal(contexts[0].state,'closed');
  }finally{for(const [key,value] of originals){if(value)Object.defineProperty(globalThis,key,value);else Reflect.deleteProperty(globalThis,key);}}
});
