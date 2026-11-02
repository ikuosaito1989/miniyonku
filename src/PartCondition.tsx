import type { Part } from './data/parts';
import { batteryCharge, batteryConsumption, motorFactor, motorLabel, motorWear } from './game/condition';

export function PartCondition({part,seconds,compact=false}:{part:Part;seconds:number;compact?:boolean}){
  if(part.category!=='motor'&&part.category!=='battery')return null;
  const battery=part.category==='battery';
  const fixed=battery?batteryConsumption(part.id)===0:part.specs.wear===0;
  const percent=(battery?batteryCharge(part.id,seconds):motorWear(seconds,part.id))*100;
  const label=battery?'電池残量':'モーター摩耗';
  const warning=!fixed&&(battery?percent<=20:percent>=50);
  if(compact)return <span className={`card-lamps condition-lamps${warning?' condition-lamps-warning':''}`} title={`${motorLabel(seconds,part.id)}・性能 ${(motorFactor(seconds,part.id)*100).toFixed(1)}%・使用 ${seconds.toFixed(0)}秒`}>
    <span className="condition-lamp-gauge"><progress aria-label={`${part.name}のモーター摩耗`} max={100} value={percent}/><span>{fixed?'消耗なし':`消耗 ${percent.toFixed(1)}%`}</span></span><i aria-hidden="true"/>
  </span>;
  return <span className={`part-condition${warning?' part-condition-warning':''}`}>
    <span className="part-condition-heading"><span>{label}</span><strong>{fixed?(battery?'100%':'消耗なし'):`${percent.toFixed(1)}%`}</strong></span>
    <progress aria-label={`${part.name}の${label}`} max={100} value={percent}/>
    <span className="part-condition-status">{battery?(fixed?'充電式・残量固定':percent<=0?'電池切れ・交換してください':warning?'残りわずか・交換がおすすめ':'使用できます'):`${motorLabel(seconds,part.id)} · 性能 ${(motorFactor(seconds,part.id)*100).toFixed(1)}%`}</span>
    {!fixed&&<span className="part-condition-time">使用時間 {seconds.toFixed(0)}秒</span>}
  </span>;
}
