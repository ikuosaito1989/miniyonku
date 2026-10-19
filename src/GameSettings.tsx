import { useState } from 'react';
import { SaveControls } from './SaveControls';
import { resetSave, useSaveStatus } from './game/persistence';
import { useGame } from './game/store';
import './game-settings.css';
const yen=(value:number)=>value.toLocaleString('ja-JP');

export function GameSettings(){
  const close=useGame(s=>s.close),money=useGame(s=>s.money),points=useGame(s=>s.proficiencyPoints);
  const {phase}=useSaveStatus();const [confirm,setConfirm]=useState(false),[working,setWorking]=useState(false),[message,setMessage]=useState('');
  const initialize=async()=>{
    setWorking(true);setMessage('');
    try{await resetSave();setConfirm(false);setMessage('初期状態でセーブしました。');}
    catch(error){setMessage(error instanceof Error?error.message:'初期化できませんでした。');}
    finally{setWorking(false);}
  };
  return <div className="scrim game-settings-scrim"><section className="game-settings" role="dialog" aria-modal="true" aria-labelledby="game-settings-title" onKeyDown={e=>{
    if(e.key!=='Tab')return;
    const controls=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'));
    if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}
  }}>
    <header><div><small>KOMOREBI MODEL / SYSTEM</small><h2 id="game-settings-title">ゲーム設定</h2></div><button autoFocus onClick={close}>閉じる</button></header>
    <section className="game-settings-balance" aria-label="ゲームの進行状況"><small>所持金</small><strong>¥ {yen(money)}</strong><span>熟練度 {points} pt</span></section>
    <section className="game-settings-save"><h3>セーブデータ</h3><p>ゲームの進行状況はこのブラウザに自動保存されます。</p><SaveControls/>
      {!confirm?<button className="game-settings-reset" disabled={phase==='loading'||phase==='saving'||working} onClick={()=>{setMessage('');setConfirm(true);}}>セーブデータを初期化</button>:<div className="game-settings-confirm" role="alert"><strong>所持金・パーツ・装備・熟練度をすべて初期状態に戻します。</strong><p>この操作は取り消せません。初期状態を新しいセーブとして保存します。</p><div><button disabled={working} onClick={()=>void initialize()}>{working?'初期化中…':'初期化する'}</button><button disabled={working} onClick={()=>setConfirm(false)}>キャンセル</button></div></div>}
      {message&&<p role="status" className="game-settings-status">{message}</p>}
    </section>
    <footer>セーブはこのブラウザ内に保存されます。別の端末・ブラウザとは共有されません。</footer>
  </section></div>;
}
