import * as THREE from 'three';

/** One draw per fixture type, regardless of how many seats, bolts or tools exist. */
export class StaticInstances{
 private batches=new Map<string,{geometry:THREE.BufferGeometry;material:THREE.Material;matrices:THREE.Matrix4[];colors:THREE.Color[]}>();
 add(name:string,geometry:()=>THREE.BufferGeometry,material:()=>THREE.Material,position:THREE.Vector3,scale:THREE.Vector3,color:number,rotation=new THREE.Quaternion()){
  let batch=this.batches.get(name);if(!batch){batch={geometry:geometry(),material:material(),matrices:[],colors:[]};this.batches.set(name,batch);}
  batch.matrices.push(new THREE.Matrix4().compose(position,rotation,scale));batch.colors.push(new THREE.Color(color));
 }
 finish(group:THREE.Group){
  for(const [name,b] of this.batches){const mesh=new THREE.InstancedMesh(b.geometry,b.material,b.matrices.length);mesh.name=name;b.matrices.forEach((m,i)=>{mesh.setMatrixAt(i,m);mesh.setColorAt(i,b.colors[i]);});mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.receiveShadow=false;group.add(mesh);}
 }
}
export const fixtureMaterial=(metal=false)=>new THREE.MeshStandardMaterial({color:0xffffff,roughness:metal?.37:.72,metalness:metal?.65:.02,envMapIntensity:metal?.7:.4});
