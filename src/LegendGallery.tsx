import { lazy, Suspense, useState } from 'react';
import { legends } from './data/legends';
import { legendPortraits } from './data/legendPortraits';
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
    <nav aria-label="展示レーサー">{legends.map((l,i)=><button key={l.id} aria-pressed={i===index} onClick={()=>setIndex(i)}><img className="legend-nav-portrait" src={legendPortraits[l.id]} alt=""/><span>{l.name}</span><small>熟練度 {l.points} pt</small></button>)}</nav>
    <article aria-live="polite"><div className="legend-owner"><img src={legendPortraits[legend.id]} alt={`${legend.name}のポートレート`}/><div><p className="legend-title">{legend.title}</p><h3>{legend.name}</h3><p>熟練度 {legend.points} pt</p></div></div><h3>{legend.machine}</h3><div className="legend-machine"><Suspense fallback={<p>マシンを準備中…</p>}><MachinePreview equipment={legend.equipment}/></Suspense></div><p>{legend.description}</p>
      <details key={legend.id}><summary>展示セッティングを見る</summary><dl>{Object.entries(legend.equipment).map(([slot,id])=><div key={slot}><dt>{equipmentSlots[slot as keyof typeof equipmentSlots].label}</dt><dd>{parts.find(p=>p.id===id)?.name}</dd></div>)}</dl></details>
    </article><footer>専用ボディは非売品・入手不可。怜・岳とは初優勝後の特別レースで、4人とは最後の模型店と最終大会で対戦できます。熟練度750pt「マスター」で5位圏内が目標。熟練度とパーツの入手段階は別です。</footer>
  </section></div>;
}
