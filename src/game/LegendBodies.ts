import * as THREE from 'three';

function builder(name:string){
 const group=new THREE.Group();group.name=name;
 const material=(color:number,metalness=.65,roughness=.3)=>new THREE.MeshStandardMaterial({color,metalness,roughness,side:THREE.DoubleSide});
 const add=(geometry:THREE.BufferGeometry,mat:THREE.Material,x:number,y:number,z:number,name:string)=>{const mesh=new THREE.Mesh(geometry,mat);mesh.position.set(x,y,z);mesh.name=name;group.add(mesh);return mesh;};
 const loft=(rows:number[][],mat:THREE.Material,name:string,x=0)=>{
  const vertices:number[]=[],indices:number[]=[],sides=12,steps=48;
  for(let i=0;i<=steps;i++){
   const f=i/steps*(rows.length-1),j=Math.min(rows.length-2,Math.floor(f)),t=f-j;
   const [z,w,low,high]=rows[j].map((value,k)=>THREE.MathUtils.lerp(value,rows[j+1][k],t));
   for(let k=0;k<sides;k++){const a=k/sides*Math.PI*2;vertices.push(x+Math.sin(a)*w,low+(high-low)*(1+Math.cos(a))/2,z);if(i<steps){const a=i*sides+k,b=(i+1)*sides+k,n=(k+1)%sides;indices.push(a,b,i*sides+n,b,(i+1)*sides+n,i*sides+n);}}
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();return add(geometry,mat,0,0,0,name);
 };
 const pipe=(points:number[][],radius:number,mat:THREE.Material,name:string)=>add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p as [number,number,number]))),20,radius,8,false),mat,0,0,0,name);
 return {group,material,add,loft,pipe};
}

/** 添付1：銀色の三分割ノーズ、4つの金色吸気口と左右の曲がった金属パイプ。 */
export function buildTowaBody(){
 const {group,material,add,loft,pipe}=builder('towa-silver-fencer');
 const silver=material(0xbfc8cc,.88,.24),dark=material(0x303c45,.55,.28),glass=material(0x17212c,.5,.15),gold=material(0xe5ad30,.9,.2),red=material(0xaa2739,.5,.24),ink=material(0x242a32,.2,.6);
 loft([[-.135,.015,.046,.065],[-.09,.03,.048,.088],[-.035,.027,.049,.075],[.03,.023,.045,.065],[.115,.005,.043,.047],[.143,.001,.043,.044]],silver,'towa-central-spear');
 loft([[-.12,.007,.066,.076],[-.085,.024,.067,.091],[-.045,.022,.062,.088],[0,.014,.057,.073],[.03,.003,.052,.055]],glass,'cabin-glass');
 loft([[-.13,.002,.075,.114],[-.096,.004,.075,.103],[-.057,.002,.075,.082]],dark,'towa-dorsal-fin');
 for(const side of [-1,1]){
  loft([[-.13,.016,.047,.067],[-.11,.03,.049,.089],[-.065,.033,.048,.085],[-.04,.015,.045,.061]],silver,'towa-rear-intake-pod',side*.048);
  loft([[.015,.008,.042,.05],[.045,.027,.043,.068],[.085,.03,.042,.062],[.13,.02,.041,.049],[.148,.001,.04,.043]],silver,'towa-split-front-fender',side*.05);
  for(const dx of [-.011,.011]){
   const x=side*.048+dx;
   add(new THREE.CylinderGeometry(.0085,.0085,.007,20),ink,x,.078,-.044,'towa-intake-recess').rotation.x=Math.PI/2;
   add(new THREE.TorusGeometry(.0072,.0023,8,24),gold,x,.078,-.039,'towa-gold-intake');
  }
  pipe([[side*.065,.063,-.045],[side*.079,.058,-.01],[side*.066,.047,.018],[side*.043,.047,.035]],.004,silver,'towa-metal-hose');
  for(let i=0;i<5;i++)add(new THREE.TorusGeometry(.0045,.0008,4,10),dark,side*(.077-i*.003),.052+i*.001,-.006+i*.005,'towa-hose-ring').rotation.y=Math.PI/2;
  add(new THREE.SphereGeometry(.008,12,8),red,side*.022,.05,.119,'towa-red-nose-light').scale.set(1,.7,1.7);
  // 独自の黒い稲妻と後部の割れ模様を、カウル表面の薄い線で描く。
  for(let i=0;i<4;i++){
   pipe([[side*(.042+i*.003),.064-i*.001,.052+i*.006],[side*(.052+i*.003),.059,.075+i*.007],[side*(.044+i*.004),.052,.106+i*.003]],.0008,ink,'towa-black-flare');
   pipe([[side*(.034+i*.009),.085,-.105],[side*(.038+i*.009),.087,-.092],[side*(.032+i*.009),.082,-.077]],.0006,red,'towa-rear-crackle');
  }
 }
 return group;
}

