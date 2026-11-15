import {test} from 'node:test';
import assert from 'node:assert/strict';
import {starterEquipment,equipmentSlots,type EquipmentSlot} from '../data/machine';
import {machinePreviewKey} from './machinePreviewKey';

test('プレビューの再生成は装備内容または塗色が変わったときだけ必要',()=>{
 const base=machinePreviewKey(starterEquipment,null);
 assert.equal(machinePreviewKey({...starterEquipment},null),base);
 for(const slot of Object.keys(equipmentSlots) as EquipmentSlot[]){
  assert.notEqual(machinePreviewKey({...starterEquipment,[slot]:'different-part'},null),base,slot);
 }
 assert.notEqual(machinePreviewKey(starterEquipment,0),base);
 assert.notEqual(machinePreviewKey(starterEquipment,0x17ac63),base);
});
