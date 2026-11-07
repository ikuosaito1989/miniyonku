import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {raceCourseDetails} from './RaceCourseDetails';
import {raceVenueScenery} from './RaceVenueScenery';
import {disposeSceneResources} from './modelFinish';

const tracks:CircuitId[]=['leaf','sun','grove','trail','grandprix','forge','zenith','park-jump'];
test('全種のコースに下部構造と固定具を有限な座標で追加し、描画を少数のバッチへ収める',()=>{
 for(const id of tracks){
  const track=getCircuitTrack(id),before=[0,.2,.5,.8].map(f=>track.sampleLanePath(track.circuitLength*f,2)),model=raceCourseDetails(track);
  assert.equal(model.children.filter(o=>o.name.startsWith('course-lane-base-')).length,5,id);
  assert.ok(model.getObjectByName('course-rail-couplers'));assert.ok(model.getObjectByName('course-hex-fasteners'));assert.ok(model.children.length<=14);
  model.traverse(o=>{if(o instanceof THREE.Mesh){const p=o.geometry.getAttribute('position');for(const n of p.array)assert.ok(Number.isFinite(n),id);if(o instanceof THREE.InstancedMesh)for(const n of o.instanceMatrix.array)assert.ok(Number.isFinite(n),id+' instances');}});
  assert.deepEqual([0,.2,.5,.8].map(f=>track.sampleLanePath(track.circuitLength*f,2)),before);
  disposeSceneResources(model);
 }
});
test('ジャンプの開口を下部構造で塞がず、高架は梁と接地する支柱を持つ',()=>{
 const track=getCircuitTrack('zenith'),model=raceCourseDetails(track),steps=Math.min(960,track.circuit.samples),base=model.getObjectByName('course-lane-base-2') as THREE.Mesh;
 const index=base.geometry.getIndex()!;
 for(let i=0;i<index.count;i+=3){const rows=[index.getX(i),index.getX(i+1),index.getX(i+2)].map(v=>Math.floor(v/4));const from=Math.min(...rows)/steps*track.circuitLength,to=Math.max(...rows)/steps*track.circuitLength;for(const t of [0,.25,.5,.75,1])assert.equal(track.isJumpGap(from+(to-from)*t),false);}
 assert.ok(model.getObjectByName('course-under-deck-beams'));assert.ok(model.getObjectByName('elevated-course-supports'));assert.ok(model.getObjectByName('course-support-braces'));
 disposeSceneResources(model);
});
test('会場の観客席・柵・ピットはコース外へ配置し、長いコースでも描画バッチ数を増やさない',()=>{
 for(const id of ['leaf','grove','zenith'] as CircuitId[]){
  const track=getCircuitTrack(id),venue=raceVenueScenery(track,true),bounds=venue.userData.courseBounds;
  assert.ok(venue.children.length<=54,id+' draw batches');assert.ok(venue.getObjectByName('venue-material-floor'));assert.ok(venue.getObjectByName('venue-spectator-arms'));assert.ok(venue.getObjectByName('pit-tools'));assert.ok(venue.getObjectByName('pit-spare-tires'));
  const points=Array.from({length:101},(_,i)=>track.sampleLanePath(i/100*track.circuitLength,2));const matrix=new THREE.Matrix4(),position=new THREE.Vector3();
  for(const name of ['pit-worktops','venue-chair-seats','venue-fence-posts']){
   const mesh=venue.getObjectByName(name) as THREE.InstancedMesh;
   for(let i=0;i<mesh.count;i++){mesh.getMatrixAt(i,matrix);position.setFromMatrixPosition(matrix);assert.ok(position.x<=bounds.left+.4||position.x>=bounds.right-.4||position.z<=bounds.top+.4||position.z>=bounds.bottom-.4,name);assert.ok(points.every(p=>Math.hypot(p.x-position.x,p.z-position.z)>.85),id+' '+name);}
  }
  disposeSceneResources(venue);
 }
 const outdoor=raceVenueScenery(getCircuitTrack('park-sand'),false,true);assert.equal(outdoor.getObjectByName('venue-material-floor'),undefined);disposeSceneResources(outdoor);
});
