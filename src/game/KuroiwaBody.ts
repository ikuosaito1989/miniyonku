import {addAeroPaint} from './AeroPaint';
import * as THREE from 'three';
/** 前寄りのキャノピー、巨大な左右カウル、後方の駆動カバーを持つ重装FM風カウル。 */
export function buildKuroiwaBody(){
 const group=new THREE.Group();group.name='kuroiwa-heavy-assembly';
 const black=new THREE.MeshStandardMaterial({color:0x15191f,metalness:.28,roughness:.3,side:THREE.DoubleSide});
 const purple=new THREE.MeshStandardMaterial({color:0x38304e,metalness:.25,roughness:.32,side:THREE.DoubleSide});
 const gold=new THREE.MeshStandardMaterial({color:0xc6a65b,metalness:.75,roughness:.26,side:THREE.DoubleSide});
 const glass=new THREE.MeshStandardMaterial({color:0x184e42,metalness:.35,roughness:.17,side:THREE.DoubleSide});
 const recess=new THREE.MeshStandardMaterial({color:0x080e12,roughness:.72});
 const silver=new THREE.MeshStandardMaterial({color:0xaab5b8,metalness:.85,roughness:.3});
 const add=(g:THREE.BufferGeometry,m:THREE.Material,x:number,y:number,z:number,name:string)=>{const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);mesh.name=name;group.add(mesh);return mesh;};
 const loft=(rows:number[][],m:THREE.Material,name:string,x=0)=>{
  const v:number[]=[],indices:number[]=[],n=64,sides=16;
  for(let i=0;i<=n;i++){const f=i/n*(rows.length-1),j=Math.min(rows.length-2,Math.floor(f)),t=f-j;const [z,w,low,high]=rows[j].map((v,k)=>THREE.MathUtils.lerp(v,rows[j+1][k],t));
   for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2;v.push(Math.sin(a)*w,low+(high-low)*(1+Math.cos(a))/2,z);if(i<n){const next=(k+1)%sides;indices.push(i*sides+k,(i+1)*sides+k,i*sides+next,(i+1)*sides+k,(i+1)*sides+next,i*sides+next);}}
  }const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(indices);g.computeVertexNormals();return add(g,m,x,0,0,name);
 };
 loft([[-.137,.036,.042,.057],[-.11,.05,.043,.076],[-.06,.046,.044,.079],[0,.039,.045,.07],[.05,.039,.044,.065],[.10,.034,.044,.063],[.139,.024,.046,.055]],black,'body-shell');
 // コックピットを前へ寄せ、後ろに大きな機構カバーを残す。
 loft([[-.012,.008,.07,.073],[.012,.024,.067,.087],[.047,.027,.063,.09],[.08,.022,.06,.079],[.096,.006,.056,.061]],glass,'kuroiwa-forward-canopy');
 loft([[-.127,.025,.064,.074],[-.104,.035,.067,.089],[-.065,.034,.066,.095],[-.027,.027,.066,.087],[-.012,.013,.067,.075]],purple,'kuroiwa-rear-drive-cover');
 for(const side of [-1,1]){
  loft([[-.138,.01,.043,.057],[-.115,.026,.043,.075],[-.073,.029,.043,.08],[-.038,.022,.043,.072],[-.022,.009,.044,.056]],purple,'kuroiwa-rear-armour',side*.052);
  loft([[.012,.013,.044,.061],[.038,.024,.044,.077],[.075,.033,.044,.086],[.112,.033,.044,.084],[.142,.022,.046,.069]],black,'kuroiwa-front-armour',side*.05);
  addAeroPaint(group,[[side*.019,.11,-.111],[side*.025,.11,-.111],[side*.025,.11,-.034],[side*.019,.11,-.034]],gold,'kuroiwa-gold-roof-stripe',['kuroiwa-rear-drive-cover']);
  const line=add(new THREE.BoxGeometry(.004,.003,.055),gold,side*.062,.083,.095,'kuroiwa-armour-trim');line.rotation.x=.05;
  add(new THREE.BoxGeometry(.019,.005,.005),glass,side*.052,.069,.139,'kuroiwa-headlamp');
  add(new THREE.BoxGeometry(.008,.018,.105),purple,side*.047,.042,-.003,'kuroiwa-side-sill');
  for(let i=0;i<5;i++){
   add(new THREE.BoxGeometry(.015,.003,.003),recess,side*.055,.077,-.105+i*.008,'kuroiwa-rear-vent');
   add(new THREE.BoxGeometry(.012,.002,.003),recess,side*.047,.083,.062+i*.008,'kuroiwa-front-vent');
  }
  add(new THREE.BoxGeometry(.005,.014,.006),silver,side*.04,.074,-.134,'kuroiwa-wing-support');
  for(const z of [-.11,.115])add(new THREE.CylinderGeometry(.0025,.0025,.0015,6),silver,side*.062,z<0?.079:.085,z,'kuroiwa-cowl-fastener');
 }
 add(new THREE.BoxGeometry(.154,.008,.025),purple,0,.084,-.137,'rear-wing');
 add(new THREE.BoxGeometry(.148,.002,.003),gold,0,.089,-.146,'kuroiwa-wing-trim');
 add(new THREE.BoxGeometry(.11,.004,.003),gold,0,.055,.143,'kuroiwa-gold-front-marker');
 // 後端の排気風スリットと機構を支える横桁。
 add(new THREE.BoxGeometry(.065,.012,.003),recess,0,.06,-.137,'kuroiwa-rear-grille');
 for(let i=0;i<7;i++)add(new THREE.BoxGeometry(.002,.009,.002),silver,-.027+i*.009,.06,-.139,'kuroiwa-grille-fin');
 return group;
}
