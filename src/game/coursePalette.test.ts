import {test} from 'node:test';
import assert from 'node:assert/strict';
import {circuitDefinitions,getCircuitTrack,type CircuitId} from '../data/circuit';
import {courseRailColorAt,pavedCourseColors} from './coursePalette';

test('舗装コースのレールは白・赤・青で統一し、オフロードの土色は維持する',()=>{
 for(const id of [...Object.keys(circuitDefinitions),'forge','zenith'] as CircuitId[]){
  const track=getCircuitTrack(id),colors=new Set<number|null>();
  for(let i=0;i<1200;i++)colors.add(courseRailColorAt(track,i/1200*track.circuitLength));
  if(track.circuit.surface.roughness===0){
   assert.ok(colors.has(pavedCourseColors.white),id+' white');assert.ok(colors.has(pavedCourseColors.red),id+' red');assert.ok(colors.has(pavedCourseColors.blue),id+' blue');assert.ok(!colors.has(null),id+' paved rail');
  }else assert.deepEqual(colors,new Set([null]),id+' off-road rail palette');
 }
});
