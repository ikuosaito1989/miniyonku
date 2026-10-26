import { parts } from '../data/parts';
import { equipmentSlots, type Equipment, type EquipmentSlot } from '../data/machine';
import { isStocked } from '../data/progression';
import { getCircuitTrack, type CircuitId } from '../data/circuit';
import { modelShops, type ShopId } from '../data/world';
import { batteryCharge, type MachineCondition } from './condition';
import { createDrivingState, startDriving, stepDriving, machinePerformance } from './driving';
import { officialTime, rankRacers, type RaceState } from './race';

export interface RaceReview { circuitId:CircuitId; text:string }
export function reviewRace(race:RaceState):RaceReview|null{
  const player=race.racers.find(r=>r.id==='player');
  if(!player||race.phase!=='finished')return null;
  const rank=rankRacers(race).findIndex(r=>r.id==='player')+1;
  const notes=[player.driving.status==='finished'?`前回は${rank}位、公式タイム${officialTime(race,player).toFixed(2)}秒。`:'前回はリタイア。'];
  if(player.driving.stopReason==='battery')notes.push('電池切れで止まったのが直接の敗因だよ。');
  else if(player.driving.stopReason==='lapped')notes.push('周回遅れになったよ。加速・最高速とコーナーでの減速を改善しよう。');
  else if(player.driving.status==='out')notes.push('コースアウトしているね。速度だけでなく、タイヤのグリップとシャーシの安定性を見直そう。');
  else if(rank>1){
    const winner=rankRacers(race)[0];
    if(winner.driving.status==='finished')notes.push(`先頭との差は${Math.max(0,officialTime(race,player)-officialTime(race,winner)).toFixed(2)}秒だったよ。`);
  }
  if(race.falseStartPenalty>0)notes.push(`フライングで${race.falseStartPenalty.toFixed(2)}秒加算されたよ。GOを見てから発進しよう。`);
  if((race.playerStartOffset??0)>.2)notes.push(`GOから発進まで${race.playerStartOffset!.toFixed(2)}秒。発進待ちも公式タイムに入るよ。`);
  if(player.performance.motorWearRate!==0&&player.performance.motorSeconds<60)notes.push(`出走時のモーター使用は${player.performance.motorSeconds.toFixed(0)}秒。約60秒までの慣らしが足りなかったね。`);
  if(player.performance.motorWearRate!==0&&player.performance.motorSeconds>180)notes.push('出走時点でモーターが摩耗し、出力が落ちていたよ。');
  if(batteryCharge(player.equipment.battery,player.performance.batterySeconds+player.driving.time)<.3)notes.push('電池残量も少なく、後半の出力が落ちていたよ。');
  return {circuitId:race.circuitId,text:notes.join('\n')};
}
export interface RaceAdviceContext extends MachineCondition {shopId:ShopId;equipment:Equipment;inventory:Record<string,number>;money:number;review:RaceReview|null;motorAges?:Record<string,number>;batteryAges?:Record<string,number>}
function trial(equipment:Equipment,condition:MachineCondition,circuitId:CircuitId){
  const track=getCircuitTrack(circuitId),performance=machinePerformance(equipment,condition);
  let driving=startDriving(createDrivingState());
  for(let i=0;i<180*120&&driving.status==='running';i++)driving=stepDriving(driving,performance,0,0,track.circuit.surface,track);
  return driving.status==='finished'?driving.time:Infinity;
}
export function raceAdvice(state:RaceAdviceContext){
  const shop=modelShops[state.shopId],lines=['レース相談は僕に任せて。'];
  if(state.review?.circuitId===shop.circuitId)lines.push(state.review.text);
  else lines.push('この店のレース記録はまだないね。今の装備で改善できる点を見てみよう。');
  if(state.shopId==='hinata'){lines.push('ひなたはロングダート。舗装用のままでは砂利で失速するよ。トレイルトルクモーター、ブロックトレッドタイヤ、ツインマスダンパー、前中後のポール式ダブルローラーを組み合わせ、4:1ギアから試そう。特にタイヤの接地とダンパーの振動吸収が大切だよ。');
    const missing=['tire-trail','accessory-damper','motor-trail','roller-double'].map(id=>parts.find(p=>p.id===id)!).find(p=>!(state.inventory[p.id]>0));
    if(missing)lines.push(`ひなた模型店の「${missing.name}」は${missing.price}円。${state.money>=missing.price?'今の所持金で買えるよ。':`あと${missing.price-state.money}円、完走賞で貯めよう。`}単体では足りない場合もあるので、悪路用の組み合わせを揃えよう。`);
  }
  if(state.shopId==='wakaba')lines.push('連続コーナーでは最高速だけを上げると姿勢が乱れる。新商品のK4 テクニカルローダウン、ハイグリップ・ソフトスポンジ、デュアルワンウェイ・プロで足回りを強化できるよ。スイフトトルクモーター、4:1ギア、ローマウント・スタビライザー、駆動サポートも組み合わせよう。第3公式大会は約2分なのでロングランセルも準備してね。');
  const motor=parts.find(p=>p.id===state.equipment.motor)!;
  if(motor.specs.wear!==0&&state.motorSeconds<60)lines.push(`今の${motor.name}は使用${state.motorSeconds.toFixed(0)}秒。作業台であと約${Math.ceil(60-state.motorSeconds)}秒ならそう。慣らしでも電池は減るので残量に注意してね。`);
  else if(motor.specs.wear!==0&&state.motorSeconds>180)lines.push(`今の${motor.name}は使用${state.motorSeconds.toFixed(0)}秒で摩耗中。慣らしを増やしても回復しないので、新品への交換を優先しよう。`);
  const charge=batteryCharge(state.equipment.battery,state.batterySeconds);
  if(charge<.5)lines.push(`今の電池残量は${(charge*100).toFixed(0)}%。新品へ交換してから挑もう。`);
  const base=trial(state.equipment,state,shop.circuitId);
  const candidates=parts.filter(p=>(isStocked(p,shop)||state.inventory[p.id]>0)&&(p.category==='roller'||!Object.values(state.equipment).includes(p.id)));
  const upgrades=candidates.flatMap(part=>{
    const slots=(Object.keys(equipmentSlots) as EquipmentSlot[]).filter(slot=>equipmentSlots[slot].category===part.category&&state.equipment[slot]!==part.id);
    return slots.flatMap(slot=>{
      const equipment={...state.equipment,[slot]:part.id};
      const condition={motorSeconds:part.category==='motor'?(state.motorAges?.[part.id]??0):state.motorSeconds,batterySeconds:part.category==='battery'?(state.batteryAges?.[part.id]??0):state.batterySeconds};
      const time=trial(equipment,condition,shop.circuitId);
      return Number.isFinite(time)&&time+.1<base?[{part,slot,time,owned:state.inventory[part.id]>0}]:[];
    });
  }).sort((a,b)=>Number(b.owned||b.part.price<=state.money)-Number(a.owned||a.part.price<=state.money)||a.time-b.time);
  for(const {part,slot,owned} of upgrades.slice(0,2)){
    const reason=part.category==='gear'?'ギア比を変えて加速と伸びを調整':part.category==='motor'?'モーターの出力を改善':part.category==='tire'?'タイヤのグリップと重量を改善':part.category==='battery'?'電池の出力・持続を改善':part.category==='terminal'?'端子の伝達効率を改善':part.category==='chassis'?'車体の重量と安定性を調整':part.category==='roller'?'ローラーの抵抗と安定性を調整':'重量や走行抵抗を改善';
    lines.push(`${reason}するなら${equipmentSlots[slot].label}を「${part.name}」へ。${owned?'所持済みなので作業台で装着しよう。':`${shop.name}で${part.price}円。${state.money>=part.price?'今の所持金で買えるよ。':`あと${part.price-state.money}円、完走賞で貯めよう。`}`}同じコースの単体交換の試走比較で、今より改善する候補だよ。`);
  }
  if(!upgrades.length)lines.push('単体のパーツ交換では明確な改善候補がないね。電池・モーターの状態、発進タイミングを整え、組み合わせを作業台で比べよう。');
  lines.push('佐伯 匠には各模型店でいつでも相談できるよ。交換後の順位は相手や発進によって変わるので、もう一度走って確かめよう。');
  return lines.join('\n\n');
}
