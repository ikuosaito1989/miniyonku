import {starterEquipment} from '../data/machine';
import {dirtSurface} from '../data/surfaces';
import {batteryCapacityMultiplier} from './condition';
import {machinePerformance,surfacePerformance,type Performance} from './driving';
const cornerResistance=(p:Performance)=>p.mass*(p.rollerFriction*.5+p.tireScrub*.018)+.002*p.cornerDrag;
const standardCornerResistance=cornerResistance(machinePerformance(starterEquipment));
/** Intrinsic equipment profile. No course, location, progress or consumable age enters the scales. */
export function setupProfile(p:Performance){
 const landing=(1-p.damping)*(.6+p.rebound)*(1-p.frontBias);
 const minutes=p.batteryConsumption===0?Infinity:p.batteryEndurance*batteryCapacityMultiplier/p.batteryConsumption/60;
 const metric=(id:string,label:string,value:number,score:number,unit:string,help:string)=>({id,label,value,display:value===Infinity?'無制限':`${value.toLocaleString('ja-JP',{maximumFractionDigits:1})}${unit}`,score:Math.max(0,Math.min(100,score)),help});
 const resistance=cornerResistance(p)/standardCornerResistance*100;
 return [
 metric('speed','最高速',p.freeSpeed*3.6,p.freeSpeed*3.6/60*100,' km/h','装備から求める理論無負荷速度。実走は空気抵抗・路面・旋回などで低下します。'),
 metric('acceleration','加速力',p.stallForce/p.mass,p.stallForce/p.mass/60*100,' m/s²','停止時の駆動力÷車重。登坂や再加速の力を比べる基準で、走行抵抗は含みません。'),
 metric('corner','旋回の安定',p.lateralLimit,p.lateralLimit/100*100,' m/s²','装備全体の横方向の耐荷重。大きいほど高速コーナーで姿勢を保てます。'),
 metric('cornerDrag','旋回の軽さ',resistance,100/(1+resistance/100),' 指数','旋回抵抗の指数。入門装備を100とした固定基準で、小さいほど抵抗が少なく、バーは長くなります。タイヤ・ローラー・ホイール・車重を合成しています。'),
 metric('contact','悪路の接地',surfacePerformance(p,dirtSurface).traction*100,surfacePerformance(p,dirtSurface).traction*100,'%','共通の凹凸条件での駆動伝達率。タイヤの追従性・車体の接地・制振から計算。すべての装備で同じ基準を使います。'),
 metric('damping','制振',p.damping*100,p.damping*100,'%','装備全体の振動吸収率。重量やブレーキによる減速とのバランスも見て選ぼう。'),
 metric('landing','着地の収まり',landing,(1-landing/1.5)*100,' 倍','着地の衝撃係数。小さいほど跳ねにくく、バーは長くなります。タイヤの反発・制振・重心から計算。飛距離は速度やブレーキでも変わります。'),
 metric('duration','電池の持ち',minutes,minutes===Infinity?100:Math.min(85,minutes/40*85),' 分相当','満充電時の使用時間。残量固定は無制限と表示。現在の残量や摩耗は下のコンディション欄で確認できます。'),
 ];
}
