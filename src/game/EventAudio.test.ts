import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EventAudio} from './EventAudio';

test('登場・足音・接触を鳴らし、音量0・背景タブでは鳴らさず音源を解放する',async()=>{
  const doc=Object.getOwnPropertyDescriptor(globalThis,'document'),audio=Object.getOwnPropertyDescriptor(globalThis,'AudioContext');
  let hidden=false,created=0,closed=0,disconnected=0;
  const notes:number[]=[],levels:number[]=[];
  class Context{
    currentTime=1;destination={};
    constructor(){created++;}
    resume(){return Promise.resolve();}close(){closed++;return Promise.resolve();}
    createGain(){return {gain:{setValueAtTime(value:number){levels.push(value);},exponentialRampToValueAtTime(){}},connect(){},disconnect(){disconnected++;}};}
    createOscillator(){
      const oscillator={type:'',frequency:{setValueAtTime(value:number){notes.push(value);},exponentialRampToValueAtTime(){}},connect(gain:unknown){return gain;},start(){},stop(){},disconnect(){disconnected++;},onended:null as (()=>void)|null};
      queueMicrotask(()=>oscillator.onended?.());return oscillator;
    }
  }
  Object.defineProperty(globalThis,'document',{configurable:true,value:{get hidden(){return hidden;}}});
  Object.defineProperty(globalThis,'AudioContext',{configurable:true,value:Context});
  try{
    const sound=new EventAudio();sound.play('arrival',0);assert.equal(created,0);
    sound.play('arrival',.5);assert.equal(notes.length,3);
    sound.play('step',.5);assert.equal(notes.length,4);
    sound.play('contact',.5);assert.equal(notes.length,6);assert.ok(levels.every(level=>level>0&&level<=.13));
    hidden=true;sound.play('step',.5);assert.equal(notes.length,6);await Promise.resolve();assert.equal(disconnected,12);sound.dispose();assert.equal(closed,1);
  }finally{
    if(doc)Object.defineProperty(globalThis,'document',doc);else Reflect.deleteProperty(globalThis,'document');
    if(audio)Object.defineProperty(globalThis,'AudioContext',audio);else Reflect.deleteProperty(globalThis,'AudioContext');
  }
});
test('音声非対応でも登場イベントを妨げない',()=>{
  const doc=Object.getOwnPropertyDescriptor(globalThis,'document');
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false}});
  try{const sound=new EventAudio();assert.doesNotThrow(()=>{sound.unlock();sound.play('contact',.5);sound.dispose();});}
  finally{if(doc)Object.defineProperty(globalThis,'document',doc);else Reflect.deleteProperty(globalThis,'document');}
});
