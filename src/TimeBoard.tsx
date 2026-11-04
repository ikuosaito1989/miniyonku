import {useGame} from './game/store';
import {currentShop} from './data/world';
import {getCircuitTrack} from './data/circuit';
import {formatRecordTime} from './game/timeRecords';
import './time-board.css';
export function TimeBoard(){
 const location=useGame(s=>s.location),history=useGame(s=>s.timeHistory),close=useGame(s=>s.close);
 const shop=currentShop(location),circuit=getCircuitTrack(shop.circuitId).circuit,records=history[shop.circuitId]??[];
 return <div className="scrim"><section className="time-board" role="dialog" aria-modal="true" aria-labelledby="time-board-title" onKeyDown={event=>{if(event.key==='Tab'){event.preventDefault();event.currentTarget.querySelector('button')?.focus();}}}>
  <header><div><small>{shop.name} · コース記録</small><h2 id="time-board-title">歴代ベストタイム TOP 3</h2></div><button autoFocus onClick={close}>閉じる</button></header>
  <p className="time-board-course">{circuit.name}</p>
  <ol>{[0,1,2].map(index=>{const record=records[index];return <li key={index} data-rank={index+1}><span className="time-board-rank">{index+1}</span><div className="time-board-entry">{record?<><strong>{record.racerName}{record.racerId==='player'?'（自分）':''}</strong><span>{record.machineName}</span><small>{new Date(record.recordedAt).toLocaleDateString('ja-JP')}</small></>:<strong>まだ記録がありません</strong>}</div><div className="time-board-value">{record?formatRecordTime(record.time,shop.circuitId==='trail'):'—'}<small>公式タイム</small></div></li>;})}</ol>
  <p>完走したレースの公式タイムを、主人公・対戦相手を含めて速い順に記録します。反応時間・早出ペナルティも含みます。同じレーサーの別レースも記録対象です。</p><footer>このブラウザでの記録を自動保存します。更新後に走ったレースから記録されます。</footer>
 </section></div>;
}
