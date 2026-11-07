import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {nextShopRace} from '../data/shopHints';
import {createRaceState, type RaceState} from './race';
import {starterEquipment} from '../data/machine';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {dialogueChoices,dialoguePerson} from '../data/dialoguePeople';
import {doctor,doctorGiftBody} from '../data/doctor';
import {doctorDrawing} from './PeopleArt';

function result(legend=false):RaceState{
  const race=createRaceState(starterEquipment,123,undefined,legend);
  return {...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,status:'finished',time:legend&&r.id==='player'?80:40+i}}))};
}
function win(){useGame.getState().startTrial();useGame.getState().settleRace(useGame.getState().raceAttempt,result());}
function invite(){useGame.getState().close();useGame.getState().completeArrival();useGame.getState().advance();}

test('初優勝後にセッティングへ戻っても、兄弟との会話を再開してレースへ進める',()=>{
  const original=useGame.getState();
  try{
    useGame.setState(useGame.getInitialState());win();invite();
    assert.equal(useGame.getState().dialogueStage,'legend-invite');
    assert.equal(dialogueChoices(false,false,'legend-invite')[1].action,'legendSetting');
    useGame.getState().openSetting();useGame.getState().close();
    useGame.getState().openLegendChallenge();
    assert.equal(useGame.getState().overlay,'dialogue');assert.equal(useGame.getState().dialogueStage,'legend-invite');
    useGame.getState().startLegendChallenge();
    assert.equal(useGame.getState().overlay,'race');assert.equal(useGame.getState().legendChallengeActive,true);
    assert.equal(useGame.getState().inventory[doctorGiftBody],undefined);
  }finally{useGame.setState(original);}
});
test('兄弟とのレース後の会話→博士の歩行登場→接触でセイランを1度だけ贈呈',()=>{
  const original=useGame.getState();
  try{
    useGame.setState(useGame.getInitialState());win();invite();useGame.getState().startLegendChallenge();
    useGame.getState().settleRace(useGame.getState().raceAttempt,result(true));
    assert.equal(useGame.getState().legendRaceCompleted,true);assert.equal(useGame.getState().inventory[doctorGiftBody],undefined);
    useGame.getState().close();assert.equal(useGame.getState().dialogueStage,'legend-debrief');
    useGame.getState().close();assert.equal(useGame.getState().overlay,'arrival');assert.equal(useGame.getState().arrivalEvent,'doctor');
    useGame.getState().close();useGame.getState().startLegendChallenge();
    assert.equal(useGame.getState().overlay,'arrival');assert.equal(useGame.getState().inventory[doctorGiftBody],undefined);
    useGame.getState().completeArrival();
    assert.equal(useGame.getState().speaker,doctor.name);assert.equal(useGame.getState().dialogueStage,'doctor-gift');
    assert.equal(useGame.getState().inventory[doctorGiftBody],1);assert.equal(useGame.getState().doctorGiftReceived,true);
    assert.equal(useGame.getState().equipment.body,starterEquipment.body);
    useGame.getState().completeArrival();useGame.getState().close();useGame.getState().beginArrival('doctor');
    assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().inventory[doctorGiftBody],1);
    const game=snapshotGame(useGame.getState());assert.deepEqual(decodeSave({version:1,savedAt:123,game}).game,game);
  }finally{useGame.setState(original);}
});
test('準備中・博士到着前の再読み込みで再開でき、旧所持ボディを重複付与しない',async()=>{
  const original=useGame.getState();
  try{
    useGame.setState({...useGame.getInitialState(),unlockedRaces:[nextShopRace.id]});
    const pending={version:1 as const,savedAt:123,game:snapshotGame(useGame.getState())};
    await loadSavedGame({read:async()=>pending,write:async()=>{}});
    assert.equal(useGame.getState().legendEventPending,true);
    useGame.getState().beginArrival('legend');useGame.getState().completeArrival();useGame.getState().close();useGame.getState().openLegendChallenge();
    assert.equal(useGame.getState().dialogueStage,'legend-invite');
    useGame.setState({overlay:null,legendRaceCompleted:true,inventory:{...useGame.getState().inventory,[doctorGiftBody]:1}});
    const game:Record<string,unknown>={...snapshotGame(useGame.getState())};delete game.doctorGiftReceived;
    await loadSavedGame({read:async()=>({version:1,savedAt:123,game}),write:async()=>{}});
    assert.equal(useGame.getState().doctorGiftReceived,false);
    useGame.getState().beginArrival('doctor');useGame.getState().completeArrival();
    assert.equal(useGame.getState().inventory[doctorGiftBody],1);
  }finally{useGame.setState(original);}
});
test('博士はイベント前に登場せず、専用の大人の歩行姿と会話顔を持つ',()=>{
  const original=useGame.getState();
  try{
    useGame.setState(useGame.getInitialState());useGame.getState().beginArrival('doctor');
    assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().inventory[doctorGiftBody],undefined);
    assert.equal(dialoguePerson(doctor.name),'doctor');
    for(const direction of ['down','up','left','right'] as const){
      assert.ok(doctorDrawing(direction).length>0);assert.notDeepEqual(doctorDrawing(direction,0),doctorDrawing(direction,1));
    }
  }finally{useGame.setState(original);}
});
