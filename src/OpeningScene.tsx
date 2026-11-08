import {story} from './data/story';
import {useEffect,useRef} from 'react';
import {useGame} from './game/store';
import {openingScenes,openingIndex,openingIsWalk,OPENING_END} from './game/opening';
import {NpcPortrait} from './NpcPortrait';
import {PlayerPortrait} from './PlayerPortrait';
import './opening.css';
export function OpeningScene(){
 const state=useGame(),step=openingIndex(state),scene=openingScenes[step],walking=openingIsWalk(step),last=step===OPENING_END-1,panel=useRef<HTMLDivElement>(null),next=useRef<HTMLButtonElement>(null);
 const proceed=()=>{if(last)state.finishOpening(true);else if(walking)state.completeOpeningWalk(step);else state.advanceOpening(step);};
 useEffect(()=>{next.current?.focus();},[step]);
 useEffect(()=>{
  const handler=(e:KeyboardEvent)=>{
   if(e.code==='KeyZ'||(e.code==='Enter'||e.code==='Space')&&!(e.target instanceof Element&&e.target.closest('button'))){e.preventDefault();if(!e.repeat)proceed();}
   if(e.key==='Tab'&&panel.current){const buttons=Array.from(panel.current.querySelectorAll<HTMLButtonElement>('button'));if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus();}}
  };window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
 });
 if(!scene)return null;
 return <div className={`opening-scene${walking?' opening-walking':''}`} ref={panel} role="dialog" aria-modal="true" aria-label="はじまりのシーン" data-step={step} onClick={e=>{if(!walking&&!last&&!(e.target instanceof Element&&e.target.closest('button')))state.advanceOpening(step);}}>
  <header className="opening-chapter"><span>はじまりの一歩</span><button onClick={()=>state.finishOpening(false)}>導入を省略</button></header>
  {walking?<div className="opening-walk-status" role="status"><span className="opening-footsteps" aria-hidden="true">● ● ●</span><span>{scene.text}</span><button ref={next} onClick={proceed}>歩く場面を省略</button></div>:<section className="opening-dialogue" key={step} aria-labelledby="opening-speaker" aria-describedby="opening-message">
   <div className="opening-face">{scene.portrait==='player'?<PlayerPortrait/>:<NpcPortrait id={scene.portrait}/>}</div>
   <div className="opening-words"><h2 id="opening-speaker">{scene.speaker===story.player?(state.playerName||story.player):scene.speaker}</h2><p id="opening-message">{scene.text.replaceAll('湊くん',`${state.playerName||story.player}さん`)}</p><nav>
    <button ref={next} onClick={proceed}>{last?'実際にやってみよう':scene.next}<span aria-hidden="true"> ▸</span></button>
    {last&&<button className="opening-look-around" onClick={()=>state.finishOpening(false)}>{state.openingTour?'設定に戻る':'案内を省略して遊ぶ'}</button>}
   </nav></div>
  </section>}
 </div>;
}
