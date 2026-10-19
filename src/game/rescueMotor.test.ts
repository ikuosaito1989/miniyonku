import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment, createStarterInventory } from '../data/machine';
import { parts } from '../data/parts';
import { isStocked } from '../data/progression';
import { createStarterUnits, motorFactor, motorWear } from './condition';
import { machinePerformance, createDrivingState, startDriving, stepDriving } from './driving';
import { useGame } from './store';
import { decodeSave, snapshotGame } from './saveData';

test('救済モーターは初期予備・非売品・性能一定で、標準より低出力',()=>{
  assert.equal(createStarterInventory()['motor-rescue'],1);
  assert.equal(createStarterUnits()['motor-rescue'].length,1);
  assert.equal(isStocked(parts.find(p=>p.id==='motor-rescue')!),false);
  for(const age of [0,60,180,1200,100000]){
    assert.equal(motorFactor(age,'motor-rescue'),1);assert.equal(motorWear(age,'motor-rescue'),0);
  }
  const equipment={...starterEquipment,motor:'motor-rescue',battery:'battery-recharge'};
  const fresh=machinePerformance(equipment),old=machinePerformance(equipment,{motorSeconds:100000,batterySeconds:100000});
  assert.ok(fresh.freeSpeed<machinePerformance(starterEquipment).freeSpeed);
  assert.ok(fresh.stallForce<machinePerformance(starterEquipment).stallForce);
  let a=startDriving(createDrivingState()),b=startDriving(createDrivingState());
  for(let i=0;i<120*300&&a.status==='running';i++){a=stepDriving(a,fresh);b=stepDriving(b,old);}
  assert.deepEqual(a,b);assert.equal(a.status,'finished');
});
test('旧セーブに予備を追加し、装備・財布を維持。慣らしでは電池も時間も消費しない',()=>{
  const game=snapshotGame(useGame.getInitialState());
  delete game.inventory['motor-rescue'];delete game.units['motor-rescue'];
  const restored=decodeSave({version:1,savedAt:1234,game}).game;
  assert.equal(restored.inventory['motor-rescue'],1);assert.equal(restored.money,game.money);
  assert.deepEqual(restored.equipment,game.equipment);
  const previous=useGame.getState();
  try{
    useGame.setState(useGame.getInitialState());useGame.getState().openSetting();useGame.getState().equip('motor-rescue','motor');
    const before=snapshotGame(useGame.getState());useGame.getState().breakIn();
    assert.deepEqual(snapshotGame(useGame.getState()),before);
  }finally{useGame.setState(previous);}
});
