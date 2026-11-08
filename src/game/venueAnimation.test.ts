import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {getCircuitTrack} from '../data/circuit';
import {raceVenueScenery} from './RaceVenueScenery';
import {VenueAnimation} from './VenueAnimation';
import {buildStartMarshal} from './StartMarshal';
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

test('旗振り係は肩と肘を連動させ、低モーション時は元の姿勢へ戻る',()=>{
 const venue=raceVenueScenery(getCircuitTrack('leaf'),false),animation=new VenueAnimation(venue),model=buildStartMarshal();animation.attachMarshal(model);
 const shoulder=model.getObjectByName('marshal-flag-arm')!,elbow=model.getObjectByName('marshal-flag-elbow')!,flag=model.getObjectByName('marshal-flag');assert.ok(flag);assert.equal(flag.parent,elbow);
 animation.update(.8,'countdown');assert.ok(Math.abs(shoulder.rotation.z-.08*Math.sin(.8*3))<1e-10);assert.notEqual(elbow.rotation.z,-.4);
 animation.update(1,'running');assert.ok(Math.abs(shoulder.rotation.z-(-.65+.12*Math.sin(2)))<1e-10);assert.notEqual(elbow.rotation.z,-.4);
 animation.update(2,'running',true);assert.equal(shoulder.rotation.z,0);assert.equal(elbow.rotation.z,-.4);disposeSceneResources(model);disposeSceneResources(venue);
});
