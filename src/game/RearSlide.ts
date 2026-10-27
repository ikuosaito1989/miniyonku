import * as THREE from 'three';

/** リアウイング下の固定レールと可動ステー。リヤ欄のローラーは可動側に取り付ける。 */
export function buildRearSlide(index=0){
 const housing=new THREE.Group();housing.name='rear-slide-housing';
 const carriage=new THREE.Group();carriage.name='rear-slide-carriage';
 housing.position.y=carriage.position.y=index*.006;
 const carbon=new THREE.MeshStandardMaterial({color:0x303642,metalness:.2,roughness:.6});
 const violet=new THREE.MeshStandardMaterial({color:0x9f7bc6,metalness:.5,roughness:.32});
 const steel=new THREE.MeshStandardMaterial({color:0xc9d2d8,metalness:.85,roughness:.25});
 const add=(group:THREE.Group,geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,name:string)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name=name;group.add(mesh);return mesh;};
 add(housing,new THREE.BoxGeometry(.12,.006,.021),carbon,0,.059,-.14,'rear-slide-fixed-base');
 const guide=add(housing,new THREE.CylinderGeometry(.0018,.0018,.157,16),steel,0,.066,-.14,'rear-slide-guide-rod');guide.rotation.z=Math.PI/2;
 add(carriage,new THREE.BoxGeometry(.19,.004,.015),violet,0,.07,-.14,'rear-slide-moving-stay');
 for(const side of [-1,1]){
  add(housing,new THREE.BoxGeometry(.009,.027,.013),carbon,side*.043,.043,-.14,'rear-slide-mount');
  add(housing,new THREE.BoxGeometry(.011,.013,.019),violet,side*.057,.065,-.14,'rear-slide-end-stop');
  const bearing=add(carriage,new THREE.CylinderGeometry(.004,.004,.009,16),steel,side*.016,.066,-.14,'rear-slide-linear-bearing');bearing.rotation.z=Math.PI/2;
  const points=Array.from({length:57},(_,i)=>{const t=i/56,a=t*Math.PI*12;return new THREE.Vector3(side*(.024+t*.023),.066+Math.cos(a)*.003,-.14+Math.sin(a)*.003);});
  add(housing,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),56,.00065,5,false),steel,0,0,0,'rear-slide-return-spring');
  add(carriage,new THREE.BoxGeometry(.023,.004,.022),carbon,side*.094,.07,-.133,'rear-slide-roller-mount');
  for(const x of [side*.043,side*.057])add(housing,new THREE.CylinderGeometry(.0025,.0025,.002,6),steel,x,.073,-.14,'rear-slide-hex-fastener');
 }
 return {housing,carriage};
}
