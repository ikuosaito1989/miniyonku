import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {createRaceState,type RaceState} from './race';
import {nextShopRace} from '../data/shopHints';
import {starterEquipment} from '../data/machine';
import {legacyCup,emptyCup} from './cup';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {OPENING_END,stepOpeningWalk} from './opening';
import {koyaEscortLocation,koyaEscortSpawn,townEscortWalks,escortWalk} from './koyaEscort';
import {townBlocks,townVenues,townWalkBounds} from '../data/world';
import {townPeople} from '../data/townPeople';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {hiddenCrafts} from '../data/hiddenCrafts';
import {shopCast} from '../data/shopCast';
import {shopLayout} from '../data/shopLayout';
import {timeBoardObstacle} from '../data/timeBoard';
import {canTravel} from './navigation';
import {createArrival,stepArrivalActor} from './arrival';
const initial=()=>({...useGame.getInitialState(),openingStep:OPENING_END,tutorialStage:'done' as const,location:'wakaba' as const,lastShop:'wakaba' as const,unlockedRaces:[nextShopRace.id],legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,wakabaCup:legacyCup(true,true,true),wakabaUnlocked:true,thirdOfficialQualified:true});
function result(place=1):RaceState{const race=createRaceState(starterEquipment,123,undefined,false,'grove');const ids=race.racers.filter(r=>r.id!=='player').map(r=>r.id);ids.splice(place-1,0,'player');return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:'finished',distance:999,time:50+ids.indexOf(r.id)}}))};}
test('わかば優勝後に4位の昊也が迎え、街を歩いて星空会場へ。出走や追加報酬は発生しない',()=>{
 const original=useGame.getState();try{
  useGame.setState(initial(),true);useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt;useGame.getState().settleRace(attempt,result());
  assert.equal(useGame.getState().overlay,'race');assert.equal(useGame.getState().koyaEscortStep,1);const money=useGame.getState().money;useGame.getState().settleRace(attempt,result());assert.equal(useGame.getState().money,money);
  useGame.getState().close();assert.equal(useGame.getState().overlay,'escort');
  for(let step=1;step<=5;step++){
   const state=useGame.getState();assert.equal(state.koyaEscortStep,step);assert.equal(state.location,koyaEscortLocation(step));
   state.close();state.openSetting();state.openSettings();state.leaveShop();state.enterShop('komorebi');state.startTrial();assert.equal(useGame.getState().overlay,'escort');assert.equal(useGame.getState().raceAttempt,attempt);
   state.advanceKoyaEscort(step);useGame.getState().advanceKoyaEscort(step);assert.equal(useGame.getState().koyaEscortStep,step+1);
  }
  assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().location,'stadium-9');assert.equal(useGame.getState().technicalCup.entered,false);assert.equal(useGame.getState().money,money);
  useGame.getState().startOfficialRace();assert.equal(useGame.getState().technicalCup.pending,'comet');
 }finally{useGame.setState(original,true);}
});
test('負け・演出終了後の再優勝・第3大会出場済みでは迎えを再発生させない',()=>{
 const original=useGame.getState();try{for(const [place,step,entered] of [[2,0,false],[1,6,false],[1,0,true]] as const){useGame.setState({...initial(),koyaEscortStep:step,technicalCup:{...emptyCup(),entered}},true);useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result(place));assert.equal(useGame.getState().koyaEscortStep,step);}}finally{useGame.setState(original,true);}
});
test('迎え・会話・同行・到着の途中を保存して再開。旧セーブに強制せず、不正な段階を拒否',async()=>{
 const original=useGame.getState();try{
  for(let step=1;step<=6;step++){useGame.setState({...initial(),koyaEscortStep:step,location:koyaEscortLocation(step)},true);const data={version:1,savedAt:123,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>data,write:async()=>{}});assert.equal(useGame.getState().koyaEscortStep,step);assert.equal(useGame.getState().overlay,step===6?null:'escort');assert.equal(useGame.getState().technicalCup.entered,false);}
  const data={version:1,savedAt:123,game:snapshotGame(initial())};delete (data.game as Partial<typeof data.game>).koyaEscortStep;assert.equal(decodeSave(data).game.koyaEscortStep,0);
  for(const step of [-1,.5,7,NaN])assert.throws(()=>decodeSave({...data,game:{...data.game,koyaEscortStep:step}}));
  assert.throws(()=>decodeSave({...data,game:{...data.game,koyaEscortStep:4}}));
 }finally{useGame.setState(original,true);}
});
test('模型店は家具・人を避けて迎えと退店。街では共通経路で昊也と離れず会場玄関へ歩く',()=>{
 const cast=shopCast('wakaba'),obstacles=[...shopLayout('wakaba').map(({target:f})=>({x:f.x,y:f.y,width:f.w,height:f.h})),...[cast.rival,...cast.visitors].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21})),timeBoardObstacle('wakaba')];
 const hero=koyaEscortSpawn(1);let arrival=createArrival(hero,obstacles,1)[0];for(let i=0;i<2000&&!arrival.arrived;i++){const before=arrival;arrival=stepArrivalActor(arrival,hero,40);assert.ok(canTravel(before.position,arrival.position,obstacles));}assert.ok(arrival.arrived);
 for(const [from,to] of [[hero,{x:480,y:557}],[arrival.position,{x:480,y:581}]] as const){let w=escortWalk(from,to,obstacles);for(let i=0;i<2000&&!w.done;i++){const before=w;w=stepOpeningWalk(w,40,190);assert.ok(canTravel(before.position,w.position,obstacles));}assert.ok(w.done);}
 const townObstacles=[...[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...[...townPeople,hiddenMechanicSpot,...hiddenCrafts].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
 let {player,guide}=townEscortWalks(townObstacles),frames=0;
 while((!player.done||!guide.done)&&frames++<5000){const before=player,oldGuide=guide;player=stepOpeningWalk(player,40,282);guide=stepOpeningWalk(guide,40,282);assert.ok(canTravel(before.position,player.position,townObstacles,townWalkBounds));assert.ok(canTravel(oldGuide.position,guide.position,townObstacles,townWalkBounds));assert.ok(Math.hypot(player.position.x-guide.position.x,player.position.y-guide.position.y)<=33);}
 assert.ok(player.done&&guide.done);assert.ok(frames>20);
});
