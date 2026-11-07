import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {getCircuitTrack} from '../data/circuit';
import {raceVenueScenery} from './RaceVenueScenery';
import {VenueAnimation} from './VenueAnimation';
import {disposeSceneResources} from './modelFinish';

test('観客の応援と整備員の動作はインスタンスだけを動かし、席や施設を動かさない',()=>{
 const venue=raceVenueScenery(getCircuitTrack('leaf'),true),animation=new VenueAnimation(venue);
 const arms=venue.getObjectByName('venue-spectator-arms') as THREE.InstancedMesh,staff=venue.getObjectByName('pit-staff-working-arms') as THREE.InstancedMesh,seats=venue.getObjectByName('venue-chair-seats') as THREE.InstancedMesh;
 const before=Array.from(arms.instanceMatrix.array),working=Array.from(staff.instanceMatrix.array),fixed=Array.from(seats.instanceMatrix.array);
 animation.update(.8,'running');assert.notDeepEqual(Array.from(arms.instanceMatrix.array),before);assert.notDeepEqual(Array.from(staff.instanceMatrix.array),working);assert.deepEqual(Array.from(seats.instanceMatrix.array),fixed);
 for(const mesh of [arms,staff])for(const value of mesh.instanceMatrix.array)assert.ok(Number.isFinite(value));
 const count=venue.children.length;animation.update(1.7,'running');assert.equal(venue.children.length,count);disposeSceneResources(venue);
});
test('動きを減らす設定では基本姿勢へ戻し、応援・整備・旗振りを止める',()=>{
 const venue=raceVenueScenery(getCircuitTrack('leaf'),false),animation=new VenueAnimation(venue),root=new THREE.Group(),flag=new THREE.Group();flag.name='marshal-flag-arm';root.add(flag);animation.attachMarshal(root);
 const mesh=venue.getObjectByName('venue-spectator-arms') as THREE.InstancedMesh,before=Array.from(mesh.instanceMatrix.array);
 animation.update(.8,'running');assert.notEqual(flag.rotation.z,0);animation.update(1,'running',true);assert.deepEqual(Array.from(mesh.instanceMatrix.array),before);assert.equal(flag.rotation.z,0);animation.update(3,'running',true);assert.deepEqual(Array.from(mesh.instanceMatrix.array),before);disposeSceneResources(venue);
});
