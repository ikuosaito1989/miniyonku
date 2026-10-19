import { useEffect } from 'react';
import { useGame } from './game/store';
import { touchInput } from './game/touchInput';

export function TouchControls(){
  const overlay=useGame(s=>s.overlay);
  useEffect(()=>{touchInput.reset();},[overlay]);
  useEffect(()=>{
    const reset=()=>touchInput.reset();
    window.addEventListener('blur',reset);window.addEventListener('resize',reset);document.addEventListener('visibilitychange',reset);
    return()=>{reset();window.removeEventListener('blur',reset);window.removeEventListener('resize',reset);document.removeEventListener('visibilitychange',reset);};
  },[]);
  return null;
}
