import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {getCircuitTrack} from '../data/circuit';
import {starterEquipment} from '../data/machine';
import {createRaceState} from './race';
import {createFinishPresentation} from './finishPresentation';
import {RaceCameraDirector} from './RaceCameraDirector';

test('追従・低位置・自動の画角は有限でプレイヤーを映し、走行状態を変更しない',()=>{
 for(const id of ['leaf','grove','zenith'] as const)for(const mode of ['auto','follow','low'] as const){
  const track=getCircuitTrack(id),race=createRaceState(starterEquipment,42,undefined,false,id),player=race.racers[0],director=new RaceCameraDirector(),finish=createFinishPresentation();race.phase='running';race.playerStartOffset=0;player.driving.status='running';player.driving.speed=5;
  for(let i=0;i<300;i++){
   player.driving.distance=i*.045;const before=JSON.stringify(race),camera=director.update(track,race,finish,mode,.56,1/60);
   assert.equal(JSON.stringify(race),before);assert.ok(camera.position.toArray().every(Number.isFinite));assert.ok(camera.fov>=40&&camera.fov<=80);
   camera.updateMatrixWorld();const p=track.sampleLanePath(player.driving.distance,player.lane),projected=new THREE.Vector3(p.x,p.y+.06,p.z).project(camera);assert.ok(Math.abs(projected.x)<1.2&&Math.abs(projected.y)<1.2,`${id}/${mode}/${i}: ${projected.toArray()}`);
  }
 }
});
test('速度に応じて画角が広がり、手動追従はコース状況でモードを変更しない',()=>{
 const track=getCircuitTrack('leaf'),race=createRaceState(starterEquipment,42),player=race.racers[0],director=new RaceCameraDirector(),finish=createFinishPresentation();race.phase='running';race.playerStartOffset=0;player.driving.status='running';
 player.driving.speed=0;const slow=director.update(track,race,finish,'follow',1,1/60).fov;player.driving.speed=10;for(let i=0;i<180;i++)director.update(track,race,finish,'follow',1,1/60);const fast=director.camera.fov;assert.ok(fast>slow+4);
 player.driving.flightY=1;for(let i=0;i<120;i++)director.update(track,race,finish,'follow',1,1/60);assert.ok(director.camera.fov>=fast-1);
});
test('コーナー・接戦・ジャンプ・ゴールで視界を維持し、切替で位置が瞬間移動しない',()=>{
 const track=getCircuitTrack('grove'),race=createRaceState(starterEquipment,42,undefined,false,'grove'),player=race.racers[0],director=new RaceCameraDirector(),finish=createFinishPresentation();race.phase='running';race.playerStartOffset=0;player.driving.status='running';player.driving.speed=6;
 let last:THREE.Vector3|undefined;
 for(let i=0;i<360;i++){
  player.driving.distance=track.circuitLength*.58+i*.035;
  if(i===90)player.driving.flightY=track.sampleLanePath(player.driving.distance,player.lane).y+.3;
  if(i===145)player.driving.flightY=undefined;
  if(i===200){race.racers[1].driving.status='running';race.racers[1].driving.distance=player.driving.distance;}
  if(i===250){player.driving.status='finished';finish.stage='finish';}
  const camera=director.update(track,race,finish,'auto',.56,1/60);camera.updateMatrixWorld();
  if(last)assert.ok(last.distanceTo(camera.position)<.25,`frame ${i}`);last=camera.position.clone();
  const p=track.sampleLanePath(player.driving.distance,player.lane),focus=new THREE.Vector3(p.x,(player.driving.flightY??p.y)+.06,p.z).project(camera);assert.ok(Math.abs(focus.x)<1.2&&Math.abs(focus.y)<1.2,`frame ${i}`);
 }
});
