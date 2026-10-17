import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStarterInventory, starterEquipment } from '../data/machine';
import { parts } from '../data/parts';
import { circuit, circuitLength } from '../data/circuit';
import { createDrivingState, machinePerformance, startDriving, stepDriving } from './driving';

function run(equipment=starterEquipment){
  const performance=machinePerformance(equipment);
  let state=startDriving(createDrivingState());
  for(let i=0;i<120*120&&state.status==='running';i++)state=stepDriving(state,performance);
  return state;
}
test('無料の初期装備は6分類すべて所持し、そのまま完走できる',()=>{
  const inventory=createStarterInventory();
  assert.equal(Object.keys(starterEquipment).length,6);
  for(const [category,id] of Object.entries(starterEquipment)){
    assert.equal(inventory[id],1);assert.equal(parts.find(p=>p.id===id)?.category,category);
  }
  const result=run();assert.equal(result.status,'finished');assert.equal(result.distance,circuitLength*circuit.laps);assert.ok(result.time>0);
});
test('ユーザーのスタート操作までは時計・距離・速度が進まない',()=>{
  const ready=createDrivingState(),performance=machinePerformance(starterEquipment);
  let state=ready;
  for(let i=0;i<1200;i++)state=stepDriving(state,performance);
  assert.deepEqual(state,ready);
  state=stepDriving(startDriving(state),performance);
  assert.equal(state.status,'running');assert.ok(state.time>0);assert.ok(state.distance>0);
  assert.equal(startDriving(state),state);
});
test('完走後のスタート入力では走行を再開しない。再試走は待機状態から始まる',()=>{
  const finished=run();assert.equal(startDriving(finished),finished);
  const ready=createDrivingState();assert.equal(ready.status,'ready');assert.equal(ready.time,0);
});
test('同一装備の固定刻み試走を再現でき、組み合わせ変更で走行性能が変わる',()=>{
  assert.deepEqual(run(),run());
  const standard=machinePerformance(starterEquipment);
  const geared=machinePerformance({...starterEquipment,gear:'gear-3.5'});
  assert.ok(geared.freeSpeed>standard.freeSpeed);assert.ok(geared.stallForce<standard.stallForce);
  assert.notEqual(run({...starterEquipment,motor:'motor-torque'}).time,run().time);
});
