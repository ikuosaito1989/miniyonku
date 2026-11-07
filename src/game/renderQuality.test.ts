import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {starterEquipment} from '../data/machine';
import {getCircuitTrack} from '../data/circuit';
import {buildMachineModel} from './MachineModel';
import {RaceShadows} from './RaceShadows';
import {disposeSceneResources} from './modelFinish';

test('車体・キャノピー・タイヤを物理材質で描き分け、塗色と機構を保持する',()=>{
 for(const body of ['body-stream','body-champion','body-legend-flow','body-legend-muscle']){
  const model=buildMachineModel(0x2d84c6,{...starterEquipment,body});
  const shell=(model.getObjectByName('body-shell')??model.getObjectByName('koya-armored-platform')) as THREE.Mesh;
  assert.ok(shell.material instanceof THREE.MeshStandardMaterial,body);
  if(body!=='body-legend-muscle')assert.ok(shell.material instanceof THREE.MeshPhysicalMaterial&&shell.material.clearcoat>0);
  let glass=false,rubber=false;
  model.traverse(o=>{if(o instanceof THREE.Mesh){for(const m of Array.isArray(o.material)?o.material:[o.material]){
   assert.ok(!(m instanceof THREE.MeshPhongMaterial),o.name);
   if(m.name==='machine-glass'){glass=true;assert.ok(m instanceof THREE.MeshPhysicalMaterial&&m.clearcoat===1&&m.roughness<.2);}
   if(o.name.startsWith('tire-')&&m instanceof THREE.MeshStandardMaterial&&m.roughness>.6&&m.metalness===0)rubber=true;
  }}});
  assert.ok(glass,body+' canopy');assert.ok(rubber,body+' rubber');assert.ok(model.userData.rotatingWheels.length>0);
  disposeSceneResources(model);
 }
});
test('接地影はバンクとループの路面に沿い、ジャンプで薄くなり脱落時は消える',()=>{
 const scene=new THREE.Scene(),light=new THREE.DirectionalLight(),shadows=new RaceShadows(scene,light,true),car=new THREE.Group();shadows.add('player',car);
 const track=getCircuitTrack('zenith');
 for(const distance of [0,track.circuitLength*.2,track.circuitLength*.5,track.circuitLength*.8]){
  const p=track.sampleLanePath(distance,2);shadows.update('player',p,undefined,true,1);
  const root=scene.getObjectByName('contact-player')!,plane=root.children[0] as THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;
  root.updateMatrixWorld(true);const normal=new THREE.Vector3(0,0,1).transformDirection(plane.matrixWorld),up=new THREE.Vector3(p.upX,p.upY,p.upZ);
  assert.ok(normal.dot(up)>.999);assert.ok(Math.abs(root.position.clone().sub(new THREE.Vector3(p.x,p.y,p.z)).dot(up)-.004)<1e-8);
  const grounded=plane.material.opacity;shadows.update('player',p,p.y+.5,true,1);assert.ok(plane.material.opacity<grounded);
  shadows.update('player',p,undefined,false,1);assert.equal(root.visible,false);
 }
 disposeSceneResources(scene);
});
test('共有する材質・テクスチャ・形状を、画面終了時にそれぞれ一度だけ解放する',()=>{
 const root=new THREE.Group(),geometry=new THREE.BoxGeometry(),texture=new THREE.DataTexture(),material=new THREE.MeshStandardMaterial({map:texture});
 root.add(new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material));
 const counts={geometry:0,material:0,texture:0};geometry.addEventListener('dispose',()=>counts.geometry++);material.addEventListener('dispose',()=>counts.material++);texture.addEventListener('dispose',()=>counts.texture++);
 disposeSceneResources(root);assert.deepEqual(counts,{geometry:1,material:1,texture:1});
});

test('曲面の塗装は三角形と投影法線の表裏が一致し、照明で裏面として暗くならない',()=>{
 const model=buildMachineModel(0xffffff,{...starterEquipment,body:'body-champion'});let checked=0;
 model.traverse(o=>{if(!(o instanceof THREE.Mesh)||!o.userData.isAeroPaint)return;const position=o.geometry.getAttribute('position'),normal=o.geometry.getAttribute('normal');
  for(let i=0;i<position.count;i+=3){const a=new THREE.Vector3().fromBufferAttribute(position,i),b=new THREE.Vector3().fromBufferAttribute(position,i+1),c=new THREE.Vector3().fromBufferAttribute(position,i+2);const cross=b.sub(a).cross(c.sub(a));assert.ok(cross.dot(new THREE.Vector3().fromBufferAttribute(normal,i))>=-1e-12,o.name);checked++;}
 });assert.ok(checked>100);disposeSceneResources(model);
});
