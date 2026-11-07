import * as THREE from 'three';
import type {CircuitTrack} from '../data/circuit';
import {StaticInstances,fixtureMaterial} from './StaticInstances';

/** Added structure follows the real lane surface, including banks, rolls and gaps. */
export function raceCourseDetails(track:CircuitTrack){
 const group=new THREE.Group();group.name='course-structural-detail';const {circuit,circuitLength,sampleLanePath}=track,batch=new StaticInstances();
 const position=new THREE.Vector3(),side=new THREE.Vector3(),up=new THREE.Vector3(),forward=new THREE.Vector3(),rotation=new THREE.Quaternion(),basis=new THREE.Matrix4();
 const pose=(d:number,lane:number)=>{const p=sampleLanePath(d,lane);position.set(p.x,p.y,p.z);side.set(p.sideX,p.sideY,p.sideZ);up.set(p.upX,p.upY,p.upZ);forward.set(p.forwardX,p.forwardY,p.forwardZ);rotation.setFromRotationMatrix(basis.makeBasis(side,up,forward));return p;};
 const box=(name:string,offset:number,height:number,w:number,h:number,length:number,color:number,metal=false)=>batch.add(name,()=>new THREE.BoxGeometry(1,1,1),()=>fixtureMaterial(metal),position.clone().addScaledVector(side,offset).addScaledVector(up,height),new THREE.Vector3(w,h,length),color,rotation);
 // Only the hidden underside/rim use fewer samples; the actual lane mesh is unchanged.
 const steps=Math.min(960,circuit.samples);
 for(let lane=0;lane<circuit.lanes;lane++){
  const vertices:number[]=[],indices:number[]=[];
  for(let i=0;i<=steps;i++){
   const p=sampleLanePath(i/steps*circuitLength,lane);
   for(const [offset,height] of [[-circuit.laneWidth/2,0],[circuit.laneWidth/2,0],[-circuit.laneWidth/2,-.029],[circuit.laneWidth/2,-.029]])vertices.push(p.x+p.sideX*offset+p.upX*height,p.y+p.sideY*offset+p.upY*height,p.z+p.sideZ*offset+p.upZ*height);
   if(i<steps){const from=i/steps*circuitLength,to=(i+1)/steps*circuitLength;
    if([0,.25,.5,.75,1].some(t=>track.isJumpGap(from+(to-from)*t)))continue;
    const a=i*4;indices.push(a,a+2,a+4,a+2,a+6,a+4,a+1,a+5,a+3,a+3,a+5,a+7,a+2,a+3,a+6,a+3,a+7,a+6);
   }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const slab=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:0x62717b,roughness:.56,metalness:.12,side:THREE.DoubleSide}));slab.name=`course-lane-base-${lane}`;slab.receiveShadow=true;group.add(slab);
 }
 const spacing=Math.max(.9,circuitLength/240);
 for(let d=.35;d<circuitLength;d+=spacing){
  if([-.07,0,.07].some(offset=>track.isJumpGap(d+offset)))continue;
  for(let lane=0;lane<circuit.lanes;lane++){
   pose(d,lane);const rough=track.surfaceAt(d).roughness>0;
   box('course-panel-seams',0,.0011,circuit.laneWidth-.025,.0007,.004,rough?0xa28a65:0x778995);
   for(const sign of [-1,1]){
    const edge=sign*circuit.laneWidth/2;
    box('course-rail-couplers',edge,.026,.027,.038,.036,0x81949e,true);
    box('course-rim-tabs',edge,.057,.029,.003,.043,0xc6d1d4,true);
    batch.add('course-hex-fasteners',()=>new THREE.CylinderGeometry(1,1,1,6),()=>fixtureMaterial(true),position.clone().addScaledVector(side,edge).addScaledVector(up,.060),new THREE.Vector3(.004,.002,.004),0xdce2dd,rotation);
   }
  }
 }
 const supportSpacing=Math.max(2.2,circuitLength/180),middle=(circuit.lanes-1)/2,half=circuit.laneWidth*circuit.lanes/2;
 const lowerSamples=Array.from({length:721},(_,i)=>sampleLanePath(i/720*circuitLength,middle));
 for(let d=0;d<circuitLength;d+=supportSpacing){
  if([-.12,0,.12].some(offset=>track.isJumpGap(d+offset)))continue;
  const p=pose(d,middle);if(p.y<.18)continue;
  box('course-under-deck-beams',0,-.056,half*2+.12,.045,.075,0x4b6472,true);
  if(p.upY<.55)continue;
  for(const sign of [-1,1]){
   const foot=position.clone().addScaledVector(side,sign*(half+.035)).addScaledVector(up,-.075),height=foot.y+.025;
   if(height<.12||lowerSamples.some(q=>Math.hypot(q.x-foot.x,q.z-foot.z)<half+.13&&q.y>.05&&q.y<foot.y-.15))continue;
   const yaw=new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),Math.atan2(p.forwardX,p.forwardZ));
   batch.add('elevated-course-supports',()=>new THREE.BoxGeometry(1,1,1),()=>fixtureMaterial(true),new THREE.Vector3(foot.x,height/2-.025,foot.z),new THREE.Vector3(.075,height,.075),0x536b78,yaw);
   batch.add('course-support-feet',()=>new THREE.BoxGeometry(1,1,1),()=>fixtureMaterial(true),new THREE.Vector3(foot.x,-.014,foot.z),new THREE.Vector3(.19,.022,.18),0x72858b,yaw);
   const braceTop=foot.clone().addScaledVector(side,-sign*.18),braceBottom=foot.clone().add(new THREE.Vector3(0,-Math.min(height*.5,.3),0)),delta=braceTop.clone().sub(braceBottom);
   batch.add('course-support-braces',()=>new THREE.CylinderGeometry(1,1,1,6),()=>fixtureMaterial(true),braceTop.clone().add(braceBottom).multiplyScalar(.5),new THREE.Vector3(.012,delta.length(),.012),0x87989e,new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize()));
  }
 }
 batch.finish(group);group.userData.jointSpacing=spacing;return group;
}
