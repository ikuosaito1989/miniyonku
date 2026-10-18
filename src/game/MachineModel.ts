import * as THREE from 'three';
import type { Equipment } from '../data/machine';
import { bodyDesign } from '../data/bodies';

// z方向が進行方向。断面の幅・高さをスプライン補間した独自のカウル。
function shell(sections: number[][], color: number, squared=false) {
  const profile = new THREE.CatmullRomCurve3(sections.map(([z,w,h])=>new THREE.Vector3(z,w,h)));
  const vertices:number[]=[], indices:number[]=[];
  const rows=48, sides=24;
  for(let i=0;i<=rows;i++){
    const p=profile.getPoint(i/rows);
    for(let j=0;j<=sides;j++){
      const angle=j/sides*Math.PI*2;
      const rounded=(n:number)=>squared?Math.sign(n)*Math.abs(n)**.5:n;
      vertices.push(rounded(Math.sin(angle))*Math.max(0.001,p.y),0.052+rounded(Math.cos(angle))*Math.max(0.001,p.z),p.x);
      if(i<rows&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color,shininess:70,side:THREE.DoubleSide}));
}

export function buildMachineModel(color:number,equipment:Equipment){
  const design=bodyDesign(equipment.body);
  const car=new THREE.Group();car.name=design.id;
  const rubber=new THREE.MeshPhongMaterial({color:equipment.tire==='tire-1'?0x424853:0x141923,shininess:8});
  const metal=new THREE.MeshPhongMaterial({color:0xc5d7e2,shininess:90});
  const frame=new THREE.MeshPhongMaterial({color:equipment.chassis==='chassis-light'?0x657b8a:equipment.chassis==='chassis-low'?0x34314f:0x243343,shininess:30});
  const accent=new THREE.MeshPhongMaterial({color:0xf4eedc,shininess:65});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);car.add(mesh);return mesh;
  };
  // 実車風のボンネット・キャビン・トランクを持つオリジナルの模型ボディ。
  const w=design.width,boxy=['kei','suv','wagon'].includes(design.shape);
  const body=shell([[-.128,.035,.012],[-.116,w*.85,.016],[-.08,w,.02],[0,w,.021],[.08,w*.97,.018],[.117,w*.83,.014],[.132,.026,.009]],color,boxy);
  body.name='body-shell';car.add(body);
  const rear=design.cabinRear,front=design.cabinFront,height=design.cabinHeight;
  const canopy=shell([[rear-.014,.002,.001],[rear,w*.68,height*.72],[rear+.02,w*.7,height],[front-.015,w*.65,height],[front+.022,w*.7,.002],[front+.028,.002,.001]],0x193b52,boxy);
  canopy.position.y=.018;canopy.name='cabin-glass';car.add(canopy);
  const roof=shell([[rear+.005,.003,.001],[rear+.02,w*.7,.002],[front-.017,w*.65,.002],[front-.012,.003,.001]],color,boxy);
  roof.position.y=.022+height;roof.name='roof';car.add(roof);
  for(const side of [-1,1]){
    // Bピラー、ドア下のプレスライン、前後灯。車種によってルーフ高さが変わる。
    const pillar=add(new THREE.CapsuleGeometry(.0025,height*.7,3,8),frame,side*w*.69,.073+height*.45,(rear+front)/2);
    pillar.rotation.z=side*.16;
    add(new THREE.CapsuleGeometry(.0015,.1,3,8),accent,side*w,.056,-.006).rotation.x=Math.PI/2;
    add(new THREE.SphereGeometry(1,16,8),accent,side*w*.55,.061,.123).scale.set(.016,.005,.003);
    const tail=add(new THREE.SphereGeometry(1,16,8),new THREE.MeshPhongMaterial({color:0xe4554c}),side*w*.63,.061,-.12);tail.scale.set(.014,.004,.003);
    if(design.shape==='suv'){
      const rail=add(new THREE.CapsuleGeometry(.0025,.085,3,8),metal,side*w*.52,.078+height,-.025);rail.rotation.x=Math.PI/2;
      add(new THREE.BoxGeometry(.008,.012,.12),frame,side*w*.97,.036,0);
    }
  }
  add(new THREE.BoxGeometry(.045,.008,.003),frame,0,.051,.131).name='front-grille';
  // ミニ四駆機構は共通のまま、曲線バンパーを車体の前後に配置。
  for(const side of [-1,1]){
    const rail=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.101,.035,.123),new THREE.Vector3(side*.07,.037,.146),new THREE.Vector3(0,.04,.155),new THREE.Vector3(-side*.07,.037,.146),new THREE.Vector3(-side*.101,.035,.123)]);
    // 前後のFRP風バンパーを曲線で成形。
    if(side===1)car.add(new THREE.Mesh(new THREE.TubeGeometry(rail,24,.005,6,false),frame));
  }
  const rearRail=new THREE.CatmullRomCurve3([new THREE.Vector3(-.103,.04,-.13),new THREE.Vector3(-.065,.037,-.145),new THREE.Vector3(0,.037,-.15),new THREE.Vector3(.065,.037,-.145),new THREE.Vector3(.103,.04,-.13)]);
  car.add(new THREE.Mesh(new THREE.TubeGeometry(rearRail,32,.005,8,false),frame));
  if(['coupe','gt','prototype'].includes(design.shape)||design.id==='body-rally'){
    const wing=add(new THREE.SphereGeometry(1,24,12),accent,0,.095,-.113);wing.scale.set(.074,.004,design.shape==='prototype'?.024:.015);wing.rotation.x=-.15;
    for(const side of [-1,1])add(new THREE.BoxGeometry(.004,.027,.006),frame,side*.045,.078,-.113);
  }
  const deck=add(new THREE.BoxGeometry(.1,.008,.18),frame,0,.026,0);deck.name='chassis';
  for(const side of [-1,1]){
    const cell=add(new THREE.CylinderGeometry(.012,.012,.12,16),new THREE.MeshPhongMaterial({color:equipment.battery==='battery-recharge'?0x8bd5b5:equipment.battery==='battery-power'?0xe4ac4c:equipment.battery==='battery-endurance'?0x61bfa7:0xa2afbb}),side*.025,.038,0);cell.rotation.x=Math.PI/2;
  }
  if(equipment.accessory!=='accessory-none')add(new THREE.BoxGeometry(.06,.006,.02),metal,0,.033,equipment.accessory==='accessory-weight'?.065:-.07);
  for(const z of [-.083,.083]){
    const axle=add(new THREE.CylinderGeometry(.003,.003,.179,12),metal,0,.033,z);axle.rotation.z=Math.PI/2;
    for(const side of [-1,1]){
      const wheel=add(new THREE.CylinderGeometry(.033,.033,.028,32),rubber,side*.082,.033,z);wheel.rotation.z=Math.PI/2;
      const rim=add(new THREE.CylinderGeometry(.022,.022,.002,24),frame,side*.097,.033,z);rim.rotation.z=Math.PI/2;
      const spokes=equipment.wheel==='wheel-light'?6:equipment.wheel==='wheel-oneway'?3:5;
      for(let i=0;i<spokes;i++){
        const spoke=add(new THREE.CapsuleGeometry(.002,.032,3,6),accent,side*.099,.033,z);spoke.rotation.x=i*Math.PI/spokes;
      }
      const hub=add(new THREE.CylinderGeometry(.007,.007,.004,16),metal,side*.101,.033,z);hub.rotation.z=Math.PI/2;
    }
  }
  for(const x of [-.101,.101])for(const z of [-.13,0,.125]){
    const id=equipment[z<0?'rollerRear':z>0?'rollerFront':'rollerSide'];
    const material=id==='roller-1'?rubber:id==='roller-2'?metal:accent;
    add(new THREE.CylinderGeometry(.014,.014,.008,24),material,x,.045,z);
    add(new THREE.CylinderGeometry(.004,.004,.013,12),metal,x,.049,z);
  }
  car.scale.setScalar(.85);return car;
}
