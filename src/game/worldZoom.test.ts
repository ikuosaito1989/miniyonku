import {test} from 'node:test';
import assert from 'node:assert/strict';
import {shopWorldZoom} from '../data/display';
import {roomView} from '../data/shop';
test('街でも模型店でも同じ投影を使い、スマホでは人物の縦横比と模型店の従来倍率を保つ',()=>{
 for(const [width,height] of [[320,568],[390,650],[390,844],[844,390],[1280,800]])for(const dpr of [1,2]){
  const zoom=shopWorldZoom(width*dpr,height*dpr,true);
  assert.equal(zoom.x,zoom.y);
  assert.equal(zoom.x/dpr,Math.max(width/560,height/roomView.height));
  const desktop=shopWorldZoom(width*dpr,height*dpr,false);
  assert.equal(desktop.x/dpr,width/roomView.width);assert.equal(desktop.y/dpr,height/roomView.height);
 }
});
