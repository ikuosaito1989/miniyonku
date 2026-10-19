import { lazy, Suspense, useState } from 'react';
import { legends } from './data/legends';
import { equipmentSlots } from './data/machine';
import { parts } from './data/parts';
import { useGame } from './game/store';
import './legends.css';
const MachinePreview=lazy(()=>import('./MachinePreview'));
export function LegendGallery(){
  const close=useGame(s=>s.close),[index,setIndex]=useState(0),legend=legends[index];
  return <div className="scrim"><section className="legend-gallery" role="dialog" aria-modal="true" aria-labelledby="legend-title" onKeyDown={e=>{
    if(e.key!=='Tab')return;
    const controls=Array.from(e.currentTarget.querySelectorAll<HTMLButtonElement>('button'));
    if(e.shiftKey&&document.activeElement===controls[0]){e.preventDefault();controls.at(-1)?.focus();}
    else if(!e.shiftKey&&document.activeElement===controls.at(-1)){e.preventDefault();controls[0]?.focus();}
  }}>
    <header><div><small>こもれび模型店・特別展示</small><h2 id="legend-title">レジェンドマシン</h2></div><button autoFocus onClick={close}>閉じる</button></header>
    <nav aria-label="展示レーサー">{legends.map((l,i)=><button key={l.id} aria-pressed={i===index} onClick={()=>setIndex(i)}><small>熟練度 {l.points} pt</small>{l.name}</button>)}</nav>
    <article aria-live="polite"><p className="legend-title">{legend.title} ／ {legend.name}</p><h3>{legend.machine}</h3><div className="legend-machine"><Suspense fallback={<p>マシンを準備中…</p>}><MachinePreview equipment={legend.equipment}/></Suspense></div><p>{legend.description}</p>
      <details key={legend.id}><summary>展示セッティングを見る</summary><dl>{Object.entries(legend.equipment).map(([slot,id])=><div key={slot}><dt>{equipmentSlots[slot as keyof typeof equipmentSlots].label}</dt><dd>{parts.find(p=>p.id===id)?.name}</dd></div>)}</dl></details>
    </article><footer>展示専用・非売品。対戦や入手はまだできません。熟練度750pt「マスター」で5位圏内が目標。熟練度とパーツの入手段階は別です。</footer>
  </section></div>;
}
