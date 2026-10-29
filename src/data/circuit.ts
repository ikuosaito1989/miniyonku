import {buildZenithTrack} from './zenithCircuit';
import {yuunagiPoint} from './yuunagiCircuit';
import {wakabaPoint} from './wakabaCircuit';
import { pavedSurface, dirtSurface } from './surfaces';
export type CircuitId='leaf'|'wind'|'sun'|'sprint'|'grove'|'comet'|'trail'|'grandprix'|'forge'|'zenith';
export const circuitDefinitions={
  grandprix:{cornerLoad:1.9,surface:pavedSurface,name:'緑川ツイスト・スパイラル',laps:1,laneWidth:.22,lanes:5,radiusX:38,radiusZ:18,asymmetry:0,chicane:0,samples:3600},
  trail:{cornerLoad:1.8,surface:pavedSurface,name:'夕凪ワンウェイ・スパイラル',laps:1,laneWidth:.22,lanes:5,radiusX:22,radiusZ:15,asymmetry:0,chicane:0,samples:2400},
  grove:{cornerLoad:3,surface:pavedSurface,name:'若葉スパイラル・ジャンプ',laps:5,laneWidth:.22,lanes:5,radiusX:17,radiusZ:10,asymmetry:.36,chicane:.48,samples:1920},
  comet:{cornerLoad:3.3,surface:pavedSurface,name:'星空スパイラル・エンデューロ',laps:5,laneWidth:.22,lanes:5,radiusX:12.5,radiusZ:8.5,asymmetry:.3,chicane:.45,samples:2400},
  sprint:{surface:pavedSurface,name:'若葉ロングストレート',laps:5,laneWidth:.22,lanes:5,radiusX:18,radiusZ:4,asymmetry:0,chicane:0,samples:1440},
  leaf:{surface:pavedSurface,name:'リーフループ',laps:5,laneWidth:.22,lanes:5,radiusX:4.5,radiusZ:2.6,asymmetry:.45,chicane:0,samples:720},
  wind:{surface:pavedSurface,name:'そよかぜテクニカル',laps:5,laneWidth:.22,lanes:5,radiusX:5.2,radiusZ:3.2,asymmetry:.35,chicane:1,samples:960},
  sun:{surface:dirtSurface,name:'サンリッジ・ダートエンデューロ',laps:5,laneWidth:.22,lanes:5,radiusX:9.8,radiusZ:6.4,asymmetry:1.1,chicane:1.5,samples:1440},
};
function buildCircuit(id:Exclude<CircuitId,'forge'|'zenith'>){
  const circuit=circuitDefinitions[id],open=id==='trail'||id==='grandprix';
  const weave=id==='sun'?.48:0;
  const waves=id==='grove'?.696:id==='comet'?.95:0;
  const stadiumPoint=(t:number)=>{
    const straight=28,radius=4,total=straight*2+2*Math.PI*radius;
    let d=((t/(2*Math.PI)*total)%total+total)%total;
    if(d<straight)return {x:-14+d,z:-radius};d-=straight;
    if(d<Math.PI*radius){const a=-Math.PI/2+d/radius;return {x:14+radius*Math.cos(a),z:radius*Math.sin(a)};}d-=Math.PI*radius;
    if(d<straight)return {x:14-d,z:radius};d-=straight;
    const a=Math.PI/2+d/radius;return {x:-14+radius*Math.cos(a),z:radius*Math.sin(a)};
  };
  const point=(t:number)=>open?yuunagiPoint(t,id==='grandprix'):id==='grove'?wakabaPoint(t):id==='sprint'?stadiumPoint(t):({x:Math.cos(t)*circuit.radiusX+Math.cos(t*2)*circuit.asymmetry+Math.cos(t*4)*weave,z:Math.sin(t)*circuit.radiusZ+Math.sin(t*3)*circuit.chicane+Math.sin(t*7)*waves});
  const points=Array.from({length:circuit.samples+1},(_,i)=>point(i/circuit.samples*Math.PI*2)),lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z));
  const circuitLength=lengths.at(-1)!;
  const startDistance=open?0:lengths[circuit.samples/4];
  const laneOffset=(lane:number)=>(lane-(circuit.lanes-1)/2)*circuit.laneWidth;
  function sampleCircuit(distance:number){
    const wrapped=open?Math.max(0,Math.min(circuitLength-1e-8,distance)):((distance%circuitLength)+circuitLength)%circuitLength;
    let low=0,high=lengths.length-1;
    while(low+1<high){const mid=(low+high)>>>1;if(lengths[mid]<=wrapped)low=mid;else high=mid;}
    const f=(wrapped-lengths[low])/(lengths[high]-lengths[low]),t=(low+f)/circuit.samples*Math.PI*2;
    if(open||id==='sprint'||id==='grove'){
      const e=.0001,q=open?Math.max(e,Math.min(2*Math.PI-e,t)):t,p=point(t),derivativeCenter=point(q),before=point(Math.max(open?0:-Infinity,q-e)),after=point(Math.min(open?2*Math.PI:Infinity,q+e)),dx=(after.x-before.x)/(2*e),dz=(after.z-before.z)/(2*e),ddx=(after.x-2*derivativeCenter.x+before.x)/e**2,ddz=(after.z-2*derivativeCenter.z+before.z)/e**2,m=Math.hypot(dx,dz);
      const extension=open?distance-wrapped:0;
      return {...p,x:p.x+dx/m*extension,z:p.z+dz/m*extension,elevation:'elevation' in p?Number(p.elevation):0,tangentX:dx/m,tangentZ:dz/m,curvature:Math.abs(dx*ddz-dz*ddx)/m**3};
    }
    const dx=-circuit.radiusX*Math.sin(t)-2*circuit.asymmetry*Math.sin(t*2)-4*weave*Math.sin(t*4),dz=circuit.radiusZ*Math.cos(t)+3*circuit.chicane*Math.cos(t*3)+7*waves*Math.cos(t*7);
    const ddx=-circuit.radiusX*Math.cos(t)-4*circuit.asymmetry*Math.cos(t*2)-16*weave*Math.cos(t*4),ddz=-circuit.radiusZ*Math.sin(t)-9*circuit.chicane*Math.sin(t*3)-49*waves*Math.sin(t*7),magnitude=Math.hypot(dx,dz);
    return {...point(t),elevation:0,tangentX:dx/magnitude,tangentZ:dz/magnitude,curvature:Math.abs(dx*ddz-dz*ddx)/magnitude**3};
  }
  const laneChange={start:circuitLength*.4,end:circuitLength*.6,bridgeHeight:.22};
  const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
  const startRamp={height:.36,riseStart:-2.4,crestStart:-.8,descentStart:-.4,descentEnd:1.6};
  function startRampHeight(distance:number){
    const progress=open?distance:((distance%circuitLength)+circuitLength)%circuitLength;
    const position=!open&&progress>circuitLength/2?progress-circuitLength:progress;
    if(position<startRamp.riseStart||position>startRamp.descentEnd)return 0;
    if(position<startRamp.crestStart)return startRamp.height*smooth((position-startRamp.riseStart)/(startRamp.crestStart-startRamp.riseStart));
    if(position<startRamp.descentStart)return startRamp.height;
    return startRamp.height*(1-smooth((position-startRamp.descentStart)/(startRamp.descentEnd-startRamp.descentStart)));
  }
  const obstacles=open?{hill:{start:circuitLength*.12,length:5,height:.35},jump:{takeoff:circuitLength*.80,rise:3.2,height:.38,gap:.55,landingLength:3}}:id==='grove'?{hill:{start:circuitLength*.10,length:6,height:.65},jump:{takeoff:circuitLength*.64,rise:3.8,height:.46,gap:.65,landingLength:3}}:null;
  const courseProgress=(distance:number)=>open?distance:((distance%circuitLength)+circuitLength)%circuitLength;
  function obstacleHeight(distance:number){
    if(!obstacles)return 0;
    const d=courseProgress(distance),hill=obstacles.hill,jump=obstacles.jump;
    const hillHeight=d>=hill.start&&d<=hill.start+hill.length?hill.height*Math.sin(Math.PI*(d-hill.start)/hill.length)**2:0;
    const ramp=d>=jump.takeoff-jump.rise&&d<jump.takeoff?jump.height*(d-jump.takeoff+jump.rise)/jump.rise:0;
    const descent=d>=jump.takeoff&&d<jump.takeoff+jump.gap?jump.height*(1-smooth((d-jump.takeoff)/jump.gap)):0;
    return hillHeight+ramp+descent;
  }
  const isJumpGap=(distance:number)=>!!obstacles&&courseProgress(distance)>=obstacles.jump.takeoff&&courseProgress(distance)<obstacles.jump.takeoff+obstacles.jump.gap;
  const wrapLane=(lane:number)=>((lane%circuit.lanes)+circuit.lanes)%circuit.lanes;
  function lanePoint(distance:number,initialLane:number){
    const lap=open?0:Math.floor(distance/circuitLength),progress=open?0:distance-lap*circuitLength,from=wrapLane(initialLane+lap),to=open?from:wrapLane(from+1);
    const u=Math.max(0,Math.min(1,(progress-laneChange.start)/(laneChange.end-laneChange.start))),offset=laneOffset(from)+(laneOffset(to)-laneOffset(from))*smooth(u),p=sampleCircuit(startDistance+distance);
    const height=from===circuit.lanes-1?laneChange.bridgeHeight*smooth(Math.min(u/.2,(1-u)/.2)):0;
    return {x:p.x+p.tangentZ*offset,y:p.elevation+height+startRampHeight(distance)+obstacleHeight(distance),z:p.z-p.tangentX*offset,from,to,lane:u<.5?from:to,changing:u>0&&u<1};
  }
  function sampleLanePath(distance:number,initialLane:number){
    const epsilon=.002,p=lanePoint(distance,initialLane),before=lanePoint(distance-epsilon,initialLane),after=lanePoint(distance+epsilon,initialLane);
    const dx=(after.x-before.x)/(2*epsilon),dy=(after.y-before.y)/(2*epsilon),dz=(after.z-before.z)/(2*epsilon),ddx=(after.x-2*p.x+before.x)/epsilon**2,ddz=(after.z-2*p.z+before.z)/epsilon**2,horizontal=Math.hypot(dx,dz);
    return {...p,bank:0,loopAngle:0,loopRadius:0,sideX:dz/horizontal,sideY:0,sideZ:-dx/horizontal,upX:0,upY:1,upZ:0,forwardX:dx/Math.hypot(dx,dy,dz),forwardY:dy/Math.hypot(dx,dy,dz),forwardZ:dz/Math.hypot(dx,dy,dz),tangentX:dx/horizontal,tangentZ:dz/horizontal,pitch:Math.atan2(dy,horizontal),pathScale:Math.hypot(dx,dy,dz),curvature:Math.abs(dx*ddz-dz*ddx)/horizontal**3};
  }
  const surfaceAt=(distance:number)=>{
    if(id!=='sun')return circuit.surface;
    const progress=((distance%circuitLength)+circuitLength)%circuitLength/circuitLength;
    return progress<.18?{name:'締まった土',roughness:.45,grip:.9}:progress<.4?{name:'砂利ストレート',roughness:.95,grip:.72}:progress<.7?{name:'荒れたダート連続コーナー',roughness:1,grip:.76}:{name:'砂地のS字',roughness:.8,grip:.65};
  };
  // 連続した切り返しで姿勢を戻す余裕が少なく、旋回時の負荷が増す。
  return {fairLanes:id==='grandprix',jumps:obstacles?[obstacles.jump]:[],open,obstacles,courseProgress,isJumpGap,obstacleHeight,cornerLoad:'cornerLoad' in circuit?circuit.cornerLoad:1,surfaceAt,circuit,circuitLength,startDistance,laneOffset,sampleCircuit,laneChange,sampleLanePath,startRamp,startRampHeight};
}
export type CircuitTrack=ReturnType<typeof buildCircuit>;
const tracks:Record<CircuitId,CircuitTrack>={leaf:buildCircuit('leaf'),wind:buildCircuit('wind'),sun:buildCircuit('sun'),sprint:buildCircuit('sprint'),grove:buildCircuit('grove'),comet:buildCircuit('comet'),trail:buildCircuit('trail'),grandprix:buildCircuit('grandprix'),forge:buildZenithTrack(buildCircuit('trail'),true),zenith:buildZenithTrack(buildCircuit('trail'))};
export const getCircuitTrack=(id:CircuitId='leaf')=>tracks[id];
// 既存の計算・テストのデフォルトは入門コースのまま。
export const {circuit,circuitLength,startDistance,laneOffset,sampleCircuit,laneChange,sampleLanePath}=tracks.leaf;
