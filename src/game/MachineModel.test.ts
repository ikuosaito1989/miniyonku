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

test('セイランは分割カウルと貫通フィンを保ち、白青黄・黒いキャノピー・赤いホイールを配色する',()=>{
  const model=buildMachineModel(0x111111,{...starterEquipment,body:'body-champion'});
  for(const name of ['seiran-split-nose','seiran-open-rear-fin','seiran-fin-brace','seiran-drilled-carbon-stay','seiran-hex-fastener','seiran-carbon-weave'])assert.ok(model.getObjectByName(name),name);
  const fin=model.getObjectByName('seiran-open-rear-fin') as THREE.Mesh<THREE.ExtrudeGeometry>;
  assert.ok((fin.geometry.parameters.shapes as THREE.Shape).holes.length>0);
  assert.equal(model.getObjectByName('champion-wing-stripe'),undefined);
  assert.equal(model.getObjectByName('rear-wing'),undefined);
  const body=model.getObjectByName('body-shell') as THREE.Mesh;
  assert.ok(body.material instanceof THREE.MeshStandardMaterial);
  assert.equal((body.material as THREE.MeshStandardMaterial).color.getHex(),0xf2f3eb);
  assert.ok((body.material as THREE.MeshStandardMaterial).roughness>.3);
  const paint=(name:string)=>(model.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>).material.color.getHex();
  assert.equal(paint('seiran-blue-spine'),0x155fc1);assert.equal(paint('seiran-yellow-nose-pinstripe'),0xf2c83b);assert.equal(paint('cabin-glass'),0x11191e);assert.equal(paint('wheel-rim-wheel-basic'),0xb6293a);
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

test('風見怜の愛機は展示・レースで共通の白青赤カウルと大型翼・白い5本スポークを持つ',()=>{
  const legend=legends.find(l=>l.id==='legend-rei')!;
  for(const model of [buildMachineModel(0xff0000,legend.equipment),buildRaceMachineModel({...legend,color:0xff0000})]){
    for(const name of ['kazami-front-cowl','kazami-red-front-lightning','kazami-red-rear-lightning','kazami-blue-nose','kazami-front-canard','kazami-wing-endplate','kazami-wing-emblem','rear-wing'])assert.ok(model.getObjectByName(name),name);
    const body=model.getObjectByName('body-shell') as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>;
    assert.equal(body.material.color.getHex(),0xf1f1e9);
    assert.equal((model.getObjectByName('rear-wing') as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>).material.color.getHex(),0x162b9c);
    let spokes=0;model.traverse(o=>{if(o.name==='wheel-spoke-wheel-light')spokes++;});assert.equal(spokes,20);
    const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.x<.22&&size.z<.3&&size.y<.12);
    model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();o.material.dispose();}});
  }
});

test('火野岳の愛機は展示・レースで白赤金と黒いフレア、赤タイヤと金色ホイールを共有する',()=>{
  const legend=legends.find(l=>l.id==='legend-gaku')!;
  for(const model of [buildMachineModel(0xffff00,legend.equipment),buildRaceMachineModel({...legend,color:0xffff00})]){
    const color=(name:string)=>(model.getObjectByName(name) as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>).material.color.getHex();
    assert.equal(color('body-shell'),0xf1f1e9);assert.equal(color('rear-wing'),0xf1f1e9);
    assert.equal(color('hino-front-cowl'),0xdf2936);assert.equal(color('hino-front-flame'),0x10191d);assert.equal(color('hino-gold-nose'),0xc5a452);
    assert.equal((model.getObjectByName('hino-front-flame') as THREE.Mesh<THREE.BufferGeometry,THREE.MeshStandardMaterial>).material.side,THREE.DoubleSide);
    assert.equal(color('tire-tire-2'),0xb92935);assert.equal(color('wheel-rim-wheel-light'),0xd6af3e);
    assert.ok(model.getObjectByName('hino-wing-endplate'));assert.ok(model.getObjectByName('hino-carbon-side-panel'));
    model.traverse(o=>{if(o instanceof THREE.Mesh){for(const attribute of ['position','normal'])for(const n of o.geometry.getAttribute(attribute).array)assert.ok(Number.isFinite(n));o.geometry.dispose();o.material.dispose();}});
  }
});

test('黒岩は前寄りキャノピーと大型左右カウルの専用重装モデルを使う',()=>{
 const model=buildRaceMachineModel(challenger);assert.ok(model.getObjectByName('kuroiwa-heavy-assembly'));const canopy=model.getObjectByName('kuroiwa-forward-canopy') as THREE.Mesh;assert.ok(canopy);assert.ok(model.getObjectByName('kuroiwa-front-armour'));assert.ok(model.getObjectByName('kuroiwa-rear-drive-cover'));assert.equal(model.getObjectByName('mob-kei-yellow-plate'),undefined);
 let wings=0;model.traverse(o=>{if(o.name==='rear-wing')wings++;if(o instanceof THREE.Mesh){for(const k of ['position','normal'])for(const v of o.geometry.getAttribute(k).array)assert.ok(Number.isFinite(v));}});assert.equal(wings,1);
 const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.x<.24&&size.z<.34&&size.y<.15);
 model.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();o.material.dispose();}});
});
