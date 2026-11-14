import * as THREE from 'three';

/** Shared sculpt for all stages; the higher stages add fins and reinforcement. */
export function addCraftDetails(car:THREE.Group,body:string,chassis:string){
 const bodyLevel=body.startsWith('body-craft-')?Number(body.split('-').at(-1))+1:0;
 const chassisLevel=chassis.startsWith('chassis-craft-')?Number(chassis.split('-').at(-1))+1:0;
 const panel=(name:string,w:number,h:number,d:number,x:number,y:number,z:number,color:number)=>{
  const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),new THREE.MeshStandardMaterial({color,roughness:.32,metalness:.15}));m.name=name;m.position.set(x,y,z);car.add(m);return m;
 };
 if(bodyLevel){
  for(const side of [-1,1]){
   const strip=panel('craft-cowl-stripe',.007,.002,.14,side*.035,.065,0,bodyLevel>=9?0xe7bf67:0x63b6b4);strip.rotation.z=side*.12;
   if(bodyLevel>=3){const fin=panel('craft-side-fin',.003,.012,.045,side*.055,.068,-.055,0xe5e9dc);fin.rotation.x=-.1;}
   if(bodyLevel>=6)panel('craft-rear-fin',.004,.018,.035,side*.045,.075,-.10,0x326f77);
  }
  if(bodyLevel>=9)panel('craft-crown-fin',.008,.014,.055,0,.082,-.065,0xf0c86f);
 }
 if(chassisLevel>=3){
  for(const side of [-1,1])panel('craft-frame-brace',.003,.004,.12,side*.06,.025,0,chassisLevel>=9?0xd1b36b:0x8fbdb0);
 }
}