/** 添付2：幅広の黒銀カウル、露出した前部駆動カバー、青いキャノピー。 */
export function buildKoyaBody(){
 const {group,material,add,loft,pipe}=builder('koya-armored-twinr');
 const black=material(0x1b2025,.45,.36),silver=material(0x919ba1,.8,.3),blue=material(0x1477d6,.65,.2),bright=material(0x65c9fa,.65,.17),yellow=material(0xf1d23c,.6,.24),recess=material(0x080d12,.15,.6);
 loft([[-.139,.044,.043,.057],[-.105,.063,.043,.065],[-.04,.058,.043,.074],[.015,.045,.043,.063],[.08,.058,.043,.06],[.14,.05,.043,.057]],black,'koya-armored-platform');
 loft([[-.098,.022,.063,.081],[-.063,.035,.064,.106],[-.02,.038,.064,.11],[.028,.03,.06,.087],[.048,.014,.057,.061]],blue,'cabin-glass');
 add(new THREE.BoxGeometry(.012,.001,.055),bright,-.019,.106,-.045,'koya-canopy-reflection').rotation.z=-.25;
 add(new THREE.BoxGeometry(.013,.002,.062),black,0,.072,.093,'koya-front-center-spine');
 const engine=add(new THREE.CylinderGeometry(.017,.017,.085,20),black,0,.07,.055,'koya-front-drive-cover');engine.rotation.z=Math.PI/2;
 for(let i=0;i<10;i++)add(new THREE.BoxGeometry(.073,.004,.003),recess,0,.084,.025+i*.006,'koya-engine-cooling-fin');
 for(const side of [-1,1]){
  loft([[.025,.018,.044,.065],[.061,.029,.045,.074],[.114,.029,.043,.069],[.143,.021,.043,.058]],silver,'koya-front-armour',side*.052);
  loft([[-.139,.018,.044,.065],[-.113,.03,.043,.082],[-.06,.028,.044,.082],[-.029,.012,.045,.061]],silver,'koya-rear-armour',side*.052);
  add(new THREE.BoxGeometry(.043,.007,.006),black,side*.05,.057,.146,'koya-headlamp-surround');
  add(new THREE.BoxGeometry(.033,.003,.001),yellow,side*.05,.058,.15,'koya-yellow-headlamp');
  add(new THREE.TorusGeometry(.004,.0012,6,14),yellow,side*.05,.058,.151,'koya-headlamp-ring');
  add(new THREE.BoxGeometry(.012,.012,.073),black,side*.064,.045,-.005,'koya-side-guard');
  for(let i=0;i<3;i++){
   const vent=add(new THREE.BoxGeometry(.004,.026,.008),black,side*(.033+i*.005),.079,-.081,'koya-canopy-vent');vent.rotation.z=side*-.28;
   add(new THREE.BoxGeometry(.002,.019,.005),bright,side*(.035+i*.005),.08,-.081,'koya-blue-vent-trim');
  }
  // 独自の銀黒の亀裂と青い縁取り。メーカー名やロゴは描かない。
  for(let i=0;i<12;i++){
   const z=.036+i*.008;
   pipe([[side*(.038+(i%3)*.005),.07,z],[side*(.05+(i%2)*.008),.073,z+.004],[side*.07,.065,z+.01]],.00085,i%3===0?blue:black,'koya-metallic-crackle');
   if(i<8)pipe([[side*.036,.077,-.12+i*.009],[side*.052,.083,-.115+i*.009],[side*.07,.074,-.111+i*.009]],.0008,black,'koya-rear-crackle');
  }
  add(new THREE.BoxGeometry(.018,.003,.037),black,side*.043,.084,-.136,'koya-rear-fin');
 }
 return group;
}
