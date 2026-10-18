import { useEffect } from 'react';
import { useGame } from './game/store';
import { touchInput } from './game/touchInput';

export function TouchControls(){
  const overlay=useGame(s=>s.overlay),nearby=useGame(s=>s.nearby);
  useEffect(()=>{touchInput.reset();},[overlay]);
  useEffect(()=>{
    const reset=()=>touchInput.reset();
    window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',reset);
    return()=>{reset();window.removeEventListener('blur',reset);window.removeEventListener('resize',reset);document.removeEventListener('visibilitychange',reset);};
  },[]);
  if(overlay)return null;
  return <section className="touch-controls" aria-label="店内のタッチ操作">
    <div className="tap-walk-guide"><strong>行きたい場所をタップ</strong><small>{nearby||'棚や机をタップすると、近くまで歩きます'}</small></div>
    <div className="touch-action"><button onClick={()=>touchInput.interact()} disabled={!nearby}>話す・調べる</button></div>
  </section>;
}
