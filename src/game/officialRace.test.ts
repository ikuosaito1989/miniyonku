import test from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {createRaceState,startRace,stepRace,launchPlayer,rankRacers,type RaceState} from './race';
import {starterEquipment,type Equipment} from '../data/machine';
import {nextShopRace} from '../data/shopHints';
import {isVenueOpen,townVenues} from '../data/world';
import {hinataRivals,offroadRival} from '../data/rivals';
import {dialogueChoices,dialoguePerson} from '../data/dialoguePeople';
const prepared:Equipment={...starterEquipment,body:'body-champion',motor:'motor-trail',tire:'tire-trail',chassis:'chassis-trail',accessory:'accessory-damper',rollerFront:'roller-double',rollerSide:'roller-double',rollerRear:'roller-double',gear:'gear-4',battery:'battery-endurance',terminal:'terminal-1'};
function result(official=false,won=true,circuitId:'sun'|'sprint'='sun'):RaceState{
 const race=createRaceState(starterEquipment,123,undefined,official?'official':false,circuitId);
 return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished',time:r.id==='player'&&!won?100:40+i}}))};
}
function initial(){return {...useGame.getInitialState(),location:'hinata' as const,lastShop:'hinata' as const,unlockedRaces:[nextShopRace.id],legendRaceCompleted:true,aozoraWon:true,villainDefeated:true};}
test('ひなたの一位でのみ公式戦の出場権。二重報酬なし、セーブ・旧セーブ・再受付に対応',async()=>{
 const original=useGame.getState();
 try{
  useGame.setState(initial());const venue=townVenues.find(v=>v.id==='stadium-5')!;
  assert.equal(isVenueOpen(venue,useGame.getState()),false);useGame.getState().startOfficialRace();assert.equal(useGame.getState().overlay,null);
  useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result(false,false));assert.equal(useGame.getState().officialQualified,false);
  useGame.getState().close();useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt;useGame.getState().settleRace(attempt,result());const money=useGame.getState().money;useGame.getState().settleRace(attempt,result());assert.equal(useGame.getState().money,money);
  assert.equal(useGame.getState().officialQualified,true);assert.equal(isVenueOpen(venue,useGame.getState()),true);assert.equal(useGame.getState().officialWon,false);
  useGame.getState().close();assert.match(useGame.getState().dialogue,/出場権/);useGame.getState().close();useGame.getState().leaveShop();
  const save=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});
  await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().officialQualified,true);
  useGame.getState().enterOfficialVenue();assert.equal(useGame.getState().location,'stadium-5');useGame.getState().openOfficialRace();assert.equal(useGame.getState().dialogueStage,'official-invite');assert.deepEqual(dialogueChoices(false,false,'official-invite').map(x=>x.action),['officialRace','legendSetting']);
  useGame.getState().openSetting();useGame.getState().close();useGame.getState().openOfficialRace();useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialChallengeActive,true);
  useGame.getState().close();useGame.getState().close();useGame.getState().openOfficialRace();useGame.getState().startOfficialRace();useGame.getState().settleRace(useGame.getState().raceAttempt,result(true,true,'sprint'));assert.equal(useGame.getState().officialWon,false);assert.equal(useGame.getState().officialSpeedWon,true);
  const intermission=decodeSave({version:1,savedAt:124,game:snapshotGame(useGame.getState())});await loadSavedGame({read:async()=>intermission,write:async()=>{}});assert.equal(useGame.getState().officialSpeedWon,true);assert.equal(useGame.getState().officialWon,false);
  useGame.getState().close();useGame.getState().openSetting();useGame.getState().close();useGame.getState().openOfficialRace();useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialRound,'dirt');
  useGame.getState().settleRace(useGame.getState().raceAttempt,result(true));assert.equal(useGame.getState().officialWon,true);
  assert.equal(decodeSave({version:1,savedAt:124,game:snapshotGame(useGame.getState())}).game.officialWon,true);
  const legacy:Record<string,unknown>={...save.game};delete legacy.officialQualified;delete legacy.officialWon;assert.equal(decodeSave({...save,game:legacy}).game.officialQualified,false);
  const oldChampion={...save.game,officialWon:true} as Record<string,unknown>;delete oldChampion.officialSpeedWon;delete oldChampion.officialDirtWon;const migrated=decodeSave({...save,game:oldChampion}).game;assert.equal(migrated.officialDirtWon,true);assert.equal(migrated.officialSpeedWon,false);assert.equal(migrated.officialWon,false);
  assert.throws(()=>decodeSave({...save,game:{...save.game,officialQualified:false,officialWon:true}}));
 }finally{useGame.setState(original,true);}
});
test('ひなたの森野陸は悪路装備。公式戦は本人・黒岩・モブ二人の四台が相手で完走・優勝可能',()=>{
 assert.ok(hinataRivals.some(r=>r.id===offroadRival.id));assert.equal(dialoguePerson(offroadRival.name),'offroader');
 assert.equal(offroadRival.equipment.tire,'tire-trail');assert.equal(offroadRival.equipment.accessory,'accessory-damper');
 for(const seed of [1,7,42,123,999]){
  let race=startRace(createRaceState(prepared,seed,{motorSeconds:60,batterySeconds:0},'official'));
  assert.equal(race.circuitId,'sun');assert.deepEqual(new Set(race.racers.map(r=>r.id)),new Set(['player','riku','go','sou','ren']));
  while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*200&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');assert.equal(rankRacers(race)[0].id,'player');assert.equal(race.racers[0].driving.status,'finished');
 }
});

test('高速舗装とダートは適した装備が異なり、同じ悪路装備で両勝ちはできない',async()=>{
 const {getCircuitTrack}=await import('../data/circuit');const track=getCircuitTrack('sprint');assert.ok(track.circuitLength*5>400);
 let straight=0;for(let i=0;i<200;i++)if(track.sampleCircuit(i*track.circuitLength/200).curvature<.001)straight++;assert.ok(straight>130);
 const road={...prepared,motor:'motor-wind',gear:'gear-3.5',tire:'tire-1',chassis:'chassis-low',accessory:'accessory-support',rollerFront:'roller-0',rollerSide:'roller-0',rollerRear:'roller-0'};
 for(const seed of [1,42,123,999])for(const circuitId of ['sprint','sun'] as const)for(const equipment of [road,prepared]){
  let race=startRace(createRaceState(equipment,seed,{motorSeconds:60,batterySeconds:0},'official',circuitId));while(race.phase==='countdown')race=stepRace(race);race=launchPlayer(race);
  for(let i=0;i<120*240&&race.phase!=='finished';i++)race=stepRace(race);
  assert.equal(race.phase,'finished');assert.equal(rankRacers(race)[0].id==='player',circuitId==='sprint'?equipment===road:equipment===prepared);
 }
});
