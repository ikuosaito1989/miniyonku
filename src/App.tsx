import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ShopWorld } from './ShopWorld';
import { useGame } from './game/store';
import { categories, parts, type Category } from './data/parts';
import { SettingView } from './SettingView';
import { PartArtwork } from './PartArtwork';
import { TouchControls } from './TouchControls';
import { isStocked } from './data/progression';
import { ProficiencyBoard } from './ProficiencyBoard';
import { SaveControls, SaveWarning } from './SaveControls';
import { AudioControls, GameAudio } from './GameAudio';
import { DialogueView } from './DialogueView';
import { LegendGallery } from './LegendGallery';
import { GameSettings } from './GameSettings';
const yen=(n:number)=>n.toLocaleString('ja-JP');
const TrialView=lazy(()=>import('./TrialView'));
export function App(){
  const game=useGame();
  const [category,setCategory]=useState<Category>('motor');
  const modal=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    if(game.overlay)modal.current?.focus();
  },[game.overlay]);
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      const state=useGame.getState();
      if(!state.overlay)return;
      if(e.key==='Escape'){e.preventDefault();state.close();}
      if(e.key==='Tab'&&state.overlay==='shop'&&modal.current){
        const controls=modal.current.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
        const first=controls[0],last=controls[controls.length-1];
        if(e.shiftKey&&(document.activeElement===first||document.activeElement===modal.current)){e.preventDefault();last?.focus();}
        else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===modal.current)){e.preventDefault();first?.focus();}
      }
    };
    window.addEventListener('keydown',handler);return()=>window.removeEventListener('keydown',handler);
  },[]);
  return <main>
    <GameAudio/>
    <section className="game-shell" aria-label="ゲーム画面">
      <div className="stage"><ShopWorld/>
        {game.overlay===null&&<button className="game-settings-open" onClick={game.openSettings}>設定</button>}
        {game.overlay!=='race'&&<AudioControls floating/>}
        <SaveWarning/>
        <TouchControls/>
        {game.overlay==='dialogue'&&<DialogueView/>}
        {game.overlay==='proficiency'&&<ProficiencyBoard/>}
        {game.overlay==='legends'&&<LegendGallery/>}
        {game.overlay==='settings'&&<GameSettings/>}
        {game.overlay==='setting'&&<SettingView/>}
        {game.overlay==='race'&&<Suspense fallback={<div className="trial-loading">試走コースを準備中…</div>}><TrialView/></Suspense>}
        {game.overlay==='shop'&&<div className="scrim"><div className="modal shop" role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={modal} tabIndex={-1}>
            <div className="shop-head"><div><p className="eyebrow">PARTS COUNTER</p><h2 id="modal-title">小さなパーツ、大きな可能性。</h2></div><button className="close" onClick={game.close} aria-label="ショップを閉じる">✕</button></div>
            <div className="shop-balance">所持金 <strong>¥ {yen(game.money)}</strong><span>所持パーツ {Object.values(game.inventory).reduce((a,b)=>a+b,0)} 点（初期装備含む）</span></div>
            <div className="tabs" aria-label="パーツの分類">{Object.entries(categories).map(([key,label])=><button key={key} aria-pressed={category===key} className={category===key?'selected':''} onClick={()=>setCategory(key as Category)}>{label}</button>)}</div>
            <div className="parts">{parts.filter(p=>p.category===category&&isStocked(p)).map(p=><article key={p.id}><div className={`part-icon ${p.category}`}><PartArtwork part={p}/></div><div className="part-info"><h3>{p.name}</h3><p>{p.description}</p><small>{p.performance}</small><span className="owned">所持 {game.inventory[p.id]??0}</span></div><div className="purchase"><strong>¥ {yen(p.price)}</strong><button disabled={game.money<p.price} onClick={()=>game.buy(p.id)}>{game.money<p.price?'所持金不足':'購入する'}</button></div></article>)}</div>
            <p className="notice" role="status" aria-live="polite">{game.notice||'春夫「じっくり選んでね。各パーツは複数購入できるよ。」'}</p><SaveControls/>
        </div></div>}
      </div>
    </section>
  </main>;
}
