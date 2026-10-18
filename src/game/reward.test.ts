import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment } from '../data/machine';
import { createRaceState, type RaceState } from './race';
import { racePrize } from './reward';
import { useGame } from './store';

function completed():RaceState {
  const race=createRaceState(starterEquipment);
  return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished',time:40+i}}))};
}
test('公式順位1位の完走時のみ300円。途中・敗北・コースアウトは0円',()=>{
  const race=completed();
  assert.equal(racePrize(race),300);
  assert.equal(racePrize({...race,phase:'running'}),0);
  assert.equal(racePrize({...race,falseStartPenalty:3}),0);
  assert.equal(racePrize({...race,racers:race.racers.map(r=>r.id==='player'?{...r,driving:{...r.driving,status:'out'}}:r)}),0);
});
test('同じレースの通知では二重加算せず、次の優勝で再度300円を受け取れる',()=>{
  const original=useGame.getState();
  try {
    useGame.setState({money:3000});
    useGame.getState().startTrial();
    const attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,{...completed(),phase:'running'});
    assert.equal(useGame.getState().money,3000);
    useGame.getState().settleRace(attempt,completed());
    useGame.getState().settleRace(attempt,completed());
    assert.equal(useGame.getState().money,3300);
    useGame.getState().close();
    assert.equal(useGame.getState().money,3300);
    useGame.getState().startTrial();
    useGame.getState().settleRace(attempt,completed());
    assert.equal(useGame.getState().money,3300);
    useGame.getState().settleRace(useGame.getState().raceAttempt,completed());
    assert.equal(useGame.getState().money,3600);
  } finally { useGame.setState(original); }
});
