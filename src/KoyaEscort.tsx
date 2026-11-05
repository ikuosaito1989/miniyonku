import {useEffect,useRef} from 'react';
import {useGame} from './game/store';
import {koyaEscortText,koyaEscortWalking} from './game/koyaEscort';
import koyaPortrait from './assets/portraits/koya-pop.webp';
import './opening.css';
export function KoyaEscort(){
 const step=useGame(s=>s.koyaEscortStep),advance=useGame(s=>s.advanceKoyaEscort),walking=koyaEscortWalking(step),button=useRef<HTMLButtonElement>(null);
 useEffect(()=>{button.current?.focus();},[step]);
 return <div className={`opening-scene${walking?' opening-walking':''}`} role="dialog" aria-modal="true" aria-label="昊也と星空レース場へ" data-step={step} onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();button.current?.focus();}}}>
  <header className="opening-chapter"><span>星空へつながる道</span></header>
  {walking?<div className="opening-walk-status" role="status"><span className="opening-footsteps" aria-hidden="true">● ● ●</span><span>{koyaEscortText(step)}</span><button ref={button} onClick={()=>advance(step)}>歩く場面を省略</button></div>:<section className="opening-dialogue" aria-labelledby="escort-speaker" aria-describedby="escort-message"><div className="opening-face"><img className="player-portrait" src={koyaPortrait} alt=""/></div><div className="opening-words"><h2 id="escort-speaker">山城 昊也</h2><p id="escort-message">{koyaEscortText(step)}</p><nav><button ref={button} onClick={()=>advance(step)}>{step===2?'一緒に会場へ':'会場を見てみよう'} ▸</button></nav></div></section>}
 </div>;
}
