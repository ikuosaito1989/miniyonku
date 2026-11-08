import {addAeroPaint} from './AeroPaint';
import * as THREE from 'three';

/** 火野 岳の専用カウル。白いセンターと大型翼、赤いフェンダー、金色のノーズと黒いフレア。 */
export function buildHinoBody(){
  const group=new THREE.Group();group.name='hino-aero-assembly';
  const white=new THREE.MeshStandardMaterial({color:0xf1f1e9,metalness:.12,roughness:.29,side:THREE.DoubleSide});
  const carbon=new THREE.MeshStandardMaterial({color:0x20272b,metalness:.15,roughness:.55,side:THREE.DoubleSide});
  const red=new THREE.MeshStandardMaterial({color:0xdf2936,metalness:.12,roughness:.32,side:THREE.DoubleSide});
  const silver=new THREE.MeshStandardMaterial({color:0xb9c1c5,metalness:.8,roughness:.26});
  const black=new THREE.MeshStandardMaterial({color:0x10191d,metalness:.24,roughness:.2,side:THREE.DoubleSide});
  const gold=new THREE.MeshStandardMaterial({color:0xc5a452,metalness:.7,roughness:.3,side:THREE.DoubleSide});
  for(const [material,priority] of [[gold,-1],[red,-2],[black,-3]] as const){material.polygonOffset=true;material.polygonOffsetFactor=priority;material.polygonOffsetUnits=priority;}
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
  const stripe=(points:number[][],material:THREE.Material,name:string)=>addAeroPaint(group,points,material,name,name.includes('flame')||name.includes('nose-crest')||name==='hino-gold-nose'||name==='hino-front-lamp'?['body-shell','hino-front-cowl','hino-rear-cowl']:[]);
  const plate=(points:number[][],material:THREE.Material,y:number,name:string,depth=.002)=>{
    const shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
    const mesh=add(new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSize:.001,bevelThickness:.0007,bevelSegments:2,steps:1}),material,0,y,0,name);mesh.rotation.x=-Math.PI/2;return mesh;
  };
  loft([[-.127,.016,.045,.062],[-.106,.036,.044,.076],[-.065,.036,.045,.081],[-.02,.031,.043,.075],[.022,.029,.043,.069],[.07,.024,.043,.061],[.119,.013,.044,.053],[.145,.001,.045,.047]],white,'body-shell');
  loft([[-.099,.002,.075,.076],[-.08,.02,.075,.089],[-.048,.025,.074,.096],[-.014,.021,.069,.091],[.018,.012,.066,.08],[.034,.001,.064,.065]],black,'cabin-glass');
  stripe([[-.021,.0695,.024],[.021,.0695,.024],[.008,.054,.116],[0,.049,.139],[-.008,.054,.116]],gold,'hino-gold-nose');
  stripe([[-.006,.06,.081],[0,.06,.069],[.006,.06,.081],[0,.06,.077]],black,'hino-nose-crest');
  for(const side of [-1,1])stripe([[side*.013,.06,.028],[side*.019,.06,.028],[side*.01,.055,.089],[side*.003,.05,.129]],red,'hino-red-nose-crest');
  // 赤い独立フェンダーと黒いフレア模様。
  for(const side of [-1,1]){
    add(new THREE.BoxGeometry(.004,.019,.095),black,side*.038,.039,-.006,'hino-battery-side-cover');
    loft([[.02,.003,.046,.054],[.047,.018,.045,.065],[.084,.032,.044,.071],[.113,.028,.043,.064],[.136,.003,.044,.049]],red,'hino-front-cowl',side*.047);
    stripe([[side*.043,.07,.126],[side*.048,.07,.112],[side*.045,.07,.098],[side*.056,.07,.105],[side*.052,.07,.076],[side*.061,.07,.087],[side*.067,.07,.058],[side*.068,.07,.09],[side*.075,.07,.105],[side*.064,.07,.099],[side*.061,.07,.12]],black,'hino-front-flame');
    stripe([[side*.045,.07,.122],[side*.062,.07,.122],[side*.066,.07,.111],[side*.051,.07,.114]],gold,'hino-front-lamp');
    loft([[-.128,.009,.044,.061],[-.108,.025,.045,.078],[-.077,.03,.044,.081],[-.043,.026,.044,.075],[-.023,.007,.045,.057]],white,'hino-rear-cowl',side*.047);
    stripe([[side*.044,.08,-.122],[side*.066,.08,-.11],[side*.073,.08,-.078],[side*.061,.08,-.045],[side*.044,.08,-.052]],red,'hino-red-rear-flame-base');
    stripe([[side*.049,.08,-.117],[side*.054,.08,-.101],[side*.047,.08,-.086],[side*.06,.08,-.092],[side*.057,.08,-.064],[side*.067,.08,-.075],[side*.07,.08,-.098],[side*.062,.08,-.104],[side*.058,.08,-.119]],black,'hino-rear-flame');
    stripe([[side*.075,.06,-.119],[side*.077,.073,-.087],[side*.074,.066,-.037],[side*.066,.051,-.027],[side*.066,.05,-.115]],carbon,'hino-carbon-side-panel');
    stripe([[side*.076,.068,-.116],[side*.078,.069,-.089],[side*.076,.058,-.049],[side*.072,.052,-.05],[side*.073,.054,-.093]],red,'hino-red-side-flare');
    add(new THREE.BoxGeometry(.004,.035,.008),silver,side*.047,.093,-.108,'hino-wing-pylon');
    // 縦型の翼端板。輪郭を実際に押し出して厚みと面取りをつける。
    const finShape=new THREE.Shape([new THREE.Vector2(.151,.096),new THREE.Vector2(.15,.126),new THREE.Vector2(.133,.132),new THREE.Vector2(.111,.119),new THREE.Vector2(.112,.097)]);
    const fin=add(new THREE.ExtrudeGeometry(finShape,{depth:.002,bevelEnabled:true,bevelSize:.0008,bevelThickness:.0008,bevelSegments:2,steps:1}),white,side*.078,0,0,'hino-wing-endplate');
    // local x = -world z, local y = world y
    fin.rotation.y=Math.PI/2;
    for(const z of [-.107,.087]){
      add(new THREE.CylinderGeometry(.0026,.0026,.0014,6),black,side*.045,z>0?.073:.082,z,'hino-body-fastener');
    }
    for(let i=0;i<3;i++){
      const vent=add(new THREE.BoxGeometry(.009,.001,.002),black,side*.035,.079,-.094+i*.006,'hino-cowl-vent');vent.rotation.z=side*.12;
    }
  }
  // 白い大型翼に金色のライン。ロゴ・模様は独自のものを使う。
  plate([[-.078,-.111],[-.037,-.119],[.037,-.119],[.078,-.111],[.078,-.143],[.037,-.15],[-.037,-.15],[-.078,-.143]],white,.109,'rear-wing',.004);
  add(new THREE.BoxGeometry(.128,.001,.002),gold,0,.114,-.145,'hino-wing-gold-trim');
  // 他作品のロゴを使わず、独自の金色の幾何学マークを入れる。
  stripe([[-.029,.114,-.13],[-.018,.114,-.124],[-.008,.114,-.13],[-.019,.114,-.128]],gold,'hino-wing-emblem');
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const flash=add(new THREE.BoxGeometry(.007,.0005,.003),gold,side*(.036+i*.009),.114,-.132,'hino-wing-gold-stripe');flash.rotation.y=-side*.35;
  }
  return group;
}
