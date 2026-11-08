import {test} from 'node:test';
import assert from 'node:assert/strict';
import {seamlessLoop} from './RaceSoundLayer';
test('ループは末尾を先頭へ重ね、繰り返し境界の不連続を抑える',()=>{
 const inputData=Float32Array.from({length:1000},(_,i)=>i/1000),input={length:1000,sampleRate:1000,numberOfChannels:1,getChannelData:()=>inputData} as unknown as AudioBuffer;
 const context={createBuffer(_channels:number,length:number,sampleRate:number){const data=new Float32Array(length);return {length,sampleRate,numberOfChannels:1,getChannelData:()=>data};}} as unknown as AudioContext;
 const loop=seamlessLoop(context,input),data=loop.getChannelData(0);assert.equal(loop.length,910);assert.ok(Math.abs(data[0]-data[data.length-1])<.03);assert.equal(data[100],inputData[190]);
});
