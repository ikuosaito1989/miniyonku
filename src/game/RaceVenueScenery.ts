import * as THREE from 'three';
import type {CircuitTrack} from '../data/circuit';
import {StaticInstances,fixtureMaterial} from './StaticInstances';
import {contactShadowTexture} from './contactShadow';
import type {SpectatorRig,StaffRig} from './VenueAnimation';

function venueFloorTexture(official:boolean){
 const size=128,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const i=(y*size+x)*4,n=((Math.imul(x+3,374761393)^Math.imul(y+41,668265263))>>>0)%7;
  const seam=official?(x===0||y===0):(y%32===0||x===(Math.floor(y/32)%2)*64);
  const grain=official?n-3:Math.sin(x*.13+y*.91)*2+n-3;
  const base=official?[128,143,143]:[167,153,125];
  for(let c=0;c<3;c++)data[i+c]=Math.max(0,Math.min(255,base[c]+grain-(seam?15:0)));data[i+3]=255;
 }
 const texture=new THREE.DataTexture(data,size,size);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.anisotropy=4;texture.needsUpdate=true;return texture;
}
/** All fixtures stay outside the measured course envelope. Repetition is instanced. */
export function raceVenueScenery(track:CircuitTrack,official:boolean,outdoor=false){
 const group=new THREE.Group();group.name='race-event-scenery';const batch=new StaticInstances();
 const spectators:SpectatorRig[]=[],capActors:number[]=[],pitStaff:StaffRig[]=[];
 const points=Array.from({length:1201},(_,i)=>track.sampleLanePath(i/1200*track.circuitLength,(track.circuit.lanes-1)/2));
 const half=track.circuit.lanes*track.circuit.laneWidth/2;
 const xs=points.map(p=>p.x),zs=points.map(p=>p.z),left=Math.min(...xs)-half-1.45,right=Math.max(...xs)+half+1.45,top=Math.min(...zs)-half-1.45,bottom=Math.max(...zs)+half+1.45;
 const cx=(left+right)/2,cz=(top+bottom)/2,width=right-left,depth=bottom-top;
 const V=(x:number,y:number,z:number)=>new THREE.Vector3(x,y,z),S=(x:number,y:number,z:number)=>V(x,y,z),yaw=(angle:number)=>new THREE.Quaternion().setFromAxisAngle(V(0,1,0),angle);
 const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,color:number,metal=false,angle=0)=>batch.add(name,()=>new THREE.BoxGeometry(1,1,1),()=>fixtureMaterial(metal),V(x,y,z),S(w,h,d),color,yaw(angle));
 const sphere=(name:string,x:number,y:number,z:number,rx:number,ry:number,rz:number,color:number)=>batch.add(name,()=>new THREE.SphereGeometry(1,name.endsWith('eyes')?4:8,name.endsWith('eyes')?3:5),()=>fixtureMaterial(),V(x,y,z),S(rx,ry,rz),color);
 const cylinder=(name:string,x:number,y:number,z:number,r:number,h:number,color:number,metal=false,rotation=new THREE.Quaternion())=>batch.add(name,()=>new THREE.CylinderGeometry(1,1,1,8),()=>fixtureMaterial(metal),V(x,y,z),S(r,h,r),color,rotation);
 const contact=(x:number,z:number,w:number,d:number,y:number)=>batch.add('venue-fixture-contact',()=>new THREE.PlaneGeometry(1,1),()=>new THREE.MeshBasicMaterial({map:contactShadowTexture(),transparent:true,opacity:.22,depthWrite:false,toneMapped:false}),V(x,y,z),S(w,d,1),0xffffff,new THREE.Quaternion().setFromAxisAngle(V(1,0,0),-Math.PI/2));
 const steel=0x70838d,navy=0x334b60,trim=official?0xc5ad7a:0x93b4b0;
 if(!outdoor){
  const texture=venueFloorTexture(official);texture.repeat.set((width+6)/2.4,(depth+6)/2.4);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(width+6,depth+6),new THREE.MeshStandardMaterial({map:texture,roughness:official?.84:.73,metalness:.02,envMapIntensity:.35}));floor.rotation.x=-Math.PI/2;floor.position.set(cx,-.022,cz);floor.name='venue-material-floor';floor.receiveShadow=true;group.add(floor);
 }
 // Painted safety boundary and a clear walking strip between track and spectators.
 for(const x of [left+.42,right-.42])box('venue-floor-boundary',x,-.020,cz,.035,.001,depth-.7,0xd5c99e);
 for(const z of [top+.42,bottom-.42])box('venue-floor-boundary',cx,-.020,z,width-.7,.001,.035,0xd5c99e);
 const rows=official?4:2,standWidth=Math.min(width,8.6),modules=width>24?2:1,seats=Math.min(24,Math.max(14,Math.floor(standWidth/.36)));
 for(const sign of [-1,1])for(let module=0;module<modules;module++)for(let row=0;row<rows;row++){
  const center=modules===1?cx:left+standWidth/2+module*(width-standWidth);
  const z=(sign<0?top:bottom)+sign*row*.34,y=.08+row*.18;
  contact(center,z,standWidth+.25,.65,-.019);
  box('venue-bleacher-decks',center,y,z,standWidth,.16,.34,navy);
  box('venue-bleacher-treads',center,y+.085,z-sign*.15,standWidth,.012,.035,trim,true);
  for(let i=0;i<seats;i++){
   const x=center-standWidth/2+(i+.5)*standWidth/seats;
   if(i%10===5){box('venue-aisle-steps',x,y+.09,z,.25,.018,.30,0xb0b6ac);continue;}
   const outfit=[0x577d90,0x967384,0xaf9365,0x638e7a,0x6d6c8c,0xb17c6c][(i+row*3+(sign+1))%6],skin=[0xe0b597,0xbb9076,0xefcba6][(i+row)%3];
   const chair=[0x587888,0x8b7581,0x879c8a][i%3];
   box('venue-chair-seats',x,y+.16,z,.18,.035,.18,chair);
   box('venue-chair-backs',x,y+.25,z+sign*.08,.18,.17,.025,chair);
   // Torso, arms and bent legs replace the old sphere-on-cube silhouettes.
   const h=.16+(i%4===0?.025:0);
   const actor=spectators.length;spectators.push({x,y:y+.25+h,z,sign,phase:(actor*1.73)%7});
   cylinder('venue-spectator-torsos',x,y+.21+h/2,z,.071,h,outfit);
   for(const side of [-1,1]){
    cylinder('venue-spectator-arms',x+side*.083,y+.25,z-sign*.025,.024,.14,outfit,false,new THREE.Quaternion().setFromAxisAngle(V(1,0,0),sign*.25));
    sphere('venue-spectator-hands',x+side*.083,y+.177,z-sign*.044,.024,.025,.023,skin);
    box('venue-spectator-legs',x+side*.041,y+.125,z-sign*.085,.047,.055,.13,0x344b60);
    box('venue-spectator-shoes',x+side*.041,y+.095,z-sign*.15,.048,.035,.065,0x31424a);
   }
   sphere('venue-spectator-heads',x,y+.25+h,z,.061,.078,.061,skin);
   sphere('venue-spectator-hair',x,y+.29+h,z+sign*.009,.063,.044,.062,[0x4a3b39,0x313b49,0x9f998a,0x705043][(i+row)%4]);
   for(const side of [-1,1])sphere('venue-spectator-eyes',x+side*.022,y+.26+h,z-sign*.056,.005,.006,.004,0x28363f);
   if(i%7===0){capActors.push(actor);cylinder('venue-spectator-caps',x,y+.32+h,z,.067,.025,outfit);box('venue-cap-visors',x,y+.31+h,z-sign*.056,.09,.009,.07,outfit);}
  }
 }
 // Continuous rails and repeated upright posts; the pit gate stays open.
 const postStep=Math.max(.85,(width+depth)/180);
 for(const x of [left+.2,right-.2]){
  for(const h of [.22,.43]){
   if(x===left+.2){for(const [a,b] of [[top+.2,cz-.6],[cz+.6,bottom-.2]])if(b>a)box('venue-safety-rails',x,h,(a+b)/2,.028,.027,b-a,steel,true);}
   else box('venue-safety-rails',x,h,cz,.028,.027,depth-.4,steel,true);
  }
  for(let z=top+.2;z<=bottom-.2;z+=postStep){if(x===left+.2&&Math.abs(z-cz)<.65)continue;cylinder('venue-fence-posts',x,.23,z,.022,.5,steel,true);box('venue-post-feet',x,-.008,z,.12,.025,.12,navy);}
 }
 for(const z of [top+.2,bottom-.2]){
  for(const h of [.22,.43])box('venue-safety-rails',cx,h,z,width-.4,.027,.028,steel,true);
  for(let x=left+.2;x<=right-.2;x+=postStep)cylinder('venue-fence-posts',x,.23,z,.022,.5,steel,true);
 }
 // Lighting masts use emissive lenses, without adding expensive shadowed lights.
 for(const x of [left-.3,right+.3])for(const z of [top-.5,cz,bottom+.5]){
  cylinder('venue-light-masts',x,.82,z,.028,1.7,steel,true);box('venue-mast-bases',x,.02,z,.22,.08,.22,navy);
  box('venue-light-housings',x,1.65,z,.46,.14,.12,navy,true);
  for(let i=0;i<4;i++)batch.add('venue-light-lenses',()=>new THREE.BoxGeometry(1,1,1),()=>new THREE.MeshStandardMaterial({color:0xffffff,emissive:0xffdfac,emissiveIntensity:.65,roughness:.35}),V(x-.15+i*.1,1.65,z-.066),S(.075,.08,.008),0xffefd0);
  box('venue-mast-crossbars',x+.1,1.05,z,.012,.55,.012,trim,true,.3);
 }
 // A row of real working-height benches outside the safety enclosure.
 const pitX=left-1.25,pitStart=cz-Math.min(1.25,depth*.15);
 for(let index=0;index<3;index++){
  const z=pitStart+index*.95;
  box('pit-floor-mats',pitX,-.014,z,.85,.012,.76,0x536b70);contact(pitX,z,.87,.75,-.007);
  box('pit-worktops',pitX,.44,z,.72,.045,.48,0xa99a7d);
  box('pit-worktop-edges',pitX,.425,z+.24,.74,.04,.025,steel,true);
  for(const sx of [-1,1])for(const sz of [-1,1])box('pit-bench-legs',pitX+sx*.29,.21,z+sz*.18,.032,.42,.032,steel,true);
  box('pit-lower-shelves',pitX,.12,z,.6,.022,.35,navy);
  box('pit-toolboxes',pitX-.18,.50,z+.08,.22,.09,.14,[0xa26358,0x54798a,0x6e826c][index]);
  box('pit-toolbox-lids',pitX-.18,.55,z+.08,.23,.012,.15,steel,true);
  box('pit-toolbox-handles',pitX-.18,.57,z+.08,.09,.025,.018,navy);
  for(let i=0;i<3;i++)box('pit-tools',pitX+.07+i*.045,.468,z+.12,.018,.007,.12,i%2?steel:0xb99a55,true,.15*i);
  box('pit-miniature-bodies',pitX+.12,.49,z-.10,.08,.035,.16,[0x7e9ab4,0xb97665,0xcfbb78][index]);
  box('pit-miniature-canopies',pitX+.12,.516,z-.12,.05,.024,.075,0x294450);
  for(const sx of [-1,1])for(const sz of [-1,1])batch.add('pit-spare-tires',()=>new THREE.TorusGeometry(1,.3,6,12),()=>fixtureMaterial(),V(pitX+.12+sx*.048,.48,z-.10+sz*.048),S(.025,.025,.025),0x283640,new THREE.Quaternion().setFromAxisAngle(V(0,1,0),Math.PI/2));
  cylinder('pit-lamp-stems',pitX-.28,.61,z-.16,.012,.30,steel,true);
  cylinder('pit-lamp-shades',pitX-.28,.76,z-.16,.06,.055,0xb5af91);
  box('pit-storage-cases',pitX+.12,.19,z,.28,.12,.22,0x748983);
  const sx=pitX-.53,skin=[0xd9ae8c,0xebc6a2,0xbc927b][index],shirt=[0x57788a,0x7e8e71,0x9b7d68][index];pitStaff.push({x:sx,z,phase:index*1.9});
  for(const dz of [-.045,.045]){box('pit-staff-legs',sx,.14,z+dz,.065,.25,.055,0x334a58);box('pit-staff-shoes',sx+.015,.03,z+dz,.1,.045,.055,0x2a3943);}
  cylinder('pit-staff-bodies',sx,.45,z,.09,.32,shirt);box('pit-staff-aprons',sx+.076,.39,z,.025,.24,.14,0x53646b);
  sphere('pit-staff-heads',sx,.69,z,.066,.082,.064,skin);sphere('pit-staff-hair',sx-.013,.728,z,.061,.044,.065,[0x4b423d,0x9c978a,0x313d48][index]);
  cylinder('pit-staff-working-arms',sx+.10,.49,z+.015,.024,.18,shirt,false,new THREE.Quaternion().setFromAxisAngle(V(0,0,1),1));sphere('pit-staff-working-hands',sx+.17,.445,z+.015,.026,.023,.024,skin);box('pit-staff-held-tools',sx+.21,.448,z+.015,.08,.008,.014,steel,true);
  cylinder('pit-staff-resting-arms',sx,.43,z-.108,.025,.23,shirt);sphere('pit-staff-resting-hands',sx,.31,z-.108,.025,.026,.025,skin);

 }
 // Access lanes, aisle end signs and checker panels use symbols rather than words.
 for(const z of [top-.5,bottom+.5])for(let i=0;i<8;i++)box('venue-checker-panels',right+.35+i*.07,.7+Math.floor(i/4)*.07,z,.07,.07,.015,(i+Math.floor(i/4))%2?0xd9dac9:navy);
 batch.finish(group);group.getObjectByName('venue-fixture-contact')!.renderOrder=1;group.userData.courseBounds={left,right,top,bottom};group.userData.outdoor=outdoor;group.userData.spectators=spectators;group.userData.capActors=capActors;group.userData.pitStaff=pitStaff;return group;
}
