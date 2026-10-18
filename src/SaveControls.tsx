import { saveNow, useSaveStatus } from './game/persistence';

export function SaveControls(){
  const {phase,message,savedAt}=useSaveStatus();
  return <div className="save-controls"><p role="status">{message}{phase==='saved'&&savedAt?`（${new Date(savedAt).toLocaleTimeString('ja-JP')}）`:''}</p>{phase!=='temporary'&&<button disabled={phase==='loading'||phase==='saving'} onClick={()=>{void saveNow().catch(()=>{});}}>{phase==='error'?'保存を再試行':'今すぐセーブ'}</button>}</div>;
}
export function SaveWarning(){
  const {phase,message}=useSaveStatus();
  return phase==='error'||phase==='temporary'?<aside className="save-warning" role="alert">{message}{phase==='error'&&<button onClick={()=>{void saveNow().catch(()=>{});}}>再試行</button>}</aside>:null;
}
