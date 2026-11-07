import {createDrivingState, machinePerformance} from './driving';
import type {RaceState} from './race';
import type {OnlineRecord} from './onlineRecords';

/** 公開装備・開始時コンディションを再シミュレーションするCPU。記録のゴーストではない。 */
export function withOnlineRivals(race:RaceState,records:OnlineRecord[]):RaceState {
 const colors=[0x4a9ce0,0x8bc864,0xc881db,0xe1ae4b];
 return {...race,racers:[race.racers.find(r=>r.id==='player')!,...records.slice(0,4).map((record,index)=>({
  id:`online-${record.playerId}`,name:record.displayName,lane:index,color:colors[index],equipment:{...record.equipment},
  performance:machinePerformance(record.equipment,record.condition),driving:createDrivingState(),
 }))].map((r,index)=>({...r,lane:race.circuitId==='trail'||race.circuitId==='grandprix'?2:index}))};
}
