import {test} from 'node:test';
import assert from 'node:assert/strict';
import {getCircuitTrack} from '../data/circuit';
import {starterEquipment} from '../data/machine';
import {canEnterShop} from '../data/world';
import {createRaceState,startRace,stepRace,launchPlayer} from './race';
import {useGame} from './store';
import {legacyCup,emptyCup,enterCupHeat,forfeitCupHeat,cupProgression} from './cup';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {currentMission} from './mission';
function technical(place=1){const cup=forfeitCupHeat(enterCupHeat(emptyCup(),'comet','technical'));cup.results[0].entries=cup.results[0].entries.map((e,i)=>({...e,finished:true,place:e.id==='player'?place:i<place-1?i+1:i+2,time:e.id==='player'?120:121+i}));return cup;}
function advanced(){return {...useGame.getInitialState(),...cupProgression(legacyCup(true,true),technical(),true),legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:['aozora-entry'],location:'town' as const};}
function result(time:number,offset=0,penalty=0,finished=true){const race=createRaceState(starterEquipment,42,undefined,false,'trail');return {...race,phase:'finished' as const,playerStartOffset:offset,falseStartPenalty:penalty,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:finished?'finished' as const:'out' as const,time,distance:finished?getCircuitTrack('trail').circuitLength:20}}))};}
test('第3公式大会を3位以内でクリアしたときだけ次の模型店へ進む。旧クリアセーブも開放',async()=>{
 const previous=useGame.getState();try{
  assert.equal(canEnterShop('yuunagi',useGame.getInitialState()),false);
  for(const place of [1,2,3,4,5]){const progress=cupProgression(legacyCup(true,true),technical(place),true);assert.equal(progress.yuunagiUnlocked,place<=3);}
  useGame.setState(advanced());assert.equal(currentMission(useGame.getState()).id,'yuunagi');
  const legacy:Record<string,unknown>=snapshotGame(useGame.getState());delete legacy.yuunagiUnlocked;delete legacy.yuunagiBestTime;delete legacy.finalQualified;
  await loadSavedGame({read:async()=>({version:1,savedAt:123,game:legacy}),write:async()=>{}});
  assert.equal(useGame.getState().yuunagiUnlocked,true);useGame.getState().enterShop('yuunagi');assert.equal(useGame.getState().location,'yuunagi');
 }finally{useGame.setState(previous,true);}
});
test('規定タイムは40秒以内の完走。反応・フライング加算、再挑戦、ベスト、保存を一貫して判定',async()=>{
 const previous=useGame.getState();try{
  useGame.setState({...advanced(),location:'yuunagi',lastShop:'yuunagi'});
  for(const race of [result(40.001),result(39,1.1),result(39,0,1.1),result(30,0,0,false)]){
   useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,race);assert.equal(useGame.getState().finalQualified,false);useGame.getState().close();
  }
  useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt;useGame.getState().settleRace(attempt,result(40));
  assert.equal(useGame.getState().finalQualified,true);assert.equal(useGame.getState().yuunagiBestTime,40);assert.equal(currentMission(useGame.getState()).id,'complete');
  const money=useGame.getState().money;useGame.getState().settleRace(attempt,result(40));assert.equal(useGame.getState().money,money);
  useGame.getState().close();useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result(50));assert.equal(useGame.getState().yuunagiBestTime,40);assert.equal(useGame.getState().finalQualified,true);
  const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>save,write:async()=>{}});
  assert.equal(useGame.getState().location,'yuunagi');assert.equal(useGame.getState().finalQualified,true);assert.equal(useGame.getState().yuunagiBestTime,40);
  const forged={...snapshotGame(advanced()),finalQualified:true,yuunagiUnlocked:true};assert.equal(decodeSave({version:1,savedAt:123,game:forged}).game.finalQualified,false);
 }finally{useGame.setState(previous,true);}
});
test('一本道は別のゴールへ1回だけ走り、スパイラルと物理ジャンプを備え、旧装備では40秒を超えるロングコース',()=>{
 const track=getCircuitTrack('trail'),start=track.sampleLanePath(0,2),end=track.sampleLanePath(track.circuitLength,2);
 assert.ok(track.circuitLength>170&&track.circuitLength<175);assert.ok(track.open);assert.equal(track.circuit.laps,1);assert.ok(Math.hypot(end.x-start.x,end.z-start.z)>25);assert.equal(end.y,0);
 assert.equal(track.sampleLanePath(track.circuitLength*.5,2).changing,false);
 for(const lane of [0,1,2,3,4])for(let i=0;i<=1200;i++){const p=track.sampleLanePath(i/1200*track.circuitLength,lane);for(const value of [p.x,p.y,p.z,p.tangentX,p.tangentZ,p.curvature,p.pathScale])assert.ok(Number.isFinite(value));assert.ok(p.pathScale>.1);}
 assert.ok(track.obstacles);assert.ok(track.isJumpGap(track.obstacles.jump.takeoff+.1));
 const equipment={...starterEquipment,body:'body-champion',motor:'motor-torque',gear:'gear-4',tire:'tire-1',chassis:'chassis-low',wheel:'wheel-light',rollerFront:'roller-1',rollerRear:'roller-1',accessory:'accessory-weight',accessory2:'accessory-support',accessory3:'accessory-damper-light',battery:'battery-endurance',terminal:'terminal-1'};
 for(const seed of [1,42,999]){
  let race=startRace(createRaceState(equipment,seed,{motorSeconds:60,batterySeconds:0},false,'trail'));assert.equal(race.racers.length,1);assert.equal(race.racers[0].lane,2);
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);for(let i=0;i<120*100&&race.phase!=='finished';i++)race=stepRace(race);
  const player=race.racers[0];assert.equal(player.driving.status,'finished');assert.equal(player.driving.landings,1);assert.ok(player.driving.time>40);
 }
});
