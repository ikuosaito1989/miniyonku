import { useEffect, useRef, useState } from 'react';
import type { Equipment } from './data/machine';
import { MachinePreviewRenderer } from './game/MachinePreviewRenderer';

export default function MachinePreview({equipment}:{equipment:Equipment}){
  const host=useRef<HTMLDivElement>(null);
  const renderer=useRef<MachinePreviewRenderer|null>(null);
  const [error,setError]=useState(false);
  useEffect(()=>{
    try{renderer.current=new MachinePreviewRenderer(host.current!);}
    catch{setError(true);}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[]);
  useEffect(()=>{renderer.current?.setEquipment(equipment);},[equipment]);
  return <div className="machine-preview">
    <div className="machine-preview-canvas" ref={host}/>
    {error?<p className="preview-error" role="status">3Dプレビューを表示できません。WebGL対応ブラウザをご利用ください。</p>:<div className="preview-controls" aria-label="プレビューの角度"><small>ドラッグで回転</small><button aria-label="マシンを左へ回転" onClick={()=>renderer.current?.rotate(-Math.PI/6)}>↶</button><button aria-label="プレビューの角度を戻す" onClick={()=>renderer.current?.reset()}>正面</button><button aria-label="マシンを右へ回転" onClick={()=>renderer.current?.rotate(Math.PI/6)}>↷</button></div>}
  </div>;
}
