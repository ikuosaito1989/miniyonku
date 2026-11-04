import type {CircuitId} from '../data/circuit';
import {bodyDesign} from '../data/bodies';
import type {RaceState} from './race';
export interface SpeedRecord {id:string;racerId:string;racerName:string;machineName:string;speed:number;recordedAt:number}
export type SpeedHistory=Partial<Record<CircuitId,SpeedRecord[]>>;
const circuits:CircuitId[]=['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'];
export const speedKmh=(speed:number)=>(speed*3.6).toFixed(1);
export function recordRaceSpeeds(history:SpeedHistory,race:RaceState,attempt:number,recordedAt=Date.now()):SpeedHistory{
 const entries=race.racers.filter(r=>Number.isFinite(r.driving.peakSpeed)&&(r.driving.peakSpeed??0)>0).map(r=>({id:`${recordedAt}:${race.seed}:${attempt}:${r.id}`,racerId:r.id,racerName:r.name,machineName:bodyDesign(r.equipment.body).name,speed:r.driving.peakSpeed!,recordedAt}));
 if(!entries.length)return history;
 const byId=new Map([...(history[race.circuitId]??[]),...entries].map(record=>[record.id,record]));
 const top=[...byId.values()].sort((a,b)=>b.speed-a.speed||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id)).slice(0,3);
 return {...history,[race.circuitId]:top};
}
export function decodeSpeedHistory(value:unknown):SpeedHistory{
 if(value===undefined)return {};
 const fail=()=>{throw new Error('最高速度の記録が不正です。');};
 if(!value||typeof value!=='object'||Array.isArray(value))return fail();
 const result:SpeedHistory={};
 for(const [key,raw] of Object.entries(value)){
  if(!circuits.includes(key as CircuitId)||!Array.isArray(raw)||raw.length>3)return fail();
  const ids=new Set<string>();const entries:SpeedRecord[]=raw.map(value=>{
   if(!value||typeof value!=='object'||Array.isArray(value))return fail();const r=value as Record<string,unknown>;
   for(const key of ['id','racerId','racerName','machineName'])if(typeof r[key]!=='string'||!r[key]||(r[key] as string).length>200)return fail();
   if(typeof r.speed!=='number'||!Number.isFinite(r.speed)||r.speed<=0||r.speed>Number.MAX_SAFE_INTEGER||typeof r.recordedAt!=='number'||!Number.isSafeInteger(r.recordedAt)||r.recordedAt<0||ids.has(r.id as string))return fail();
   ids.add(r.id as string);return {id:r.id as string,racerId:r.racerId as string,racerName:r.racerName as string,machineName:r.machineName as string,speed:r.speed,recordedAt:r.recordedAt};
  });
  result[key as CircuitId]=entries.sort((a,b)=>b.speed-a.speed||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id));
 }
 return result;
}
