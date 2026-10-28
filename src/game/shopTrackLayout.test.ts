import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {shopTrackLayout} from './shopTrackLayout';
test('店内模型は実コースの全レーンと端点を台の内側へ収める',()=>{
 for(const id of ['leaf','wind','sun','sprint','grove','comet','trail','grandprix'] as CircuitId[]){
  const track=getCircuitTrack(id),layout=shopTrackLayout(track,286,163);
  assert.equal(layout.paths.length,6);
  for(const path of [layout.centerline,...layout.paths])for(const p of path){assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));assert.ok(p.x>=9&&p.x<=277,`${id}: x=${p.x}`);assert.ok(p.y>=9&&p.y<=137,`${id}: y=${p.y}`);}
  const start=layout.centerline[0],end=layout.centerline.at(-1)!;assert.equal(Math.hypot(end.x-start.x,end.y-start.y)>10,track.open);
 }
});
