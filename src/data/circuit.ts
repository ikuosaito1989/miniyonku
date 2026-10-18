// 独立したコースデータ。単位はm。描画と走行計算の両方で参照する。
import { pavedSurface } from './surfaces';
export const circuit = {
  surface:pavedSurface,
  name: 'リーフループ', laps: 5, laneWidth: 0.22, lanes: 5,
  radiusX: 4.5, radiusZ: 2.6, asymmetry: 0.45, samples: 720,
};
const points = Array.from({ length: circuit.samples + 1 }, (_, i) => {
  const t = i / circuit.samples * Math.PI * 2;
  return { x: Math.cos(t) * circuit.radiusX + Math.cos(t * 2) * circuit.asymmetry, z: Math.sin(t) * circuit.radiusZ };
});
const lengths = [0];
for (let i = 1; i < points.length; i++) lengths.push(lengths[i-1] + Math.hypot(points[i].x-points[i-1].x, points[i].z-points[i-1].z));
export const circuitLength = lengths[lengths.length-1];
// スタート台を、カーブ途中ではなく緩い長辺の中央に置く。
export const startDistance = lengths[circuit.samples/4];
export function laneOffset(lane:number){return (lane-(circuit.lanes-1)/2)*circuit.laneWidth;}

export function sampleCircuit(distance: number) {
  const wrapped = ((distance % circuitLength) + circuitLength) % circuitLength;
  let low = 0, high = lengths.length - 1;
  while (low + 1 < high) { const mid = (low + high) >>> 1; if (lengths[mid] <= wrapped) low = mid; else high = mid; }
  const f = (wrapped - lengths[low]) / (lengths[high] - lengths[low]);
  const t = (low + f) / circuit.samples * Math.PI * 2;
  const dx = -circuit.radiusX * Math.sin(t) - 2 * circuit.asymmetry * Math.sin(t*2);
  const dz = circuit.radiusZ * Math.cos(t);
  const ddx = -circuit.radiusX * Math.cos(t) - 4 * circuit.asymmetry * Math.cos(t*2);
  const ddz = -circuit.radiusZ * Math.sin(t);
  const magnitude = Math.hypot(dx,dz);
  return { x: Math.cos(t)*circuit.radiusX+Math.cos(t*2)*circuit.asymmetry, z:Math.sin(t)*circuit.radiusZ, tangentX: dx/magnitude, tangentZ: dz/magnitude, curvature: Math.abs(dx*ddz-dz*ddx)/magnitude**3 };
}

export const laneChange = { start: circuitLength*0.4, end: circuitLength*0.6, bridgeHeight:0.22 };
const smooth=(value:number)=>{const t=Math.max(0,Math.min(1,value));return t*t*(3-2*t);};
const wrapLane=(lane:number)=>((lane%circuit.lanes)+circuit.lanes)%circuit.lanes;

function lanePoint(distance:number,initialLane:number){
  const lap=Math.floor(distance/circuitLength);
  const progress=distance-lap*circuitLength;
  const from=wrapLane(initialLane+lap),to=wrapLane(from+1);
  const u=Math.max(0,Math.min(1,(progress-laneChange.start)/(laneChange.end-laneChange.start)));
  const offset=laneOffset(from)+(laneOffset(to)-laneOffset(from))*smooth(u);
  const p=sampleCircuit(startDistance+distance);
  // 最外レーンだけは上を越えて最内レーンへ戻す。交差点で他車と接触しない。
  const height=from===circuit.lanes-1?laneChange.bridgeHeight*smooth(Math.min(u/0.2,(1-u)/0.2)):0;
  return {x:p.x+p.tangentZ*offset,y:height,z:p.z-p.tangentX*offset,from,to,lane:u<0.5?from:to,changing:u>0&&u<1};
}

// 中心線上の進捗から、その周回で実際に通るレーン・立体交差の位置を求める。
// 描画、距離補正、コーナー安定性に同じ経路を使用する。
export function sampleLanePath(distance:number,initialLane:number){
  const epsilon=0.002;
  const p=lanePoint(distance,initialLane),before=lanePoint(distance-epsilon,initialLane),after=lanePoint(distance+epsilon,initialLane);
  const dx=(after.x-before.x)/(2*epsilon),dy=(after.y-before.y)/(2*epsilon),dz=(after.z-before.z)/(2*epsilon);
  const ddx=(after.x-2*p.x+before.x)/epsilon**2,ddz=(after.z-2*p.z+before.z)/epsilon**2;
  const horizontal=Math.hypot(dx,dz);
  return {...p,tangentX:dx/horizontal,tangentZ:dz/horizontal,pitch:Math.atan2(dy,horizontal),pathScale:Math.hypot(dx,dy,dz),curvature:Math.abs(dx*ddz-dz*ddx)/horizontal**3};
}
