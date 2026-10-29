import {cupProgression,forfeitCupHeat} from './cup';
import type { StoreApi } from 'zustand';
import { useGame, type GameState } from './store';
import { decodeSave, snapshotGame, type SavedGame } from './saveData';
import type { SaveStorage } from './saveStorage';
import { nextShopRace } from '../data/shopHints';

export type SaveStatus={phase:'loading'|'saving'|'saved'|'error'|'temporary';savedAt:number|null;message:string};
export async function loadSavedGame(storage:SaveStorage,store:StoreApi<GameState>=useGame){
  const raw=await storage.read();
  if(raw===undefined){store.setState({...store.getInitialState(),location:'town',lastShop:'komorebi'});return null;}
  const data=decodeSave(raw);
  const progression=cupProgression(forfeitCupHeat(data.game.wakabaCup),forfeitCupHeat(data.game.technicalCup),data.game.thirdOfficialQualified,forfeitCupHeat(data.game.finalCup),forfeitCupHeat(data.game.zenithCup));
  // UIや途中レースは再開せず、保存した店の入口／街の店前から復帰する。
  store.setState({...store.getInitialState(),...data.game,...progression,...(progression.gameOver?{overlay:'game-over' as const}:{}),legendEventPending:data.game.unlockedRaces.includes(nextShopRace.id)&&!data.game.legendRaceCompleted,villainArrivalPending:data.game.aozoraWon&&!data.game.villainDefeated});
  return data.savedAt;
}
export function startAutoSave(storage:SaveStorage,status:(status:SaveStatus)=>void,store:StoreApi<GameState>=useGame){
  let lastSignature=JSON.stringify(snapshotGame(store.getState()));
  let pending:SavedGame|null=null,running:Promise<void>|null=null;
  let timer:ReturnType<typeof setTimeout>|null=null,stopped=false;
  let lastSaved:number|null=null;
  function drain():Promise<void>{
    if(running)return running;
    running=(async()=>{
      while(pending){
        const game=pending;pending=null;
        status({phase:'saving',savedAt:lastSaved,message:'保存中…'});
        try{
          const data=decodeSave({version:1,savedAt:Date.now(),game});
          await storage.write(data);lastSaved=data.savedAt;
          status({phase:'saved',savedAt:lastSaved,message:'自動セーブ済み'});
        }catch(error){
          pending??=game;
          status({phase:'error',savedAt:lastSaved,message:`保存できませんでした。${error instanceof Error?error.message:'空き容量やブラウザ設定を確認してください。'}`});
          throw error;
        }
      }
    })().finally(()=>{running=null;});
    return running;
  }
  function flush(){
    if(stopped)return Promise.resolve();
    if(timer){clearTimeout(timer);timer=null;}
    pending=snapshotGame(store.getState());
    return drain();
  }
  const unsubscribe=store.subscribe((state,previous)=>{
    const signature=JSON.stringify(snapshotGame(state));
    const leavingRace=previous.overlay==='race'&&state.overlay!=='race';
    if(signature===lastSignature&&!leavingRace)return;
    lastSignature=signature;
    const officialEntry=state.wakabaCup.pending!==previous.wakabaCup.pending||state.technicalCup.pending!==previous.technicalCup.pending||state.finalCup.pending!==previous.finalCup.pending||state.zenithCup.pending!==previous.zenithCup.pending;
    if(officialEntry){void flush().catch(()=>{});return;}
    if(state.overlay==='race'&&state.settledAttempt!==state.raceAttempt){
      // 毎フレーム書かず、走行中の消耗だけは1秒ごとにチェックポイント保存。
      if(!timer)timer=setTimeout(()=>{timer=null;void flush().catch(()=>{});},1000);
    }else void flush().catch(()=>{});
  });
  return {flush,stop(){stopped=true;unsubscribe();if(timer)clearTimeout(timer);}};
}
