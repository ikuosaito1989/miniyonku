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
  assert.equal(racePrize(race),800);
  assert.equal(racePrize({...race,phase:'running'}),0);
  assert.equal(racePrize({...race,falseStartPenalty:2.5}),350);
  assert.equal(racePrize({...race,racers:race.racers.map(r=>r.id==='player'?{...r,driving:{...r.driving,status:'out'}}:r)}),0);
});
test('同じレースの通知では二重加算せず、次の優勝で再度800円を受け取れる',()=>{
  const original=useGame.getState();
  try {
    useGame.setState({money:3000});
    useGame.getState().startTrial();
    const attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,{...completed(),phase:'running'});
    assert.equal(useGame.getState().money,3000);
    useGame.getState().settleRace(attempt,completed());
    useGame.getState().settleRace(attempt,completed());
    assert.equal(useGame.getState().money,3800);
    useGame.getState().close();
    assert.equal(useGame.getState().money,3800);
    useGame.getState().startTrial();
    useGame.getState().settleRace(attempt,completed());
    assert.equal(useGame.getState().money,3800);
    useGame.getState().settleRace(useGame.getState().raceAttempt,completed());
    assert.equal(useGame.getState().money,4600);
  } finally { useGame.setState(original); }
});

test('完走賞は全順位に対応し、敗北では優勝の熟練度を加算しない',()=>{
  const original=useGame.getState();
  try{
    const race=completed();
    for(const [index,prize] of [800,500,350,300,250].entries()){
      const result={...race,falseStartPenalty:index+.5};
      assert.equal(racePrize(result),prize);
    }
    useGame.setState({money:1000,proficiencyPoints:0});
    useGame.getState().startTrial();
    const attempt=useGame.getState().raceAttempt;
    const last={...race,falseStartPenalty:5};
    useGame.getState().settleRace(attempt,last);
    useGame.getState().settleRace(attempt,last);
    assert.equal(useGame.getState().money,1250);
    assert.equal(useGame.getState().proficiencyPoints,5);
  }finally{useGame.setState(original);}
});

test('わかば優勝2500円を基準に通常店と公式杯の全順位へ賞金を支給する',()=>{
 const tables={leaf:[800,500,350,300,250],wind:[1200,750,550,450,350],sun:[1800,1100,800,650,500],grove:[2500,1500,1100,900,700],sprint:[3000,1800,1350,1050,800],comet:[4000,2400,1800,1400,1000]};
 for(const [id,prizes] of Object.entries(tables))for(const [place,prize] of prizes.entries()){
  const result={...completed(),circuitId:id as RaceState['circuitId'],falseStartPenalty:place+.5};
  assert.equal(racePrize(result),prize);
  if(id==='sun')assert.equal(racePrize({...result,event:'official'}),tables.sprint[place]);
 }
});
