import * as THREE from 'three';
import type { Equipment } from '../data/machine';

// z方向が進行方向。断面の幅・高さをスプライン補間した独自のカウル。
function shell(sections: number[][], color: number) {
  const profile = new THREE.CatmullRomCurve3(sections.map(([z,w,h])=>new THREE.Vector3(z,w,h)));
  const vertices:number[]=[], indices:number[]=[];
  const rows=48, sides=24;
  for(let i=0;i<=rows;i++){
    const p=profile.getPoint(i/rows);
    for(let j=0;j<=sides;j++){
      const angle=j/sides*Math.PI*2;
      vertices.push(Math.sin(angle)*Math.max(0.001,p.y),0.052+Math.cos(angle)*Math.max(0.001,p.z),p.x);
      if(i<rows&&j<sides){const a=i*(sides+1)+j,b=a+sides+1;indices.push(a,b,a+1,b,b+1,a+1);}
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color,shininess:70,side:THREE.DoubleSide}));
}

export function buildMachineModel(color:number,equipment:Equipment){
  const car=new THREE.Group();car.name='komorebi-stream-body';
  const rubber=new THREE.MeshPhongMaterial({color:equipment.tire==='tire-1'?0x424853:0x141923,shininess:8});
  const metal=new THREE.MeshPhongMaterial({color:0xc5d7e2,shininess:90});
  const frame=new THREE.MeshPhongMaterial({color:equipment.chassis==='chassis-light'?0x657b8a:equipment.chassis==='chassis-low'?0x34314f:0x243343,shininess:30});
  const accent=new THREE.MeshPhongMaterial({color:0xf4eedc,shininess:65});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);car.add(mesh);return mesh;
  };
  // 細いノーズ、ふくらんだ肩、絞ったテール。タイヤを覆い隠さない低い車体。
  const body=shell([[-.137,.006,.003],[-.11,.043,.014],[-.065,.061,.021],[0,.048,.027],[.055,.032,.019],[.11,.017,.009],[.143,.002,.002]],color);
  body.scale.x=equipment.body==='body-arrow'?.8:equipment.body==='body-manta'?1.18:1;car.add(body);
  const canopy=shell([[-.066,.001,.001],[-.045,.022,.018],[-.012,.024,.025],[.025,.014,.012],[.048,.001,.001]],0x153e59);
  canopy.position.y=.025;car.add(canopy);
  const stripe=shell([[-.132,.001,.001],[-.09,.006,.002],[-.045,.007,.002],[.035,.005,.002],[.12,.002,.001]],0xf5e8bc);
  stripe.position.y=.022;car.add(stripe);
  // 左右の曲面サイドポッドと吸気口。
  for(const side of [-1,1]){
    const pod=shell([[-.093,.001,.001],[-.064,.014,.012],[-.02,.015,.015],[.035,.009,.009],[.07,.001,.001]],color);
    pod.position.set(side*.047,-.009,0);car.add(pod);
    for(let i=0;i<3;i++){
      const vent=add(new THREE.CapsuleGeometry(.002,.018,3,8),frame,side*.047,.067,-.045+i*.012);vent.rotation.z=Math.PI/2;
    }
    const rail=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.101,.035,.123),new THREE.Vector3(side*.07,.037,.146),new THREE.Vector3(0,.04,.155),new THREE.Vector3(-side*.07,.037,.146),new THREE.Vector3(-side*.101,.035,.123)]);
    // 前後のFRP風バンパーを曲線で成形。
    if(side===1)car.add(new THREE.Mesh(new THREE.TubeGeometry(rail,24,.005,6,false),frame));
    const stay=add(new THREE.CapsuleGeometry(.003,.025,3,8),metal,side*.056,.077,-.109);
    stay.rotation.x=.2;
  }
  const rear=new THREE.CatmullRomCurve3([new THREE.Vector3(-.103,.04,-.13),new THREE.Vector3(-.065,.037,-.145),new THREE.Vector3(0,.037,-.15),new THREE.Vector3(.065,.037,-.145),new THREE.Vector3(.103,.04,-.13)]);
  car.add(new THREE.Mesh(new THREE.TubeGeometry(rear,32,.005,8,false),frame));
  const wing=add(new THREE.SphereGeometry(1,24,12),accent,0,.095,-.113);wing.scale.set(.078,.005,.018);wing.rotation.x=-.15;
  if(equipment.body==='body-manta')wing.scale.z=.029;
  const deck=add(new THREE.BoxGeometry(.1,.008,.18),frame,0,.026,0);deck.name='chassis';
  for(const side of [-1,1]){
    const cell=add(new THREE.CylinderGeometry(.012,.012,.12,16),new THREE.MeshPhongMaterial({color:equipment.battery==='battery-power'?0xe4ac4c:equipment.battery==='battery-endurance'?0x61bfa7:0xa2afbb}),side*.025,.038,0);cell.rotation.x=Math.PI/2;
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
