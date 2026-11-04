import type {CircuitId} from '../data/circuit';
import {bodyDesign} from '../data/bodies';
import {officialTime,type RaceState} from './race';
export interface TimeRecord {id:string;racerId:string;racerName:string;machineName:string;time:number;recordedAt:number}
export type TimeHistory=Partial<Record<CircuitId,TimeRecord[]>>;
const circuits:CircuitId[]=['leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'];
export function formatRecordTime(seconds:number,roundUp=false){const cs=roundUp?Math.ceil(seconds*100-1e-7):Math.floor(seconds*100);return `${String(Math.floor(cs/6000)).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;}
export function recordRaceTimes(history:TimeHistory,race:RaceState,attempt:number,recordedAt=Date.now()):TimeHistory{
 const entries=race.racers.filter(r=>r.driving.status==='finished'&&Number.isFinite(officialTime(race,r))&&officialTime(race,r)>0).map(r=>({id:`${recordedAt}:${race.seed}:${attempt}:${r.id}`,racerId:r.id,racerName:r.name,machineName:bodyDesign(r.equipment.body).name,time:officialTime(race,r),recordedAt}));
 if(!entries.length)return history;
 const byId=new Map([...(history[race.circuitId]??[]),...entries].map(record=>[record.id,record]));
 const top=[...byId.values()].sort((a,b)=>a.time-b.time||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id)).slice(0,3);
 return {...history,[race.circuitId]:top};
}
export function decodeTimeHistory(value:unknown):TimeHistory{
 if(value===undefined)return {};
 const fail=()=>{throw new Error('ベストタイムの記録が不正です。');};
 if(!value||typeof value!=='object'||Array.isArray(value))return fail();
 const result:TimeHistory={};
 for(const [key,raw] of Object.entries(value)){
  if(!circuits.includes(key as CircuitId)||!Array.isArray(raw)||raw.length>3)return fail();
  const ids=new Set<string>();const entries:TimeRecord[]=raw.map(value=>{
   if(!value||typeof value!=='object'||Array.isArray(value))return fail();const r=value as Record<string,unknown>;
   for(const key of ['id','racerId','racerName','machineName'])if(typeof r[key]!=='string'||!r[key]||(r[key] as string).length>200)return fail();
   if(typeof r.time!=='number'||!Number.isFinite(r.time)||r.time<=0||r.time>Number.MAX_SAFE_INTEGER||typeof r.recordedAt!=='number'||!Number.isSafeInteger(r.recordedAt)||r.recordedAt<0||ids.has(r.id as string))return fail();
   ids.add(r.id as string);return {id:r.id as string,racerId:r.racerId as string,racerName:r.racerName as string,machineName:r.machineName as string,time:r.time,recordedAt:r.recordedAt};
  });
  result[key as CircuitId]=entries.sort((a,b)=>a.time-b.time||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id));
 }
 return result;
}
