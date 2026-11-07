import {addAeroPaint} from './AeroPaint';
import * as THREE from 'three';

/** 風見 怜の専用カウル。白い分割ノーズ、青いウイング、赤い稲妻ライン。 */
export function buildKazamiBody(){
  const group=new THREE.Group();group.name='kazami-aero-assembly';
  const white=new THREE.MeshStandardMaterial({color:0xf1f1e9,metalness:.12,roughness:.29});
  const blue=new THREE.MeshStandardMaterial({color:0x162b9c,metalness:.24,roughness:.28,side:THREE.DoubleSide});
  const red=new THREE.MeshStandardMaterial({color:0xdf2936,metalness:.12,roughness:.32,side:THREE.DoubleSide});
  const silver=new THREE.MeshStandardMaterial({color:0xb9c1c5,metalness:.8,roughness:.26});
  const black=new THREE.MeshStandardMaterial({color:0x10191d,metalness:.24,roughness:.2});
  const gold=new THREE.MeshStandardMaterial({color:0xc5a452,metalness:.7,roughness:.3});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,name:string)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name=name;group.add(mesh);return mesh;
  };
  const loft=(sections:number[][],material:THREE.Material,name:string,x=0)=>{
    const vertices:number[]=[],indices:number[]=[],sides=12,rows=72;
    for(let r=0;r<=rows;r++){
      const f=r/rows*(sections.length-1),i=Math.min(sections.length-2,Math.floor(f)),t=f-i;
      const [z,w,bottom,top]=sections[i].map((v,k)=>THREE.MathUtils.lerp(v,sections[i+1][k],t));
      for(let j=0;j<sides;j++){
        const a=j/sides*Math.PI*2;vertices.push(Math.sin(a)*w,bottom+(top-bottom)*(Math.cos(a)+1)/2,z);
        if(r<rows){const n=(j+1)%sides;indices.push(r*sides+j,(r+1)*sides+j,r*sides+n,(r+1)*sides+j,(r+1)*sides+n,r*sides+n);}
      }
    }
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return add(g,material,x,0,0,name);
  };
  const stripe=(points:number[][],material:THREE.Material,name:string)=>addAeroPaint(group,points,material,name,name.includes('lightning')||name==='kazami-blue-nose'?['body-shell','kazami-front-cowl','kazami-rear-cowl']:[]);
  const plate=(points:number[][],material:THREE.Material,y:number,name:string,depth=.002)=>{
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const mesh=add(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.001,bevelThickness:.0007,bevelSegments:2,steps:1}),material,0,y,0,name);mesh.rotation.x=-Math.PI/2;return mesh;
  };
  loft([[-.127,.016,.045,.062],[-.106,.036,.044,.076],[-.065,.036,.045,.081],[-.02,.031,.043,.075],[.022,.029,.043,.069],[.07,.024,.043,.061],[.119,.013,.044,.053],[.145,.001,.045,.047]],white,'body-shell');
  loft([[-.099,.002,.075,.076],[-.08,.02,.075,.089],[-.048,.025,.074,.096],[-.014,.021,.069,.091],[.018,.012,.066,.08],[.034,.001,.064,.065]],black,'cabin-glass');
  stripe([[-.021,.0695,.024],[.021,.0695,.024],[.008,.054,.116],[0,.049,.139],[-.008,.054,.116]],blue,'kazami-blue-nose');
  // 白いノーズの左右に赤い折れ線。ボディの面に沿って高さも変える。
  for(const side of [-1,1]){
    add(new THREE.BoxGeometry(.004,.019,.095),black,side*.038,.039,-.006,'kazami-battery-side-cover');
    const mirror=(points:number[][])=>points.map(([x,z])=>[x*side,z]);
    loft([[.02,.003,.046,.054],[.047,.018,.045,.065],[.084,.026,.044,.073],[.113,.024,.043,.065],[.136,.003,.044,.049]],white,'kazami-front-cowl',side*.047);
    stripe([[side*.031,.064,.048],[side*.051,.068,.067],[side*.04,.069,.077],[side*.06,.072,.09],[side*.043,.064,.12],[side*.05,.07,.092],[side*.03,.066,.077]],red,'kazami-red-front-lightning');
    loft([[-.128,.009,.044,.061],[-.108,.025,.045,.078],[-.077,.03,.044,.081],[-.043,.026,.044,.075],[-.023,.007,.045,.057]],white,'kazami-rear-cowl',side*.047);
    stripe([[side*.043,.079,-.113],[side*.065,.081,-.094],[side*.052,.083,-.08],[side*.067,.079,-.06],[side*.043,.078,-.038],[side*.052,.08,-.062],[side*.038,.084,-.079]],red,'kazami-red-rear-lightning');
    stripe([[side*.075,.06,-.119],[side*.077,.073,-.087],[side*.074,.066,-.037],[side*.066,.051,-.027],[side*.066,.05,-.115]],blue,'kazami-blue-side-skirt');
    // 独立した前側の青いカナードと、タイヤ前方の切り欠き。
    const canard=plate(mirror([[.058,.126],[.082,.128],[.083,.087],[.071,.098]]),blue,.049,'kazami-front-canard');
    canard.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),side*.15));
    stripe([[side*.062,.065,.121],[side*.078,.066,.116],[side*.076,.06,.106]],white,'kazami-canard-white-mark');
    add(new THREE.BoxGeometry(.004,.035,.008),silver,side*.047,.093,-.108,'kazami-wing-pylon');
    // 縦型の翼端板。輪郭を実際に押し出して厚みと面取りをつける。
    const finShape=new THREE.Shape([new THREE.Vector2(.151,.096),new THREE.Vector2(.15,.126),new THREE.Vector2(.133,.132),new THREE.Vector2(.111,.119),new THREE.Vector2(.112,.097)]);
    const fin=add(new THREE.ExtrudeGeometry(finShape,{depth:.002,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0008,bevelSegments:2,steps:1}),blue,side*.078,0,0,'kazami-wing-endplate');
    // local x = -world z, local y = world y
    fin.rotation.y=Math.PI/2;
    for(const z of [-.107,.087]){
      add(new THREE.CylinderGeometry(.0026,.0026,.0014,6),black,side*.045,z>0?.073:.082,z,'kazami-body-fastener');
    }
    for(let i=0;i<3;i++){
      const vent=add(new THREE.BoxGeometry(.009,.001,.002),black,side*.035,.079,-.094+i*.006,'kazami-cowl-vent');vent.rotation.z=side*.12;
    }
  }
  // 後退角をつけた大型の青いリアウイング。
  plate([[-.078,-.111],[-.037,-.119],[.037,-.119],[.078,-.111],[.078,-.143],[.037,-.15],[-.037,-.15],[-.078,-.143]],blue,.109,'rear-wing',.004);
  add(new THREE.BoxGeometry(.128,.001,.002),white,0,.114,-.145,'kazami-wing-white-trim');
  // 他作品のロゴを使わず、独自の金色の幾何学マークを入れる。
  stripe([[-.029,.114,-.13],[-.018,.114,-.124],[-.008,.114,-.13],[-.019,.114,-.128]],gold,'kazami-wing-emblem');
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const flash=add(new THREE.BoxGeometry(.007,.0005,.003),gold,side*(.036+i*.009),.114,-.132,'kazami-wing-gold-stripe');flash.rotation.y=-side*.35;
  }
  return group;
}
