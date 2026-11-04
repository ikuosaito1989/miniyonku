import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {batteryCapacityMultiplier,motorFactor,remainingCharge} from './condition';
import {surfacePerformance,type Performance} from './driving';
export interface DirtSetupWarning {severe:boolean;title:string;advice:string}
/** ひなたの全路面で、停止状態の駆動力と路面抵抗を比較する。 */
export function dirtSetupWarning(performance:Performance,circuitId:CircuitId):DirtSetupWarning|null{
 if(circuitId!=='sun')return null;
 const remaining=remainingCharge(performance.batterySeconds,performance.batteryEndurance*batteryCapacityMultiplier,performance.batteryConsumption);
 if(remaining<=0)return null;
 const charge=.55+.45*Math.sqrt(remaining),motor=performance.motorWearRate===0?1:motorFactor(performance.motorSeconds),track=getCircuitTrack('sun');
 const margin=Math.min(...[.1,.3,.5,.8].map(position=>{
  const road=surfacePerformance(performance,track.surfaceAt(position*track.circuitLength));
  return performance.stallForce*charge*motor*road.traction/(performance.mass*9.81*.025+road.resistance);
 }));
 if(margin>=1.6)return null;
 return {severe:margin<=1.05,title:margin<=1.05?'ダート不向き：空転・超低速':'ダートの駆動力不足：大幅に減速',advice:'ブロックタイヤ・悪路シャーシを優先し、高トルクモーターとダンパーも見直そう。'};
}
