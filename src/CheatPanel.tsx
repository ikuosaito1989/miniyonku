import { useState } from 'react';
import { useGame } from './game/store';
import './cheat.css';
import {replayEvents} from './game/eventReplay';

export function CheatPanel(){
  const close=useGame(s=>s.close),apply=useGame(s=>s.applyCheat);
  const cheatUsed=useGame(s=>s.cheatUsed),startEventReplay=useGame(s=>s.startEventReplay);
  const [confirm,setConfirm]=useState<'max'|1000|null>(null);
  return <div className="scrim cheat-scrim"><section className="cheat-panel" role="dialog" aria-modal="true" aria-labelledby="cheat-title">
    <header><div><small>KOMOREBI MODEL / SECRET</small><h2 id="cheat-title">裏技コマンド</h2></div><button onClick={close}>閉じる</button></header>
    {!confirm?<><p className="cheat-unlocked">SECRET MENU</p><p>特別な所持金コマンドを選んでください。</p><div className="cheat-options"><button onClick={()=>setConfirm(1000)}>所持金を1,000円追加</button><button onClick={()=>setConfirm('max')}>所持金を最大にする</button></div>{cheatUsed&&<section className="cheat-events"><h3>イベントへ移動</h3><p>イベントを一時的に体験します。終了すると元の進行に戻ります。</p><div className="cheat-options">{replayEvents.map(event=><button key={event.id} onClick={()=>startEventReplay(event.id)}>{event.label} ▸</button>)}</div></section>}</>:<><p className="cheat-unlocked">実行内容を確認</p><p>{confirm==='max'?'所持金を9,999,999円にし、裏技モードを有効にします。レースをスキップできるようになります。':'所持金に1,000円を追加します。'}</p><div className="cheat-options"><button onClick={()=>apply(confirm)}>実行する</button><button onClick={()=>setConfirm(null)}>戻る</button></div></>}
    <footer>実行するとセーブデータに記録されます。</footer>
  </section></div>;
}
