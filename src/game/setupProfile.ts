import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {modelShops,type ShopId} from '../data/world';
import {motorFactor,remainingCharge,batteryCapacityMultiplier} from './condition';
import {DIRT_CRAWL_SPEED,surfacePerformance,type Performance} from './driving';
export const setupCourses: CircuitId[]=['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'];
export function setupCourse(location:string,secondHeat=false):CircuitId {
 return location==='stadium-5'?(secondHeat?'sun':'sprint'):location==='stadium-9'?'comet':location==='stadium-10'?'grandprix':location==='stadium-7'?'zenith':modelShops[location as ShopId]?.circuitId??'leaf';
}
const courses=new Map<CircuitId,ReturnType<typeof inspectCourse>>();
function inspectCourse(id:CircuitId){
 const track=getCircuitTrack(id);
 const samples=Array.from({length:240},(_,i)=>{const d=i/240*track.circuitLength;return {surface:track.surfaceAt(d),curve:track.sampleCircuit(track.startDistance+d).curvature};});
 const curves=samples.map(s=>s.curve).filter(Number.isFinite).sort((a,b)=>a-b);
 const rough=Math.max(...samples.map(s=>s.surface.roughness));
 return {track,samples,curve:curves[Math.floor(curves.length*.95)],rough};
}
export function courseProfile(id:CircuitId){
 if(!courses.has(id))courses.set(id,inspectCourse(id));
 return courses.get(id)!;
}
export function setupProfile(p:Performance,id:CircuitId){
 const {track,samples,curve,rough}=courseProfile(id);
 const roads=samples.map(s=>surfacePerformance(p,s.surface));
 const traction=Math.min(...roads.map(r=>r.traction));
 const resistance=Math.max(...roads.map(r=>r.resistance));
 const lateral=Math.min(...roads.map(r=>r.lateralLimit));
 const charge=remainingCharge(p.batterySeconds,p.batteryEndurance*batteryCapacityMultiplier,p.batteryConsumption);
 const factor=(.55+.45*Math.sqrt(charge))*(p.motorWearRate===0?1:motorFactor(p.motorSeconds));
 const force=p.stallForce*factor*traction;
 const crawl=rough>0&&!track.obstacles&&charge>0&&traction>0&&force>0;
 const acceleration=charge<=0?0:Math.max(crawl?.25*(.55+.45*Math.sqrt(charge)):0,(force-p.mass*9.81*.025-resistance)/p.mass);
 // Local steady speed on each flat surface, using the same motor curve and drag as driving.
 const speeds=roads.map(road=>{
  let low=0,high=p.freeSpeed*factor;
  for(let i=0;i<40;i++){const v=(low+high)/2;const net=p.stallForce*factor*road.traction*(1-v/(p.freeSpeed*factor))-(p.mass*9.81*.025+(p.drag+road.rollingDrag)*v*v+road.resistance);if(net>0)low=v;else high=v;}
  return charge<=0?0:Math.max(crawl?DIRT_CRAWL_SPEED*factor:0,(low+high)/2)*3.6;
 });
 const cornerSpeed=Math.sqrt(lateral/(track.cornerLoad*Math.max(.0001,curve)))*3.6;
 const landing=(1-p.damping)*(.6+p.rebound)*(1-p.frontBias);
 const minutes=p.batteryConsumption===0?Infinity:charge*p.batteryEndurance*batteryCapacityMultiplier/p.batteryConsumption/60;
 const metric=(id:string,label:string,value:number,scale:number,unit:string,help:string,lower=false)=>({id,label,value,display:value===Infinity?'無制限':`${value.toLocaleString('ja-JP',{maximumFractionDigits:1})}${unit}`,score:value===Infinity?100:Math.max(0,Math.min(100,(lower?1-value/scale:value/scale)*100)),help});
 return [
 metric('speed','平地の到達速度',Math.min(...speeds),60,' km/h','対象コースの最も遅い路面での定常速度。坂・旋回・空中は含みません。'),
 metric('acceleration','発進の加速',acceleration,60,' m/s²','対象路面で停止時の駆動力から抵抗を引いた加速度。'),
 metric('corner','旋回の限界速度',cornerSpeed,60,' km/h','曲率の95パーセンタイルと最も厳しい路面から求めた目安。ローラー抵抗や瞬間的な急カーブの影響は別です。'),
 metric('contact',rough>0?'悪路の駆動伝達':'舗装の駆動伝達',traction*100,100,'%','対象コースで最も接地しにくい路面の駆動伝達率。'),
 metric('damping','制振',p.damping*100,100,'%','装備を合成した振動・着地の吸収率。'),
 metric('landing','着地の収まり',landing,1.5,' 倍','着地の衝撃係数。小さいほど跳ねにくい。速度・飛距離・ブレーキによっては飛びすぎや飛距離不足が起きます。',true),
 metric('duration','残り走行時間',minutes,40,' 分相当','現在の電池残量から求めた使用時間の目安。消耗が進むと出力も低下します。'),
 ];
}
