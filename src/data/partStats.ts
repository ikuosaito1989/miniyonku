import {parts,type Part} from './parts';
import {batteryCapacityMultiplier} from '../game/condition';
type Metric={id:string;label:string;read:(part:Part)=>number;format:(value:number)=>string;lower?:boolean;help?:string};
const number=(n:number)=>n.toLocaleString('ja-JP',{maximumFractionDigits:3});
const weight:Metric={id:'weight',label:'軽さ',read:p=>p.specs.weight,format:n=>`${number(n)} g`,lower:true};
const stability:Metric={id:'stability',label:'安定性',read:p=>p.specs.stability??1,format:n=>`×${number(n)}`};
const damping:Metric={id:'damping',label:'制振',read:p=>p.specs.damping??0,format:n=>`${number(n*100)}%`};
const efficiency:Metric={id:'efficiency',label:'駆動効率',read:p=>p.specs.efficiency??1,format:n=>`×${number(n)}`};
export function motorOutput(part:Part){return part.specs.rpm*(2*Math.PI/60)*(part.specs.torque/1000)/4;}
function metrics(part:Part):Metric[]{
 switch(part.category){
  case 'motor':return [
   {id:'rpm',label:'回転数',read:p=>p.specs.rpm,format:n=>`${number(n)} rpm`},
   {id:'torque',label:'トルク',read:p=>p.specs.torque,format:n=>`${number(n)} mN·m`},
   {id:'power',label:'出力目安',read:motorOutput,format:n=>`${number(n)} W`,help:'回転数とトルクから求めた単体の理論最大出力。実走では電池・ブレークイン・装備で変わります。'},weight];
  case 'tire':return [
   {id:'grip',label:'グリップ',read:p=>p.specs.grip,format:number},
   {id:'scrub',label:'旋回の軽さ',read:p=>p.specs.grip,format:n=>`横擦れ ${number(n)}`,lower:true,help:'グリップが低いほど横擦れが小さく、旋回で速度を残せます。安定性とは交換関係です。'},
   {id:'compliance',label:'悪路への追従',read:p=>p.specs.compliance??(p.id==='tire-1'?1.2:p.id==='tire-2'?.7:1),format:n=>`×${number(n)}`},
   {id:'rebound',label:'跳ねにくさ',read:p=>p.specs.rebound??.45,format:n=>`反発 ${number(n)}`,lower:true}];
  case 'roller':return [
   {id:'friction',label:'回転の軽さ',read:p=>p.specs.friction,format:n=>`摩擦 ${number(n)}`,lower:true,help:'壁に接触したときの摩擦。小さいほど回転が軽く、旋回で速度を残します。'},stability,damping,weight];
  case 'chassis':return [efficiency,stability,{id:'compliance',label:'悪路への追従',read:p=>p.specs.compliance??1,format:n=>`×${number(n)}`},weight];
  case 'body':return [{id:'drag',label:'空気抵抗の少なさ',read:p=>p.specs.drag,format:n=>`抵抗 ${number(n)}`,lower:true},stability,{id:'roughGrip',label:'悪路の接地',read:p=>p.specs.roughGrip,format:n=>`×${number(n)}`},weight];
  case 'battery':return [
   {id:'power',label:'出力',read:p=>p.specs.power,format:n=>`×${number(n)}`},
   {id:'capacity',label:'持続の目安',read:p=>p.specs.consumption===0?Infinity:p.specs.endurance*batteryCapacityMultiplier,format:n=>n===Infinity?'無制限':`${(n/60).toLocaleString('ja-JP',{maximumFractionDigits:1})}分相当`,help:'新品から残量がなくなるまでの使用時間の目安。残量が減ると出力も低下します。'},weight];
  case 'gear':return [{id:'speed',label:'最高速寄り',read:p=>p.specs.ratio,format:n=>`${number(n)}:1`,lower:true},{id:'force',label:'駆動力寄り',read:p=>p.specs.ratio,format:n=>`${number(n)}:1`},weight];
  case 'wheel':return [{id:'cornerDrag',label:'旋回の軽さ',read:p=>p.specs.cornerDrag,format:n=>`抵抗 ×${number(n)}`,lower:true},weight];
  case 'shaft':return [weight];
  case 'terminal':return [{id:'efficiency',label:'通電効率',read:p=>p.specs.efficiency,format:n=>`${number(n*100)}%`},weight];
  case 'accessory':{
   if(part.id==='accessory-none')return [];
   if(part.specs.brake)return [{id:'brake',label:'制動力',read:p=>p.specs.brake??0,format:number},weight];
   const result:Metric[]=[];
   if((part.specs.efficiency??1)!==1)result.push(efficiency);
   if((part.specs.stability??1)!==1)result.push(stability);
   if(part.specs.damping)result.push(damping);
   if(part.specs.cornerDrag!==undefined)result.push({id:'cornerDrag',label:'旋回の軽さ',read:p=>p.specs.cornerDrag??1,format:n=>`抵抗 ×${number(n)}`,lower:true});
   return [...result,weight];
  }
 }
}
export function partStats(part:Part,peers:readonly Part[]=parts,reference?:Part){
 return metrics(part).map(metric=>{
  const candidates=[part,...peers.filter(p=>p.category===part.category),...(reference?.category===part.category?[reference]:[])];
  const values=candidates.map(metric.read).filter(Number.isFinite);const min=Math.min(...values),max=Math.max(...values,0),hasInfinite=candidates.some(p=>metric.read(p)===Infinity);
  // Shared scale within the displayed comparison group; no guessed race speed or roller RPM.
  const score=(value:number)=>value===Infinity?100:max===0?(metric.lower?100:0):Math.max(0,Math.min(100,(metric.lower?(value===0?1:min>0?min/value:1-value/max):value/max)*(hasInfinite?85:100)));
  const value=metric.read(part),current=reference?.category===part.category?metric.read(reference):undefined;
  return {id:metric.id,label:metric.label,value,display:metric.format(value),score:score(value),help:metric.help,reference:current===undefined?undefined:{display:metric.format(current),score:score(current)}};
 });
}
export function partSummary(p:Part):string{
 const s=p.specs;
 switch(p.category){
  case 'motor':return s.rpm>=28000&&s.torque>=3.5?'高出力型。回転数とトルクの両方を重視。':s.rpm>=15500&&s.torque<=1.2?'回転重視。軽い装備で最高速を狙う。':s.torque>=3?'高トルク型。坂や重い装備向け。':s.rpm>=24000?'高回転型。直線の最高速を狙う。':s.torque>=2?'力を重視。登坂と再加速を支える。':'基本型。速さと力を扱いやすく両立。';
  case 'tire':return (s.compliance??1)>=2?'悪路向け。砂や凹凸で接地を保つ。':s.grip<1?'低グリップ。旋回の抵抗と跳ねを抑える。':(s.rebound??.45)<=.2?'低反発。着地の跳ねを抑える舗装用。':s.grip>=1.3?'高グリップ。安定するぶん旋回抵抗も増える。':'舗装向け。グリップと軽さのバランス型。';
  case 'roller':return (s.stability??1)>=1.16||(s.damping??0)>=.1?'姿勢重視。高速旋回や着地を支える。':s.friction<=.05?'回転が軽い。コーナーで速度を残しやすい。':'摩擦と重さを見て選ぶ標準ガイド。';
  case 'chassis':return s.frontMotor===1?'前寄り重心。ジャンプを低く抑えるFM型。':(s.compliance??1)>=1.5?'凹凸への追従を重視する悪路向け。':s.stability>=1.2?'安定重視。高速コーナーで姿勢を保つ。':s.weight<18?'軽量型。発進と再加速の負担を減らす。':'重さと扱いやすさのバランス型。';
  case 'body':return s.roughGrip>=1.2?'悪路向け。砂や凹凸で接地を支える。':s.drag<=.7?'空気抵抗の少ない高速向けカウル。':'重さと旋回の安定を比べて選ぶボディ。';
  case 'battery':return s.consumption===0?'残量固定。交換なしで繰り返し使える。':s.power>=1.1?'高出力・短距離向け。長距離は残量に注意。':s.endurance>=180?'長距離向け。後半まで出力を保ちやすい。':'出力と容量のバランス型。';
  case 'gear':return s.ratio<3.8?'最高速寄り。坂や重い装備では力不足に注意。':s.ratio>4.2?'駆動力重視。登坂に強く最高速は控えめ。':'最高速と駆動力を両立する中間比率。';
  case 'wheel':return s.cornerDrag<=.85?'旋回抵抗を抑える。連続コーナー向け。':s.weight<=4?'軽さを重視。発進と再加速の負担を減らす。':'標準型。重量と旋回抵抗を比べて選ぶ。';
  case 'shaft':return '軽い軸ほど、発進と再加速の負担が減る。';
  case 'terminal':return '通電ロスを減らし、モーターへ電力を伝える。';
  case 'accessory':return p.id==='accessory-none'?'補助パーツを外して軽量化する。':s.brake?'坂で制動して飛びすぎを抑える。強すぎに注意。':s.damping?'振動と着地の跳ねを抑える。重量も確認。':(s.efficiency??1)>1?'駆動の損失を抑え、加速を支える。':'姿勢を安定させる補助パーツ。重量も確認。';
 }
}
export function partBadges(p:Part){return [
 ...(p.specs.wear===0?['消耗なし']:[]),...(p.specs.consumption===0?['残量固定']:[]),
 ...(p.category==='chassis'?[p.specs.frontMotor===1?'FM・前置き':'RM・後置き']:[]),
 ...(p.category==='tire'?[`外径 ${number(p.specs.diameter)} mm`,`重量 ${number(p.specs.weight)} g`]:[]),
 ...(p.category==='wheel'?[`リム径 ${number(p.specs.diameter)} mm`]:[]),
 ];}
