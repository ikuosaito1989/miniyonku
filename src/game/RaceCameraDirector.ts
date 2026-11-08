import * as THREE from 'three';
import type {CircuitTrack} from '../data/circuit';
import type {TrialCamera} from '../data/raceCamera';
import type {RaceState} from './race';
import type {FinishPresentation} from './finishPresentation';
import {finishTrackDistance} from './finishPresentation';

type Shot='follow'|'low'|'corner'|'pack'|'jump'|'finish'|'start';
const damp=(rate:number,dt:number)=>1-Math.exp(-rate*Math.max(0,Math.min(dt,.1)));
/** Rendering-only camera. All positions come from the unshaken track centreline. */
export class RaceCameraDirector {
 readonly camera=new THREE.PerspectiveCamera(54,1,.025,1200);
 private position=new THREE.Vector3();private target=new THREE.Vector3();private initialized=false;
 private shot:Shot='start';private shotAge=0;private shotAnchor=new THREE.Vector3();
 reset(){this.initialized=false;this.shot='start';this.shotAge=0;}
 update(track:CircuitTrack,race:RaceState,finish:FinishPresentation,mode:TrialCamera,aspect:number,dt:number,reduced=false){
  const player=race.racers.find(r=>r.id==='player')!,distance=finishTrackDistance(player,finish),p=track.sampleLanePath(distance,player.lane);
  const speed=Math.max(0,player.driving.speed),speedRatio=THREE.MathUtils.clamp(speed/10,0,1);
  const lookDistance=THREE.MathUtils.clamp(.3+speed*.12,.3,1.5),ahead=track.sampleLanePath(distance+lookDistance,player.lane);
  const horizontal=new THREE.Vector3(p.tangentX,0,p.tangentZ).normalize();
  if(horizontal.lengthSq()<.01)horizontal.set(0,0,1);
  const side=new THREE.Vector3(horizontal.z,0,-horizontal.x);
  const nearby=race.racers.filter(r=>r.id!=='player'&&r.driving.status==='running'&&Math.abs(r.driving.distance-player.driving.distance)<1.0).length;
  const remaining=track.circuitLength*track.circuit.laps-player.driving.distance;
  const auto=mode==='auto';let desired:Shot=mode==='low'?'low':'follow';
  if(auto){
   if(race.playerStartOffset===null)desired='start';
   else if(player.driving.status==='finished'||remaining<2.4)desired='finish';
   else if(player.driving.flightY!==undefined)desired='jump';
   else if(nearby&&speed>1)desired='pack';
   else if(ahead.curvature>.11&&speed>1)desired='corner';
   else desired='follow';
  }
  this.shotAge+=Math.max(0,dt);
  const urgent=this.shot==='start'||desired==='start'||desired==='finish'||desired==='jump';
  if(desired!==this.shot&&(!auto||urgent||this.shotAge>=3.2)){
   this.shot=desired;this.shotAge=0;
   const shotPoint=track.sampleLanePath(distance+Math.max(.8,speed*.6),player.lane);
   this.shotAnchor.set(shotPoint.x,shotPoint.y,shotPoint.z).addScaledVector(side,track.circuit.laneWidth*track.circuit.lanes/2+.55);
  }
  const shot=auto?this.shot:desired,baseY=player.driving.flightY??p.y;
  const focus=new THREE.Vector3(p.x,baseY+.06,p.z);
  const aim=new THREE.Vector3(ahead.x,ahead.y+.08,ahead.z).lerp(focus,.52);
  let pos=new THREE.Vector3(p.x,baseY,p.z).addScaledVector(horizontal,-(.85+speedRatio*.45)).addScaledVector(side,.18);
  pos.y=baseY+.40+speedRatio*.08;
  let fov=50+speedRatio*8;
  if(shot==='start'){
   pos.copy(focus).addScaledVector(horizontal,-1.1).addScaledVector(side,.68);pos.y=baseY+.48;aim.copy(focus);fov=48;
  }else if(shot==='low'||shot==='corner'){
   // Trackside anchor changes only when entering a shot; tracking follows the car.
   if(mode==='low'){
    const future=track.sampleLanePath(distance+Math.max(.6,speed*.35),player.lane);
    pos.set(future.x,future.y+.30,future.z).addScaledVector(side,track.circuit.laneWidth*track.circuit.lanes/2+.42);
   }else pos.copy(this.shotAnchor).add(new THREE.Vector3(0,.3,0));
   // Limit distance to keep a long shot from losing a fast car.
   if(pos.distanceTo(focus)>3)pos.lerp(focus,1-3/pos.distanceTo(focus));
   aim.copy(focus).lerp(new THREE.Vector3(ahead.x,ahead.y+.06,ahead.z),.15);fov=55;
  }else if(shot==='pack'){
   pos.addScaledVector(horizontal,-.55).addScaledVector(side,.25);pos.y+=.22;fov=57;
  }else if(shot==='jump'){
   pos.addScaledVector(horizontal,-.25);pos.y=Math.max(baseY+.4,p.y+.8);aim.copy(focus);fov=56;
  }else if(shot==='finish'){
   const pull=player.driving.status==='finished'?Math.min(.8,finish.finalAge*.3):0;
   pos.addScaledVector(horizontal,-pull);pos.y+=pull*.22;aim.copy(focus).lerp(aim,.3);fov=52+speedRatio*4;
  }
  // Portrait needs a wider angle to retain the whole car and nearby lane walls.
  fov=Math.min(78,fov+(aspect<.8?( .8-aspect)*27:0));
  this.camera.aspect=Math.max(.2,aspect);
  if(!this.initialized){this.position.copy(pos);this.target.copy(aim);this.camera.fov=fov;this.initialized=true;}
  else{
   const rate=reduced?9:(shot==='corner'?4:7);
   this.position.lerp(pos,damp(rate,dt));this.target.lerp(aim,damp(reduced?12:9,dt));
   // Long curves must never let interpolation leave the player outside the frame.
   if(this.target.distanceTo(focus)>1.4)this.target.lerp(focus,1-1.4/this.target.distanceTo(focus));
   this.camera.fov=THREE.MathUtils.lerp(this.camera.fov,fov,damp(3,dt));
  }
  this.camera.position.copy(this.position);this.camera.up.set(0,1,0);this.camera.lookAt(this.target);this.camera.updateProjectionMatrix();
  return this.camera;
 }
}
