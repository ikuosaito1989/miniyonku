import {OnlineTimeBoard} from './OnlineTimeBoard';
import {parts} from './data/parts';
import {equipmentSlots} from './data/machine';
import {officialVenueFor} from './data/officialVenue';
import {useGame} from './game/store';
import {isPracticeCourse} from './data/practiceCourses';
import {currentShop,modelShops} from './data/world';
import {getCircuitTrack} from './data/circuit';
import {formatRecordTime} from './game/timeRecords';
import {outdoorRecommendations} from './data/outdoorAdvisors';
import {practiceCourses} from './data/practiceCourses';
import './time-board.css';
const courseGuides:Record<string,{feature:string;parts:readonly string[]}>= {
 leaf:{feature:'短い周回に小さなコーナーが連続する基本コース。速度を落とさず曲がる旋回性と、立ち上がりの加速が鍵。',parts:['motor-turn','tire-turn','roller-turn']},
 wind:{feature:'細かな連続コーナーと切り返しが続くテクニカルコース。旋回抵抗を抑え、車体の姿勢を保つ必要がある。',parts:['motor-turn','chassis-turn','roller-turn']},
 sun:{feature:'土・砂利・荒れたダート・砂地を走る長距離オフロード。接地性と制振に加え、路面ごとの抵抗変化に対応する。',parts:['motor-rally','tire-trail','accessory-damper']},
 sprint:{feature:'長い直線を中心に速度を伸ばす高速コース。最高速だけでなく、終盤まで回転を保つ電池と安定性も重要。',parts:['motor-wind','gear-3.5','tire-1']},
 grove:{feature:'連続コーナーに坂とジャンプを組み合わせた立体コース。旋回の安定、登坂力、着地後の姿勢をまとめて調整する。',parts:['motor-turn','chassis-turn','accessory-slide-rear']},
 comet:{feature:'強い連続旋回とアップダウンが続く長距離テクニカルコース。コーナーの安定と、後半まで続く出力の両立が必要。',parts:['motor-turn','chassis-turn','battery-endurance']},
 trail:{feature:'街の外へ続く片道の起伏コース。坂・カーブ・ジャンプを越えて、加速と着地の安定を両立する。',parts:['motor-rally','gear-4','accessory-damper']},
 grandprix:{feature:'高速区間と大きな旋回をつなぐ決勝コース。最高速を伸ばしながら、高速コーナーでの安定性を確保する。',parts:['motor-surge','tire-landing','wheel-floating']},
 forge:{feature:'高低差のある長い複合コース。速度・登坂力・旋回・悪路への対応を、装備全体で組み立てる。',parts:['motor-titan','tire-hoshi-gravel','battery-hoshi-long']},
 zenith:{feature:'天頂決戦の最終コース。高低差、長い高速区間、連続旋回を走り切る総合性能が試される。',parts:['motor-titan','gear-4.2','battery-hoshi-long']},
};
export function TimeBoard(){
 const location=useGame(s=>s.location),history=useGame(s=>s.timeHistory),close=useGame(s=>s.close);
 const selected=useGame(s=>s.timeBoardCircuit),legacy=useGame(s=>s.legacyTimeHistory);
 const shop=currentShop(location),id=selected??shop.circuitId,circuit=getCircuitTrack(id).circuit,records=history[id]??[],old=legacy[id]??[],venue=isPracticeCourse(id)?modelShops[id].name:location.startsWith('stadium-')?officialVenueFor(location).name:shop.name;
 return <div className="scrim"><section className="time-board" role="dialog" aria-modal="true" aria-labelledby="time-board-title" onKeyDown={event=>{if(event.key==='Tab'){const items=[...event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), summary, input')],first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}}}>
  <header><div><small>{venue} · コース記録</small><h2 id="time-board-title">歴代ベストタイム TOP 5</h2></div><button autoFocus onClick={close}>閉じる</button></header>
 <p className="time-board-course">{circuit.name}</p>
 <section className="time-board-guide" aria-label="コース紹介とおすすめパーツ"><h3>コース紹介</h3><p>{isPracticeCourse(id)?practiceCourses[id].feature:courseGuides[id]?.feature??'コースの路面と形状に合わせ、速度・加速・安定性を調整しよう。'}</p><h3>おすすめパーツ</h3><ul>{(isPracticeCourse(id)?outdoorRecommendations(id).map(p=>({name:p.name,reason:p.reason})):courseGuides[id]?.parts.map(partId=>({name:parts.find(p=>p.id===partId)?.name??partId,reason:'コースの特徴に合わせて性能を調整する'}))??[]).map((part,index)=><li key={`${part.name}-${index}`}><strong>{part.name}</strong><span>{part.reason}</span></li>)}</ul><small>推奨例です。現在のマシンや走り方に合わせて交換し、タイムを比べてください。</small></section>
  <ol>{[0,1,2,3,4].map(index=>{const record=records[index];return <li key={index} data-rank={index+1}><span className="time-board-rank">{index+1}</span><div className="time-board-entry">{record?<><strong>{record.racerName}{record.racerId==='player'?'（自分）':''}</strong><span>{record.machineName}</span><small>{new Date(record.recordedAt).toLocaleDateString('ja-JP')}</small></>:<strong>まだ記録がありません</strong>}</div><div className="time-board-value">{record?formatRecordTime(record.time,id==='trail'):'—'}<small>公式タイム</small></div></li>;})}</ol>
  {records.map(record=><details key={record.id}><summary>{record.racerName} · {formatRecordTime(record.time,id==='trail')}のセッティング</summary><dl>{record.equipment&&Object.entries(record.equipment).map(([slot,partId])=><div key={slot}><dt>{equipmentSlots[slot as keyof typeof equipmentSlots].label}</dt><dd>{parts.find(p=>p.id===partId)?.name}</dd></div>)}</dl></details>)}
  {old.length>0&&<details><summary>旧参考記録（調整前・装備情報なし）</summary><p>調整前の走行や装備情報のない記録は、新しいルールのランキングとは分けて保存しています。</p>{old.map(r=><p key={r.id}>{r.racerName}　{formatRecordTime(r.time,id==='trail')}</p>)}</details>}
  <OnlineTimeBoard key={id} circuitId={id}/>
  <p>星皇シリーズを1つでも装着した走行は記録対象外です。完走したレースの公式タイムを、主人公・対戦相手を含めて速い順に記録します。反応時間・早出ペナルティも含みます。同じレーサーの別レースも記録対象です。</p><footer>このブラウザでの記録を自動保存します。更新後に走ったレースから記録されます。</footer>
 </section></div>;
}
