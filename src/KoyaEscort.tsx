import {towaEscortText} from './game/towaEscort';
import towaPortrait from './assets/portraits/towa-pop.webp';
import {useEffect,useRef} from 'react';
import {useGame} from './game/store';
import {koyaEscortText,koyaEscortWalking} from './game/koyaEscort';
import koyaPortrait from './assets/portraits/koya-pop.webp';
import './opening.css';
export function KoyaEscort({towa=false}:{towa?:boolean}){
 const text=towa?towaEscortText:koyaEscortText;
 const step=useGame(s=>towa?s.towaEscortStep:s.koyaEscortStep),advance=useGame(s=>towa?s.advanceTowaEscort:s.advanceKoyaEscort),walking=koyaEscortWalking(step),button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{button.current?.focus();},[step]);
 return <div className={`opening-scene${walking?' opening-walking':''}`} role="dialog" aria-modal="true" aria-label={towa?'斗和と緑川グランプリ会場へ':'昊也と星空レース場へ'} data-step={step} onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();button.current?.focus();}}}>
  <header className="opening-chapter"><span>{towa?'決勝へつながる道':'星空へつながる道'}</span></header>
  {walking?<div className="opening-walk-status" role="status"><span className="opening-footsteps" aria-hidden="true">● ● ●</span><span>{text(step)}</span><button ref={button} onClick={()=>advance(step)}>歩く場面を省略</button></div>:<section className="opening-dialogue" aria-labelledby="escort-speaker" aria-describedby="escort-message"><div className="opening-face"><img className="player-portrait" src={towa?towaPortrait:koyaPortrait} alt=""/></div><div className="opening-words"><h2 id="escort-speaker">{towa?'橘 斗和':'山城 昊也'}</h2><p id="escort-message">{text(step)}</p><nav><button ref={button} onClick={()=>advance(step)}>{step===2?'一緒に会場へ':'会場を見てみよう'} ▸</button></nav></div></section>}
 </div>;
}
