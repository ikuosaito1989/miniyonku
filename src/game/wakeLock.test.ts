import test from 'node:test';import assert from 'node:assert/strict';import {keepScreenAwake} from './wakeLock';
class Lock extends EventTarget{released=false;async release(){this.released=true;this.dispatchEvent(new Event('release'));}}
class Screen extends EventTarget{visibilityState:DocumentVisibilityState='visible';}
const tick=()=>new Promise(r=>setTimeout(r,0));
test('表示中だけ保持し、背景復帰・OS解除後の操作で再取得、終了時に解除する',async()=>{
 const doc=new Screen(),locks:Lock[]=[];const stop=keepScreenAwake({wakeLock:{request:async()=>{const l=new Lock();locks.push(l);return l;}}},doc);
 await tick();assert.equal(locks.length,1);doc.dispatchEvent(new Event('pointerdown'));await tick();assert.equal(locks.length,1);
 doc.visibilityState='hidden';doc.dispatchEvent(new Event('visibilitychange'));await tick();assert.equal(locks[0].released,true);
 doc.visibilityState='visible';doc.dispatchEvent(new Event('visibilitychange'));await tick();assert.equal(locks.length,2);
 await locks[1].release();doc.dispatchEvent(new Event('keydown'));await tick();assert.equal(locks.length,3);stop();assert.equal(locks[2].released,true);
 doc.dispatchEvent(new Event('pointerdown'));await tick();assert.equal(locks.length,3);
});
test('非対応・取得拒否でも続行し、終了後に到着したロックは即解除する',async()=>{
 const doc=new Screen();keepScreenAwake({},doc)();let resolve!:(l:Lock)=>void;const stop=keepScreenAwake({wakeLock:{request:()=>new Promise(r=>resolve=r)}},doc);stop();const lock=new Lock();resolve(lock);await tick();assert.equal(lock.released,true);
 let tries=0;const cleanup=keepScreenAwake({wakeLock:{request:async()=>{tries++;throw Error('denied');}}},doc);await tick();doc.dispatchEvent(new Event('pointerdown'));await tick();assert.equal(tries,2);cleanup();
});
