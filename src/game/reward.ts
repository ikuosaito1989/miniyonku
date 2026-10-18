import { rankRacers, type RaceState } from './race';

export const WIN_PRIZE = 300;
export function racePrize(race: RaceState): number {
  if (race.phase !== 'finished') return 0;
  const winner = rankRacers(race)[0];
  return winner?.id === 'player' && winner.driving.status === 'finished' ? WIN_PRIZE : 0;
}
