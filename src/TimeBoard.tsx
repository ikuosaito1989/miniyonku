import {OnlineTimeBoard} from './OnlineTimeBoard';
import {parts} from './data/parts';
import {equipmentSlots} from './data/machine';
import {officialVenueFor} from './data/officialVenue';
import {useGame} from './game/store';
import {isPracticeCourse} from './data/practiceCourses';
import {currentShop,modelShops} from './data/world';
import {getCircuitTrack} from './data/circuit';
import {formatRecordTime} from './game/timeRecords';
import './time-board.css';
export function TimeBoard(){
 const location=useGame(s=>s.location),history=useGame(s=>s.timeHistory),close=useGame(s=>s.close);
 const selected=useGame(s=>s.timeBoardCircuit),legacy=useGame(s=>s.legacyTimeHistory);
 const shop=currentShop(location),id=selected??shop.circuitId,circuit=getCircuitTrack(id).circuit,records=history[id]??[],old=legacy[id]??[],venue=isPracticeCourse(id)?modelShops[id].name:location.startsWith('stadium-')?officialVenueFor(location).name:shop.name;
 return <div className="scrim"><section className="time-board" role="dialog" aria-modal="true" aria-labelledby="time-board-title" onKeyDown={event=>{if(event.key==='Tab'){const items=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), summary, input')],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}}}>
  <header><div><small>{venue} · コース記録</small><h2 id="time-board-title">歴代ベストタイム TOP 3</h2></div><button autoFocus onClick={close}>閉じる</button></header>
  <p className="time-board-course">{circuit.name}</p>
  <ol>{[0,1,2].map(index=>{const record=records[index];return <li key={index} data-rank={index+1}><span className="time-board-rank">{index+1}</span><div className="time-board-entry">{record?<><strong>{record.racerName}{record.racerId==='player'?'（自分）':''}</strong><span>{record.machineName}</span><small>{new Date(record.recordedAt).toLocaleDateString('ja-JP')}</small></>:<strong>まだ記録がありません</strong>}</div><div className="time-board-value">{record?formatRecordTime(record.time,id==='trail'):'—'}<small>公式タイム</small></div></li>;})}</ol>
  {records.map(record=><details key={record.id}><summary>{record.racerName} · {formatRecordTime(record.time,id==='trail')}のセッティング</summary><dl>{record.equipment&&Object.entries(record.equipment).map(([slot,partId])=><div key={slot}><dt>{equipmentSlots[slot as keyof typeof equipmentSlots].label}</dt><dd>{parts.find(p=>p.id===partId)?.name}</dd></div>)}</dl></details>)}
  {old.length>0&&<details><summary>旧参考記録（調整前・装備情報なし）</summary><p>調整前の走行や装備情報のない記録は、新しいルールのランキングとは分けて保存しています。</p>{old.map(r=><p key={r.id}>{r.racerName}　{formatRecordTime(r.time,id==='trail')}</p>)}</details>}
  <OnlineTimeBoard key={id} circuitId={id}/>
  <p>星皇シリーズを1つでも装着した走行は記録対象外です。完走したレースの公式タイムを、主人公・対戦相手を含めて速い順に記録します。反応時間・早出ペナルティも含みます。同じレーサーの別レースも記録対象です。</p><footer>このブラウザでの記録を自動保存します。更新後に走ったレースから記録されます。</footer>
 </section></div>;
}
