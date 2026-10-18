import type { Equipment } from '../data/machine';
import { rivals, type Entrant } from '../data/rivals';
import { createDrivingState, FIXED_STEP, machinePerformance, startDriving, stepDriving, type DrivingState, type Performance } from './driving';
import { freshCondition, type MachineCondition } from './condition';
import { story } from '../data/story';

export interface Racer extends Entrant { driving: DrivingState; performance: Performance; }
export interface RaceState {
  phase: 'ready'|'countdown'|'running'|'finished';
  countdownTicks: number;
  time: number;
  seed: number;
  playerStartOffset: number | null;
  falseStartPenalty: number;
  racers: Racer[];
}
export const COUNTDOWN_TICKS=Math.round(3/FIXED_STEP);
export function createRaceState(equipment:Equipment,seed=0x5eed,condition:MachineCondition=freshCondition):RaceState {
  let randomState=seed>>>0||1;
  const random=()=>{randomState^=randomState<<13;randomState^=randomState>>>17;randomState^=randomState<<5;return (randomState>>>0)/4294967296;};
  const entrants:Entrant[]=[{id:'player',name:story.player,lane:2,color:0xe85438,equipment:{...equipment}},...rivals.map(r=>({...r,equipment:{...r.equipment}}))];
  return {phase:'ready',countdownTicks:COUNTDOWN_TICKS,time:0,seed,playerStartOffset:null,falseStartPenalty:0,racers:entrants.map(entrant=>{
    const performance=machinePerformance(entrant.equipment,entrant.id==='player'?condition:freshCondition);
    // CPUの個体差もシードから決定する。毎フレームの乱数は使わない。
    const variation=entrant.id==='player'?1:0.97+random()*0.06;
    return {...entrant,performance:{...performance,freeSpeed:performance.freeSpeed*variation,stallForce:performance.stallForce*variation},driving:createDrivingState()};
  })};
}
export function startRace(state:RaceState):RaceState {
  return state.phase==='ready'?{...state,phase:'countdown',countdownTicks:COUNTDOWN_TICKS}:state;
}
export function launchPlayer(state:RaceState):RaceState {
  if((state.phase!=='countdown'&&state.phase!=='running')||state.playerStartOffset!==null)return state;
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
  if(state.phase==='countdown'){
    const racers=state.racers.map(r=>({...r,driving:stepDriving(r.driving,r.performance,0,r.lane)}));
    if(state.countdownTicks>1)return {...state,racers,countdownTicks:state.countdownTicks-1};
    return {...state,phase:'running',countdownTicks:0,racers:racers.map(r=>r.id==='player'?r:{...r,driving:startDriving(r.driving)})};
  }
  const racers=state.racers.map(r=>({...r,driving:stepDriving(r.driving,r.performance,0,r.lane)}));
  return {...state,racers,time:state.time+FIXED_STEP,phase:racers.every(r=>r.driving.status==='finished'||r.driving.status==='out')?'finished':'running'};
}
export function rankRacers(state:RaceState):Racer[] {
  return [...state.racers].sort((a,b)=>{
    const group=(r:Racer)=>r.driving.status==='finished'?0:r.driving.status==='out'?2:1;
    const difference=group(a)-group(b);if(difference)return difference;
    if(a.driving.status==='finished')return officialTime(state,a)-officialTime(state,b)||a.lane-b.lane;
    return b.driving.distance-a.driving.distance||a.lane-b.lane;
  });
}
