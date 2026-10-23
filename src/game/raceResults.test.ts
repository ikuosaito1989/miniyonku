import { test } from 'node:test';
import assert from 'node:assert/strict';
import { starterEquipment } from '../data/machine';
import { getCircuitTrack, type CircuitId } from '../data/circuit';
import { canViewRaceResults, completeRaceAfterPlayerFinish, createRaceState, launchPlayer, officialTime, rankRacers, startRace, stepRace, type RaceState } from './race';
import { racePrize } from './reward';
import { useGame } from './store';
import { snapshotGame } from './saveData';
import { nextShopRace } from '../data/shopHints';

function nearGoal(circuitId:CircuitId):RaceState{
  const race=createRaceState(starterEquipment,123,undefined,false,circuitId),track=getCircuitTrack(circuitId);
  return {...race,phase:'running',time:40,playerStartOffset:0,falseStartPenalty:4,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:'running',time:40,speed:2,distance:track.circuitLength*track.circuit.laps-(r.id==='player'?.001:1)}}))};
}
test('ゴール後の結果表示は残りCPUを通常と同じ計算で確定し、フライング・順位・賞金を維持する',()=>{
  for(const id of ['leaf','wind'] as const){
    const goal=stepRace(nearGoal(id)),snapshot=structuredClone(goal);
    assert.equal(goal.racers[0].driving.status,'finished');assert.equal(goal.phase,'running');
    let expected=goal;while(expected.phase==='running')expected=stepRace(expected);
    const result=completeRaceAfterPlayerFinish(goal);
    assert.deepEqual(result,expected);assert.deepEqual(goal,snapshot);
    assert.deepEqual(result.racers[0].driving,goal.racers[0].driving);
    assert.equal(officialTime(result,result.racers[0]),officialTime(goal,goal.racers[0]));
    assert.equal(rankRacers(result).at(-1)?.id,'player');assert.equal(racePrize(result),id==='leaf'?150:250);
    assert.equal(completeRaceAfterPlayerFinish(result),result);
  }
});
test('発進前・走行中・通常のコースアウトでは結果へのスキップを許可しない',()=>{
  const ready=createRaceState(starterEquipment),running=nearGoal('leaf');
  assert.equal(completeRaceAfterPlayerFinish(ready),ready);
  assert.equal(completeRaceAfterPlayerFinish(startRace(ready)).phase,'countdown');
  assert.equal(completeRaceAfterPlayerFinish(running),running);
  running.racers[0].driving.status='out';assert.equal(completeRaceAfterPlayerFinish(running),running);
});
test('先頭から1周以上の差でリタイア。1周未満・既にゴールした車はリタイアにしない',()=>{
  for(const id of ['leaf','wind'] as const){
    const track=getCircuitTrack(id),race=nearGoal(id);
    race.racers=race.racers.map(r=>({...r,driving:{...r.driving,distance:track.circuitLength*2,speed:0}}));
    race.racers[0].driving.distance=track.circuitLength+.1;
    assert.equal(stepRace(race).racers[0].driving.status,'running');
    race.racers[0].driving.distance=track.circuitLength-.1;
    const result=stepRace(race);assert.equal(result.racers[0].driving.status,'out');assert.equal(result.racers[0].driving.stopReason,'lapped');
    assert.equal(result.racers[0].driving.speed,0);assert.equal(racePrize(result),0);
    race.racers[0].driving.status='finished';assert.equal(stepRace(race).racers[0].driving.status,'finished');
  }
});
test('GO後に未発進のまま周回遅れになった場合もリタイアし、後から発進できない',()=>{
  const race=nearGoal('leaf'),length=getCircuitTrack().circuitLength;
  race.playerStartOffset=null;
  race.racers=race.racers.map(r=>({...r,driving:{...r.driving,status:r.id==='player'?'ready':'running',distance:r.id==='player'?0:length+1}}));
  const result=stepRace(race);assert.equal(result.racers[0].driving.stopReason,'lapped');assert.equal(launchPlayer(result),result);
});
test('最強兄弟に周回遅れで敗北しても街を解放し、賞金は付与しない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),...snapshotGame(useGame.getInitialState()),unlockedRaces:[nextShopRace.id]});
    useGame.getState().startLegendChallenge();
    let race=startRace(createRaceState(starterEquipment,123,undefined,true));
    while(race.phase==='countdown')race=stepRace(race);
    race=launchPlayer(race);
    for(let i=0;i<120*120&&race.phase!=='finished';i++)race=stepRace(race);
    assert.equal(race.phase,'finished');assert.equal(race.racers[0].driving.stopReason,'lapped');
    const before=useGame.getState().money;
    useGame.getState().settleRace(useGame.getState().raceAttempt,race);
    assert.equal(useGame.getState().legendRaceCompleted,true);assert.equal(useGame.getState().money,before);
    useGame.getState().close();useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');
  }finally{useGame.setState(original);}
});

test('周回遅れ直後に残りCPUの結果を確定でき、停止状態・賞金・兄弟イベントを維持する',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),unlockedRaces:[nextShopRace.id]});
    useGame.getState().startLegendChallenge();
    let race=startRace(createRaceState(starterEquipment,123,undefined,true));
    while(race.phase==='countdown')race=stepRace(race);
    race=launchPlayer(race);
    for(let i=0;i<120*120&&race.racers[0].driving.status!=='out';i++)race=stepRace(race);
    assert.equal(race.phase,'running');assert.equal(race.racers[0].driving.stopReason,'lapped');
    assert.equal(canViewRaceResults(race),true);
    const before=structuredClone(race),money=useGame.getState().money;
    let expected=race;while(expected.phase==='running')expected=stepRace(expected);
    const result=completeRaceAfterPlayerFinish(race);
    assert.equal(result.phase,'finished');assert.deepEqual(result,expected);
    assert.deepEqual(race,before);assert.deepEqual(result.racers[0].driving,before.racers[0].driving);
    assert.equal(racePrize(result),0);
    const attempt=useGame.getState().raceAttempt;
    useGame.getState().settleRace(attempt,result);useGame.getState().settleRace(attempt,result);
    assert.equal(useGame.getState().money,money);assert.equal(useGame.getState().legendRaceCompleted,true);
    useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'legend-debrief');
    useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');
  }finally{useGame.setState(original);}
});
test('未発進で周回遅れになっても結果を集計できる',()=>{
  const race=nearGoal('leaf'),length=getCircuitTrack().circuitLength;
  race.playerStartOffset=null;
  race.racers=race.racers.map(r=>({...r,driving:{...r.driving,status:r.id==='player'?'ready':'running',distance:r.id==='player'?0:length+1}}));
  const stopped=stepRace(race),result=completeRaceAfterPlayerFinish(stopped);
  assert.equal(canViewRaceResults(stopped),true);assert.equal(result.phase,'finished');
  assert.equal(result.racers[0].driving.stopReason,'lapped');assert.equal(result.playerStartOffset,null);
});
