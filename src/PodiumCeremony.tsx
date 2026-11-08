import {useEffect,useRef} from 'react';
import {useGame} from './game/store';
import {podiumRows} from './game/podium';
import {RacerPortrait} from './RaceRanking';
import './podium.css';
function Trophy(){return <svg className="podium-trophy" viewBox="0 0 80 86" role="img" aria-label="優勝トロフィー"><defs><linearGradient id="cup-gold"><stop stopColor="#fff6b5"/><stop offset=".5" stopColor="#e1aa32"/><stop offset="1" stopColor="#986322"/></linearGradient></defs><path d="M19 13H5v15q0 21 25 21M61 13h14v15q0 21-25 21" fill="none" stroke="#e4bd60" strokeWidth="6"/><path d="M18 5h44v24q0 22-18 25v15h14v9H22v-9h14V54Q18 51 18 29Z" fill="url(#cup-gold)" stroke="#fff0a1" strokeWidth="2"/><path d="m40 15 4 9 10 1-8 7 2 10-8-5-8 5 2-10-8-7 10-1Z" fill="#fff3b2"/><path d="M17 78h46v7H17" fill="#403847"/></svg>;}
export function PodiumCeremony(){
 const state=useGame(),button=useRef<HTMLButtonElement>(null),kind=state.location==='stadium-7'?'zenith':state.location==='stadium-10'?'final':state.location==='stadium-9'?'technical':'wakaba',cup=kind==='zenith'?state.zenithCup:kind==='final'?state.finalCup:kind==='technical'?state.technicalCup:state.wakabaCup;
 const {overall,rows,winners}=podiumRows(cup,kind),player=rows.find(r=>r.id==='player'),title=kind==='zenith'?'天頂決戦・ゼニス・クラウン':kind==='final'?'緑川グランプリ':kind==='technical'?'星空テクニカル杯':'若葉公式ダート杯';
 useEffect(()=>{button.current?.focus();},[]);
 return <section className="podium-ceremony" role="dialog" aria-modal="true" aria-labelledby="podium-title" onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();button.current?.focus();}}}>
  <div className="podium-spotlights" aria-hidden="true"/><header><p>{title}{!overall?'・第1戦':''}</p><h1 id="podium-title">{overall?'総合表彰式':'レース表彰式'}</h1><span className="podium-laurel" aria-hidden="true">✦　✧　✦</span></header>
  <div className="podium-stage" aria-label="表彰台">{[2,1,3].map(place=>{const racer=winners.find(r=>r.place===place);return <div key={place} className={`podium-column podium-place-${place}`} style={{'--medal':place===1?'#edc65b':place===2?'#d6e4ed':'#c99165'} as React.CSSProperties}>
   <div className="podium-racer">{racer&&<><RacerPortrait id={racer.id} color={0x317d91} facing="down"/><svg className="podium-medal" viewBox="0 0 40 48" role="img" aria-label={`${place===1?'金':place===2?'銀':'銅'}メダル`}><path d="m5 0 15 23L35 0" fill="none" stroke="#af3448" strokeWidth="7"/><path d="m8 0 12 18L32 0" fill="none" stroke="#f0e6bf" strokeWidth="2"/><circle cx="20" cy="32" r="13" fill="var(--medal)" stroke="#fff0be" strokeWidth="2"/><text x="20" y="37" textAnchor="middle" fill="#624c29" fontSize="15" fontWeight="bold">{place}</text></svg>{place===1&&<Trophy/>}</>}</div>
   <div className="podium-block"><strong>{place}</strong><span>{racer?.name??'—'}{racer?.id==='player'?'（あなた）':''}</span></div>
  </div>;})}</div>
  <footer><p>{player?`湊：${player.finishes>0?`${overall?'総合':''}${player.place}位${player.place<=3?' 入賞おめでとう！':'。次の走りにつなげよう。'}`:'リタイア。最後まで挑んだ走りに拍手。'}`:''}</p><button ref={button} onClick={state.close}>表彰式を終える ▸</button></footer>
 </section>;
}
