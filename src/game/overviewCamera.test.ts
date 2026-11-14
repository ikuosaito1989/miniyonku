import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {overviewFrame,overviewViewportFrame,overviewCarScale,raceCameraFar} from './overviewCamera';
import {masterCourseIds} from '../data/masterCourses';
import {raceCamera} from '../data/raceCamera';
import * as THREE from 'three';
test('全体カメラは全コースの立体レーンを画角内に保ち、縦長・横長とも中央に収める',()=>{
 for(const id of ['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'] as CircuitId[])for(const aspect of [.45,.8,1,1.7,2.8]){
  const track=getCircuitTrack(id),frame=overviewFrame(track,aspect),center=frame.target;
  for(const lane of [0,4])for(let i=0;i<=1500;i++){
   const p=track.sampleLanePath(i*track.circuitLength/1500,lane),x=(p.x-center.x)*frame.right.x+(p.y-center.y)*frame.right.y+(p.z-center.z)*frame.right.z,y=(p.x-center.x)*frame.up.x+(p.y-center.y)*frame.up.y+(p.z-center.z)*frame.up.z;
   assert.ok(Math.abs(x)<frame.height*aspect/2,`${id} ${aspect}: horizontal`);assert.ok(Math.abs(y)<frame.height/2,`${id} ${aspect}: vertical`);
  }
 }
});
test('若葉の全景は従来より大きく、車はスマホで約18px以上に拡大される',()=>{
 const track=getCircuitTrack('grove');
 for(const [width,height] of [[390,430],[719,500],[1100,550]]){
  const frame=overviewFrame(track,width/height),old=Math.max(track.circuit.radiusZ*2+3,(track.circuit.radiusX*2+3)/(width/height));
  assert.ok(frame.height<old*.9);const scale=overviewCarScale(height,frame.height);
  assert.ok(scale>=1&&scale<=8);assert.ok(.24*.85*scale*height/frame.height>=17.9);
 }
});

test('縦画面ではコースを縦向きに収め、走行中の画面の余白を減らす',()=>{const track=getCircuitTrack('grove'),frame=overviewFrame(track,390/652),normal=overviewFrame(track,390/652,false);assert.equal(frame.rotated,true);assert.ok(frame.height<normal.height*.8);});

test('全景の路面は案内やタイム表示の下に隠れない',()=>{const track=getCircuitTrack('grove');for(const [w,h] of [[390,652],[1100,640]]){const frame=overviewViewportFrame(track,w,h);for(const lane of [0,4])for(let i=0;i<1000;i++){const p=track.sampleLanePath(i*track.circuitLength/1000,lane),y=(p.x-frame.target.x)*frame.up.x+(p.y-frame.target.y)*frame.up.y+(p.z-frame.target.z)*frame.up.z,screen=h/2-y*h/frame.height;assert.ok(screen>44&&screen<h-48);}}});

test('巨大コースの紹介と全景は奥行き方向にも切れない',()=>{
 for(const id of masterCourseIds)for(const [width,height] of [[390,652],[1100,640]])for(const intro of [true,false]){
  const aspect=width/height,track=getCircuitTrack(id),frame=intro?overviewFrame(track,aspect,false):overviewViewportFrame(track,width,height);
  const viewHeight=intro?frame.height*1.12+Math.max(4,5/aspect):frame.height;
  const camera=new THREE.OrthographicCamera(-viewHeight*aspect/2,viewHeight*aspect/2,viewHeight/2,-viewHeight/2,.01,raceCameraFar(viewHeight,aspect));
  const target=new THREE.Vector3(frame.target.x,frame.target.y,frame.target.z);
  if(!intro)camera.up.set(frame.up.x,frame.up.y,frame.up.z);
  camera.position.copy(target).add(new THREE.Vector3(...raceCamera.start.offset).multiplyScalar(Math.max(1,viewHeight/6)));
  camera.lookAt(target);camera.updateMatrixWorld();camera.updateProjectionMatrix();
  for(let i=0;i<=1000;i++){
   const p=track.sampleLanePath(i*track.circuitLength/1000,0),projected=new THREE.Vector3(p.x,p.y,p.z).project(camera);
   assert.ok(projected.z>-1&&projected.z<1,`${id} ${width}x${height} ${intro?'intro':'overview'}: depth ${projected.z}`);
  }
 }
});
