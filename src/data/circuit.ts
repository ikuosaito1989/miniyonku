import { pavedSurface, dirtSurface } from './surfaces';
export type CircuitId='leaf'|'wind'|'sun';
export const circuitDefinitions={
  leaf:{surface:pavedSurface,name:'リーフループ',laps:5,laneWidth:.22,lanes:5,radiusX:4.5,radiusZ:2.6,asymmetry:.45,chicane:0,samples:720},
  wind:{surface:pavedSurface,name:'そよかぜテクニカル',laps:5,laneWidth:.22,lanes:5,radiusX:5.2,radiusZ:3.2,asymmetry:.35,chicane:1,samples:960},
  sun:{surface:dirtSurface,name:'サンリッジ・ダートエンデューロ',laps:5,laneWidth:.22,lanes:5,radiusX:9.8,radiusZ:6.4,asymmetry:1.1,chicane:1.5,samples:1440},
};
function buildCircuit(id:CircuitId){
  const circuit=circuitDefinitions[id];
  const weave=id==='sun'?.48:0;
  const point=(t:number)=>({x:Math.cos(t)*circuit.radiusX+Math.cos(t*2)*circuit.asymmetry+Math.cos(t*4)*weave,z:Math.sin(t)*circuit.radiusZ+Math.sin(t*3)*circuit.chicane});
  const points=Array.from({length:circuit.samples+1},(_,i)=>point(i/circuit.samples*Math.PI*2)),lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+Math.hypot(points[i].x-points[i-1].x,points[i].z-points[i-1].z));
  const circuitLength=lengths.at(-1)!;
  const startDistance=lengths[circuit.samples/4];
  const laneOffset=(lane:number)=>(lane-(circuit.lanes-1)/2)*circuit.laneWidth;
  function sampleCircuit(distance:number){
    const wrapped=((distance%circuitLength)+circuitLength)%circuitLength;
    let low=0,high=lengths.length-1;
    while(low+1<high){const mid=(low+high)>>>1;if(lengths[mid]<=wrapped)low=mid;else high=mid;}
    const f=(wrapped-lengths[low])/(lengths[high]-lengths[low]),t=(low+f)/circuit.samples*Math.PI*2;
    const dx=-circuit.radiusX*Math.sin(t)-2*circuit.asymmetry*Math.sin(t*2)-4*weave*Math.sin(t*4),dz=circuit.radiusZ*Math.cos(t)+3*circuit.chicane*Math.cos(t*3);
    const ddx=-circuit.radiusX*Math.cos(t)-4*circuit.asymmetry*Math.cos(t*2)-16*weave*Math.cos(t*4),ddz=-circuit.radiusZ*Math.sin(t)-9*circuit.chicane*Math.sin(t*3),magnitude=Math.hypot(dx,dz);
    return {...point(t),tangentX:dx/magnitude,tangentZ:dz/magnitude,curvature:Math.abs(dx*ddz-dz*ddx)/magnitude**3};
  }
  const laneChange={start:circuitLength*.4,end:circuitLength*.6,bridgeHeight:.22};
  const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
  const startRamp={height:.36,riseStart:-2.4,crestStart:-.8,descentStart:-.4,descentEnd:1.6};
  function startRampHeight(distance:number){
    const progress=((distance%circuitLength)+circuitLength)%circuitLength;
    const position=progress>circuitLength/2?progress-circuitLength:progress;
    if(position<startRamp.riseStart||position>startRamp.descentEnd)return 0;
    if(position<startRamp.crestStart)return startRamp.height*smooth((position-startRamp.riseStart)/(startRamp.crestStart-startRamp.riseStart));
    if(position<startRamp.descentStart)return startRamp.height;
    return startRamp.height*(1-smooth((position-startRamp.descentStart)/(startRamp.descentEnd-startRamp.descentStart)));
  }
  const wrapLane=(lane:number)=>((lane%circuit.lanes)+circuit.lanes)%circuit.lanes;
  function lanePoint(distance:number,initialLane:number){
    const lap=Math.floor(distance/circuitLength),progress=distance-lap*circuitLength,from=wrapLane(initialLane+lap),to=wrapLane(from+1);
    const u=Math.max(0,Math.min(1,(progress-laneChange.start)/(laneChange.end-laneChange.start))),offset=laneOffset(from)+(laneOffset(to)-laneOffset(from))*smooth(u),p=sampleCircuit(startDistance+distance);
    const height=from===circuit.lanes-1?laneChange.bridgeHeight*smooth(Math.min(u/.2,(1-u)/.2)):0;
    return {x:p.x+p.tangentZ*offset,y:height+startRampHeight(distance),z:p.z-p.tangentX*offset,from,to,lane:u<.5?from:to,changing:u>0&&u<1};
  }
  function sampleLanePath(distance:number,initialLane:number){
    const epsilon=.002,p=lanePoint(distance,initialLane),before=lanePoint(distance-epsilon,initialLane),after=lanePoint(distance+epsilon,initialLane);
    const dx=(after.x-before.x)/(2*epsilon),dy=(after.y-before.y)/(2*epsilon),dz=(after.z-before.z)/(2*epsilon),ddx=(after.x-2*p.x+before.x)/epsilon**2,ddz=(after.z-2*p.z+before.z)/epsilon**2,horizontal=Math.hypot(dx,dz);
    return {...p,tangentX:dx/horizontal,tangentZ:dz/horizontal,pitch:Math.atan2(dy,horizontal),pathScale:Math.hypot(dx,dy,dz),curvature:Math.abs(dx*ddz-dz*ddx)/horizontal**3};
  }
  const surfaceAt=(distance:number)=>{
    if(id!=='sun')return circuit.surface;
    const progress=((distance%circuitLength)+circuitLength)%circuitLength/circuitLength;
    return progress<.18?{name:'締まった土',roughness:.45,grip:.9}:progress<.4?{name:'砂利ストレート',roughness:.95,grip:.72}:progress<.7?{name:'荒れたダート連続コーナー',roughness:1,grip:.76}:{name:'砂地のS字',roughness:.8,grip:.65};
  };
  return {surfaceAt,circuit,circuitLength,startDistance,laneOffset,sampleCircuit,laneChange,sampleLanePath,startRamp,startRampHeight};
}
export type CircuitTrack=ReturnType<typeof buildCircuit>;
const tracks:Record<CircuitId,CircuitTrack>={leaf:buildCircuit('leaf'),wind:buildCircuit('wind'),sun:buildCircuit('sun')};
export const getCircuitTrack=(id:CircuitId='leaf')=>tracks[id];
// 既存の計算・テストのデフォルトは入門コースのまま。
export const {circuit,circuitLength,startDistance,laneOffset,sampleCircuit,laneChange,sampleLanePath}=tracks.leaf;
