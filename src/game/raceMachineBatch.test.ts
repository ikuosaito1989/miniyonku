import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {starterEquipment} from '../data/machine';
import {buildMachineModel,buildRaceMachineModel} from './MachineModel';
import {createRaceState} from './race';
import {batchRaceWheelSpokes} from './raceMachineBatch';
import {disposeSceneResources} from './modelFinish';

test('レース車両のスポークを車輪単位にまとめても位置・個数と車輪回転を維持する',()=>{
 const car=buildRaceMachineModel(createRaceState(starterEquipment).racers[0]);
 const wheels=car.userData.rotatingWheels as THREE.Group[];
 const before=wheels.map(w=>w.children.filter(o=>o.name.startsWith('wheel-spoke-')).map(o=>{o.updateMatrix();return o.matrix.toArray();}));
 batchRaceWheelSpokes(car);
 wheels.forEach((wheel,i)=>{
  const mesh=wheel.children.find(o=>o.name.startsWith('wheel-spoke-')) as THREE.InstancedMesh;
  assert.ok(mesh instanceof THREE.InstancedMesh);assert.equal(mesh.count,before[i].length);
  for(let j=0;j<mesh.count;j++){const matrix=new THREE.Matrix4();mesh.getMatrixAt(j,matrix);matrix.toArray().forEach((n,k)=>assert.ok(Math.abs(n-before[i][j][k])<1e-6));}
  assert.equal(mesh.parent,wheel);
 });
 disposeSceneResources(car);
});

test('セイランとレジェンドでもスポークとローラーの可動階層を保持する',()=>{
 for(const body of ['body-champion','body-legend-flow','body-legend-wedge','body-legend-towa','body-legend-muscle']){
  const car=buildMachineModel(0xffffff,{...starterEquipment,body,wheel:'wheel-light'});
  const rollers=car.userData.rotatingRollers as THREE.Group[];
  batchRaceWheelSpokes(car);
  for(const wheel of car.userData.rotatingWheels as THREE.Group[]){const spokes=wheel.children.find(o=>o.name==='wheel-spoke-wheel-light') as THREE.InstancedMesh;assert.ok(spokes instanceof THREE.InstancedMesh,body);assert.equal(spokes.count,6);}
  assert.equal(rollers.length,6);assert.ok(rollers.every(r=>r.parent!==null));disposeSceneResources(car);
 }
});
