import { rankRacers, type RaceState } from './race';
import { RACE_PRIZES, prizesForCircuit, OFFICIAL_PRIZES } from '../data/economy';

export const WIN_PRIZE = RACE_PRIZES[0];
export function racePrize(race: RaceState): number {
  if (race.phase !== 'finished') return 0;
  const ranked = rankRacers(race);
  const place = ranked.findIndex(r => r.id === 'player');
  return place >= 0 && ranked[place].driving.status === 'finished' ? (race.event==='official'&&race.circuitId!=='comet'?OFFICIAL_PRIZES:prizesForCircuit(race.circuitId))[place] ?? 0 : 0;
}
