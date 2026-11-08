import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paintedFixtureFrame,paintedSceneryLayout} from '../data/paintedSceneryLayout';
import {shopLayout} from '../data/shopLayout';
import {modelShops} from '../data/world';
import {officialFixturesFor} from '../data/officialVenue';

test('旧店舗の全室原画と家具を同じ倍率で配置し、あおぞらは背景も前景も左右反転する',()=>{
 for(const id of Object.keys(modelShops) as Array<keyof typeof modelShops>){
  const {bounds,mirrored}=paintedSceneryLayout(id);assert.deepEqual(bounds,{x:0,y:0,width:960,height:640});assert.equal(mirrored,id==='aozora');
  for(const {source,target} of shopLayout(id)){
   const frame=paintedFixtureFrame(id,target,1920,1280);
   assert.deepEqual(frame,{x:source.x*2,y:source.y*2,width:source.w*2,height:source.h*2});
   assert.ok(frame.x>=0&&frame.x+frame.width<=1920&&frame.y>=0&&frame.y+frame.height<=1280);
  }
 }
});
test('大会会場の原画範囲とコース・ピット・観客席の切り出しを維持する',()=>{
 for(const id of ['stadium-5','stadium-9','stadium-10','stadium-7']){
  assert.deepEqual(paintedSceneryLayout(id),{bounds:{x:40,y:35,width:880,height:579},mirrored:false});
  for(const f of officialFixturesFor(id)){
   const frame=paintedFixtureFrame(id,f,1760,1158);
   assert.deepEqual(frame,{x:(f.x-40)*2,y:(f.y-35)*2,width:f.w*2,height:f.h*2});
  }
 }
});
