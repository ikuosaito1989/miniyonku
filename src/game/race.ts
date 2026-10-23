import type { Equipment } from '../data/machine';
import { rivals, aozoraRivals, hinataRivals, type Entrant } from '../data/rivals';
import { createDrivingState, FIXED_STEP, machinePerformance, startDriving, stepDriving, type DrivingState, type Performance } from './driving';
import { freshCondition, type MachineCondition } from './condition';
import { story } from '../data/story';
import { legends } from '../data/legends';
import { getCircuitTrack, type CircuitId } from '../data/circuit';
import { challenger } from '../data/challenger';
export type RaceChallenge=boolean|'villain';

export interface Racer extends Entrant { driving: DrivingState; performance: Performance; }
export interface RaceState {
  circuitId:CircuitId;
  phase: 'ready'|'countdown'|'running'|'finished';
  countdownTicks: number;
  time: number;
  seed: number;
  playerStartOffset: number | null;
  falseStartPenalty: number;
  racers: Racer[];
}
// 45秒切りを入門レースの優勝目安にするため、CPUは基礎性能の90%で走る。
export const RIVAL_DIFFICULTY=0.9;
export const COUNTDOWN_TICKS=Math.round(3/FIXED_STEP);
export function createRaceState(equipment:Equipment,seed=0x5eed,condition:MachineCondition=freshCondition,challenge:RaceChallenge=false,circuitId:CircuitId='leaf'):RaceState {
  const legendChallenge=challenge===true;
  let randomState=seed>>>0||1;
  const random=()=>{randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return (randomState>>>0)/4294967296;};
  const lanes=[0,1,2,3,4];
  for(let i=lanes.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[lanes[i],lanes[j]]=[lanes[j],lanes[i]];}
  const entrants:Entrant[]=legendChallenge
    ?[{id:'player',name:story.player,lane:2,color:0xd94232,equipment:{...equipment}},...legends.slice(0,2).map((legend,index)=>({id:legend.id,name:legend.name,lane:index,color:index?0xe5b839:0x477de0,motorSeconds:90,equipment:{...legend.equipment}})),...rivals.slice(0,2).map(r=>({...r,equipment:{...r.equipment}}))]
    :[{id:'player',name:story.player,lane:2,color:0xd94232,equipment:{...equipment}},...(challenge==='villain'?[challenger,...aozoraRivals.slice(0,3)]:circuitId==='sun'?hinataRivals:circuitId==='wind'?aozoraRivals:rivals).map(r=>({...r,equipment:{...r.equipment}}))];
  return {circuitId,phase:'ready',countdownTicks:COUNTDOWN_TICKS,time:0,seed,playerStartOffset:null,falseStartPenalty:0,racers:entrants.map((entry,index)=>{
    const entrant={...entry,lane:lanes[index]};
    const performance=machinePerformance(entrant.equipment,entrant.id==='player'?condition:{...freshCondition,motorSeconds:entrant.motorSeconds??0});
    // CPUの個体差もシードから決定する。毎フレームの乱数は使わない。
    const variation=entrant.id==='player'?1:0.97+random()*0.06;
    const legendary=legendChallenge&&entrant.id.startsWith('legend-');
    const difficulty=circuitId!=='leaf'?.96:RIVAL_DIFFICULTY;
    const racePace=legendary?2.25:entrant.id==='player'||entrant.id===challenger.id?1:difficulty;
    return {...entrant,performance:{...performance,freeSpeed:performance.freeSpeed*variation*racePace,stallForce:performance.stallForce*variation*(legendary?1.8:racePace),lateralLimit:performance.lateralLimit*(legendary?25:1)},driving:createDrivingState()};
  })};
}
export function startRace(state:RaceState):RaceState {
  return state.phase==='ready'?{...state,phase:'countdown',countdownTicks:COUNTDOWN_TICKS}:state;
}
export function launchPlayer(state:RaceState):RaceState {
  if((state.phase!=='countdown'&&state.phase!=='running')||state.playerStartOffset!==null||state.racers.find(r=>r.id==='player')?.driving.status!=='ready')return state;
  const early=state.phase==='countdown'?state.countdownTicks*FIXED_STEP:0;
  return {...state,playerStartOffset:early>0?-early:state.time,falseStartPenalty:early,
    racers:state.racers.map(r=>r.id==='player'?{...r,driving:startDriving(r.driving)}:r)};
}
export function officialTime(state:RaceState,racer:Racer):number {
  if(racer.id!=='player')return racer.driving.time;
  if(state.playerStartOffset===null)return state.time;
  return racer.driving.time+Math.max(0,state.playerStartOffset)+state.falseStartPenalty;
}
export function countdownNumber(state:RaceState){return Math.ceil(state.countdownTicks*FIXED_STEP);}
export function stepRace(state:RaceState):RaceState {
  if(state.phase==='ready'||state.phase==='finished')return state;
  const track=getCircuitTrack(state.circuitId);
  if(state.phase==='countdown'){
    const racers=state.racers.map(r=>({...r,driving:stepDriving(r.driving,r.performance,0,r.lane,track.circuit.surface,track)}));
    if(state.countdownTicks>1)return {...state,racers,countdownTicks:state.countdownTicks-1};
    return {...state,phase:'running',countdownTicks:0,racers:racers.map(r=>r.id==='player'?r:{...r,driving:startDriving(r.driving)})};
  }
  const advanced=state.racers.map(r=>({...r,driving:stepDriving(r.driving,r.performance,0,r.lane,track.circuit.surface,track)}));
  const leaderDistance=Math.max(...advanced.filter(r=>r.driving.status!=='out').map(r=>r.driving.distance));
  const racers=advanced.map(r=>(r.driving.status==='running'||r.driving.status==='ready')&&leaderDistance-r.driving.distance>=track.circuitLength
    ?{...r,driving:{...r.driving,status:'out' as const,speed:0,stopReason:'lapped' as const}}:r);
  return {...state,racers,time:state.time+FIXED_STEP,phase:racers.every(r=>r.driving.status==='finished'||r.driving.status==='out')?'finished':'running'};
}
// 映像の待ち時間だけを省略。固定刻みでCPUの順位・リタイアも確定する。
export function completeRaceAfterPlayerFinish(state:RaceState):RaceState {
  if(state.racers.find(r=>r.id==='player')?.driving.status!=='finished')return state;
  let result=state;
  while(result.phase==='running')result=stepRace(result);
  return result;
}
export function rankRacers(state:RaceState):Racer[] {
  return [...state.racers].sort((a,b)=>{
    const group=(r:Racer)=>r.driving.status==='finished'?0:r.driving.status==='out'?2:1;
    const difference=group(a)-group(b);if(difference)return difference;
    if(a.driving.status==='finished')return officialTime(state,a)-officialTime(state,b)||a.lane-b.lane;
    return b.driving.distance-a.driving.distance||a.lane-b.lane;
  });
}
