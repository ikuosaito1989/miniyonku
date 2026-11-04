import * as THREE from 'three';
import type {CircuitTrack} from '../data/circuit';
/** コース外にのみ配置する競技会場。観客・椅子はInstancedMeshでまとめる。 */
export function raceVenueScenery(track:CircuitTrack,official:boolean){
 const group=new THREE.Group();group.name='race-event-scenery';
 const points=Array.from({length:601},(_,i)=>track.sampleCircuit(i/600*track.circuitLength));
 const xs=points.map(p=>p.x),zs=points.map(p=>p.z),left=Math.min(...xs)-2,right=Math.max(...xs)+2,top=Math.min(...zs)-2,bottom=Math.max(...zs)+2;
 const cx=(left+right)/2,cz=(top+bottom)/2,width=right-left,depth=bottom-top;
 const steel=new THREE.MeshStandardMaterial({color:0x687f92,metalness:.65,roughness:.4}),navy=new THREE.MeshStandardMaterial({color:0x233c56,roughness:.6}),gold=new THREE.MeshStandardMaterial({color:official?0xdac289:0x8ebfc4,metalness:.65,roughness:.3});
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);return mesh;};
 const rows=official?4:2,seats=Math.min(42,Math.max(14,Math.floor(width/.3))),total=rows*seats*2;
 const crowd=new THREE.InstancedMesh(new THREE.SphereGeometry(.07,6,5),new THREE.MeshLambertMaterial(),total),chairs=new THREE.InstancedMesh(new THREE.BoxGeometry(.17,.12,.17),new THREE.MeshLambertMaterial(),total),matrix=new THREE.Matrix4(),color=new THREE.Color();
 let index=0;
 for(const side of [-1,1])for(let row=0;row<rows;row++){
  const z=(side<0?top:bottom)+side*row*.3,y=.1+row*.19;
  add(new THREE.BoxGeometry(width,.18,.32),navy,cx,y,z);
  add(new THREE.BoxGeometry(width,.025,.03),gold,cx,y+.1,z-side*.15);
  for(let i=0;i<seats;i++){
   const x=left+(i+.5)*width/seats;
   matrix.makeTranslation(x,y+.2,z);chairs.setMatrixAt(index,matrix);chairs.setColorAt(index,color.setHex([0x719da9,0x9a7d95,0xc6ac78,0x8caf9e][(i+row)%4]));
   matrix.makeTranslation(x,y+.36,z);crowd.setMatrixAt(index,matrix);crowd.setColorAt(index,color.setHex([0xe4b99b,0xbe967c,0xf0cfaa][(i+row)%3]));index++;
  }
 }
 group.add(chairs,crowd);
 // 両翼の光沢レール、照明塔、格子梁、チェッカー旗。
 for(const side of [-1,1]){
  const x=side<0?left:right;
  add(new THREE.BoxGeometry(.08,.22,depth),navy,x,.1,cz);add(new THREE.BoxGeometry(.09,.025,depth),gold,x,.23,cz);
  for(const z of [top+.3,cz,bottom-.3]){
   add(new THREE.CylinderGeometry(.025,.04,1.6,8),steel,x,.8,z);
   add(new THREE.BoxGeometry(.42,.15,.1),navy,x,1.62,z);
   for(let i=0;i<4;i++)add(new THREE.BoxGeometry(.07,.075,.012),new THREE.MeshBasicMaterial({color:0xffe9b4}),x-.135+i*.09,1.63,z-.056);
   add(new THREE.BoxGeometry(.015,.7,.015),steel,x+.16,1.1,z);
   for(let row=0;row<3;row++)for(let col=0;col<4;col++)add(new THREE.BoxGeometry(.07,.07,.008),new THREE.MeshBasicMaterial({color:(row+col)%2?0xe8e8d6:0x25384b}),x+.18+col*.07,1.4-row*.07,z);
  }
 }
 group.userData.courseBounds={left,right,top,bottom};return group;
}
