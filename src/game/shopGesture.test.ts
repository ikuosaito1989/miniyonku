import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createShopGesture } from './shopGesture';
test('指を滑らせた主方向に移動し、指を離すと必ず停止。スワイプはタップにならない',()=>{
  const g=createShopGesture();g.down(1,100,100,0);g.move(1,140,105);
  assert.deepEqual(g.direction(),{x:1,y:0});g.move(1,102,50);assert.deepEqual(g.direction(),{x:0,y:-1});
  assert.equal(g.up(1,102,50,300,true),null);assert.deepEqual(g.direction(),{x:0,y:0});
});
test('小さな揺れはタップ、長押し・往復ドラッグは調査や設定を開かない',()=>{
  const g=createShopGesture();g.down(1,100,100,0);g.move(1,105,103);assert.equal(g.up(1,105,103,150,false),'tap');
  g.down(1,100,100,200);assert.equal(g.up(1,100,100,900,false),null);
  g.down(1,100,100,1000);g.move(1,150,100);assert.equal(g.up(1,100,100,1200,true),null);
});
test('近い床の2回タップのみ設定を開く。人物・設備の連打では開かない',()=>{
  const g=createShopGesture();g.down(1,100,100,0);assert.equal(g.up(1,100,100,100,true),'tap');
  g.down(1,105,103,200);assert.equal(g.up(1,105,103,250,true),'setting');
  for(let i=0;i<2;i++){g.down(1,100,100,300+i*100);assert.equal(g.up(1,100,100,350+i*100,false),'tap');}
  g.down(1,100,100,1000);g.up(1,100,100,1050,true);g.down(1,200,200,1100);assert.equal(g.up(1,200,200,1150,true),'tap');
});
test('画面切替・キャンセル・複数指で移動とダブルタップ候補をリセット',()=>{
  const g=createShopGesture();g.down(1,100,100,0);g.move(1,150,100);g.reset();assert.deepEqual(g.direction(),{x:0,y:0});assert.equal(g.up(1,150,100,200,true),null);
  g.down(1,100,100,300);g.move(1,150,100);g.down(2,200,200,350);assert.deepEqual(g.direction(),{x:0,y:0});assert.equal(g.up(1,150,100,400,true),null);
});
