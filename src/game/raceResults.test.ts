import {legacyCup,cupProgression} from './cup';
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
    assert.equal(rankRacers(result).at(-1)?.id,'player');assert.equal(racePrize(result),id==='leaf'?250:350);
    assert.equal(completeRaceAfterPlayerFinish(result),result);
  }
});
test('発進前・走行中は結果へのスキップを許可しない',()=>{
  const ready=createRaceState(starterEquipment),running=nearGoal('leaf');
  assert.equal(completeRaceAfterPlayerFinish(ready),ready);
  assert.equal(completeRaceAfterPlayerFinish(startRace(ready)).phase,'countdown');
  assert.equal(completeRaceAfterPlayerFinish(running),running);
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
    useGame.getState().close();useGame.getState().close();useGame.getState().completeArrival();useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');
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
    useGame.getState().close();useGame.getState().completeArrival();useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');
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

test('コースアウト・着地失敗・ループ失速・電池切れから残りCPUを確定して終了できる',()=>{
 for(const reason of [undefined,'jump','loop','battery','lapped'] as const)for(const circuitId of ['leaf','wind'] as const){
  const stopped=nearGoal(circuitId);stopped.racers[0].driving={...stopped.racers[0].driving,status:'out',speed:0,stopReason:reason};
  const snapshot=structuredClone(stopped);let expected=stopped;while(expected.phase==='running')expected=stepRace(expected);
  assert.equal(canViewRaceResults(stopped),true);const result=completeRaceAfterPlayerFinish(stopped);
  assert.deepEqual(result,expected);assert.equal(result.phase,'finished');assert.deepEqual(result.racers[0].driving,snapshot.racers[0].driving);assert.deepEqual(stopped,snapshot);assert.equal(racePrize(result),0);
  assert.equal(completeRaceAfterPlayerFinish(result),result);
 }
});

test('公式戦のコースアウト終了は敗退を確定し、前のセーブから再開できる',()=>{
 const before=useGame.getState();try{
  const wakaba=legacyCup(true,true),technical={entered:true,pending:null,results:[{...wakaba.results[0],circuitId:'comet' as const}]};
  useGame.setState({...useGame.getInitialState(),...cupProgression(wakaba,technical,true),openingStep:9,tutorialStage:'done',location:'town',legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:[nextShopRace.id],yuunagiBestTime:39,finalQualified:true,money:4321},true);
  useGame.getState().enterOfficialVenue('stadium-10');const baseline=snapshotGame(useGame.getState());useGame.getState().startOfficialRace();
  const attempt=useGame.getState().raceAttempt,race=createRaceState(useGame.getState().equipment,42,undefined,'official','grandprix'),length=getCircuitTrack('grandprix').circuitLength;
  race.phase='running';race.playerStartOffset=0;race.time=10;race.racers=race.racers.map(r=>({...r,driving:{...r.driving,status:r.id==='player'?'out':'running',time:10,distance:r.id==='player'?10:length-.01,speed:r.id==='player'?0:2}}));
  const result=completeRaceAfterPlayerFinish(race);assert.equal(result.phase,'finished');assert.equal(racePrize(result),0);useGame.getState().settleRace(attempt,result);useGame.getState().settleRace(attempt,result);
  assert.equal(useGame.getState().gameOver,true);assert.equal(useGame.getState().grandprixCleared,false);assert.equal(useGame.getState().money,4321);assert.equal(useGame.getState().finalCup.results[0].entries.find(e=>e.id==='player')?.finished,false);
  useGame.getState().close();assert.equal(useGame.getState().overlay,'podium');useGame.getState().close();assert.equal(useGame.getState().overlay,'game-over');useGame.getState().retryFromSave();assert.deepEqual(snapshotGame(useGame.getState()),baseline);
 }finally{useGame.setState(before,true);}
});

test('先頭がゴールしたら砂で停止中・未発進でも即座に終了でき、未完走と現在の消耗を確定する',()=>{
 for(const circuitId of ['forge','zenith'] as const)for(const status of ['running','ready'] as const){
  const race=createRaceState(starterEquipment,42,undefined,circuitId==='zenith'?'official':false,circuitId),track=getCircuitTrack(circuitId);
  race.phase='running';race.time=99;race.playerStartOffset=status==='ready'?null:0;
  race.racers=race.racers.map((r,i)=>({...r,driving:{...r.driving,status:i===1?'finished':r.id==='player'?status:'running',time:i===1?87:99,distance:i===1?track.circuitLength:r.id==='player'?100:150+i,speed:0}}));
  const snapshot=structuredClone(race);assert.equal(canViewRaceResults(race),true);const result=completeRaceAfterPlayerFinish(race);
  assert.equal(result.phase,'finished');assert.equal(result.time,99);assert.deepEqual(race,snapshot);assert.deepEqual(result.racers[1],race.racers[1]);
  for(const r of result.racers.filter(r=>r.id!==race.racers[1].id)){assert.equal(r.driving.status,'out');assert.equal(r.driving.stopReason,'retired');assert.equal(r.driving.time,99);assert.equal(r.driving.distance,race.racers.find(old=>old.id===r.id)!.driving.distance);}
  assert.equal(rankRacers(result)[0].id,race.racers[1].id);assert.equal(racePrize(result),0);assert.equal(completeRaceAfterPlayerFinish(result),result);
 }
});
