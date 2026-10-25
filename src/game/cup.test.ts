import test from 'node:test';import assert from 'node:assert/strict';
import {useGame} from './store';import {createRaceState,type RaceState} from './race';import {starterEquipment} from '../data/machine';import {nextShopRace} from '../data/shopHints';import {snapshotGame,decodeSave} from './saveData';import {loadSavedGame,startAutoSave} from './autoSave';import {cupStandings,cupPlayerPlace,cupComplete} from './cup';import type {CircuitId} from '../data/circuit';
const initial=()=>({...useGame.getInitialState(),location:'stadium-5' as const,lastShop:'hinata' as const,legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:[nextShopRace.id]});
function result(id:CircuitId,place:number,official=true):RaceState{
 const r=createRaceState(starterEquipment,123,undefined,official?'official':false,id),ids=['riku','go','sou','ren'];ids.splice(place-1,0,'player');
 return {...r,phase:'finished',playerStartOffset:0,racers:r.racers.map(e=>({...e,driving:{...e.driving,status:'finished',distance:999,time:100+ids.indexOf(e.id)}}))};
}
function heat(id:'sprint'|'sun'|'comet',place:number){const s=useGame.getState();s.startOfficialRace();assert.equal(useGame.getState().overlay,'race');const attempt=useGame.getState().raceAttempt;s.settleRace(attempt,result(id,place));const count=useGame.getState().wakabaCup.results.length;const money=useGame.getState().money;s.settleRace(attempt,result(id,place));assert.equal(useGame.getState().wakabaCup.results.length,count);assert.equal(useGame.getState().money,money);s.close();}
test('一度限りの2戦総合：1位は第3出場権、2・3位は新店、4・5位はゲームオーバー。終了後の再エントリーを拒否',()=>{
 const original=useGame.getState();try{for(const place of [1,2,3,4,5]){
  useGame.setState(initial(),true);heat('sprint',place);assert.equal(useGame.getState().gameOver,false);assert.equal(useGame.getState().wakabaCup.results.length,1);useGame.getState().close();heat('sun',place);
  const s=useGame.getState();assert.equal(cupPlayerPlace(s.wakabaCup),place);assert.equal(s.officialWon,place===1);assert.equal(s.thirdOfficialQualified,place===1);assert.equal(s.wakabaUnlocked,place<=3);assert.equal(s.gameOver,place>3);assert.equal(s.overlay,place>3?'game-over':'dialogue');
  const attempt=s.raceAttempt;s.startOfficialRace();assert.equal(useGame.getState().raceAttempt,attempt);assert.equal(cupComplete(s.wakabaCup,'wakaba'),true);
  const decoded=decodeSave({version:1,savedAt:123,game:snapshotGame(s)}).game;assert.equal(decoded.gameOver,place>3);assert.equal(decoded.wakabaUnlocked,place<=3);
 }}finally{useGame.setState(original,true);}
});
test('入賞で次店に入れ、その店の優勝でも第3公式大会を解放。第3は約2分のコーナーコースで一度だけ',()=>{
 const original=useGame.getState();try{
  useGame.setState(initial(),true);heat('sprint',2);useGame.getState().close();heat('sun',2);useGame.getState().close();useGame.getState().leaveShop();useGame.getState().enterOfficialVenue('stadium-9');assert.equal(useGame.getState().location,'town');
  useGame.getState().enterShop('wakaba');assert.equal(useGame.getState().location,'wakaba');useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result('grove',1,false));assert.equal(useGame.getState().thirdOfficialQualified,true);useGame.getState().close();useGame.getState().leaveShop();useGame.getState().enterOfficialVenue('stadium-9');assert.equal(useGame.getState().location,'stadium-9');heat('comet',2);assert.equal(useGame.getState().gameOver,false);assert.equal(cupPlayerPlace(useGame.getState().technicalCup),2);const attempt=useGame.getState().raceAttempt;useGame.getState().startOfficialRace();assert.equal(useGame.getState().raceAttempt,attempt);
 }finally{useGame.setState(original,true);}
});
test('再読込は出場中のレースを棄権にして記録し、前の戦に戻れない。両棄権のゲームオーバーも再読込で保持',async()=>{
 const original=useGame.getState();try{
  useGame.setState(initial(),true);useGame.getState().startOfficialRace();let save={version:1,savedAt:123,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>save,write:async()=>{}});
  assert.equal(useGame.getState().wakabaCup.results.length,1);assert.equal(useGame.getState().wakabaCup.results[0].entries.find(e=>e.id==='player')!.finished,false);useGame.getState().openOfficialRace('speed');assert.equal(useGame.getState().dialogueStage,'none');useGame.getState().close();useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialRound,'dirt');useGame.getState().close();assert.equal(useGame.getState().gameOver,true);
  save={version:1,savedAt:124,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().overlay,'game-over');const attempt=useGame.getState().raceAttempt;useGame.getState().startTrial();useGame.getState().startOfficialRace();assert.equal(useGame.getState().raceAttempt,attempt);
 }finally{useGame.setState(original,true);}
});
test('出場記録は1秒の消耗チェックポイントを待たず即時保存し、破損した二重出場記録を拒否',async()=>{
 const original=useGame.getState();useGame.setState(initial(),true);const writes:unknown[]=[];const autosave=startAutoSave({read:async()=>undefined,write:async d=>{writes.push(d);}},()=>{});try{
  useGame.getState().startOfficialRace();await new Promise(r=>setTimeout(r,0));assert.ok(writes.length>0);const data=decodeSave(writes.at(-1));assert.equal(data.game.wakabaCup.pending,'sprint');assert.throws(()=>decodeSave({...data,game:{...data.game,wakabaCup:{...data.game.wakabaCup,results:[{circuitId:'sun',entries:[]}]}}}));
 }finally{autosave.stop();useGame.setState(original,true);}
});
test('得点同点は完走数・合計タイムで決める',()=>{
 const entries=result('sprint',1).racers.map((r,i)=>({id:r.id,name:r.name,place:i+1,finished:true,time:100+i}));const reversed=entries.map(e=>({...e,place:6-e.place,time:e.id==='player'?200:100}));const standings=cupStandings({entered:true,pending:null,results:[{circuitId:'sprint',entries},{circuitId:'sun',entries:reversed}]});assert.equal(standings.length,5);assert.ok(standings.every(e=>e.points>0));assert.equal(standings[0].id,'ren');assert.equal(standings[1].id,'player');
 const first=entries.map(e=>({...e,place:e.id==='riku'?1:e.id==='go'?2:e.id==='player'?3:e.place}));const second=entries.map(e=>({...e,place:e.id==='go'?1:e.id==='player'?2:e.id==='sou'?3:e.id==='ren'?4:5,finished:e.id!=='riku',time:e.id==='player'?500:10}));const byFinishes=cupStandings({entered:true,pending:null,results:[{circuitId:'sprint',entries:first},{circuitId:'sun',entries:second}]});assert.ok(byFinishes.findIndex(e=>e.id==='player')<byFinishes.findIndex(e=>e.id==='riku'));
});
