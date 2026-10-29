import type {CircuitTrack} from './circuit';
type Point={x:number;y:number;z:number;loopAngle:number;loopRadius:number;bank:number};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
/** 立体の実走行弧長で進む、縦ループ・横螺旋・混合路面の最長コース。 */
export function buildZenithTrack(base:CircuitTrack,practice=false):CircuitTrack{
 const points:Point[]=[];
 const road=(controls:number[][])=>{
  for(let i=0;i<controls.length-1;i++)for(let j=0;j<48;j++){
   const a=controls[i-1]??controls[i].map((v,k)=>2*v-controls[i+1][k]),b=controls[i],c=controls[i+1],d=controls[i+2]??c.map((v,k)=>2*v-b[k]),t=j/48;
   const f=(k:number)=>.5*(2*b[k]+(-a[k]+c[k])*t+(2*a[k]-5*b[k]+4*c[k]-d[k])*t*t+(-a[k]+3*b[k]-3*c[k]+d[k])*t*t*t);
   points.push({x:f(0),z:f(1),y:Math.max(0,f(2)),loopAngle:0,loopRadius:0,bank:0});
  }
  const end=controls.at(-1)!;points.push({x:end[0],z:end[1],y:end[2],loopAngle:0,loopRadius:0,bank:0});
 };
 road([[-70,-45,0],[-48,-45,0],[-20,-45,0]]);
 const radius=1.8;
 for(let i=1;i<=360;i++){const a=i/360*Math.PI*2,u=i/360;points.push({x:-20+radius*Math.sin(a),y:radius*(1-Math.cos(a)),z:-45+1.4*u*u*(3-2*u),loopAngle:a,loopRadius:radius,bank:0});}
 road([[-20,-43.6,0],[0,-43.6,0],[30,-36,0],[24,-22,0],[32,-20,1.4],[40,-20,1.4]]);
 for(let i=1;i<=540;i++){const u=i/540,a=-Math.PI/2+u*3*Math.PI;points.push({x:40+8*Math.cos(a),z:-12+8*Math.sin(a),y:1.4+1.4*u,loopAngle:0,loopRadius:0,bank:u*Math.PI*2});}
 road([[40,-4,2.8],[32,-4,2.2],[12,2,.5],[-12,8,0],[-40,12,0],[-66,25,.7],[-80,45,0],[-65,62,0],[-30,62,0],[0,58,0],[32,62,.7],[60,55,0],[76,30,0],[100,12,0],[120,30,0],[145,25,0],[185,25,0],[225,25,0]]);
 // 練習でも全要素を走る。公式は短い連続S字を追加し、約1分半に収める。
 if(!practice)road([[225,25,0],[235,18,0],[245,28,.5],[258,22,0]]);
 const lengths=[0];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];lengths.push(lengths.at(-1)!+Math.hypot(b.x-a.x,b.y-a.y,b.z-a.z));}
 // 区間の継ぎ目の重複点を除く。
 for(let i=lengths.length-1;i>0;i--)if(lengths[i]-lengths[i-1]<1e-7){points.splice(i,1);lengths.splice(i,1);}
 const circuitLength=lengths.at(-1)!;
 const jumps=[.46,.74].map(f=>({takeoff:circuitLength*f,rise:4,height:.34,gap:.5,landingLength:4}));
 const obstacles={hill:{start:circuitLength*.34,length:9,height:.8},jump:jumps[0]};
 const obstacleHeight=(distance:number)=>{
  const h=obstacles.hill;let height=distance>=h.start&&distance<=h.start+h.length?h.height*Math.sin(Math.PI*(distance-h.start)/h.length)**2:0;
  for(const j of jumps){if(distance>=j.takeoff-j.rise&&distance<j.takeoff)height+=j.height*(distance-j.takeoff+j.rise)/j.rise;if(distance>=j.takeoff&&distance<j.takeoff+j.gap){const u=(distance-j.takeoff)/j.gap;height+=j.height*(1-u*u*(3-2*u));}}
  return height;
 };
 const sample=(distance:number):Point=>{
  const d=Math.max(0,Math.min(circuitLength,distance));let lo=0,hi=lengths.length-1;while(lo+1<hi){const m=(lo+hi)>>>1;if(lengths[m]<=d)lo=m;else hi=m;}
  const u=(d-lengths[lo])/(lengths[hi]-lengths[lo]),a=points[lo],b=points[hi];
  const extension=distance-d,span=lengths[hi]-lengths[lo];return {x:mix(a.x,b.x,u)+(b.x-a.x)/span*extension,y:mix(a.y,b.y,u)+(b.y-a.y)/span*extension,z:mix(a.z,b.z,u)+(b.z-a.z)/span*extension,loopAngle:mix(a.loopAngle,b.loopAngle,u),loopRadius:Math.max(a.loopRadius,b.loopRadius),bank:mix(a.bank,b.bank,u)};
 };
 const center=(d:number)=>{const p=sample(d);return {...p,y:p.y+base.startRampHeight(d)+obstacleHeight(d)};};
 const pose=(distance:number)=>{
  const epsilon=.025,p=center(distance),a=center(distance-epsilon),b=center(distance+epsilon),span=2*epsilon;
  const dx=(b.x-a.x)/span,dy=(b.y-a.y)/span,dz=(b.z-a.z)/span,l=Math.hypot(dx,dy,dz)||1,tx=dx/l,ty=dy/l,tz=dz/l,horizontal=Math.hypot(dx,dz)||.0001;
  let sx:number,sy:number,sz:number;
  if(p.loopRadius){sx=tx*tz;sy=ty*tz;sz=-1+tz*tz;}else{sx=dz/horizontal;sy=0;sz=-dx/horizontal;}
  const sl=Math.hypot(sx,sy,sz)||1;sx/=sl;sy/=sl;sz/=sl;
  let ux=ty*sz-tz*sy,uy=tz*sx-tx*sz,uz=tx*sy-ty*sx;
  const bank=p.bank,c=Math.cos(bank),s=Math.sin(bank),rx=sx*c+ux*s,ry=sy*c+uy*s,rz=sz*c+uz*s;ux=ux*c-sx*s;uy=uy*c-sy*s;uz=uz*c-sz*s;
  const ddx=(b.x-2*p.x+a.x)/epsilon**2,ddz=(b.z-2*p.z+a.z)/epsilon**2;
  return {...p,tangentX:dx/horizontal,tangentZ:dz/horizontal,tangentY:ty,forwardX:tx,forwardY:ty,forwardZ:tz,sideX:rx,sideY:ry,sideZ:rz,upX:ux,upY:uy,upZ:uz,pitch:Math.atan2(dy,horizontal),pathScale:1,curvature:p.loopRadius?0:Math.min(2,Math.abs(dx*ddz-dz*ddx)/horizontal**3)};
 };
 const sampleLanePath=(d:number,lane:number)=>{const p=pose(d),offset=(lane-2)*base.circuit.laneWidth;return {...p,x:p.x+p.sideX*offset,y:p.y+p.sideY*offset,z:p.z+p.sideZ*offset,from:lane,to:lane,lane,changing:false};};
 const sampleCircuit=(d:number)=>{const p=pose(d);return {x:p.x,z:p.z,elevation:p.y,tangentX:p.tangentX,tangentZ:p.tangentZ,curvature:p.curvature};};
 const surfaceAt=(distance:number)=>{const f=distance/circuitLength;return f>=.30&&f<.43||f>=.64&&f<.72?{name:'深い砂地',roughness:.9,grip:.7}:f>=.55&&f<.64?{name:'砂利の切り返し',roughness:.65,grip:.82}:{name:'高速舗装',roughness:0,grip:1};};
 return {...base,fairLanes:true,open:true,jumps,obstacles,obstacleHeight,courseProgress:(d:number)=>d,isJumpGap:(d:number)=>jumps.some(j=>d>=j.takeoff&&d<j.takeoff+j.gap),cornerLoad:2.0,circuit:{...base.circuit,name:practice?'暁アルティメット・クロス':'天頂決戦・ゼニス・クラウン',laps:1,radiusX:215,radiusZ:150,samples:4800,surface:{name:'舗装・砂地・砂利',roughness:.5,grip:.9}},circuitLength,startDistance:0,sampleCircuit,sampleLanePath,surfaceAt};
}
