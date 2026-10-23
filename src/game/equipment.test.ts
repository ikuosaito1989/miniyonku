import { test } from 'node:test';
import assert from 'node:assert/strict';
import { equipPart } from './equipment';
import { starterEquipment, createStarterInventory } from '../data/machine';
import { machinePerformance } from './driving';
import { purchase } from './purchase';

test('未所持・不明なパーツは装備できない',()=>{
  const inventory=createStarterInventory();
  assert.equal(equipPart(starterEquipment,inventory,'motor-rev'),starterEquipment);
  assert.equal(equipPart(starterEquipment,inventory,'unknown'),starterEquipment);
});
test('購入した装備を交換し、所持数を消費せず元の装備へ戻せる',()=>{
  const wallet=purchase({money:3000,inventory:createStarterInventory()},'motor-rev').wallet;
  const before={...wallet.inventory};
  const changed=equipPart(starterEquipment,wallet.inventory,'motor-rev');
  assert.equal(changed.motor,'motor-rev');
  assert.equal(changed.gear,starterEquipment.gear);
  assert.equal(starterEquipment.motor,'motor-stock');
  assert.deepEqual(wallet.inventory,before);
  assert.notEqual(machinePerformance(changed).freeSpeed,machinePerformance(starterEquipment).freeSpeed);
  assert.deepEqual(equipPart(changed,wallet.inventory,'motor-stock'),starterEquipment);
});

test('ローラーは所持1セットで前横後をまとめて交換し、未所持品は使えない',()=>{
  const inventory={...createStarterInventory(),'roller-2':1};
  const front=equipPart(starterEquipment,inventory,'roller-2','rollerFront');
  assert.equal(front.rollerFront,'roller-2');
  assert.equal(front.rollerSide,'roller-2');
  assert.equal(front.rollerRear,'roller-2');
  assert.deepEqual(equipPart(front,inventory,'roller-2','rollerSide'),front);
  assert.equal(equipPart(front,inventory,'roller-2','motor'),front);
  const side=equipPart(front,{...inventory,'roller-2':2},'roller-2','rollerSide');
  assert.equal(side.rollerSide,'roller-2');
  const removed=equipPart(side,inventory,'roller-0','rollerFront');
  assert.equal(removed.rollerFront,'roller-0');assert.equal(removed.rollerSide,'roller-0');assert.equal(removed.rollerRear,'roller-0');
  assert.equal(equipPart(removed,inventory,'roller-1','rollerRear'),removed);
  assert.equal(equipPart(front,inventory,'roller-2','rollerFront').rollerFront,'roller-2');
});
test('タイヤとホイールは別枠で交換する',()=>{
  const inventory={...createStarterInventory(),'wheel-light':1,'tire-1':1};
  const wheel=equipPart(starterEquipment,inventory,'wheel-light','wheel');
  assert.equal(wheel.wheel,'wheel-light');assert.equal(wheel.tire,'tire-0');
  const tire=equipPart(wheel,inventory,'tire-1','tire');
  assert.equal(tire.wheel,'wheel-light');assert.equal(tire.tire,'tire-1');
});
