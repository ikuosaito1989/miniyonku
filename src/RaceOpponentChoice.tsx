import {useEffect,useState} from 'react';
import {useGame} from './game/store';
import {getCircuitTrack} from './data/circuit';
import {isPracticeCourse} from './data/practiceCourses';
import type {OnlineRecord} from './game/onlineRecords';
import {loadLeaderboard} from './game/onlineLeaderboard';
import {formatRecordTime} from './game/timeRecords';

export function RaceOpponentChoice(){
 const id=useGame(s=>s.raceChoiceCircuit),close=useGame(s=>s.close),startMob=useGame(s=>s.startMobTrial),startRecords=useGame(s=>s.startOnlineTrial),location=useGame(s=>s.location),startSolo=useGame(s=>s.startOfficialRace),startShop=useGame(s=>s.startTrial);
 const [records,setRecords]=useState<OnlineRecord[]>([]),[loading,setLoading]=useState(true),[error,setError]=useState(''),[revision,setRevision]=useState(0);
 useEffect(()=>{if(!id)return;let active=true;setLoading(true);setError('');setRecords([]);void loadLeaderboard(id).then(rows=>{if(active)setRecords(rows.slice(0,4));}).catch(()=>{if(active)setError('記録を取得できません。モブ対戦はそのまま遊べます。');}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[id,revision]);
 if(!id)return null;
 const outdoor=isPracticeCourse(id),regularRewards=!location.startsWith('stadium-'),solo=!outdoor&&(id==='trail'||location.startsWith('stadium-'));
 return <div className="scrim"><section className="modal race-opponent-choice" role="dialog" aria-modal="true" aria-labelledby="opponent-choice-title" onKeyDown={event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();}if(event.key==='Tab'){const buttons=[...event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}}}>
  <header><div><small>{getCircuitTrack(id).circuit.name}</small><h2 id="opponent-choice-title">対戦相手を選ぶ</h2></div><button autoFocus className="close" onClick={close}>戻る</button></header>
  <div className="opponent-options">
   <section><h3>モブCPU</h3><p>4台のモブCPUと走ります。{regularRewards?'賞金・熟練度・消耗は通常どおりです。':'賞金・熟練度・ストーリー進行は変わらず、消耗と記録だけ反映します。'}</p><button className="primary" onClick={()=>startMob(id)}>モブと走る</button></section>
   <section><h3>オンライン記録保持者</h3><p>上位4人の装備・走行開始時の状態を使うCPUとの対戦です。賞金・熟練度・ストーリー進行は変わらず、消耗と記録だけ反映します。</p>
    <div role="status">{loading?'記録を読み込み中…':error||(!records.length?'まだオンライン記録がありません。':'対戦相手')}</div>
    {!!records.length&&<ol>{records.map(record=><li key={record.playerId}><span>{record.displayName}</span><strong>{formatRecordTime(record.time,id==='trail')}</strong></li>)}</ol>}
    <button className="primary" disabled={loading||!!error||!records.length} onClick={()=>startRecords(id,records)}>記録保持者と走る</button>
    {(error||!loading&&!records.length)&&<button disabled={loading} onClick={()=>setRevision(n=>n+1)}>記録を再取得</button>}
   </section>
  </div>
  {solo&&<button className="solo-race-option" onClick={()=>location.startsWith('stadium-')?startSolo():startShop()}>1台でタイムアタック</button>}
 </section></div>;
}
