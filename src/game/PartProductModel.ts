import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {Part} from '../data/parts';
import {partAppearance} from '../data/partAppearance';

/** カタログ専用の接写モデル。走行性能やゲーム内装備は変更しない。 */
export function buildPartProduct(part:Part){
 const a=partAppearance(part),group=new THREE.Group();group.name=part.id;
 const mat=(color:THREE.ColorRepresentation,metalness=.65,roughness=.28)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const metal=mat('#c9d2db',.92,.23),edge=mat('#edf3f6',.9,.2),steel=mat('#536474',.85,.32),gold=mat('#d5ac50',.88,.23),black=mat('#151d27',.15,.48),rubber=mat('#242931',0,.87),color=mat(a.color,.45,.35),accent=mat(a.accent,.5,.29);
 const add=(geometry:THREE.BufferGeometry,material:THREE.Material,x=0,y=0,z=0,parent:THREE.Object3D=group)=>{const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);parent.add(mesh);return mesh;};
 const box=(x:number,y:number,z:number,w:number,h:number,d:number,m:THREE.Material,parent:THREE.Object3D=group)=>add(new RoundedBoxGeometry(w,h,d,2,Math.min(w,h,d)*.15),m,x,y,z,parent);
 const cylinder=(x:number,y:number,z:number,r:number,h:number,m:THREE.Material,axis:'x'|'y'|'z'='y',parent:THREE.Object3D=group)=>{const mesh=add(new THREE.CylinderGeometry(r,r,h,48),m,x,y,z,parent);if(axis==='x')mesh.rotation.z=Math.PI/2;if(axis==='z')mesh.rotation.x=Math.PI/2;return mesh;};
 const ring=(x:number,y:number,z:number,r:number,t:number,m:THREE.Material,axis:'x'|'y'|'z'='y',parent:THREE.Object3D=group)=>{const mesh=add(new THREE.TorusGeometry(r,t,10,48),m,x,y,z,parent);if(axis==='y')mesh.rotation.x=Math.PI/2;if(axis==='x')mesh.rotation.y=Math.PI/2;return mesh;};
 const screw=(x:number,y:number,z:number,parent:THREE.Object3D=group)=>{cylinder(x,y,z,.044,.024,steel,'y',parent);box(x,y+.013,z,.055,.004,.008,black,parent);box(x,y+.013,z,.008,.004,.055,black,parent);};
 const label=(text:string,w:number,h:number,bg:string,fg='#e9f2f7')=>{
  if(typeof document==='undefined')return new THREE.Mesh(new THREE.PlaneGeometry(w,h),mat(bg,.2,.45));
  const canvas=document.createElement('canvas');canvas.width=768;canvas.height=256;const ctx=canvas.getContext('2d')!;ctx.fillStyle=bg;ctx.fillRect(0,0,768,256);ctx.fillStyle=fg;ctx.font='bold 85px sans-serif';ctx.textAlign='center';ctx.fillText(text,384,116);ctx.font='25px monospace';ctx.fillText('TINY DRIVE / PERFORMANCE PARTS',384,174);ctx.fillRect(70,208,628,3);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:texture,metalness:.2,roughness:.45}));
 };
 const plate=(shape:THREE.Shape,h:number,m:THREE.Material,y:number)=>{const mesh=add(new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:true,bevelSegments:2,steps:1,bevelSize:.015,bevelThickness:.012}),m,0,y,0);mesh.rotation.x=-Math.PI/2;return mesh;};
 const hole=(shape:THREE.Shape,x:number,z:number,r:number)=>{const path=new THREE.Path();path.absarc(x,z,r,0,Math.PI*2,true);shape.holes.push(path);};
 const rectangle=(x:number,z:number,w:number,d:number)=>{const s=new THREE.Shape();s.moveTo(x,z);s.lineTo(x+w,z);s.lineTo(x+w,z+d);s.lineTo(x,z+d);s.closePath();return s;};
 const gear=(x:number,z:number,r:number,teeth:number,m:THREE.Material)=>{
  const s=new THREE.Shape();for(let i=0;i<teeth*4;i++){const angle=i/(teeth*4)*Math.PI*2,rr=i%4===0||i%4===3?r*.86:r;const px=x+Math.cos(angle)*rr,pz=z+Math.sin(angle)*rr;if(!i)s.moveTo(px,pz);else s.lineTo(px,pz);}s.closePath();hole(s,x,z,r*.14);for(let i=0;i<3;i++)hole(s,x+Math.cos(i*2*Math.PI/3)*r*.55,z+Math.sin(i*2*Math.PI/3)*r*.55,r*.16);plate(s,.12,m,.12);ring(x,.25,-z,r*.32,.024,edge);return s;
 };
 if(part.category==='motor'){
  cylinder(0,.62,0,.51,1.85,metal,'x');cylinder(-.97,.62,0,.48,.16,accent,'x');cylinder(.96,.62,0,.49,.12,steel,'x');ring(.99,.62,0,.45,.035,edge,'x');cylinder(1.06,.62,0,.18,.14,metal,'x');ring(1.14,.62,0,.12,.025,gold,'x');cylinder(1.44,.62,0,.055,.65,edge,'x');
  for(const x of [-.75,.75])ring(x,.62,0,.502,.012,steel,'x');
  for(let i=0;i<6;i++){const angle=i*Math.PI/3;const vent=box(-.64,.62+Math.cos(angle)*.49,Math.sin(angle)*.49,.22,.035,.12,black);vent.rotation.x=-angle;}
  for(const side of [-1,1]){box(-1.05,.62+side*.35,.05,.3,.07,.15,gold);box(-1.16,.62+side*.35,.05,.07,.12,.15,gold);cylinder(-1.07,.62+side*.34,.05,.026,.15,black,'z');}
  for(let i=0;i<3;i++){const angle=i*2*Math.PI/3;cylinder(1.032,.62+Math.cos(angle)*.33,Math.sin(angle)*.33,.035,.02,black,'x');}
  const decal=label(a.mark,1.1,.37,a.accent,'#172536');decal.position.set(-.04,.64,.512);group.add(decal);
  for(let i=0;i<12;i++){const angle=i*Math.PI/6;box(-1.065,.62+Math.cos(angle)*.18,Math.sin(angle)*.18,.045,.04,.04,gold);}
 }else if(part.category==='chassis'){
  const s=new THREE.Shape();s.moveTo(-.68,-1.56);s.lineTo(.68,-1.56);s.lineTo(.74,-1.3);s.lineTo(.58,-1.04);s.lineTo(.58,.96);s.lineTo(.76,1.22);s.lineTo(.68,1.56);s.lineTo(-.68,1.56);s.lineTo(-.76,1.22);s.lineTo(-.58,.96);s.lineTo(-.58,-1.04);s.lineTo(-.74,-1.3);s.closePath();
  for(const x of [-.5,.5])for(const z of [-1.39,1.39])hole(s,x,z,.075);
  if(a.detail>=2)for(const x of [-.33,.06])for(const z of [-.7,0]){const slot=rectangle(x,z,.26,.54);s.holes.push(new THREE.Path(slot.getPoints()));}
  plate(s,.09,color,.1);
  for(const side of [-1,1]){
   box(side*.59,.23,0,.09,.19,2.1,color);box(side*.34,.18,0,.035,.09,1.9,accent);
   for(const z of [-.92,.94]){cylinder(side*.55,.3,z,.1,.22,color);screw(side*.55,.42,z);box(side*.46,.24,z,.18,.15,.12,accent);}
   for(const z of [-1.39,1.39])ring(side*.5,.22,z,.073,.023,metal);
  }
  for(const z of [-1.05,1.08]){box(0,.3,z,1.05,.25,.36,color);cylinder(0,.35,z,.11,1.5,steel,'x');cylinder(.8,.35,z,.15,.09,black,'x');cylinder(-.8,.35,z,.15,.09,black,'x');for(const x of [-.34,0,.34])box(x,.44,z,.045,.035,.28,accent);}
  box(0,.21,.08,.055,.12,1.6,color);box(0,.38,part.specs.frontMotor===1?.84:-.84,.66,.25,.44,black);cylinder(.15,.44,part.specs.frontMotor===1?.84:-.84,.18,.72,metal,'x');
  for(const side of [-1,1])for(const z of [-.64,.65])box(side*.36,.28,z,.24,.22,.05,black);
 }else if(part.category==='battery'){
  for(const x of [-.4,.4]){
   cylinder(x,.39,0,.33,2.15,color,'z');cylinder(x,.39,1.085,.3,.07,edge,'z');cylinder(x,.39,1.15,.15,.09,steel,'z');cylinder(x,.39,-1.1,.3,.06,steel,'z');ring(x,.39,1.07,.29,.025,black,'z');
   const decal=label(a.mark,.57,1.35,a.color);decal.rotation.x=-Math.PI/2;decal.rotation.z=Math.PI/2;decal.position.set(x,.723,0);group.add(decal);
   for(const z of [-.85,.85])ring(x,.39,z,.333,.015,accent,'z');
  }
 }else if(part.category==='wheel'||part.category==='tire'){
  const tire=part.category==='tire',r=.8,width=tire?.65:.5;
  const profile=[new THREE.Vector2(.39,-width/2),new THREE.Vector2(.72,-width/2),new THREE.Vector2(r,-width*.32),new THREE.Vector2(r,width*.32),new THREE.Vector2(.72,width/2),new THREE.Vector2(.39,width/2),new THREE.Vector2(.39,-width/2)];
  const barrel=add(new THREE.LatheGeometry(profile,64),tire?rubber:color,0,.84,0);barrel.rotation.z=Math.PI/2;
  for(const side of [-1,1])ring(side*width/2,.84,0,tire?.73:.72,.027,tire?black:edge,'x');
  if(!tire){cylinder(width/2,.84,0,.16,.15,accent,'x');for(let i=0;i<Math.max(3,a.detail);i++){const angle=i*2*Math.PI/Math.max(3,a.detail);const spoke=box(width/2,.84+Math.cos(angle)*.39,Math.sin(angle)*.39,.1,.63,.085,accent);spoke.rotation.x=angle;}cylinder(width/2+.09,.84,0,.065,.03,black,'x');}
  else{
   const offroad=/sand|trail|hybrid|apex|dune|gravel/.test(part.id);
   for(let i=0;i<(offroad?28:48);i++){const angle=i*Math.PI*2/(offroad?28:48);const tread=box(0,.84+Math.cos(angle)*r,Math.sin(angle)*r,width*.87,offroad?.06:.007,offroad?.06:.012,offroad?black:steel);tread.rotation.x=angle;}
   for(const side of [-1,1])ring(side*(width/2+.004),.84,0,.64,.01,accent,'x');
  }
 }else if(part.category==='roller'){
  const double=/double|crown/.test(part.id);
  for(const y of double?[.24,.62]:[.3]){
   const shape=new THREE.Shape();shape.absarc(0,0,.75,0,Math.PI*2,false);hole(shape,0,0,.13);for(let i=0;i<Math.max(4,a.detail);i++){const angle=i*2*Math.PI/Math.max(4,a.detail);hole(shape,Math.cos(angle)*.47,Math.sin(angle)*.47,.11);}plate(shape,.12,color,y);ring(0,y+.09,0,.73,.035,metal);ring(0,y+.14,0,.24,.045,accent);ring(0,y+.145,0,.15,.025,steel);
  }
  cylinder(0,.52,0,.07,1.04,steel);cylinder(0,1.07,0,.11,.08,gold);screw(0,1.12,0);
 }else if(part.category==='gear'){
  gear(-.4,0,.8,Math.min(40,Math.max(22,a.detail)),color);gear(.78,-.12,.43,18,accent);cylinder(-.4,.4,0,.1,.23,metal);cylinder(.78,.36,.12,.07,.18,steel);
 }else if(part.category==='shaft'){
  for(const z of [-.25,.25]){cylinder(0,.17,z,.055,2.75,metal,'x');for(const x of [-1.35,1.35]){cylinder(x,.17,z,.085,.12,gold,'x');if(a.detail===1)cylinder(x+(x>0?.065:-.065),.17,z,.035,.005,black,'x');}for(const x of [-.8,.8])ring(x,.17,z,.056,.007,steel,'x');}
 }else if(part.category==='terminal'){
  for(const x of [-.55,.55]){
   const shape=new THREE.Shape();shape.moveTo(x-.2,-.85);shape.lineTo(x+.2,-.85);shape.lineTo(x+.14,.65);shape.lineTo(x-.12,.83);shape.lineTo(x-.23,.63);shape.closePath();hole(shape,x,-.5,.075);plate(shape,.035,part.id==='terminal-1'?gold:metal,.1);
   box(x,.22,-.58,.35,.13,.06,accent);const bend=box(x,.3,-.78,.35,.4,.035,gold);bend.rotation.x=-.28;ring(x,.14,.45,.11,.02,edge);
  }
 }else if(part.category==='accessory'){
  if(part.id==='accessory-none'){ring(0,.2,0,.7,.035,steel);box(0,.22,0,1.3,.07,.06,steel).rotation.y=Math.PI/4;}
  else if(/brake/.test(part.id)){
   const shape=rectangle(-1.25,-.36,2.5,.72);for(const x of [-1,-.55,.55,1])hole(shape,x,0,.075);plate(shape,.08,color,.26);
   for(const x of [-.6,.6]){box(x,.12,0,.7,.18,.5,accent);box(x,.023,0,.65,.035,.46,rubber);screw(x,.39,0);}
  }else if(/damper|active/.test(part.id)){
   for(const x of [-.5,.5]){cylinder(x,.55,0,.055,1.1,metal);cylinder(x,.28,0,.24,.4,gold);ring(x,.1,0,.23,.025,steel);ring(x,.48,0,.23,.025,edge);const points:THREE.Vector3[]=[];for(let i=0;i<=160;i++){const t=i/160,angle=t*Math.PI*12;points.push(new THREE.Vector3(x+Math.cos(angle)*.12,.5+t*.49,Math.sin(angle)*.12));}add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),160,.026,6,false),steel);cylinder(x,1.09,0,.15,.08,accent);screw(x,1.15,0);}
  }else{
   const shape=rectangle(-1.2,-.32,2.4,.64);for(const x of [-1,-.55,.55,1])hole(shape,x,0,.09);plate(shape,.12,/weight/.test(part.id)?gold:color,.14);
   for(const x of [-1,1]){ring(x,.33,0,.18,.05,accent);screw(x,.34,0);}
   box(0,.36,0,1.2,.23,.48,black);for(let i=0;i<4;i++)box(-.4+i*.26,.49,0,.045,.035,.42,accent);
   if(/slide/.test(part.id))for(const x of [-.42,.42]){cylinder(x,.34,.4,.04,.7,metal,'z');cylinder(x,.34,-.4,.04,.7,metal,'z');}
  }
 }
 return group;
}
