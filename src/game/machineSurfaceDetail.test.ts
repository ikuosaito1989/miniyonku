import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {starterEquipment} from '../data/machine';
import {buildMachineModel} from './MachineModel';
import {disposeSceneResources} from './modelFinish';

test('細部・材質模様を共有し、塗色と既存のマシン寸法を保つ',()=>{
 const model=buildMachineModel(0x1776bc,{...starterEquipment,body:'body-champion'}),rubberMaps=new Set<THREE.Texture>(),allMaps=new Set<THREE.Texture>();
 assert.ok(model.getObjectByName('motor-power-lead'));assert.ok(model.getObjectByName('chassis-detail-fasteners'));assert.ok(model.getObjectByName('body-mould-seams'));
 model.traverse(o=>{if(o instanceof THREE.Mesh){for(const material of Array.isArray(o.material)?o.material:[o.material])if(material instanceof THREE.MeshStandardMaterial){for(const map of [material.map,material.roughnessMap,material.normalMap])if(map){allMaps.add(map);assert.ok(map instanceof THREE.DataTexture);assert.ok(map.image.width<=64);}if(o.name.startsWith('tire-')&&material.normalMap)rubberMaps.add(material.normalMap);}}});
 assert.equal(rubberMaps.size,1);assert.ok(allMaps.size<=8);assert.ok(allMaps.size>=5);
 const size=new THREE.Box3().setFromObject(model).getSize(new THREE.Vector3());assert.ok(size.x<.23&&size.z<.32&&size.y<.15);
 const disposed=new Map<THREE.Texture,number>();for(const texture of allMaps)texture.addEventListener('dispose',()=>disposed.set(texture,(disposed.get(texture)??0)+1));disposeSceneResources(model);for(const texture of allMaps)assert.equal(disposed.get(texture),1);
});
