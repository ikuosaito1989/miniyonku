import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTouchInput } from './touchInput';
import { raceRenderSize, shopRenderOptions } from '../data/display';

test('移動経路を停止するため、リセットごとに世代を更新する',()=>{
  const input=createTouchInput();assert.equal(input.version(),0);
  input.reset();assert.equal(input.version(),1);input.reset();assert.equal(input.version(),2);
});
test('調査入力は一度だけ消費され、画面切替・キャンセル用リセットで移動も止まる',()=>{
  const input=createTouchInput();input.interact();assert.equal(input.consume(),true);assert.equal(input.consume(),false);
  input.interact();input.reset();assert.equal(input.consume(),false);
});
test('PC・スマホは画面解像度に追従し、DPR上限とモバイル描画上限内でピクセル描画する',()=>{
  assert.deepEqual(raceRenderSize(true,390,524,2),{width:780,height:1048});
  assert.deepEqual(raceRenderSize(true,844,300,3),{width:1600,height:569});
  assert.deepEqual(raceRenderSize(true,390,524,1),{width:390,height:524});
  const size=raceRenderSize(true,2000,1000,3);assert.equal(Math.max(size.width,size.height),1600);
  assert.deepEqual(raceRenderSize(false,800,400,2),{width:1600,height:800});
  assert.deepEqual(raceRenderSize(false,1920,1080,2),{width:2560,height:1440});
  assert.deepEqual(raceRenderSize(false,2000,2000,2),{width:1920,height:1920});
  assert.deepEqual(raceRenderSize(true,0,0,2),{width:2,height:2});
});
test('2DはNearestのピクセル描画を使い、描画解像度に上限を設ける',()=>{
  assert.equal(shopRenderOptions.pixelArt,true);assert.equal(shopRenderOptions.roundPixels,true);
  assert.equal(shopRenderOptions.antialias,false);assert.equal(shopRenderOptions.antialiasGL,false);
  for(const value of [NaN,Infinity,-1,0]){
    const size=raceRenderSize(false,value,value,value);
    assert.ok(Number.isFinite(size.width)&&size.width>=1&&Number.isFinite(size.height)&&size.height>=1);
  }
});
