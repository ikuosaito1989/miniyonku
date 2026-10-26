import * as THREE from 'three';

/** セイラン専用の分割カウル。開口部は黒い模様ではなく実際に抜いた形状。 */
export function buildSeiranBody(){
  const group=new THREE.Group();group.name='seiran-aero-assembly';
  const graphite=new THREE.MeshStandardMaterial({color:0x252d30,metalness:.28,roughness:.43,side:THREE.DoubleSide});
  const edge=new THREE.MeshStandardMaterial({color:0x343e42,metalness:.4,roughness:.34});
  const carbon=new THREE.MeshStandardMaterial({color:0x141a1d,metalness:.18,roughness:.65});
  const steel=new THREE.MeshStandardMaterial({color:0xbac5c9,metalness:.85,roughness:.26});
  const recess=new THREE.MeshStandardMaterial({color:0x080d10,roughness:.85});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number,name:string)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.name=name;group.add(mesh);return mesh;
  };
  const bolt=(x:number,y:number,z:number)=>{
    add(new THREE.CylinderGeometry(.0031,.0031,.001,20),steel,x,y,z,'seiran-washer');
    add(new THREE.CylinderGeometry(.0022,.0022,.0022,6),steel,x,y+.0013,z,'seiran-hex-fastener');
    add(new THREE.BoxGeometry(.0025,.0003,.00065),recess,x,y+.0025,z,'seiran-screw-slot');
  };
  const beam=(a:number[],b:number[],radius:number,material:THREE.Material,name:string)=>{
    const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
    const mesh=add(new THREE.CylinderGeometry(radius,radius,delta.length(),8),material,0,0,0,name);
    mesh.position.copy(from.add(to).multiplyScalar(.5));mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());
  };
  const panel=(outline:number[][],holes:number[][][],y:number,material:THREE.Material,name:string,depth=.002)=>{
    const shape=new THREE.Shape(outline.map(([x,z])=>new THREE.Vector2(x,-z)));
    for(const points of holes)shape.holes.push(new THREE.Path(points.map(([x,z])=>new THREE.Vector2(x,-z))));
    const geo=new THREE.ExtrudeGeometry(shape,{depth,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.0008,bevelThickness:.0007,curveSegments:12});
    const mesh=add(geo,material,0,y,0,name);mesh.rotation.x=-Math.PI/2;return mesh;
  };
  // 細いセンターモノコック。長い尖った鼻先から背面へ立ち上がる複合断面。
  const sections=[[-.113,.01,.058,.07],[-.09,.025,.056,.078],[-.063,.032,.055,.091],[-.025,.028,.053,.082],[.017,.025,.05,.073],[.065,.02,.047,.067],[.108,.011,.045,.057],[.142,.001,.045,.047]];
  const vertices:number[]=[],indices:number[]=[];
  const sides=10,rows=80;
  for(let r=0;r<=rows;r++){
    const f=r/rows*(sections.length-1),i=Math.min(sections.length-2,Math.floor(f)),t=f-i;
    const [z,w,bottom,top]=sections[i].map((n,k)=>THREE.MathUtils.lerp(n,sections[i+1][k],t));
    for(let j=0;j<sides;j++){
      const a=j/sides*Math.PI*2;
      vertices.push(Math.sin(a)*w,bottom+(top-bottom)*(Math.cos(a)+1)/2,z);
      if(r<rows){const n=(j+1)%sides;indices.push(r*sides+j,(r+1)*sides+j,r*sides+n,(r+1)*sides+j,(r+1)*sides+n,r*sides+n);}
    }
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
  add(geo,graphite,0,0,0,'body-shell');
  // キャビンも黒い装甲カウル。既存の寸法比較・プレビューに共通の名前を使う。
  const canopy=add(new THREE.SphereGeometry(1,24,12),graphite,0,.076,-.053,'cabin-glass');canopy.scale.set(.023,.013,.043);
  for(const side of [-1,1]){
    const mirror=(p:number[][])=>p.map(([x,z])=>[x*side,z]);
    panel(mirror([[.012,.137],[.034,.119],[.05,.075],[.044,.021],[.028,.008],[.024,.058]]),[mirror([[.031,.104],[.04,.079],[.034,.043],[.03,.061]])],.057,graphite,'seiran-split-nose');
    // 車輪上部の独立した鎌形フェンダー。タイヤは外から見える。
    for(const z of [-.083,.083]){
      const arch=add(new THREE.TorusGeometry(.037,.004,8,32,Math.PI),graphite,side*.071,.033,z,'seiran-wheel-cowl');arch.rotation.y=Math.PI/2;
      panel(mirror([[.045,z+.031],[.064,z+.041],[.075,z+.014],[.071,z-.026],[.058,z-.036],[.049,z-.016]]),[],.063,graphite,'seiran-fender-blade');
    }
    // 写真のような開いた三角フレーム。外板と三角の貫通穴を一体成形。
    const outline=mirror([[.04,-.018],[.069,-.041],[.076,-.112],[.056,-.133],[.043,-.087]]);
    const hole=mirror([[.048,-.048],[.065,-.059],[.064,-.108],[.053,-.111]]);
    const fin=panel(outline,[hole],.067,graphite,'seiran-open-rear-fin',.003);fin.quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,0,1),side*.65));
    beam([side*.047,.053,-.02],[side*.068,.077,-.105],.0018,edge,'seiran-fin-brace');
    beam([side*.042,.04,.06],[side*.063,.044,-.07],.002,carbon,'seiran-side-skeleton');
    for(const z of [.044,-.033,-.097])bolt(side*.023,z>.0?.071:.086,z);
    for(let i=0;i<4;i++){
      const vent=add(new THREE.BoxGeometry(.013,.0012,.0026),recess,side*.023,.074-i*.001,-.083+i*.008,'seiran-rear-louvre');vent.rotation.z=side*-.18;
    }
  }
  // 穴付きカーボンステー。装備ローラーは共通側で配置する。
  for(const z of [.125,-.13]){
    const shape=new THREE.Shape();shape.moveTo(-.105,-.009);shape.lineTo(.105,-.009);shape.lineTo(.108,.006);shape.lineTo(.066,.012);shape.lineTo(-.066,.012);shape.lineTo(-.108,.006);shape.closePath();
    for(let i=-4;i<=4;i++){
      const h=new THREE.Path();h.absarc(i*.019,0,.0025,0,Math.PI*2,true);shape.holes.push(h);
    }
    const plate=add(new THREE.ExtrudeGeometry(shape,{depth:.003,bevelEnabled:true,bevelSize:.0007,bevelThickness:.0005,bevelSegments:1}),carbon,0,.036,z,'seiran-drilled-carbon-stay');plate.rotation.x=-Math.PI/2;
    for(const x of [-.096,-.057,0,.057,.096])bolt(x,.041,z+.004);
    // 織目の短いハイライト。テクスチャを増やさず成形材の層を見せる。
    for(let i=-8;i<=8;i++){
      const weave=add(new THREE.BoxGeometry(.007,.00025,.0007),edge,i*.011,.0399,z+.007,'seiran-carbon-weave');weave.rotation.y=(i%2?1:-1)*.65;
    }
  }
  bolt(0,.077,-.104);bolt(0,.054,.121);
  return group;
}
