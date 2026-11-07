import * as THREE from 'three';
import {StaticInstances,fixtureMaterial} from './StaticInstances';

/** Fine construction details stay inside the existing machine envelope. */
export function machineFineDetails(model:THREE.Group,frontMotor:boolean){
 const batch=new StaticInstances(),p=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z);
 for(const x of [-.066,.066])for(const z of [-.066,.066]){
  batch.add('chassis-detail-washers',()=>new THREE.CylinderGeometry(1,1,1,12),()=>fixtureMaterial(true),p(x,.032,z),p(.004,.001,.004),0xabb8bd);
  batch.add('chassis-detail-fasteners',()=>new THREE.CylinderGeometry(1,1,1,6),()=>fixtureMaterial(true),p(x,.0333,z),p(.0025,.0018,.0025),0xc4ccd0);
  batch.add('chassis-fastener-slots',()=>new THREE.BoxGeometry(1,1,1),()=>fixtureMaterial(),p(x,.0343,z),p(.0028,.0003,.0006),0x263942);
 }
 batch.finish(model);
 for(const side of [-1,1]){
  const motorZ=frontMotor?.086:-.126,curve=new THREE.CubicBezierCurve3(p(side*.025,.045,side*.061),p(side*.046,.060,side*.065),p(side*.044,.080,motorZ+.014),p(side*.028,.074,motorZ));
  const wire=new THREE.Mesh(new THREE.TubeGeometry(curve,10,.0012,5,false),new THREE.MeshStandardMaterial({color:side<0?0x9e5146:0x273742,roughness:.77}));wire.name='motor-power-lead';model.add(wire);
 }
 const shell=model.getObjectByName('body-shell');if(!(shell instanceof THREE.Mesh))return;
 model.updateMatrixWorld(true);const ray=new THREE.Raycaster(),vertices:number[]=[];
 for(const z of [.065,-.065]){
  let previous:THREE.Vector3|null=null;
  for(let x=-.074;x<=.075;x+=.006){
   ray.set(p(x,.3,z),p(0,-1,0));const hit=ray.intersectObject(shell,false)[0];
   if(!hit){previous=null;continue;}const point=hit.point.clone().addScaledVector(hit.normal?.clone().transformDirection(shell.matrixWorld)??p(0,1,0),.0007);
   if(previous&&point.distanceTo(previous)<.012){const w=.00022;vertices.push(previous.x,previous.y,previous.z-w,point.x,point.y,point.z-w,previous.x,previous.y,previous.z+w,point.x,point.y,point.z-w,point.x,point.y,point.z+w,previous.x,previous.y,previous.z+w);}
   previous=point;
  }
 }
 if(vertices.length){const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();const seams=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:0x24343e,transparent:true,opacity:.2,side:THREE.DoubleSide,depthWrite:false}));seams.name='body-mould-seams';seams.userData.noShadow=true;model.add(seams);}
}
