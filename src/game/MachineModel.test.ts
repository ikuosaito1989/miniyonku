import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildMachineModel } from './MachineModel';
import { starterEquipment } from '../data/machine';
import { bodies } from '../data/bodies';

test('曲面マシンの頂点は有限で、従来のレーン内寸法に収まる',()=>{
  const model=buildMachineModel(0xe85438,starterEquipment);
  let curved=false;
  model.traverse(object=>{
    if(!(object instanceof THREE.Mesh))return;
    for(const value of object.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));
    if(object.name==='body-shell'&&object.geometry.getAttribute('position').count>500)curved=true;
  });
  assert.ok(curved);
  const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  assert.ok(size.x<.22);
  assert.ok(size.z<.3);
  assert.ok(size.y<.12);
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});

test('入門ボディは赤い低床ウェッジにリヤウイングと前後フェンダーを備え、レース色を反映する',()=>{
  const model=buildMachineModel(0xd94232,starterEquipment);
  assert.equal((model.getObjectByName('body-shell') as THREE.Mesh).material instanceof THREE.MeshPhongMaterial?((model.getObjectByName('body-shell') as THREE.Mesh).material as THREE.MeshPhongMaterial).color.getHex():0,0xd94232);
  assert.ok(model.getObjectByName('rear-wing'));
  assert.ok(model.getObjectByName('front-fender-arch'));
  assert.ok(model.getObjectByName('rear-fender-arch'));
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});

test('初優勝ボディは独自の赤白青緑リバリーと立体フィンを持つ最上位モデル',()=>{
  const model=buildMachineModel(0x111111,{...starterEquipment,body:'body-champion'});
  assert.ok(model.getObjectByName('champion-nose-inlay'));
  assert.ok(model.getObjectByName('champion-rear-fin'));
  assert.ok(model.getObjectByName('champion-inner-fin'));
  assert.ok(model.getObjectByName('champion-wing-stripe'));
  const body=model.getObjectByName('body-shell') as THREE.Mesh;
  assert.equal((body.material as THREE.MeshPhongMaterial).color.getHex(),0xdf3b3a);
  const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
  assert.ok(size.x<.22&&size.z<.3&&size.y<.12);
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});

test('装備したタイヤ・ホイール・ローラーと内部パーツが個別の造形でプレビューされる',()=>{
  const equipment={...starterEquipment,tire:'tire-2',wheel:'wheel-light',rollerFront:'roller-2',rollerSide:'roller-1',rollerRear:'roller-0',chassis:'chassis-light',motor:'motor-rev',gear:'gear-4',battery:'battery-power',shaft:'shaft-1',terminal:'terminal-1',accessory:'accessory-support'};
  const model=buildMachineModel(0xd94232,equipment);
  for(const name of ['tire-tire-2','tire-sidewall-tire-2','wheel-rim-wheel-light','wheel-spoke-wheel-light','roller-rollerFront-roller-2','roller-bearing-rollerFront','roller-rollerSide-roller-1','roller-rollerRear-roller-0','chassis-lightening-slot','motor-cooling-fin','gear-inspection-cap','battery-service-cover','hollow-shaft-collar','terminal-contact','underbody-support'])assert.ok(model.getObjectByName(name),name);
  const count=(name:string)=>{let total=0;model.traverse(object=>{if(object.name===name)total++;});return total;};
  assert.equal(count('wheel-spoke-wheel-light'),24);
  assert.equal(count('motor-cooling-fin'),5);
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});

test('全ボディの曲面形状が有限でレーンに収まり、軽・SUV・スポーツの背の高さを描き分ける',()=>{
  const heights:Record<string,number>={};
  for(const body of bodies){
    const model=buildMachineModel(0x72c5ad,{...starterEquipment,body:body.id});
    model.traverse(object=>{if(object instanceof THREE.Mesh)for(const value of object.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value));});
    const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());
    assert.ok(size.x<.22&&size.z<.3&&size.y<.12,body.id);
    heights[body.id]=new THREE.Box3().setFromObject(model.getObjectByName('cabin-glass')!).getSize(new THREE.Vector3()).y;
    model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
  }
  assert.ok(heights['body-manta']>heights['body-stream']);
  assert.ok(heights['body-stream']<heights['body-arrow']);
});
