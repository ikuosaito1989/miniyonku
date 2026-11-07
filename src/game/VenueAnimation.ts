import * as THREE from 'three';
import type {RaceState} from './race';
export type SpectatorRig={x:number;y:number;z:number;sign:number;phase:number};
export type StaffRig={x:number;z:number;phase:number};
type RigPart={mesh:THREE.InstancedMesh;base:Float32Array;kind:'head'|'arm'|'staff-head'|'staff-arm';actors:number[];side?:number[]};

/** Instanced gestures update at 12Hz; reduced motion restores the static pose. */
export class VenueAnimation{
 private parts:RigPart[]=[];
 private people:SpectatorRig[];
 private staff:StaffRig[];
 private lastTick=-1;
 private wasReduced=false;
 private marshal:THREE.Group|null=null;
 private matrix=new THREE.Matrix4();private rotation=new THREE.Matrix4();private base=new THREE.Matrix4();private pivot=new THREE.Vector3();private shifted=new THREE.Vector3();
 constructor(private venue:THREE.Group){
  this.people=venue.userData.spectators??[];this.staff=venue.userData.pitStaff??[];
  const add=(name:string,kind:RigPart['kind'],perActor=1,actors?:number[])=>{
   const mesh=venue.getObjectByName(name);if(!(mesh instanceof THREE.InstancedMesh))return;
   this.parts.push({mesh,kind,base:new Float32Array(mesh.instanceMatrix.array),actors:actors??Array.from({length:mesh.count},(_,i)=>Math.floor(i/perActor))});
   mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);if(mesh.boundingSphere)mesh.boundingSphere.radius+=.3;if(mesh.boundingBox)mesh.boundingBox.expandByScalar(.3);
  };
  for(const name of ['venue-spectator-heads','venue-spectator-hair'])add(name,'head');
  add('venue-spectator-eyes','head',2);add('venue-spectator-caps','head',1,venue.userData.capActors);add('venue-cap-visors','head',1,venue.userData.capActors);
  add('venue-spectator-arms','arm',2);add('venue-spectator-hands','arm',2);
  add('pit-staff-heads','staff-head');add('pit-staff-hair','staff-head');add('pit-staff-working-arms','staff-arm');add('pit-staff-working-hands','staff-arm');add('pit-staff-held-tools','staff-arm');
 }
 attachMarshal(root:THREE.Object3D){this.marshal=root.getObjectByName('marshal-flag-arm') as THREE.Group??null;}
 update(seconds:number,phase:RaceState['phase'],reduced=false){
  if(reduced){if(!this.wasReduced){for(const p of this.parts){p.mesh.instanceMatrix.array.set(p.base);p.mesh.instanceMatrix.needsUpdate=true;}if(this.marshal)this.marshal.rotation.z=0;}this.wasReduced=true;return;}
  this.wasReduced=false;const tick=Math.floor(seconds*12);if(tick===this.lastTick)return;this.lastTick=tick;
  const stride=Math.max(1,Math.ceil(this.people.length/96));
  for(const part of this.parts){
   for(let i=0;i<part.mesh.count;i++){
    const actor=part.actors[i];if(actor===undefined)continue;
    let angle=0;
    if(part.kind==='head'||part.kind==='arm'){
     if(actor%stride!==0)continue;const p=this.people[actor];if(!p)continue;
     if(part.kind==='head'){this.pivot.set(p.x,p.y,p.z);angle=Math.sin(seconds*.7+p.phase)*.12;this.rotation.makeRotationY(angle);}
     else{
      const side=i%2===0?-1:1,cycle=(seconds+p.phase)%7,cheer=(phase==='running'||phase==='finished')&&cycle<2?Math.sin(cycle*Math.PI/2):0;
      this.pivot.set(p.x+side*.083,p.y-.09,p.z-p.sign*.025);
      angle=p.sign*((side===1||actor%3===0)?cheer*(2.05+.25*Math.sin(seconds*7+p.phase)):.04*Math.sin(seconds+p.phase));this.rotation.makeRotationX(angle);
     }
    }else{
     const p=this.staff[actor];if(!p)continue;
     if(part.kind==='staff-head'){this.pivot.set(p.x,.69,p.z);this.rotation.makeRotationZ(.08*Math.sin(seconds*1.3+p.phase));}
     else{this.pivot.set(p.x+.06,.56,p.z+.015);this.rotation.makeRotationZ(.16*Math.sin(seconds*2.2+p.phase));}
    }
    this.shifted.copy(this.pivot).applyMatrix4(this.rotation);this.shifted.subVectors(this.pivot,this.shifted);this.rotation.setPosition(this.shifted);
    this.base.fromArray(part.base,i*16);this.matrix.multiplyMatrices(this.rotation,this.base);part.mesh.setMatrixAt(i,this.matrix);
   }
   part.mesh.instanceMatrix.needsUpdate=true;
  }
  if(this.marshal)this.marshal.rotation.z=phase==='countdown'?.08*Math.sin(seconds*3):phase==='running'?-.65+.12*Math.sin(seconds*2):.03*Math.sin(seconds);
 }
}
