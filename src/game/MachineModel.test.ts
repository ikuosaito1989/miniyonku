import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildMachineModel } from './MachineModel';
import { starterEquipment } from '../data/machine';

test('曲面マシンの頂点は有限で、従来のレーン内寸法に収まる',()=>{
  const model=buildMachineModel(0xe85438,starterEquipment);
  let curved=false;
  model.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    for(const value of object.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));
    if(object.geometry.getAttribute('position').count>1000)curved=true;
  });
  assert.ok(curved);
  const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  assert.ok(size.x<.22);
  assert.ok(size.z<.3);
  assert.ok(size.y<.12);
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});
