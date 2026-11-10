import {topOnlineOpponents} from './game/onlineRace';
import {recordOpponentUnlocked} from './game/raceOpponents';
import {useEffect,useState} from 'react';
import {parts} from './data/parts';
import {equipmentSlots} from './data/machine';
import type {CircuitId} from './data/circuit';
import {useGame} from './game/store';
import {formatRecordTime} from './game/timeRecords';
import type {OnlineRecord} from './game/onlineRecords';
import {loadLeaderboard,onlineDisplayName,setOnlineDisplayName,syncOnlineRecords,useOnlineStatus} from './game/onlineLeaderboard';
import {SeiranLoading} from './WorldTransitionLoading';

export function OnlineTimeBoard({circuitId}:{circuitId:CircuitId}){
 const [records,setRecords]=useState<OnlineRecord[]>([]),[name,setName]=useState(''),[error,setError]=useState(''),[loading,setLoading]=useState(true),[revision,setRevision]=useState(0);
 const message=useOnlineStatus(s=>s.message),start=useGame(s=>s.startOnlineTrial),cleared=useGame(s=>s.zenithCleared),choose=useGame(s=>s.openRaceChoice);
 const unlocked=recordOpponentUnlocked(circuitId,cleared);
 useEffect(()=>{let active=true;setLoading(true);setError('');setRecords([]);
  void loadLeaderboard(circuitId).then(rows=>{if(active)setRecords(rows);}).catch(()=>{if(active)setError('オンラインランキングを取得できません。接続準備中、または通信できない状態です。');}).finally(()=>{if(active)setLoading(false);});
  void onlineDisplayName().then(value=>{if(active)setName(value);}).catch(()=>{if(active)setError('投稿用の端末情報を保存できません。');});
  return()=>{active=false;};
 },[circuitId,revision]);
 async function saveName(){try{await setOnlineDisplayName(name);useGame.getState().setPlayerName(name);setError('');}catch(error){setError(error instanceof Error?error.message:'表示名を保存できません。');}}
 return <section className="online-time-board" aria-labelledby="online-record-title">
  <h3 id="online-record-title">オンライン タイムアタック TOP 5</h3>
  <p>全プレイヤーのコース別上位5人です。上位5位に入る自己ベストだけを登録します。公開されるのは表示名・タイム・装備・走行開始時の状態です。ゲームのセーブはこのブラウザに保存します。</p>
  <label>投稿する表示名 <input value={name} maxLength={24} onChange={event=>setName(event.target.value)} /></label>
  <button onClick={()=>{void saveName();}}>表示名を保存</button>
  <button disabled={loading} onClick={()=>{void syncOnlineRecords().then(()=>setRevision(n=>n+1));}}>再送・ランキング更新</button>
  {loading?<SeiranLoading label="オンラインランキングを読み込んでいます" compact inline/>:<p role="status">{message}</p>}
  {error&&<p role="alert">{error}</p>}
  {!loading&&!error&&!records.length&&<p>まだオンライン記録がありません。完走して最初の記録を残そう。</p>}
  <ol>{records.map((record,index)=><li key={record.playerId}>
   <span className="time-board-rank">{index+1}</span><div className="time-board-entry"><strong>{record.displayName}</strong><small>{new Date(record.recordedAt).toLocaleDateString('ja-JP')}</small></div><span className="time-board-value">{formatRecordTime(record.time,circuitId==='trail')}</span>
  </li>)}</ol>
  {records.map(record=><details key={record.playerId}><summary>{record.displayName}の装備・開始時の状態</summary><dl>{Object.entries(equipmentSlots).map(([slot,meta])=><div key={slot}><dt>{meta.label}</dt><dd>{parts.find(p=>p.id===record.equipment[slot as keyof typeof equipmentSlots])?.name}</dd></div>)}</dl><p>モーター使用 {record.condition.motorSeconds.toFixed(1)}秒 / 電池使用 {record.condition.batterySeconds.toFixed(1)}秒</p></details>)}
  <button disabled={!unlocked||loading||!records.length} onClick={()=>start(circuitId,topOnlineOpponents(records))}>オンライン上位4名と走る（自分を含め5台）</button>
  {!!records.length&&records.length<4&&<p>現在の記録保持者は{records.length}名です。不足分の{4-records.length}台はモブが参加します。</p>}
  {unlocked?<button onClick={()=>choose(circuitId)}>対戦相手を選ぶ（CPU／記録保持者）</button>:<p className="record-opponent-lock">このストーリーコースの記録保持者対戦は、天頂決戦をクリアすると解放されます。</p>}
  <p>装備と開始時の状態を使ったCPUとの対戦です。記録時の走行を再現するゴーストではなく、発進やレーンによってタイムが変わります。賞金・大会進行への影響はありません。完走すると通常どおり電池・モーターを消耗します。</p>
 </section>;
}
