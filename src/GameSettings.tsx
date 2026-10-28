import { useRef, useState } from 'react';
import { SaveControls } from './SaveControls';
import { AudioControls } from './GameAudio';
import { resetSave, useSaveStatus } from './game/persistence';
import { useGame } from './game/store';
import './game-settings.css';
import { currentMission, missionNextAction } from './game/mission';
import { currentShop } from './data/world';
const yen=(value:number)=>value.toLocaleString('ja-JP');

export function GameSettings(){
  const close=useGame(s=>s.close),money=useGame(s=>s.money),points=useGame(s=>s.proficiencyPoints);
  const openCheat=useGame(s=>s.openCheat);
  const state=useGame(),location=state.location,mission=currentMission(state);
  const nextGoal=[mission.title,missionNextAction(state,mission),mission.hint].join(' ');
  const secretTaps=useRef<{count:number;at:number}>({count:0,at:0});
  const tapSystemMark=()=>{
    const now=performance.now();
    secretTaps.current=now-secretTaps.current.at<2200?{count:secretTaps.current.count+1,at:now}:{count:1,at:now};
    if(secretTaps.current.count>=7){secretTaps.current={count:0,at:0};openCheat(true);}
  };
  const {phase}=useSaveStatus();const [confirm,setConfirm]=useState(false),[working,setWorking]=useState(false),[message,setMessage]=useState('');
  const initialize=async()=>{
    setWorking(true);setMessage('');
    try{await resetSave();setConfirm(false);setMessage('初期状態でセーブしました。');}
    catch(error){setMessage(error instanceof Error?error.message:'初期化できませんでした。');}
    finally{setWorking(false);}
  };
  return <div className="scrim game-settings-scrim"><section className="game-settings" role="dialog" aria-modal="true" aria-labelledby="game-settings-title" onKeyDown={e=>{
    if(e.key!=='Tab')return;
    const controls=Array.from(e.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled),summary,input:not(:disabled),a[href]')).filter(control=>control.getClientRects().length>0);
    if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}
  }}>
    <header><div><small onClick={tapSystemMark}>KOMOREBI MODEL / SYSTEM</small><h2 id="game-settings-title">ゲーム設定</h2></div><button autoFocus onClick={close}>閉じる</button></header>
    <section className="game-settings-audio" aria-label="音量・サウンド設定"><h3>音量・サウンド</h3><AudioControls/></section>
    <section className="game-settings-balance" aria-label="ゲームの進行状況"><small>所持金</small><strong>¥ {yen(money)}</strong><span>熟練度 {points} pt</span></section>
    <section className="game-settings-manual"><h3>次の目標</h3><p>現在地：{location==='town'?'緑川町':location==='stadium-10'?'緑川グランプリ決勝会場':location==='stadium-9'?'星空公式レース会場':location==='stadium-5'?'若葉公式レース会場':currentShop(location).name}</p><p>{nextGoal}</p><p>街でも指を滑らせて移動できます。入口をタップ、または近づいてZ・Enterで入店・調査します。</p><p>レースでは先頭に1周差をつけられるとリタイア。ゴール後は画面タップ、またはZ・Enter・Spaceで結果を表示できます。通常戦は模型店のコース、公式戦は各公式会場内のコースから出場します。公式大会は一度しか出られません。</p></section>
    <section className="game-settings-manual"><h3>あそびかた・操作説明</h3><dl><div><dt>店内を移動</dt><dd>スマホ：画面を押したまま指を滑らせる。PC：方向キーまたはWASD。</dd></div><div><dt>人と話す・調べる</dt><dd>スマホ：人物や棚・設備をタップ。PC：近づいてZまたはEnter。</dd></div><div><dt>セッティングを開く</dt><dd>スマホ：床をすばやく2回タップ（ダブルタップ）。PC：作業台を調べる。</dd></div><div><dt>パーツを交換</dt><dd>セッティング画面で部位を選び、所持パーツを選択。ローラーは1セットで前・横・後をまとめて交換。</dd></div><div><dt>レースを操作</dt><dd>コースを調べてレースへ。画面をタップしてカウント開始、GOの表示中にもう一度タップして発進。</dd></div></dl></section>
    <section className="game-settings-save"><h3>セーブデータ</h3><p>ゲームの進行状況はこのブラウザに自動保存されます。</p><SaveControls/>
      {!confirm?<button className="game-settings-reset" disabled={phase==='loading'||phase==='saving'||working} onClick={()=>{setMessage('');setConfirm(true);}}>セーブデータを初期化</button>:<div className="game-settings-confirm" role="alert"><strong>所持金・パーツ・装備・熟練度をすべて初期状態に戻します。</strong><p>この操作は取り消せません。初期状態を新しいセーブとして保存します。</p><div><button disabled={working} onClick={()=>void initialize()}>{working?'初期化中…':'初期化する'}</button><button disabled={working} onClick={()=>setConfirm(false)}>キャンセル</button></div></div>}
      {message&&<p role="status" className="game-settings-status">{message}</p>}
    </section>
    <footer>セーブはこのブラウザ内に保存されます。別の端末・ブラウザとは共有されません。</footer>
  </section></div>;
}
