import {PodiumCeremony} from './PodiumCeremony';
import {KoyaEscort} from './KoyaEscort';
import {TutorialGuide} from './TutorialGuide';
import {tutorialActive,TUTORIAL_PART} from './game/tutorial';
import {OpeningScene} from './OpeningScene';
import {OPENING_END} from './game/opening';
import {PurchaseConfirmation} from './PurchaseConfirmation';
import {TimeBoard} from './TimeBoard';
import { MissionGuide } from './MissionGuide';
import { TownMap } from './TownMap';
import { GameOver } from './GameOver';
import { keepScreenAwake } from './game/wakeLock';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { ShopWorld } from './ShopWorld';
import { useGame } from './game/store';
import { categories, parts, type Category, type Part } from './data/parts';
import { SettingView } from './SettingView';
import { PartDescription } from './PartDescription';
import { PartArtwork } from './PartArtwork';
import { TouchControls } from './TouchControls';
import { isStocked } from './data/progression';
import { ProficiencyBoard } from './ProficiencyBoard';
import { SaveControls, SaveWarning } from './SaveControls';
import { AudioControls, GameAudio } from './GameAudio';
import { DialogueView } from './DialogueView';
import { LegendGallery } from './LegendGallery';
import { GameSettings } from './GameSettings';
import { CheatPanel } from './CheatPanel';
import { currentShop } from './data/world';
import { TitleScreen } from './TitleScreen';
const yen=(n:number)=>n.toLocaleString('ja-JP');
const TrialView=lazy(()=>import('./TrialView'));
export function App(){
  const game=useGame();
  const [started,setStarted]=useState(false);
  useEffect(()=>{if(started&&!game.openingActive&&game.openingStep<OPENING_END)game.startOpening();},[started,game.openingActive,game.openingStep,game.startOpening]);
  useEffect(()=>{if(started)return keepScreenAwake();},[started]);
  const shop=currentShop(game.location);
  const [category,setCategory]=useState<Category>('motor');
  useEffect(()=>setCategory(game.tutorialStage==='purchase'?'gear':'motor'),[shop.id,game.tutorialStage]);
  const modal=useRef<HTMLDivElement>(null);
  const [pendingPurchase,setPendingPurchase]=useState<Part|null>(null),[purchaseError,setPurchaseError]=useState('');
  const purchaseButton=useRef<HTMLButtonElement|null>(null),purchaseBusy=useRef(false);
  const cancelPurchase=()=>{setPendingPurchase(null);setPurchaseError('');requestAnimationFrame(()=>{const button=purchaseButton.current;if(button?.isConnected&&!button.disabled)button.focus();else modal.current?.focus();});};
  const confirmPurchase=()=>{
    if(!pendingPurchase||purchaseBusy.current)return;
    purchaseBusy.current=true;const before=useGame.getState().purchaseCount;
    useGame.getState().buy(pendingPurchase.id);
    if(useGame.getState().purchaseCount>before)cancelPurchase();else{purchaseBusy.current=false;setPurchaseError(useGame.getState().notice);}
  };
  useEffect(()=>{setPendingPurchase(null);setPurchaseError('');},[game.overlay,shop.id]);
  useEffect(()=>{
    if(game.overlay)modal.current?.focus();
  },[game.overlay]);
  useEffect(()=>{
    const handler=(e:KeyboardEvent)=>{
      const state=useGame.getState();
      if(!state.overlay||state.openingActive)return;
      if(e.key==='Escape'&&state.overlay!=='race'){e.preventDefault();state.close();}
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
    {!started ? <TitleScreen onStart={()=>{useGame.getState().startOpening();useGame.getState().resumeTutorial();useGame.getState().resumeKoyaEscort();useGame.getState().resumeTowaEscort();setStarted(true);}}/> : <section className="game-shell" aria-label="ゲーム画面">
      <div className="stage"><ShopWorld/>
        {game.overlay===null&&<div className="world-toolbar"><button className="game-settings-open" onClick={game.openSettings}>設定</button>{!tutorialActive(game.tutorialStage)&&<MissionGuide/>}<AudioControls floating/></div>}
        <SaveWarning/>
        {game.openingActive&&<OpeningScene/>}
        {game.overlay==='escort'&&<KoyaEscort/>}
        {game.overlay==='towa-escort'&&<KoyaEscort towa/>}
        {game.overlay==='podium'&&<PodiumCeremony/>}
        <TutorialGuide context="world"/>
        {game.loginBonusReceived&&<aside className="login-bonus" role="status"><span>おかえりなさい！ ログインボーナス 500円を受け取りました。</span><button aria-label="ログインボーナスのお知らせを閉じる" onClick={()=>useGame.setState({loginBonusReceived:false})}>閉じる</button></aside>}
        <TownMap/>
        {game.overlay==='mission'&&<MissionGuide/>}
        <TouchControls/>
        {game.overlay==='game-over'&&<GameOver/>}
        {game.overlay==='dialogue'&&<DialogueView/>}
        {game.overlay==='proficiency'&&<ProficiencyBoard/>}
        {game.overlay==='legends'&&<LegendGallery/>}
        {game.overlay==='time-board'&&<TimeBoard/>}
        {game.overlay==='settings'&&<GameSettings/>}
        {game.overlay==='cheat'&&<CheatPanel/>}
        {game.overlay==='setting'&&<SettingView/>}
        {game.overlay==='race'&&<Suspense fallback={<div className="trial-loading">試走コースを準備中…</div>}><TrialView/></Suspense>}
        {game.overlay==='shop'&&<div className="scrim"><div className="modal shop" inert={!!pendingPurchase} aria-hidden={pendingPurchase?true:undefined} role="dialog" aria-modal={pendingPurchase?undefined:true} aria-labelledby="modal-title" ref={modal} tabIndex={-1}>
            <div className="shop-head"><div><p className="eyebrow">{shop.name} / PARTS COUNTER</p><h2 id="modal-title">小さなパーツ、大きな可能性。</h2></div><button className="close" onClick={game.close} aria-label="ショップを閉じる">✕</button></div>
            <div className="shop-balance">所持金 <strong>¥ {yen(game.money)}</strong><span>所持パーツ {Object.values(game.inventory).reduce((a,b)=>a+b,0)} 点（初期装備含む）</span></div>
            <TutorialGuide context="shop"/>
            <p>全パーツは種類ごとに1個まで所持できます。モーター・電池のみ、同じ種類の再購入で新品へ交換できます。その他①〜③には異なる種類を最大3個装着できます。ローラーは1セットで前・中・後に設定できます。</p><div className="tabs" aria-label="パーツの分類">{Object.entries(categories).filter(([key])=>!shop.exclusiveParts||parts.some(p=>p.category===key&&isStocked(p,shop))).map(([key,label])=><button key={key} aria-pressed={category===key} className={category===key?'selected':''} onClick={()=>setCategory(key as Category)}>{label}</button>)}</div>
            <div className="parts">{parts.filter(p=>p.category===category&&isStocked(p,shop)).map(p=><article key={p.id} data-part-id={p.id} className={game.tutorialStage==='purchase'&&p.id===TUTORIAL_PART?'tutorial-target':''}><div className={`part-icon ${p.category}`}><PartArtwork part={p}/></div><div className="part-info"><h3>{p.name}</h3><PartDescription part={p}/><span className="owned">所持 {game.inventory[p.id]??0}</span></div><div className="purchase"><strong>¥ {yen(p.price)}</strong><button disabled={game.tutorialStage==='purchase'&&p.id!==TUTORIAL_PART||game.money<p.price||(p.category!=='motor'&&p.category!=='battery'&&game.inventory[p.id]>0)} onClick={event=>{purchaseButton.current=event.currentTarget;purchaseBusy.current=false;setPurchaseError('');setPendingPurchase(p);}}>{p.category!=='motor'&&p.category!=='battery'&&game.inventory[p.id]>0?'所持済み':game.money<p.price?'所持金不足':p.category==='motor'||p.category==='battery'?(game.inventory[p.id]>0?'新品に交換':'購入して装着'):'購入する'}</button></div></article>)}</div>
            <p className="notice" role="status" aria-live="polite">{game.notice||`${shop.owner}「じっくり選んでね。各種類1個まで所持できるよ。モーター・電池を買い直すと新品を装着するよ。」`}</p><SaveControls/>
        </div>{pendingPurchase&&<PurchaseConfirmation part={pendingPurchase} money={game.money} owned={(game.inventory[pendingPurchase.id]??0)>0} error={purchaseError} onCancel={cancelPurchase} onConfirm={confirmPurchase}/>}</div>}
      </div>
    </section>}
  </main>;
}
