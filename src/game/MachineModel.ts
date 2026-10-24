import { challenger } from '../data/challenger';
import * as THREE from 'three';
import type { Equipment } from '../data/machine';
import type { Entrant } from '../data/rivals';
import { bodyDesign } from '../data/bodies';
import { partAppearances } from '../data/partAppearance';

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

// 入門スポーツボディ専用の、低い平面と面取りを持つカウル。
// z正方向がノーズ。断面を横長の多角形にして、丸いハッチ形状と描き分ける。
function lowWedgeShell(sections:number[][],color:number,shininess=85){
  const rings=64,sides=8,vertices:number[]=[],indices:number[]=[];
  const point=(row:number)=>{
    const position=row/rings*(sections.length-1),index=Math.min(sections.length-2,Math.floor(position)),t=position-index;
    return sections[index].map((value,axis)=>value+(sections[index+1][axis]-value)*t);
  };
  for(let row=0;row<=rings;row++){
    const [z,width,bottom,shoulder,top]=point(row);
    const outline:[[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number],[number,number]]=[
      [-width*.7,top],[-width,shoulder],[-width,bottom+.002],[-width*.58,bottom],[width*.58,bottom],[width,bottom+.002],[width,shoulder],[width*.7,top],
    ];
    for(const [x,y] of outline)vertices.push(x,y,z);
    if(row<rings)for(let side=0;side<sides;side++){
      const a=row*sides+side,b=(row+1)*sides+side,next=(side+1)%sides;
      indices.push(a,b,row*sides+next,b,(row+1)*sides+next,row*sides+next);
    }
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  return new THREE.Mesh(geometry,new THREE.MeshPhongMaterial({color,shininess,side:THREE.DoubleSide}));
}

export function buildRaceMachineModel(racer:Pick<Entrant,'id'|'color'|'equipment'>){
  const model=buildMachineModel(racer.color,racer.equipment,racer.id!=='player'&&racer.id!=='riku'&&!racer.id.startsWith('legend-')?'mob-kei':'stock');
  if(racer.id===challenger.id){
    // 黒岩専用の黒金カラー。遠い画角でも屋根の2本線で識別できる。
    const gold=new THREE.MeshPhongMaterial({color:0xf5cb50,shininess:45});
    for(const side of [-1,1]){
      const stripe=new THREE.Mesh(new THREE.BoxGeometry(.014,.002,.145),gold);
      stripe.name='kuroiwa-gold-roof-stripe';stripe.position.set(side*.022,.124,-.024);model.add(stripe);
      const hood=new THREE.Mesh(new THREE.BoxGeometry(.014,.002,.027),gold);
      hood.name='kuroiwa-gold-hood-stripe';hood.position.set(side*.022,.079,.104);model.add(hood);
    }
    const bumper=new THREE.Mesh(new THREE.BoxGeometry(.102,.004,.003),gold);
    bumper.name='kuroiwa-gold-front-marker';bumper.position.set(0,.055,.130);model.add(bumper);
  }
  return model;
}

export function buildMachineModel(racerColor:number,equipment:Equipment,appearance:'stock'|'mob-kei'='stock'){
  const original=bodyDesign(equipment.body);
  // コハクK660と通常NPCは同じ素朴な軽ワゴンの造形を使う。性能データは変更しない。
  const isMob=(original.id==='body-stream'||appearance==='mob-kei')&&original.id!=='body-champion'&&!original.id.startsWith('body-legend-');
  const design=isMob?{...original,shape:'kei' as const,silhouette:undefined,width:.056,cabinHeight:.042,cabinFront:.041,cabinRear:-.092}:original;
  // 3Dプレビューはボディ固有色、レース中はレーサーごとの塗色を使う。
  const isStarter=design.silhouette==='starter-wedge',isChampion=design.silhouette==='champion-aero';
  const color=isChampion?Number.parseInt(design.color.slice(1),16):racerColor;
  const look=(id:string)=>partAppearances[id]??{color:'#8395a3',accent:'#dbe4e8',detail:0,mark:''};
  const hex=(value:string)=>Number.parseInt(value.replace('#',''),16);
  const partMaterial=(id:string,shininess=55)=>new THREE.MeshPhongMaterial({color:hex(look(id).color),shininess});
  const partAccent=(id:string,shininess=65)=>new THREE.MeshPhongMaterial({color:hex(look(id).accent),shininess});
  const car=new THREE.Group();car.name=design.id;
  const rubber=partMaterial(equipment.tire,equipment.tire==='tire-1'?4:equipment.tire==='tire-2'?22:8);
  const metal=new THREE.MeshPhongMaterial({color:0xc5d7e2,shininess:90});
  const frame=partMaterial(equipment.chassis,35),frameAccent=partAccent(equipment.chassis,55);
  const accent=new THREE.MeshPhongMaterial({color:0xf4eedc,shininess:65});
  const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x:number,y:number,z:number)=>{
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);car.add(mesh);return mesh;
  };
  // 実車風のボンネット・キャビン・トランクを持つオリジナルの模型ボディ。
  const w=design.width,style=design.silhouette,boxy=style==='wedge'||style==='muscle'||(style!=='starter-wedge'&&style!=='champion-aero'&&['kei','suv','wagon'].includes(design.shape));
  const sections=style==='starter-wedge'
    ?[[-.13,w*.67,.01],[-.114,w*.91,.014],[-.082,w,.017],[-.045,w*.98,.018],[.005,w*.9,.017],[.052,w*.79,.014],[.092,w*.63,.009],[.12,w*.44,.005],[.133,.01,.002]]
    :style==='wedge'
    ?[[-.128,w*.8,.016],[-.105,w,.022],[-.06,w,.024],[0,w*.88,.018],[.075,w*.94,.012],[.12,w*.82,.006],[.132,w*.65,.003]]
    :style==='flow'
    ?[[-.128,w*.65,.012],[-.10,w,.021],[-.06,w*.94,.02],[0,w*.8,.017],[.08,w,.022],[.12,w*.72,.009],[.132,.028,.006]]
    :style==='muscle'
    ?[[-.128,w*.77,.015],[-.10,w*.97,.021],[-.07,w,.022],[0,w*.9,.021],[.08,w,.023],[.12,w*.87,.018],[.132,w*.74,.013]]
    :[[-.128,.035,.012],[-.116,w*.85,.016],[-.08,w,.02],[0,w,.021],[.08,w*.97,.018],[.117,w*.83,.014],[.132,.026,.009]];
  const body=isMob
    ?new THREE.Mesh(new THREE.BoxGeometry(.112,.035,.24),new THREE.MeshPhongMaterial({color,shininess:12}))
    :isStarter
    ?lowWedgeShell([[-.137,.043,.045,.053,.067],[-.119,.064,.045,.056,.071],[-.092,.074,.045,.057,.072],[-.065,.071,.045,.056,.07],[-.02,.064,.045,.054,.067],[.035,.061,.045,.053,.065],[.077,.057,.045,.052,.062],[.105,.047,.045,.051,.06],[.132,.027,.046,.05,.057],[.145,.004,.048,.05,.053]],color)
    :isChampion
    ?lowWedgeShell([[-.145,.025,.045,.054,.07],[-.12,.061,.045,.06,.078],[-.09,.078,.045,.061,.078],[-.05,.074,.045,.058,.073],[0,.064,.045,.055,.069],[.045,.065,.045,.054,.067],[.085,.058,.045,.052,.064],[.12,.043,.045,.05,.06],[.148,.018,.047,.05,.056],[.158,.002,.048,.05,.053]],color,105)
    :shell(sections,color,boxy);
  if(isMob)body.position.y=.06;
  body.name='body-shell';car.add(body);
  const rear=design.cabinRear,front=design.cabinFront,height=design.cabinHeight;
  const canopy=isMob
    ?new THREE.Mesh(new THREE.BoxGeometry(.099,.046,.142),new THREE.MeshPhongMaterial({color:0x35494e,shininess:18}))
    :isStarter
    ?lowWedgeShell([[-.091,.004,.067,.071,.072],[-.078,.026,.067,.078,.087],[-.054,.036,.067,.081,.091],[-.018,.037,.067,.081,.091],[.014,.031,.066,.078,.086],[.04,.019,.064,.071,.077],[.051,.002,.063,.066,.067]],0x193b52,52)
    :isChampion
    ?lowWedgeShell([[-.09,.003,.069,.073,.074],[-.073,.028,.069,.078,.087],[-.046,.036,.069,.082,.091],[-.012,.034,.069,.081,.09],[.022,.025,.067,.076,.083],[.043,.002,.064,.068,.069]],0x172c49,58)
    :shell([[rear-.014,.002,.001],[rear,w*.68,height*.72],[rear+.02,w*.7,height],[front-.015,w*.65,height],[front+.022,w*.7,.002],[front+.028,.002,.001]],0x193b52,boxy);
  if(isMob)canopy.position.set(0,.094,-.024);
  else if(!isStarter&&!isChampion)canopy.position.y=.018;
  canopy.name='cabin-glass';car.add(canopy);
  if(!isStarter&&!isChampion){
    const roof=isMob?new THREE.Mesh(new THREE.BoxGeometry(.108,.005,.152),new THREE.MeshPhongMaterial({color,shininess:12})):shell([[rear+.005,.003,.001],[rear+.02,w*.7,.002],[front-.017,w*.65,.002],[front-.012,.003,.001]],color,boxy);
    if(isMob)roof.position.set(0,.12,-.024);else roof.position.y=.022+height;roof.name='roof';car.add(roof);
  }else if(isStarter){
    // 小さな赤いルーフパネルで、窓とボンネットをはっきり分ける。
    const roof=lowWedgeShell([[-.039,.023,.088,.09,.091],[-.025,.026,.088,.091,.092],[.004,.026,.088,.091,.092],[.015,.018,.085,.087,.088]],color,95);roof.name='roof';car.add(roof);
  }
  const triangle=(points:number[][],material:THREE.Material,name:string)=>{
    const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(points.flat(),3));geometry.setIndex([0,1,2]);geometry.computeVertexNormals();
    const mesh=new THREE.Mesh(geometry,material);mesh.name=name;car.add(mesh);return mesh;
  };
  const white=new THREE.MeshPhongMaterial({color:0xf4f4eb,shininess:95,side:THREE.DoubleSide});
  if(isMob){
    const plastic=new THREE.MeshPhongMaterial({color:0x34393a,shininess:2});
    for(const z of [-.124,.124])add(new THREE.BoxGeometry(.115,.012,.009),plastic,0,.05,z).name='mob-kei-plastic-bumper';
    add(new THREE.BoxGeometry(.028,.012,.002),new THREE.MeshPhongMaterial({color:0xe9cd58,shininess:5}),0,.06,.13).name='mob-kei-yellow-plate';
    for(const side of [-1,1]){
      add(new THREE.BoxGeometry(.003,.004,.015),plastic,side*.057,.074,-.008).name='mob-kei-door-handle';
      add(new THREE.BoxGeometry(.025,.013,.004),accent,side*.036,.073,.123).name='mob-kei-square-headlight';
      add(new THREE.BoxGeometry(.014,.016,.004),new THREE.MeshPhongMaterial({color:0xb74f43,shininess:8}),side*.043,.068,-.123).name='mob-kei-square-tail-light';
      add(new THREE.BoxGeometry(.004,.04,.007),new THREE.MeshPhongMaterial({color,shininess:12}),side*.051,.094,-.02).name='mob-kei-window-pillar';
    }
  }
  const teal=new THREE.MeshPhongMaterial({color:0x27b6a7,shininess:85,side:THREE.DoubleSide});
  if(isChampion){
    // 固有ロゴを使わない、赤白のノーズと青緑の流線アクセント。
    const nose=lowWedgeShell([[.028,.003,.067,.068,.069],[.055,.009,.064,.065,.066],[.09,.013,.06,.061,.062],[.126,.008,.056,.057,.058],[.153,.001,.052,.053,.054]],0xf4f4eb,90);nose.name='champion-nose-inlay';car.add(nose);
  }
  for(const side of [-1,1]){
    // Bピラー、ドア下のプレスライン、前後灯。車種によってルーフ高さが変わる。
    const pillar=add(new THREE.CapsuleGeometry(.0025,height*.7,3,8),frame,side*w*.69,.073+height*.45,(rear+front)/2);
    pillar.rotation.z=side*.16;
    add(new THREE.CapsuleGeometry(.0015,.1,3,8),accent,side*w,.056,-.006).rotation.x=Math.PI/2;
    if(!isMob){
      const lamp=add(isStarter?new THREE.BoxGeometry(.012,.004,.005):new THREE.SphereGeometry(1,16,8),isStarter?new THREE.MeshPhongMaterial({color:0xf6d45b,shininess:65}):accent,side*(isStarter?.036:w*.55),isStarter?.055:(style==='wedge'?.057:.061),isStarter?.128:.123);
      if(!isStarter)lamp.scale.set(style==='muscle'?.018:.016,style==='wedge'?.002:.005,.003);
      lamp.rotation.z=style==='flow'?side*.3:style==='wedge'?side*.14:0;
    }
    const red=new THREE.MeshPhongMaterial({color:0xe4554c});
    if(style==='muscle'){
      for(const offset of [0,.016]){const tail=add(new THREE.CylinderGeometry(.006,.006,.003,20),red,side*(.029+offset),.063,-.126);tail.rotation.x=Math.PI/2;tail.name='round-tail';}
      add(new THREE.BoxGeometry(.009,.005,.06),frame,side*w,.039,-.008);
    }else if(!isMob){
      const tail=add(new THREE.SphereGeometry(1,16,8),red,side*w*.63,.061,-.12);tail.scale.set(.014,.004,.003);
    }
    if(style==='starter-wedge'){
      const stripe=add(new THREE.BoxGeometry(.005,.002,.069),new THREE.MeshPhongMaterial({color:0xf1cf4f,shininess:85}),side*.015,.066,.084);stripe.rotation.x=-.08;stripe.name='starter-racing-stripe';
      const intake=add(new THREE.BoxGeometry(.003,.016,.022),new THREE.MeshPhongMaterial({color:0x14222a,shininess:28}),side*.069,.055,-.025);intake.rotation.x=.16;intake.name='side-intake';
      const sill=add(new THREE.BoxGeometry(.01,.005,.14),frame,side*.073,.038,-.006);sill.name='sport-sill';
    }else if(style==='wedge'||style==='flow'){
      const intake=add(new THREE.BoxGeometry(.004,style==='wedge'?.018:.012,.036),frame,side*w*.94,.057,-.035);intake.rotation.x=style==='wedge'?.25:-.2;intake.name='side-intake';
      const sill=add(new THREE.BoxGeometry(.008,.005,.15),frame,side*w*.95,.035,0);sill.name='sport-sill';
    }
    if(isChampion){
      triangle([[side*.065,.056,-.082],[side*.073,.067,-.045],[side*.067,.057,.066]],white,'champion-side-sweep');
      triangle([[side*.068,.056,-.075],[side*.075,.061,-.038],[side*.071,.054,.055]],teal,'champion-teal-stripe');
      const intake=add(new THREE.BoxGeometry(.003,.018,.027),new THREE.MeshPhongMaterial({color:0x172632,shininess:35}),side*.074,.054,-.024);intake.rotation.x=.18;intake.name='champion-side-intake';
      triangle([[side*.036,.072,-.105],[side*.036,.124,-.128],[side*.036,.083,-.045]],white,'champion-rear-fin');
      triangle([[side*.045,.069,-.082],[side*.045,.107,-.11],[side*.045,.079,-.036]],teal,'champion-inner-fin');
    }
    if(design.shape==='suv'){
      const rail=add(new THREE.CapsuleGeometry(.0025,.085,3,8),metal,side*w*.52,.078+height,-.025);rail.rotation.x=Math.PI/2;
      add(new THREE.BoxGeometry(.008,.012,.12),frame,side*w*.97,.036,0);
    }
  }
  add(isStarter?new THREE.BoxGeometry(.036,.006,.003):new THREE.BoxGeometry(.045,.008,.003),isStarter?new THREE.MeshPhongMaterial({color:0x17212a,shininess:35}):frame,0,isStarter?.052:.051,isStarter?.137:.131).name='front-grille';
  // ミニ四駆機構は共通のまま、曲線バンパーを車体の前後に配置。
  for(const side of [-1,1]){
    const rail=new THREE.CatmullRomCurve3([new THREE.Vector3(side*.101,.035,.123),new THREE.Vector3(side*.07,.037,.146),new THREE.Vector3(0,.04,.155),new THREE.Vector3(-side*.07,.037,.146),new THREE.Vector3(-side*.101,.035,.123)]);
    // 前後のFRP風バンパーを曲線で成形。
    if(side===1)car.add(new THREE.Mesh(new THREE.TubeGeometry(rail,24,.005,6,false),frame));
  }
  const rearRail=new THREE.CatmullRomCurve3([new THREE.Vector3(-.103,.04,-.13),new THREE.Vector3(-.065,.037,-.145),new THREE.Vector3(0,.037,-.15),new THREE.Vector3(.065,.037,-.145),new THREE.Vector3(.103,.04,-.13)]);
  car.add(new THREE.Mesh(new THREE.TubeGeometry(rearRail,32,.005,8,false),frame));
  if(['coupe','gt','prototype'].includes(design.shape)||design.id==='body-rally'||style==='starter-wedge'||isChampion){
    const span=isChampion?.126:style==='starter-wedge'?.112:.074,wingMaterial=style==='starter-wedge'||isChampion?new THREE.MeshPhongMaterial({color:color,shininess:100}):accent;
    add(new THREE.BoxGeometry(span,.008,isChampion?.03:style==='starter-wedge'?.026:design.shape==='prototype'?.024:.015),wingMaterial,0,isChampion?.128:style==='starter-wedge'?.12:.095,isChampion?-.132:style==='starter-wedge'?-.124:-.113).name='rear-wing';
    if(isChampion){
      add(new THREE.BoxGeometry(span*.78,.002,.004),white,0,.133,-.132).name='champion-wing-stripe';
      for(const side of [-1,1])add(new THREE.BoxGeometry(.005,.028,.032),white,side*span*.45,.121,-.132).name='champion-wing-endplate';
    }
    if(style==='starter-wedge'){
      add(new THREE.BoxGeometry(span*.82,.002,.003),new THREE.MeshPhongMaterial({color:0xf1cf4f,shininess:75}),0,.124,-.124).name='wing-pinstripe';
      for(const side of [-1,1])add(new THREE.BoxGeometry(.004,.019,.025),wingMaterial,side*span*.45,.116,-.124).name='wing-endplate';
    }
    for(const side of [-1,1]){
      add(new THREE.BoxGeometry(.004,style==='starter-wedge'?.047:.024,.006),frame,side*.045,style==='starter-wedge'?.087:.078,-.116);
      if(style==='starter-wedge'||isChampion){
        const archColor=isChampion?0xf4f4eb:color;
        const arch=add(new THREE.TorusGeometry(.035,.004,8,28,Math.PI),new THREE.MeshPhongMaterial({color:archColor,shininess:88}),side*.069,.034,-.083);
        arch.rotation.y=Math.PI/2;arch.name='rear-fender-arch';
        const frontArch=add(new THREE.TorusGeometry(.035,.004,8,28,Math.PI),new THREE.MeshPhongMaterial({color:archColor,shininess:88}),side*.069,.034,.083);
        frontArch.rotation.y=Math.PI/2;frontArch.name='front-fender-arch';
      }
    }
  }
  const deckHeight=equipment.chassis==='chassis-low'?.023:equipment.chassis==='chassis-light'?.025:.027;
  const deck=add(new THREE.BoxGeometry(.1,deckHeight,.18),frame,0,.026,0);deck.name='chassis';
  for(const side of [-1,1]){
    const rail=add(new THREE.BoxGeometry(.008,.006,.205),frameAccent,side*.074,.027,0);rail.name='chassis-side-rail';
    if(equipment.chassis==='chassis-light')for(const z of [-.065,-.02,.025,.07])add(new THREE.BoxGeometry(.004,.002,.015),frame,side*.074,.031,z).name='chassis-lightening-slot';
    if(equipment.chassis==='chassis-low')add(new THREE.BoxGeometry(.004,.002,.12),frameAccent,side*.069,.022,0).name='low-chassis-rib';
  }
  for(const side of [-1,1]){
    const cell=add(new THREE.CylinderGeometry(.012,.012,.12,16),partMaterial(equipment.battery,35),side*.025,.038,0);cell.rotation.x=Math.PI/2;cell.name='battery-cell';
    const terminal=add(new THREE.CylinderGeometry(.004,.004,.004,12),partAccent(equipment.terminal,85),side*.025,.038,side*.061);terminal.rotation.x=Math.PI/2;terminal.name='battery-terminal';
  }
  if(isStarter||isChampion){
    const serviceDeck=isChampion?.081:.074;
    for(const side of [-1,1]){
      add(new THREE.BoxGeometry(.014,.004,.028),partMaterial(equipment.battery,60),side*.021,serviceDeck,-.116).name='battery-service-cover';
      add(new THREE.BoxGeometry(.006,.002,.004),partAccent(equipment.terminal,90),side*.021,serviceDeck+.003,-.098).name='terminal-contact';
    }
  }
  // モーター／ギアはリアデッキの点検窓から見える小型パーツとして表現。
  const motorPaint=partMaterial(equipment.motor,75),gearPaint=partMaterial(equipment.gear,80),gearAccent=partAccent(equipment.gear,70);
  const gearTeeth=equipment.gear==='gear-3.5'?24:equipment.gear==='gear-4'?28:32;
  add(new THREE.CylinderGeometry(.012,.012,.004,gearTeeth),gearPaint,0,.074,-.105).name='gear-inspection-cap';
  add(new THREE.TorusGeometry(.014,.0015,6,32),gearAccent,0,.077,-.105).name='gear-accent-ring';
  const ventCount=equipment.motor==='motor-rev'?5:equipment.motor==='motor-torque'?3:4;
  for(let i=0;i<ventCount;i++){
    const x=(i-(ventCount-1)/2)*.008;
    add(new THREE.BoxGeometry(.003,.003,.021),motorPaint,x,.074,-.126).name='motor-cooling-fin';
  }
  if(equipment.shaft==='shaft-1'){
    for(const z of [-.083,.083])for(const side of [-1,1]){
      const collar=add(new THREE.TorusGeometry(.004,.0012,6,12),partAccent(equipment.shaft,85),side*.101,.033,z);collar.rotation.y=Math.PI/2;collar.name='hollow-shaft-collar';
    }
  }
  for(const [accessoryIndex,accessoryId] of [equipment.accessory,equipment.accessory2,equipment.accessory3].entries()){
    const accessoryStart=car.children.length;
    if(accessoryId.startsWith('accessory-damper')){
      for(const side of [-1,1]){
        add(new THREE.CylinderGeometry(.003,.003,.05,12),metal,side*.065,.063,.025).name='damper-post';
        add(new THREE.CylinderGeometry(.01,.01,.016,16),partMaterial(accessoryId,75),side*.065,.052,.025).name='damper-mass';
        for(let ring=0;ring<5;ring++){const spring=add(new THREE.TorusGeometry(.005,.001,4,12),metal,side*.065,.067+ring*.003,.025);spring.rotation.x=Math.PI/2;spring.name='damper-spring';}
      }
    }else if(accessoryId==='accessory-weight'){
      add(new THREE.BoxGeometry(.052,.007,.024),partMaterial(accessoryId,65),0,.034,.066).name='ballast-plate';
      add(new THREE.BoxGeometry(.04,.002,.003),partAccent(accessoryId),0,.039,.066).name='ballast-mark';
    }else if(accessoryId==='accessory-support'){
      for(const side of [-1,1])add(new THREE.BoxGeometry(.008,.012,.11),partMaterial(accessoryId,75),side*.07,.031,0).name='underbody-support';
    }
    for(const item of car.children.slice(accessoryStart))item.position.z+=accessoryIndex*.022;
  }
  for(const z of [-.083,.083]){
    const axle=add(new THREE.CylinderGeometry(equipment.shaft==='shaft-1'?.002:.003,equipment.shaft==='shaft-1'?.002:.003,.179,12),partMaterial(equipment.shaft,85),0,.033,z);axle.rotation.z=Math.PI/2;axle.name='drive-shaft';
    for(const side of [-1,1]){
      const trailTire=equipment.tire==='tire-trail'||equipment.tire==='tire-sand';
      const tireRadius=trailTire?.037:equipment.tire==='tire-1'?.034:equipment.tire==='tire-2'?.031:.033;
      const tireWidth=equipment.tire==='tire-1'?.034:equipment.tire==='tire-2'?.022:.028;
      const tire=add(new THREE.CylinderGeometry(tireRadius,tireRadius,tireWidth,40,1),rubber,side*.082,.033,z);tire.rotation.z=Math.PI/2;tire.name=`tire-${equipment.tire}`;
      if(trailTire)for(let lug=0;lug<16;lug++){const angle=lug*Math.PI/8;const block=add(new THREE.BoxGeometry(tireWidth+.003,.004,.01),rubber,side*.082,.033+Math.cos(angle)*tireRadius,z+Math.sin(angle)*tireRadius);block.rotation.x=angle;block.name='offroad-tread';}
      const sidewall=add(new THREE.TorusGeometry(tireRadius*.81,.0014,5,32),partAccent(equipment.tire,60),side*(.082+tireWidth/2+.001),.033,z);sidewall.rotation.y=Math.PI/2;sidewall.name=`tire-sidewall-${equipment.tire}`;
      if(equipment.tire==='tire-1')for(let pore=0;pore<10;pore++){
        const angle=pore*Math.PI/5,texture=add(new THREE.SphereGeometry(.0014,6,4),partAccent(equipment.tire,25),side*(.082+tireWidth/2+.001),.033+Math.cos(angle)*tireRadius*.58,z+Math.sin(angle)*tireRadius*.58);texture.name='sponge-pore';
      }
      const wheelColor=isChampion?0xf0c943:hex(look(equipment.wheel).color),wheelAccent=partAccent(equipment.wheel,80);
      const rim=add(new THREE.CylinderGeometry(.022,.022,.003,24),new THREE.MeshPhongMaterial({color:wheelColor,shininess:70}),side*.097,.033,z);rim.rotation.z=Math.PI/2;rim.name=`wheel-rim-${equipment.wheel}`;
      const spokes=equipment.wheel==='wheel-light'?6:equipment.wheel==='wheel-oneway'?3:5;
      for(let i=0;i<spokes;i++){
        const spoke=add(new THREE.CapsuleGeometry(equipment.wheel==='wheel-light'?.0015:.002,.032,3,6),wheelAccent,side*.099,.033,z);spoke.rotation.x=i*Math.PI/spokes;spoke.name=`wheel-spoke-${equipment.wheel}`;
      }
      const hub=add(new THREE.CylinderGeometry(equipment.wheel==='wheel-oneway'?.009:.007,equipment.wheel==='wheel-oneway'?.009:.007,.005,16),partAccent(equipment.wheel,90),side*.101,.033,z);hub.rotation.z=Math.PI/2;hub.name='wheel-hub';
    }
  }
  for(const x of [-.101,.101])for(const z of [-.13,0,.125]){
    const slot=z<0?'rollerRear':z>0?'rollerFront':'rollerSide',id=equipment[slot];
    if(id==='roller-double'){
      add(new THREE.CylinderGeometry(.0025,.0025,.055,12),metal,x,.065,z).name='double-roller-pole';
      add(new THREE.CylinderGeometry(.014,.014,.009,24),partMaterial(id,65),x,.083,z).name='double-roller-upper';
      const upperRing=add(new THREE.TorusGeometry(.01,.0015,6,24),partAccent(id,85),x,.088,z);upperRing.rotation.x=Math.PI/2;
    }
    const base=add(new THREE.CylinderGeometry(.014,.014,.009,32),partMaterial(id,id==='roller-1'?12:60),x,.045,z);base.name=`roller-${slot}-${id}`;
    const ring=add(new THREE.TorusGeometry(id==='roller-2'?.010:.009,.0015,6,24),partAccent(id,85),x,.050,z);ring.rotation.x=Math.PI/2;ring.name=`roller-accent-${slot}`;
    if(id==='roller-2'){
      const inner=add(new THREE.TorusGeometry(.0045,.001,6,16),metal,x,.051,z);inner.rotation.x=Math.PI/2;inner.name=`roller-bearing-${slot}`;
    }
    add(new THREE.CylinderGeometry(.004,.004,.013,12),metal,x,.051,z).name=`roller-axle-${slot}`;
  }
  car.scale.setScalar(.85);return car;
}
