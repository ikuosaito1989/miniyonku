import {nextShopRace} from '../data/shopHints';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {recordOpponentUnlocked} from './raceOpponents';
import {onlineCircuits,type OnlineRecord} from './onlineRecords';
import {starterEquipment} from '../data/machine';
import {raceRulesVersion} from './timeRecords';
import {createRaceState} from './race';
import {withMobRivals} from './mobRace';
import {getCircuitTrack,type CircuitId} from '../data/circuit';
import {snapshotGame} from './saveData';
import {loadSavedGame} from './autoSave';
const records=(id:CircuitId):OnlineRecord[]=>[0,1,2,3].map((i)=>({playerId:String(i).repeat(64),displayName:`記録保持者${i+1}`,recordedAt:'2026-11-08T00:00:00Z',circuitId:id,rulesVersion:raceRulesVersion,time:20+i,equipment:{...starterEquipment},condition:{motorSeconds:60,batterySeconds:0}}));
const ready=()=>({...useGame.getInitialState(),openingActive:false,openingStep:9,tutorialStage:'done' as const});

test('ストーリー10コースの記録対戦は最終クリア後、屋外10コースは初めから解放する',()=>{
 assert.equal(onlineCircuits.length,20);assert.equal(onlineCircuits.filter(id=>recordOpponentUnlocked(id,false)).length,10);
 for(const id of onlineCircuits)assert.equal(recordOpponentUnlocked(id,true),true);
 const before=useGame.getState();try{
  for(const cleared of [false,true])for(const location of ['komorebi','yuunagi','stadium-7'] as const){
   const id=location==='komorebi'?'leaf':location==='yuunagi'?'trail':'zenith';useGame.setState({...ready(),location,zenithCleared:cleared,overlay:'time-board',timeBoardCircuit:id},true);
   const attempt=useGame.getState().raceAttempt;useGame.getState().startOnlineTrial(id,records(id));assert.equal(useGame.getState().overlay,cleared?'race':'time-board');assert.equal(useGame.getState().raceAttempt,attempt+(cleared?1:0));
  }
  useGame.setState({...ready(),location:'town',overlay:'time-board',timeBoardCircuit:'park-sand'},true);useGame.getState().startOnlineTrial('park-sand',records('park-sand'));assert.equal(useGame.getState().onlineChallenge?.circuitId,'park-sand');
 }finally{useGame.setState(before,true);}
});
test('相手選択の取消は何も消費せず、記録なし・別コース・進行前の開始も拒否する',()=>{
 const before=useGame.getState();try{
  useGame.setState({...ready(),location:'town'},true);const saved=snapshotGame(useGame.getState()),attempt=useGame.getState().raceAttempt;
  useGame.getState().openRaceChoice('park-sand');assert.equal(useGame.getState().overlay,'race-opponents');useGame.getState().startOnlineTrial('park-sand',[]);assert.equal(useGame.getState().overlay,'race-opponents');
  useGame.getState().startMobTrial('park-gravel');assert.equal(useGame.getState().overlay,'race-opponents');useGame.getState().close();assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().raceAttempt,attempt);assert.deepEqual(snapshotGame(useGame.getState()),saved);
  useGame.setState({...ready(),location:'komorebi',overlay:'race-opponents',raceChoiceCircuit:'leaf'},true);useGame.getState().startOnlineTrial('leaf',records('leaf'));useGame.getState().startMobTrial('leaf');assert.equal(useGame.getState().overlay,'race-opponents');
  useGame.setState({...ready(),location:'komorebi',zenithCleared:true,overlay:'time-board'},true);useGame.getState().startOnlineTrial('zenith',records('zenith'));assert.equal(useGame.getState().overlay,'time-board');
 }finally{useGame.setState(before,true);}
});
test('モブ対戦は通常の賞金を維持し、クリア後の公式会場では進行・報酬を変更しない',async()=>{
 const before=useGame.getState();try{
  useGame.setState({...ready(),location:'town'},true);useGame.getState().openRaceChoice('park-sand');useGame.getState().startMobTrial('park-sand');assert.equal(useGame.getState().outdoorCourse,'park-sand');assert.equal(useGame.getState().mobChallenge,null);useGame.getState().close();assert.equal(useGame.getState().overlay,null);
  useGame.setState({...ready(),location:'stadium-5',zenithCleared:true,officialQualified:true,legendRaceCompleted:true,unlockedRaces:[nextShopRace.id],aozoraWon:true,villainDefeated:true,money:1234,proficiencyPoints:100},true);useGame.getState().openRaceChoice('sprint');useGame.getState().startMobTrial('sprint');assert.equal(useGame.getState().mobChallenge,'sprint');
  const initial=useGame.getState(),attempt=initial.raceAttempt,selected=initial.selectedUnits.motor,seconds=initial.units[initial.equipment.motor].find(u=>u.id===selected)!.seconds;
  const race=withMobRivals(createRaceState(initial.equipment,42,undefined,false,'sprint'));const done={...race,phase:'finished' as const,playerStartOffset:0,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:'finished' as const,time:10,distance:getCircuitTrack('sprint').circuitLength*5}}))};
  useGame.getState().settleRace(attempt,done);useGame.getState().settleRace(attempt,done);const after=useGame.getState();assert.equal(after.money,1234);assert.equal(after.proficiencyPoints,100);assert.equal(after.akatsukiRaceCount,initial.akatsukiRaceCount);assert.deepEqual(after.zenithCup,initial.zenithCup);assert.equal(after.units[after.equipment.motor].find(u=>u.id===selected)!.seconds,seconds+10);assert.ok(after.timeHistory.sprint?.length);
  const save={version:1,savedAt:1,game:snapshotGame(after)};assert.ok(!('mobChallenge' in save.game));await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().mobChallenge,null);assert.equal(useGame.getState().raceChoiceCircuit,null);
 }finally{useGame.setState(before,true);}
});
test('1台専用だったコースもモブ4台と走れ、公式ソロは選択画面から引き続き開始できる',()=>{
 for(const id of onlineCircuits){const race=withMobRivals(createRaceState(starterEquipment,42,undefined,false,id));assert.equal(race.racers.length,5,id);assert.equal(race.racers[0].id,'player');assert.equal(new Set(race.racers.map(r=>r.id)).size,5);assert.ok(race.racers.slice(1).every(r=>r.id.startsWith('mob-')));}
 const before=useGame.getState();try{useGame.setState({...ready(),location:'stadium-5',zenithCleared:true,officialQualified:true},true);useGame.getState().openOfficialRace('speed');assert.equal(useGame.getState().overlay,'race-opponents');assert.equal(useGame.getState().raceChoiceCircuit,'sprint');useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialReplayActive,true);assert.equal(useGame.getState().raceChoiceCircuit,null);useGame.getState().close();useGame.getState().openTimeBoard('sun');useGame.getState().openRaceChoice('sun');useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialRound,'dirt');}finally{useGame.setState(before,true);}
});

test('通常の模型店でモブを選んでも従来の賞金・熟練度を受け取れる',()=>{
 const before=useGame.getState();try{useGame.setState({...ready(),location:'komorebi',zenithCleared:true,money:1234,proficiencyPoints:100,legendRaceCompleted:true,unlockedRaces:[nextShopRace.id]},true);useGame.getState().openRaceChoice('leaf');useGame.getState().startMobTrial('leaf');const s=useGame.getState(),race=withMobRivals(createRaceState(s.equipment));const done={...race,phase:'finished' as const,playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished' as const,time:10+i,distance:getCircuitTrack('leaf').circuitLength*5}}))};useGame.getState().settleRace(s.raceAttempt,done);assert.ok(useGame.getState().money>1234);assert.ok(useGame.getState().proficiencyPoints>100);assert.equal(useGame.getState().gameOver,false);}finally{useGame.setState(before,true);}
});
