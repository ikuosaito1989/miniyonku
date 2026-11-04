import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import * as THREE from 'three';
import {parts} from '../data/parts';
import {buildPartProduct} from './PartProductModel';

test('販売・所持パーツの全カテゴリに高解像度WebPが揃い、画像の欠落がない',()=>{
 for(const part of parts.filter(p=>p.category!=='body')){
  const path=new URL(`../assets/parts/${part.id}.webp`,import.meta.url);assert.ok(existsSync(path),part.id);
  const bytes=readFileSync(path);assert.equal(bytes.toString('ascii',0,4),'RIFF',part.id);assert.equal(bytes.toString('ascii',8,12),'WEBP',part.id);assert.ok(bytes.length>2000,part.id);
 }
});
test('全パーツの接写モデルは有限で、カテゴリごとの立体形状を持つ',()=>{
 for(const part of parts.filter(p=>p.category!=='body')){
  const model=buildPartProduct(part),bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3());
  assert.ok(size.x>0&&size.y>0&&size.z>0&&Math.max(size.x,size.y,size.z)<10,part.id);
  const materials=new Set<THREE.Material>();model.traverse(object=>{if(object instanceof THREE.Mesh){for(const value of object.geometry.getAttribute('position').array)assert.ok(Number.isFinite(value),part.id);object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}});materials.forEach(material=>material.dispose());
 }
});
