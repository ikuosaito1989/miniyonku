import assert from 'node:assert/strict';
import test from 'node:test';
import { starterEquipment } from '../data/machine';
import { parts } from '../data/parts';
import { buildQuickSetup } from './quickSetup';

const fullInventory = Object.fromEntries(parts.map(part => [part.id, 1]));

test('quick setup only equips owned parts and leaves inventory unchanged', () => {
  const inventory:Record<string,number> = { ...fullInventory, 'motor-zenith': 0 };
  const before = { ...inventory };
  for (const profile of ['speed', 'offroad', 'balanced'] as const) {
    const setup = buildQuickSetup(starterEquipment, inventory, profile);
    for (const id of Object.values(setup)) assert.ok(inventory[id] > 0, `${profile} used unowned part ${id}`);
  }
  assert.deepEqual(inventory, before);
});

test('quick setup preserves unavailable equipment and does not alter an empty inventory', () => {
  const current = { ...starterEquipment, body: 'body-champion' };
  const onlyCurrent = Object.fromEntries(Object.values(current).map(id => [id, 1]));
  assert.deepEqual(buildQuickSetup(current, onlyCurrent, 'speed'), current);
  assert.deepEqual(buildQuickSetup(current, {}, 'offroad'), current);
});

test('profiles produce different setups when useful owned alternatives exist', () => {
  const speed = buildQuickSetup(starterEquipment, fullInventory, 'speed');
  const dirt = buildQuickSetup(starterEquipment, fullInventory, 'offroad');
  assert.notDeepEqual(speed, dirt);
});
