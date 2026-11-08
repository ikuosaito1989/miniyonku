import * as THREE from 'three';

/** Original toy-like start marshal, in the start-ramp coordinate system. */
export function buildStartMarshal(){
 const root=new THREE.Group();root.name='start-marshal';
 const material=(color:number,roughness=.72)=>new THREE.MeshStandardMaterial({color,roughness,metalness:0});
 const skin=material(0xefbd98),skinShade=material(0xd79876),hair=material(0x493b37),jacket=material(0xdca65b),jacketLight=material(0xf1ca85),pants=material(0x40566c),shoes=material(0x283d50),white=material(0xfff5e6),eyes=material(0x243d48),hat=material(0x536d80),hatLight=material(0x839aa0),flagYellow=material(0xf1d66c),flagDark=material(0x9f7c40);
 // Shared, modestly tessellated forms keep GPU memory and draw cost low on mobile.
 const sphere=new THREE.SphereGeometry(1,12,8),cylinder=new THREE.CylinderGeometry(1,1,1,10);
 const ellipsoid=(parent:THREE.Object3D,mat:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number,name?:string)=>{
  const mesh=new THREE.Mesh(sphere,mat);mesh.position.set(x,y,z);mesh.scale.set(sx,sy,sz);if(name)mesh.name=name;parent.add(mesh);return mesh;
 };
 const rod=(parent:THREE.Object3D,mat:THREE.Material,x:number,y:number,z:number,radius:number,length:number,angle=0)=>{
  const mesh=new THREE.Mesh(cylinder,mat);mesh.position.set(x,y,z);mesh.scale.set(radius,length,radius);mesh.rotation.z=angle;parent.add(mesh);return mesh;
 };
 // Proportions remain within the existing start podium footprint, with a large head.
 ellipsoid(root,pants,0,.098,0,.065,.058,.041,'marshal-hips');
 for(const side of [-1,1]){
  ellipsoid(root,pants,side*.035,.065,0,.029,.058,.03);
  ellipsoid(root,shoes,side*.036,.023,.012,.032,.022,.045);
  ellipsoid(root,hatLight,side*.036,.026,.045,.022,.006,.009);
 }
 ellipsoid(root,jacket,0,.19,0,.075,.092,.049,'marshal-body');
 ellipsoid(root,jacketLight,0,.205,.043,.046,.054,.009);
 rod(root,white,0,.196,.053,.002,.066); // jacket zip
 ellipsoid(root,white,0,.244,.005,.039,.015,.037);
 ellipsoid(root,skin,0,.272,.003,.026,.025,.025);
 ellipsoid(root,skin,0,.327,0,.079,.077,.067,'marshal-head');
 // Hair cap and side locks frame the face without replacing its silhouette.
 ellipsoid(root,hair,0,.366,-.012,.078,.047,.063);
 for(const side of [-1,1]){
  ellipsoid(root,skin,side*.075,.326,.002,.013,.021,.014);
  ellipsoid(root,hair,side*.065,.35,.028,.015,.033,.022);
  ellipsoid(root,white,side*.029,.333,.058,.016,.023,.008);
  ellipsoid(root,eyes,side*.029,.331,.066,.008,.014,.005);
  ellipsoid(root,white,side*.032,.337,.071,.003,.004,.002);
  ellipsoid(root,skinShade,side*.049,.306,.052,.012,.006,.003);
 }
 ellipsoid(root,skinShade,0,.316,.067,.009,.007,.005,'marshal-nose');
 ellipsoid(root,material(0x985e58),0,.3,.063,.013,.004,.003,'marshal-mouth');
 // Rounded cap, brim and a small badge, all original game artwork.
 ellipsoid(root,hat,0,.391,-.006,.081,.033,.067);
 ellipsoid(root,hatLight,0,.398,-.006,.063,.017,.052);
 ellipsoid(root,hat,0,.375,.053,.068,.009,.034);
 ellipsoid(root,flagYellow,0,.393,.057,.012,.011,.004);
 // Resting arm and gloved hand.
 ellipsoid(root,jacket,-.081,.197,0,.025,.054,.029).rotation.z=-.2;
 ellipsoid(root,white,-.09,.148,.002,.023,.023,.023);
 // Shoulder pivot uses the existing animation key. A child elbow follows it.
 const shoulder=new THREE.Group();shoulder.name='marshal-flag-arm';shoulder.position.set(.067,.233,0);root.add(shoulder);
 const upper=ellipsoid(shoulder,jacket,.024,-.026,0,.025,.053,.025);upper.rotation.z=.65;
 const elbow=new THREE.Group();elbow.name='marshal-flag-elbow';elbow.position.set(.048,-.055,0);shoulder.add(elbow);elbow.rotation.z=-.4;
 const lower=ellipsoid(elbow,jacketLight,.022,.031,0,.021,.049,.022);lower.rotation.z=-.55;
 ellipsoid(elbow,white,.043,.066,0,.023,.022,.023);
 rod(elbow,flagDark,.051,.105,0,.004,.115,-.12);
 const cloth=new THREE.Mesh(new THREE.PlaneGeometry(.105,.065,4,2),flagYellow);cloth.name='marshal-flag';cloth.position.set(.101,.145,0);cloth.rotation.z=-.12;cloth.material.side=THREE.DoubleSide;elbow.add(cloth);
 // Small hem provides a readable flag edge at race-camera scale.
 rod(elbow,jacketLight,.097,.115,.001,.002,.093,Math.PI/2-.12);
 return root;
}
