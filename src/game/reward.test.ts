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
test('公式順位に応じた完走賞。途中・コースアウトは0円',()=>{
  const race=completed();
  assert.equal(racePrize(race),300);
  assert.equal(racePrize({...race,phase:'running'}),0);
  assert.equal(racePrize({...race,falseStartPenalty:2.5}),140);
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

test('完走賞は全順位に対応し、敗北では優勝の熟練度を加算しない',()=>{
  const original=useGame.getState();
  try{
    const race=completed();
    for(const [index,prize] of [300,180,140,100,80].entries()){
      const result={...race,falseStartPenalty:index+.5};
      assert.equal(racePrize(result),prize);
    }
    useGame.setState({money:1000,proficiencyPoints:0});
    useGame.getState().startTrial();
    const attempt=useGame.getState().raceAttempt;
    const last={...race,falseStartPenalty:5};
    useGame.getState().settleRace(attempt,last);
    useGame.getState().settleRace(attempt,last);
    assert.equal(useGame.getState().money,1080);
    assert.equal(useGame.getState().proficiencyPoints,5);
  }finally{useGame.setState(original);}
});
