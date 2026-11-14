import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {createRaceState,type RaceState} from './race';
import {starterEquipment} from '../data/machine';
import {nextShopRace} from '../data/shopHints';
import {legacyCup,emptyCup} from './cup';
import {podiumRows} from './podium';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {OPENING_END,stepOpeningWalk} from './opening';
import {towaEscortLocation} from './towaEscort';
import {townEscortWalks,escortWalk} from './koyaEscort';
import {townVenues,townBlocks,townWalkBounds} from '../data/world';
import {townPeople} from '../data/townPeople';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {hiddenCrafts} from '../data/hiddenCrafts';
import {shopLayout} from '../data/shopLayout';
import {shopCast} from '../data/shopCast';
import {timeBoardObstacle} from '../data/timeBoard';
import {createArrival,stepArrivalActor} from './arrival';
import {canTravel} from './navigation';
const initial=()=>({...useGame.getInitialState(),openingStep:OPENING_END,tutorialStage:'done' as const,koyaEscortStep:6,unlockedRaces:[nextShopRace.id],legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,wakabaCup:legacyCup(true,true,true),wakabaUnlocked:true,thirdOfficialQualified:true,location:'stadium-9' as const,lastShop:'wakaba' as const});
function officialResult(place=1):RaceState{const race=createRaceState(starterEquipment,123,undefined,'official','comet'),ids=race.racers.filter(r=>r.id!=='player').map(r=>r.id);ids.splice(place-1,0,'player');return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map(r=>({...r,driving:{...r.driving,status:'finished',time:100+ids.indexOf(r.id)}}))};}
function yuunagi(){const race=officialResult();return {...initial(),location:'yuunagi' as const,lastShop:'yuunagi' as const,yuunagiUnlocked:true,technicalCup:{entered:true,pending:null,results:[{circuitId:'comet' as const,entries:race.racers.map((r,i)=>({id:r.id,name:r.name,place:i+1,finished:true,time:100+i}))}]}};}
function trial(time:number,status:'finished'|'out'='finished'):RaceState{const r=createRaceState(starterEquipment,123,undefined,false,'trail');return {...r,phase:'finished',playerStartOffset:0,racers:r.racers.map(e=>({...e,driving:{...e.driving,time,status}}))};}
test('公式戦の結果後に実順位の表彰台。保存再開・終了で報酬二重支払いや大会の再出場を起こさない',async()=>{
 const original=useGame.getState();try{for(const place of [1,2,3,4,5]){
  useGame.setState(initial(),true);useGame.getState().startOfficialRace();const attempt=useGame.getState().raceAttempt;useGame.getState().settleRace(attempt,officialResult(place));const money=useGame.getState().money;
  assert.equal(useGame.getState().podiumPending,true);useGame.getState().close();assert.equal(useGame.getState().overlay,'podium');const model=podiumRows(useGame.getState().technicalCup,'technical');assert.equal(model.rows.find(r=>r.id==='player')!.place,place);assert.equal(model.winners.some(r=>r.id==='player'),place<=3);
  const save={version:1,savedAt:123,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().overlay,'podium');assert.equal(useGame.getState().money,money);useGame.getState().close();assert.equal(useGame.getState().overlay,place<=3?'dialogue':'game-over');assert.equal(useGame.getState().podiumPending,false);assert.equal(useGame.getState().money,money);useGame.getState().startOfficialRace();assert.notEqual(useGame.getState().overlay,'race');
 }}finally{useGame.setState(original,true);}
});
test('DNFを表彰台へ乗せず、若葉第1戦と総合表彰の順位を区別する',()=>{
 const race=officialResult(),entries=race.racers.map((r,i)=>({id:r.id,name:r.name,place:i+1,finished:i!==0,time:100+i}));const first={entered:true,pending:null,results:[{circuitId:'sprint' as const,entries}]};assert.equal(podiumRows(first,'wakaba').overall,false);assert.ok(podiumRows(first,'wakaba').winners.every(r=>r.finished));
 const complete={...first,results:[...first.results,{circuitId:'sun' as const,entries}]};assert.equal(podiumRows(complete,'wakaba').overall,true);assert.ok(podiumRows(complete,'wakaba').winners.every(r=>r.finishes>0));
});
test('ゆうなぎ40秒以内の初クリアだけ斗和の迎え。店→街→決勝会場を保存再開し、自動出走しない',async()=>{
 const original=useGame.getState();try{
  for(const [time,status] of [[40.01,'finished'],[39,'out']] as const){useGame.setState(yuunagi(),true);useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,trial(time,status));assert.equal(useGame.getState().towaEscortStep,0);}
  useGame.setState(yuunagi(),true);useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,trial(40));assert.equal(useGame.getState().overlay,'race');assert.equal(useGame.getState().towaEscortStep,1);useGame.getState().close();
  for(let step=1;step<=5;step++){assert.equal(useGame.getState().overlay,'towa-escort');assert.equal(useGame.getState().location,towaEscortLocation(step));const save={version:1,savedAt:123,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().towaEscortStep,step);useGame.getState().close();assert.equal(useGame.getState().overlay,'towa-escort');useGame.getState().advanceTowaEscort(step);useGame.getState().advanceTowaEscort(step);}
  assert.equal(useGame.getState().location,'stadium-10');assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().finalCup.entered,false);
  const old={version:1,savedAt:123,game:snapshotGame(useGame.getState())};delete (old.game as Partial<typeof old.game>).towaEscortStep;delete (old.game as Partial<typeof old.game>).podiumPending;assert.equal(decodeSave(old).game.towaEscortStep,0);assert.equal(decodeSave(old).game.podiumPending,false);
  assert.throws(()=>decodeSave({...old,game:{...old.game,towaEscortStep:4}}));
 }finally{useGame.setState(original,true);}
});
test('既存の出場権を持つセーブも次の規定内クリアで迎え、決勝出場済みなら割り込まない',()=>{
 const original=useGame.getState();try{for(const entered of [false,true]){useGame.setState({...yuunagi(),finalQualified:true,yuunagiBestTime:39,finalCup:{...emptyCup(),entered}},true);useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,trial(39));assert.equal(useGame.getState().towaEscortStep,entered?0:1);}}finally{useGame.setState(original,true);}
});
test('斗和の迎えと退店は家具を避け、街は二人で同じ道を通って緑川会場まで到達する',()=>{
 const cast=shopCast('yuunagi'),obstacles=[...shopLayout('yuunagi').map(({target:f})=>({x:f.x,y:f.y,width:f.w,height:f.h})),...[cast.rival,...cast.visitors].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21})),timeBoardObstacle('yuunagi')],hero={x:480,y:535};
 let actor=createArrival(hero,obstacles,1)[0];for(let i=0;i<2000&&!actor.arrived;i++)actor=stepArrivalActor(actor,hero,40);assert.ok(actor.arrived);let w=escortWalk(actor.position,{x:480,y:581},obstacles);for(let i=0;i<2000&&!w.done;i++)w=stepOpeningWalk(w,40,190);assert.ok(w.done);
 const town=[...[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...[...townPeople,hiddenMechanicSpot,...hiddenCrafts].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];let {player,guide}=townEscortWalks(town,'yuunagi','stadium-10');for(let i=0;i<5000&&(!player.done||!guide.done);i++){const p=player,g=guide;player=stepOpeningWalk(player,40,282);guide=stepOpeningWalk(guide,40,282);assert.ok(canTravel(p.position,player.position,town,townWalkBounds));assert.ok(canTravel(g.position,guide.position,town,townWalkBounds));assert.ok(Math.hypot(player.position.x-guide.position.x,player.position.y-guide.position.y)<=33);}assert.ok(player.done&&guide.done);
});
