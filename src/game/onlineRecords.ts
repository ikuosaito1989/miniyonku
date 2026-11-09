import {equipmentSlots, type Equipment} from '../data/machine';
import {parts} from '../data/parts';
import {practiceCourseIds} from '../data/practiceCourses';
import type {CircuitId} from '../data/circuit';
import type {MachineCondition} from './condition';
import {officialTime, type RaceState} from './race';
import {isRecordEquipmentEligible, currentRaceRulesVersion} from './timeRecords';

export interface OnlineSubmission {
 circuitId:CircuitId; rulesVersion:number; time:number; equipment:Equipment;
 condition:MachineCondition; displayName:string;
}
export interface OnlineRecord extends OnlineSubmission {playerId:string; recordedAt:string}
export interface OnlineChallenge {circuitId:CircuitId; records:OnlineRecord[]}
export const onlineCircuits:CircuitId[]=[...practiceCourseIds,'leaf','wind','sun','sprint','grove','comet','trail','grandprix','forge','zenith'];
export function raceSubmission(race:RaceState,displayName:string):OnlineSubmission|null {
 const player=race.racers.find(r=>r.id==='player');
 if((race.phase!=='running'&&race.phase!=='finished')||!player||player.driving.status!=='finished'||!isRecordEquipmentEligible(player.equipment))return null;
 const time=officialTime(race,player);
 if(!Number.isFinite(time)||time<=0||time>86400)return null;
 return {circuitId:race.circuitId,rulesVersion:currentRaceRulesVersion(race.circuitId),time,equipment:{...player.equipment},condition:{motorSeconds:player.performance.motorSeconds,batterySeconds:player.performance.batterySeconds},displayName};
}
export function decodeOnlineRecords(value:unknown,circuitId:CircuitId):OnlineRecord[] {
 if(!value||typeof value!=='object'||!('records' in value)||!Array.isArray(value.records)||value.records.length>5)throw new Error('ランキングの形式が不正です。');
 return value.records.map((raw:unknown)=>{
  if(!raw||typeof raw!=='object')throw new Error('記録の形式が不正です。');
  const r=raw as OnlineRecord;
  if(r.circuitId!==circuitId||r.rulesVersion!==currentRaceRulesVersion(circuitId)||typeof r.playerId!=='string'||!/^[a-f0-9]{64}$/.test(r.playerId)||typeof r.displayName!=='string'||!r.displayName.trim()||r.displayName.length>24||typeof r.recordedAt!=='string'||!Number.isFinite(Date.parse(r.recordedAt))||!Number.isFinite(r.time)||r.time<=0||r.time>86400)throw new Error('記録の形式が不正です。');
  if(!r.equipment||Object.keys(r.equipment).length!==Object.keys(equipmentSlots).length||!Object.entries(equipmentSlots).every(([slot,meta])=>parts.some(p=>p.id===r.equipment[slot as keyof Equipment]&&p.category===meta.category))||!isRecordEquipmentEligible(r.equipment)||!r.condition||![r.condition.motorSeconds,r.condition.batterySeconds].every(n=>Number.isFinite(n)&&n>=0&&n<=1e9))throw new Error('記録の装備が不正です。');
  return {...r,equipment:{...r.equipment},condition:{...r.condition}};
 });
}
