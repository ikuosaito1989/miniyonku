import { create } from 'zustand';
import { loadSavedGame, startAutoSave, type SaveStatus } from './autoSave';
import { indexedDbStorage } from './saveStorage';

export const useSaveStatus=create<SaveStatus>(()=>({phase:'loading',savedAt:null,message:'セーブを読み込み中…'}));
let session:ReturnType<typeof startAutoSave>|null=null;
export async function initializeSave(){
  const savedAt=await loadSavedGame(indexedDbStorage);
  useSaveStatus.setState({phase:'saved',savedAt,message:savedAt?'セーブを読み込みました':'自動セーブを準備しています'});
  session=startAutoSave(indexedDbStorage,state=>useSaveStatus.setState(state));
  // 新規開始も直ちに保存。失敗しても初期化成功扱いにせず保存エラーを通知。
  void session.flush().catch(()=>{});
}
export function playWithoutSave(){useSaveStatus.setState({phase:'temporary',savedAt:null,message:'セーブなしでプレイ中です。再読み込みで進行が失われます。'});}
export async function saveNow(){await session?.flush();}
if(typeof window!=='undefined'){
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden')void saveNow().catch(()=>{});});
  window.addEventListener('pagehide',()=>{void saveNow().catch(()=>{});});
}
if(import.meta.hot)import.meta.hot.dispose(()=>session?.stop());
