import {useGame} from './game/store';
import {currentShop} from './data/world';
import {getCircuitTrack} from './data/circuit';
import {speedKmh} from './game/speedRecords';
import './speed-board.css';
export function SpeedBoard(){
 const location=useGame(s=>s.location),history=useGame(s=>s.speedHistory),close=useGame(s=>s.close);
 const shop=currentShop(location),circuit=getCircuitTrack(shop.circuitId).circuit,records=history[shop.circuitId]??[];
 return <div className="scrim"><section className="speed-board" role="dialog" aria-modal="true" aria-labelledby="speed-board-title" onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();event.currentTarget.querySelector('button')?.focus();}}}>
  <header><div><small>{shop.name} · コース記録</small><h2 id="speed-board-title">歴代最高速度 TOP 3</h2></div><button autoFocus onClick={close}>閉じる</button></header>
  <p className="speed-board-course">{circuit.name}</p>
  <ol>{[0,1,2].map(index=>{const record=records[index];return <li key={index} data-rank={index+1}><span className="speed-board-rank">{index+1}</span><div className="speed-board-entry">{record?<><strong>{record.racerName}{record.racerId==='player'?'（自分）':''}</strong><span>{record.machineName}</span><small>{new Date(record.recordedAt).toLocaleDateString('ja-JP')}</small></>:<strong>まだ記録がありません</strong>}</div><div className="speed-board-value">{record?speedKmh(record.speed):'—'}<small>km/h</small></div></li>;})}</ol>
  <p>レース中の瞬間最高速度を、主人公・対戦相手を含めて記録します。同じレーサーの別レースも記録対象です。</p><footer>このブラウザでの記録を自動保存します。更新後に走ったレースから記録されます。</footer>
 </section></div>;
}
