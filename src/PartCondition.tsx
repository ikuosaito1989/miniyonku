import type { Part } from './data/parts';
import { batteryCharge, batteryConsumption, motorFactor, motorLabel, motorWear } from './game/condition';

/** 左は消耗・残量、右の短いランプは装着状態。カーソル位置とは連動しない。 */
export function PartCondition({part,seconds,equipped}:{part:Part;seconds:number;equipped:boolean}){
  const battery=part.category==='battery',motor=part.category==='motor';
  const lamp=<i className="part-equipped-lamp" data-equipped={equipped} role="img" aria-label={`${part.name}：${equipped?'装着中':'未装着'}`}/>;
  if(!battery&&!motor)return <span className="card-lamps"><i aria-hidden="true"/>{lamp}</span>;
  const fixed=battery?batteryConsumption(part.id)===0:part.specs.wear===0;
  const percent=(battery?batteryCharge(part.id,seconds):motorWear(seconds,part.id))*100;
  const label=battery?'電池残量':'モーター摩耗';
  const warning=!fixed&&(battery?percent<=20:percent>=50);
  const status=battery?(fixed?'充電式・残量固定':percent<=0?'電池切れ':warning?'残りわずか':'使用できます'):`${motorLabel(seconds,part.id)}・性能 ${(motorFactor(seconds,part.id)*100).toFixed(1)}%`;
  return <span className={`card-lamps condition-lamps${warning?' condition-lamps-warning':''}`} title={`${label} ${percent.toFixed(1)}%・${status}・使用 ${seconds.toFixed(0)}秒`}>
    <span className="condition-lamp-gauge"><progress aria-label={`${part.name}の${label}`} max={100} value={percent}/><span>{battery?`残量 ${percent.toFixed(1)}%${fixed?'（充電式）':percent<=0?'・電池切れ':''}`:fixed?'消耗なし':`消耗 ${percent.toFixed(1)}%`}</span>
      <span className="part-card-condition-status">{battery?status:motorLabel(seconds,part.id)}</span>
      {motor&&<span className="part-card-condition-detail">性能 {(motorFactor(seconds,part.id)*100).toFixed(1)}%</span>}
      <span className="part-card-condition-detail">使用 {seconds.toFixed(0)}秒</span>
    </span>{lamp}
  </span>;
}
