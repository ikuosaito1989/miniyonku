import { parts } from '../data/parts';
import type { Equipment } from '../data/machine';

export interface PartUnit { id:string; seconds:number }
export type UnitInventory=Record<string,PartUnit[]>;
export interface MachineCondition { motorSeconds:number; batterySeconds:number }
export const freshCondition:MachineCondition={motorSeconds:0,batterySeconds:0};
export const motorTuning={breakInSeconds:60,peakUntilSeconds:180,wornOutSeconds:1200};
export function motorFactor(seconds:number){
  const age=Math.max(0,seconds);
  if(age<60)return .94+.14*age/60;
  return Math.max(.55,1.08-(Math.max(0,age-180)/1020)*.53);
}
export function motorWear(seconds:number){return Math.min(1,Math.max(0,seconds-180)/1020);}
export function batteryCapacity(id:string){return (parts.find(p=>p.id===id)?.specs.endurance??90)*4;}
export function batteryCharge(id:string,seconds:number){return Math.max(0,1-Math.max(0,seconds)/batteryCapacity(id));}
export function motorLabel(seconds:number){return seconds<60?'慣らし中':seconds<=180?'絶好調':motorWear(seconds)<.5?'摩耗あり':'交換推奨';}
export function equippedCondition(equipment:Equipment,units:UnitInventory,selected:Record<'motor'|'battery',string>):MachineCondition{
  const age=(slot:'motor'|'battery')=>{const list=units[equipment[slot]];return (list?.find(u=>u.id===selected[slot])??list?.[0])?.seconds??0;};
  return {motorSeconds:age('motor'),batterySeconds:age('battery')};
}
export function createStarterUnits():UnitInventory{return {'motor-stock':[{id:'starter-motor',seconds:0}],'battery-basic':[{id:'starter-battery',seconds:0}]};}
