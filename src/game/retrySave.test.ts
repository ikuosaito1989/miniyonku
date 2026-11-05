import {test} from 'node:test';
import assert from 'node:assert/strict';
import {useGame} from './store';
import {snapshotGame,decodeSave,type SaveData} from './saveData';
import {loadSavedGame,startAutoSave} from './autoSave';
import {legacyCup,cupProgression} from './cup';
const firstHeat=()=>{const c=legacyCup(true,false);c.results[0].entries=c.results[0].entries.map((e,i)=>({...e,place:i===0?5:i}));return c;};
const qualified=()=>({...useGame.getInitialState(),location:'stadium-5' as const,openingStep:9,tutorialStage:'done' as const,legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:['aozora-entry'],...cupProgression(firstHeat(),useGame.getInitialState().technicalCup,false),money:4321});
test('公式戦前の全状態に戻り、消耗・賞金・記録を巻き戻して再出場できる',()=>{
 const before=useGame.getState();try{
 useGame.setState(qualified(),true);const baseline=snapshotGame(useGame.getState());
 useGame.getState().startOfficialRace();assert.deepEqual(useGame.getState().retryCheckpoint,baseline);
 useGame.setState({money:1,proficiencyPoints:9999});useGame.getState().close();assert.ok(useGame.getState().gameOver);
 useGame.getState().retryFromSave();assert.deepEqual(snapshotGame(useGame.getState()),baseline);assert.equal(useGame.getState().overlay,null);
 useGame.getState().startOfficialRace();assert.equal(useGame.getState().wakabaCup.pending,'sun');
 }finally{useGame.setState(before,true);}
});
test('自動保存と再読み込みを越えて再開データを保持し、第2戦なら第1戦を残す',async()=>{
 const before=useGame.getState();let session:ReturnType<typeof startAutoSave>|undefined;try{
 const cup=firstHeat();useGame.setState({...qualified(),...cupProgression(cup,useGame.getInitialState().technicalCup,false)},true);
 const baseline=snapshotGame(useGame.getState());let saved:SaveData|undefined;
 const storage={read:async()=>saved,write:async(data:SaveData)=>{saved=structuredClone(data);}};
 session=startAutoSave(storage,()=>{});useGame.getState().startOfficialRace();await session.flush();session.stop();
 await loadSavedGame(storage);assert.ok(useGame.getState().gameOver);assert.deepEqual(useGame.getState().retryCheckpoint,baseline);
 session=startAutoSave(storage,()=>{});await session.flush();session.stop();await loadSavedGame(storage);
 useGame.getState().retryFromSave();assert.deepEqual(snapshotGame(useGame.getState()),baseline);
 useGame.getState().startOfficialRace();assert.equal(useGame.getState().wakabaCup.pending,'sun');assert.equal(useGame.getState().wakabaCup.results.length,1);
 }finally{session?.stop();useGame.setState(before,true);}
});
test('古いゲームオーバー保存でも初期化せず直前の公式戦を再挑戦できる',async()=>{
 const before=useGame.getState();try{
 useGame.setState(qualified(),true);useGame.getState().startOfficialRace();useGame.getState().close();const game=snapshotGame(useGame.getState());
 await loadSavedGame({read:async()=>({version:1,savedAt:123,game}),write:async()=>{}});
 assert.equal(useGame.getState().retryCheckpoint,null);useGame.getState().retryFromSave();assert.equal(useGame.getState().gameOver,false);assert.equal(useGame.getState().money,4321);
 useGame.getState().startOfficialRace();assert.equal(useGame.getState().wakabaCup.pending,'sun');
 const cp=snapshotGame(qualified());assert.throws(()=>decodeSave({version:1,savedAt:123,game,checkpoint:{...cp,gameOver:true,wakabaCup:game.wakabaCup}}),/再開用/);
 }finally{useGame.setState(before,true);}
});
