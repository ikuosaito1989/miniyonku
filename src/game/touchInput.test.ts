import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTouchInput } from './touchInput';
import { raceRenderSize } from '../data/display';

test('移動経路を停止するため、リセットごとに世代を更新する',()=>{
  const input=createTouchInput();assert.equal(input.version(),0);
  input.reset();assert.equal(input.version(),1);input.reset();assert.equal(input.version(),2);
});
test('調査入力は一度だけ消費され、画面切替・キャンセル用リセットで移動も止まる',()=>{
  const input=createTouchInput();input.interact();assert.equal(input.consume(),true);assert.equal(input.consume(),false);
  input.interact();input.reset();assert.equal(input.consume(),false);
});
test('スマホは画面解像度に追従し、長辺1280・DPR2の上限内で滑らかに描画する',()=>{
  assert.deepEqual(raceRenderSize(true,390,524,2),{width:780,height:1048});
  assert.deepEqual(raceRenderSize(true,844,300,3),{width:1280,height:455});
  assert.deepEqual(raceRenderSize(true,390,524,1),{width:390,height:524});
  const size=raceRenderSize(true,2000,1000,3);assert.equal(Math.max(size.width,size.height),1280);
  assert.deepEqual(raceRenderSize(false,800,400,2),{width:576,height:288});
  assert.deepEqual(raceRenderSize(true,0,0,2),{width:2,height:2});
});
