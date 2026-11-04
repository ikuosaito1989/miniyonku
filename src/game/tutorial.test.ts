import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {OPENING_END} from './opening';
import {TUTORIAL_PART} from './tutorial';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {createRaceState,startRace,launchPlayer,stepRace} from './race';
import {parts} from '../data/parts';
const initial=()=>({...useGame.getInitialState(),openingStep:OPENING_END});
function doPurchase(){useGame.getState().inspectTutorial('motor');useGame.getState().inspectTutorial('tire');useGame.getState().openTutorialShop();useGame.getState().buy(TUTORIAL_PART);}

test('導入から部位の説明→実購入→手動装着→通常レース→完了まで実操作で進む',()=>{
 const original=useGame.getState();try{
  useGame.setState(initial());const money=useGame.getState().money,price=parts.find(p=>p.id===TUTORIAL_PART)!.price;
  useGame.getState().startTutorial();assert.equal(useGame.getState().tutorialStage,'motor');useGame.getState().inspectTutorial('body');assert.equal(useGame.getState().tutorialStage,'motor');
  doPurchase();assert.equal(useGame.getState().tutorialStage,'equip');assert.equal(useGame.getState().money,money-price);assert.equal(useGame.getState().equipment.gear,'gear-5');assert.equal(useGame.getState().overlay,'setting');
  useGame.getState().equip(TUTORIAL_PART,'gear');assert.equal(useGame.getState().tutorialStage,'start');useGame.getState().startTrial();assert.equal(useGame.getState().tutorialStage,'racing');
  const attempt=useGame.getState().raceAttempt;let race=launchPlayer(startRace(createRaceState(useGame.getState().equipment,42)));useGame.getState().settleRace(attempt,race);assert.equal(useGame.getState().tutorialStage,'racing');
  for(let i=0;i<120*240&&race.phase!=='finished';i++)race=stepRace(race);assert.equal(race.phase,'finished');useGame.getState().settleRace(attempt,race);assert.equal(useGame.getState().tutorialStage,'result');const after=useGame.getState().money;useGame.getState().settleRace(attempt,race);assert.equal(useGame.getState().money,after);
  useGame.getState().finishTutorial();assert.equal(useGame.getState().tutorialStage,'done');assert.equal(useGame.getState().equipment.gear,TUTORIAL_PART);
 }finally{useGame.setState(original,true);}
});
test('練習の購入・消耗・進行は保存されず、終了すると本編の全データを復元する',()=>{
 const original=useGame.getState();try{
  useGame.setState({...initial(),tutorialStage:'done',location:'town',money:12345});const before=snapshotGame(useGame.getState());
  useGame.getState().startTutorial(true);assert.equal(useGame.getState().money,2000);doPurchase();useGame.getState().equip(TUTORIAL_PART,'gear');useGame.getState().startTrial();assert.deepEqual(snapshotGame(useGame.getState()),before);
  useGame.getState().finishTutorial();assert.equal(useGame.getState().overlay,'settings');assert.deepEqual(snapshotGame(useGame.getState()),before);assert.equal(useGame.getState().tutorialReturn,null);
 }finally{useGame.setState(original,true);}
});
test('説明・購入・装着・初レースの段階を保存し、レース中断後は再出場の案内から再開する',async()=>{
 const original=useGame.getState();try{
  useGame.setState(initial());useGame.getState().startTutorial();doPurchase();const data={version:1,savedAt:100,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>data,write:async()=>{}});useGame.getState().resumeTutorial();assert.equal(useGame.getState().tutorialStage,'equip');assert.equal(useGame.getState().overlay,'setting');
  useGame.getState().equip(TUTORIAL_PART,'gear');useGame.getState().startTrial();const raceSave={version:1,savedAt:100,game:snapshotGame(useGame.getState())};await loadSavedGame({read:async()=>raceSave,write:async()=>{}});assert.equal(useGame.getState().tutorialStage,'start');assert.equal(useGame.getState().overlay,null);
  const legacy=structuredClone(data) as {version:number;savedAt:number;game:Record<string,unknown>};delete legacy.game.tutorialStage;assert.equal(decodeSave(legacy).game.tutorialStage,'done');legacy.game.openingStep=0;assert.equal(decodeSave(legacy).game.tutorialStage,'pending');legacy.game.tutorialStage='invalid';assert.throws(()=>decodeSave(legacy));
 }finally{useGame.setState(original,true);}
});

test('初レースで優勝しても、チュートリアル完了までは兄弟の登場イベントを待たせる',()=>{
 const original=useGame.getState();try{
  useGame.setState({...initial(),tutorialStage:'result',overlay:'race',legendEventPending:true});useGame.getState().close();assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().legendEventPending,true);useGame.getState().finishTutorial();assert.equal(useGame.getState().tutorialStage,'done');assert.equal(useGame.getState().legendEventPending,true);
 }finally{useGame.setState(original,true);}
});
