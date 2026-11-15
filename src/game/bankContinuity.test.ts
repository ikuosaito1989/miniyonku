import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
test('紫電の螺旋出口は360度から0度へ逆回転せず姿勢が連続する',()=>{
 const track=getCircuitTrack('master-violet');
 let previous=track.sampleLanePath(240.4,2);
 for(let d=240.405;d<240.9;d+=.005){
  const p=track.sampleLanePath(d,2);
  assert.ok(Math.abs(Math.atan2(Math.sin(p.bank-previous.bank),Math.cos(p.bank-previous.bank)))<.05);
  previous=p;
 }
});
