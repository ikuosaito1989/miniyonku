import {practiceCourseIds} from '../data/practiceCourses';
import {isSovereignPart} from '../data/sovereignParts';
import {equipmentSlots,type Equipment} from '../data/machine';
import {parts} from '../data/parts';
import type {CircuitId} from '../data/circuit';
import {bodyDesign} from '../data/bodies';
import {officialTime,type RaceState} from './race';
export const raceRulesVersion=2;
export interface TimeRecord {rulesVersion?:number;id:string;racerId:string;racerName:string;machineName:string;time:number;recordedAt:number;equipment?:Equipment}
export type TimeHistory=Partial<Record<CircuitId,TimeRecord[]>>;
const circuits:CircuitId[]=[...practiceCourseIds,'leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'];
export function formatRecordTime(seconds:number,roundUp=false){const cs=roundUp?Math.ceil(seconds*100-1e-7):Math.floor(seconds*100);return `${String(Math.floor(cs/6000)).padStart(2,'0')}:${String(Math.floor(cs/100)%60).padStart(2,'0')}.${String(cs%100).padStart(2,'0')}`;}
export const isRecordEquipmentEligible=(equipment:Equipment)=>!Object.values(equipment).some(isSovereignPart);
export function recordRaceTimes(history:TimeHistory,race:RaceState,attempt:number,recordedAt=Date.now()):TimeHistory{
 const entries=race.racers.filter(r=>r.driving.status==='finished'&&isRecordEquipmentEligible(r.equipment)&&Number.isFinite(officialTime(race,r))&&officialTime(race,r)>0).map(r=>({id:`${recordedAt}:${race.seed}:${attempt}:${r.id}`,racerId:r.id,racerName:r.name,machineName:bodyDesign(r.equipment.body).name,time:officialTime(race,r),recordedAt,rulesVersion:raceRulesVersion,equipment:{...r.equipment}}));
 if(!entries.length)return history;
 const byId=new Map([...(history[race.circuitId]??[]).filter(r=>r.rulesVersion===raceRulesVersion&&r.equipment&&isRecordEquipmentEligible(r.equipment)),...entries].map(record=>[record.id,record]));
 const top=[...byId.values()].sort((a,b)=>a.time-b.time||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id)).slice(0,5);
 return {...history,[race.circuitId]:top};
}
export function decodeTimeHistory(value:unknown):TimeHistory{
 if(value===undefined)return {};
 const fail=()=>{throw new Error('ベストタイムの記録が不正です。');};
 if(!value||typeof value!=='object'||Array.isArray(value))return fail();
 const result:TimeHistory={};
 for(const [key,raw] of Object.entries(value)){
  if(!circuits.includes(key as CircuitId)||!Array.isArray(raw)||raw.length>5)return fail();
  const ids=new Set<string>();const entries:TimeRecord[]=raw.map(value=>{
   if(!value||typeof value!=='object'||Array.isArray(value))return fail();const r=value as Record<string,unknown>;
   for(const key of ['id','racerId','racerName','machineName'])if(typeof r[key]!=='string'||!r[key]||(r[key] as string).length>200)return fail();
   if(typeof r.time!=='number'||!Number.isFinite(r.time)||r.time<=0||r.time>Number.MAX_SAFE_INTEGER||typeof r.recordedAt!=='number'||!Number.isSafeInteger(r.recordedAt)||r.recordedAt<0||ids.has(r.id as string))return fail();
   if(r.rulesVersion!==undefined&&(typeof r.rulesVersion!=='number'||!Number.isInteger(r.rulesVersion)||r.rulesVersion<1||r.rulesVersion>raceRulesVersion))return fail();
   let equipment:Equipment|undefined;
   if(r.equipment!==undefined){if(!r.equipment||typeof r.equipment!=='object'||Array.isArray(r.equipment))return fail();equipment={} as Equipment;for(const [slot,meta] of Object.entries(equipmentSlots)){const id=(r.equipment as Record<string,unknown>)[slot];if(typeof id!=='string'||!parts.some(p=>p.id===id&&p.category===meta.category))return fail();equipment[slot as keyof Equipment]=id;}}
   ids.add(r.id as string);return {id:r.id as string,racerId:r.racerId as string,racerName:r.racerName as string,machineName:r.machineName as string,time:r.time,recordedAt:r.recordedAt,...(r.rulesVersion?{rulesVersion:r.rulesVersion as number}:{}),...(equipment?{equipment}:{})};
  });
  result[key as CircuitId]=entries.sort((a,b)=>a.time-b.time||a.recordedAt-b.recordedAt||a.id.localeCompare(b.id));
 }
 return result;
}

export function migrateTimeHistory(history:TimeHistory,old:TimeHistory={}){
 const clean:TimeHistory={},legacy:TimeHistory={...old};
 for(const [id,records] of Object.entries(history)){
  const circuit=id as CircuitId;clean[circuit]=records.filter(r=>r.rulesVersion===raceRulesVersion&&r.equipment&&isRecordEquipmentEligible(r.equipment));
  const unknown=records.filter(r=>r.rulesVersion!==raceRulesVersion||!r.equipment);if(unknown.length)legacy[circuit]=[...new Map([...(legacy[circuit]??[]),...unknown].map(r=>[r.id,r])).values()].sort((a,b)=>a.time-b.time).slice(0,5);
 }
 return {timeHistory:clean,legacyTimeHistory:legacy};
}
