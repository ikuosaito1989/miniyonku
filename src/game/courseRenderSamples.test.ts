import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {practiceCourseIds} from '../data/practiceCourses';
import {courseRenderSamples} from './courseRenderSamples';

test('描画用の間引きはジャンプ開口をまたがず全コースをカバーする',()=>{
 for(const id of ['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith',...practiceCourseIds] as CircuitId[]){
  const track=getCircuitTrack(id),samples=courseRenderSamples(track),count=track.circuit.samples;
  assert.equal(samples[0],0,id);assert.equal(samples.at(-1),count,id);assert.ok(samples.length<count+1,id);
  for(let i=1;i<samples.length;i++){
   const a=samples[i-1],b=samples[i];assert.ok(b>a&&b-a<=2,id);
   const gap=track.isJumpGap((a+b)/2/count*track.circuitLength);
   for(let j=a;j<b;j++)assert.equal(track.isJumpGap((j+.5)/count*track.circuitLength),gap,id);
  }
 }
});
