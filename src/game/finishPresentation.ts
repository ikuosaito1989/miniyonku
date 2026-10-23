import { getCircuitTrack } from '../data/circuit';
import type { RaceState, Racer } from './race';

export const finishSequence = { approachDistance:2.4, coastSpeedFactor:.7, holdSeconds:2.2, tallySeconds:1.6 };
export interface FinishArrival { id:string; age:number; crossingTime:number; }
export interface FinishPresentation {
  stage:'racing'|'approach'|'finish'|'tally'|'results';
  arrivals:FinishArrival[];
  finalAge:number;
}
export function createFinishPresentation():FinishPresentation { return {stage:'racing',arrivals:[],finalAge:0}; }
export function stepFinishPresentation(previous:FinishPresentation,race:RaceState,elapsed:number):FinishPresentation {
  const {circuit,circuitLength}=getCircuitTrack(race.circuitId);
  const delta=Math.max(0,elapsed);
  const arrivals=previous.arrivals.map(a=>({...a,age:a.age+delta}));
  for(const racer of race.racers){
    if(racer.driving.status!=='finished'||arrivals.some(a=>a.id===racer.id))continue;
    const offset=racer.id==='player'?(race.playerStartOffset??0):0;
    arrivals.push({id:racer.id,age:0,crossingTime:racer.driving.time+offset});
  }
  arrivals.sort((a,b)=>a.crossingTime-b.crossingTime||a.id.localeCompare(b.id));
  const finalAge=race.phase==='finished'?previous.finalAge+delta:0;
  const approaching=race.racers.some(r=>r.driving.status==='running'&&r.driving.distance>=circuitLength*circuit.laps-finishSequence.approachDistance);
  const stage=race.phase==='finished'&&finalAge>=finishSequence.holdSeconds+finishSequence.tallySeconds?'results':
    race.phase==='finished'&&finalAge>=finishSequence.holdSeconds?'tally':
    arrivals.length||race.phase==='finished'?'finish':approaching?'approach':'racing';
  return {stage,arrivals,finalAge};
}
// ゴール後も流し走行を続ける。公式の距離・タイムは変更しない。
export function finishCoastDistance(racer:Racer,presentation:FinishPresentation){
  const arrival=presentation.arrivals.find(a=>a.id===racer.id);
  return arrival?Math.max(.5,racer.driving.speed*finishSequence.coastSpeedFactor)*arrival.age:0;
}
export function shouldUseFinishCamera(race:RaceState,presentation:FinishPresentation){
  const {circuit,circuitLength}=getCircuitTrack(race.circuitId);
  if(race.playerStartOffset===null||!['approach','finish'].includes(presentation.stage))return false;
  return race.phase==='finished'||race.racers.some(r=>r.id==='player'&&r.driving.status==='finished')||
    presentation.arrivals.some(a=>a.age<2)||race.racers.some(r=>r.driving.status==='running'&&r.driving.distance>=circuitLength*circuit.laps-finishSequence.approachDistance);
}
