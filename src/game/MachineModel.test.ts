import { challenger } from '../data/challenger';
import { rivals } from '../data/rivals';
import { legends } from '../data/legends';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildMachineModel, buildRaceMachineModel } from './MachineModel';
import { starterEquipment } from '../data/machine';
import { bodies } from '../data/bodies';

test('曲面マシンの頂点は有限で、従来のレーン内寸法に収まる',()=>{
  const model=buildMachineModel(0xe85438,{...starterEquipment,body:'body-champion'});
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

test('コハクK660はモブ車と同じ箱型軽ワゴンで、ウイングのない地味な入門車',()=>{
  const model=buildMachineModel(0xb4b09a,starterEquipment);
  const mob=buildMachineModel(0xb4b09a,starterEquipment,'mob-kei');
  const body=model.getObjectByName('body-shell') as THREE.Mesh;
  assert.ok(body.geometry instanceof THREE.BoxGeometry);
  assert.equal((body.material as THREE.MeshPhongMaterial).color.getHex(),0xb4b09a);
  assert.equal((body.material as THREE.MeshPhongMaterial).shininess,12);
  assert.ok(model.getObjectByName('mob-kei-yellow-plate'));
  assert.ok(model.getObjectByName('mob-kei-plastic-bumper'));
  assert.ok(model.getObjectByName('mob-kei-square-headlight'));
  assert.equal(model.getObjectByName('rear-wing'),undefined);
  const geometry=(car:THREE.Group)=>{
    const result:unknown[]=[];car.traverse(object=>{if(object instanceof THREE.Mesh)result.push([object.name,Array.from(object.geometry.getAttribute('position').array),object.position.toArray()]);});return result;
  };
  assert.deepEqual(geometry(model),geometry(mob));
  for(const car of [model,mob])car.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
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
  const equipment={...starterEquipment,body:'body-champion',tire:'tire-2',wheel:'wheel-light',rollerFront:'roller-2',rollerSide:'roller-1',rollerRear:'roller-0',chassis:'chassis-light',motor:'motor-rev',gear:'gear-4',battery:'battery-power',shaft:'shaft-1',terminal:'terminal-1',accessory:'accessory-support'};
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
  assert.ok(heights['body-stream']>heights['body-arrow']);
});

test('通常CPUは箱型軽ワゴンの外観。記念車と最強兄弟は従来の造形を維持する',()=>{
  const mob=buildRaceMachineModel(rivals[0]);
  assert.ok(mob.getObjectByName('mob-kei-yellow-plate'));
  assert.ok(mob.getObjectByName('mob-kei-plastic-bumper'));
  assert.ok(mob.getObjectByName('mob-kei-square-headlight'));
  assert.equal(mob.getObjectByName('rear-wing'),undefined);
  const size=new THREE.Box3().setFromObject(mob).getSize(new THREE.Vector3());
  assert.ok(size.x<.22&&size.z<.3&&size.y<.13);
  const shell=mob.getObjectByName('body-shell') as THREE.Mesh;
  assert.ok(shell.geometry instanceof THREE.BoxGeometry);
  const protectedCars=[{id:'player',color:0xff0000,equipment:{...starterEquipment,body:'body-champion'}},...legends.slice(0,2).map(legend=>({...legend,color:0xff0000}))];
  for(const racer of protectedCars){
    const current=buildRaceMachineModel(racer),previous=buildMachineModel(racer.color,racer.equipment);
    assert.equal(current.getObjectByName('mob-kei-yellow-plate'),undefined);
    const geometry=(model:THREE.Group)=>{
      const result:unknown[]=[];model.traverse(object=>{if(object instanceof THREE.Mesh)result.push([object.name,Array.from(object.geometry.getAttribute('position').array),object.position.toArray()]);});return result;
    };
    assert.deepEqual(geometry(current),geometry(previous));
    for(const model of [current,previous])model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
  }
  const ku=buildRaceMachineModel(challenger),paint=(ku.getObjectByName('body-shell') as THREE.Mesh).material as THREE.MeshPhongMaterial;
  assert.equal(paint.color.getHex(),0x15191f);
  assert.ok(ku.getObjectByName('kuroiwa-gold-roof-stripe'));
  assert.equal(mob.getObjectByName('kuroiwa-gold-roof-stripe'),undefined);
  ku.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
  mob.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();object.material.dispose();}});
});
