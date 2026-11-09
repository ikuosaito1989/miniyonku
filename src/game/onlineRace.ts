import {withMobRivals} from './mobRace';
import {createDrivingState, machinePerformance} from './driving';
import type {RaceState} from './race';
import type {OnlineRecord} from './onlineRecords';

export const topOnlineOpponents=(records:OnlineRecord[])=>[...records].sort((a,b)=>a.time-b.time||a.recordedAt.localeCompare(b.recordedAt)||a.playerId.localeCompare(b.playerId)).slice(0,4);

/** 公開装備・開始時コンディションを再シミュレーションするCPU。記録のゴーストではない。 */
export function withOnlineRivals(race:RaceState,records:OnlineRecord[]):RaceState {
 const colors=[0x4a9ce0,0x8bc864,0xc881db,0xe1ae4b];
 const ranked=topOnlineOpponents(records);
 const fillers=withMobRivals(race).racers.filter(r=>r.id!=='player').slice(0,4-ranked.length).map(r=>({...r,name:`${r.name}（モブ）`}));
 return {...race,racers:[race.racers.find(r=>r.id==='player')!,...ranked.map((record,index)=>({
  id:`online-${record.playerId}`,name:record.displayName,lane:index,color:colors[index],equipment:{...record.equipment},
  performance:machinePerformance(record.equipment,record.condition),driving:createDrivingState(),
 })),...fillers].map((r,index)=>({...r,lane:race.circuitId==='trail'||race.circuitId==='grandprix'?2:index}))};
}
