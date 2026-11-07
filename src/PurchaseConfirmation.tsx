import {useRef} from 'react';
import type {Part} from './data/parts';
import {partSummary} from './data/partStats';
import {PartArtwork} from './PartArtwork';
import './purchase-confirmation.css';
export function PurchaseConfirmation({part,money,owned,error,onCancel,onConfirm}:{part:Part;money:number;owned:boolean;error:string;onCancel:()=>void;onConfirm:()=>void}){
 const dialog=useRef<HTMLElement>(null),consumable=part.category==='motor'||part.category==='battery',replacement=consumable&&owned;
 const allowed=money>=part.price&&(consumable||!owned),yen=(value:number)=>`¥ ${value.toLocaleString('ja-JP')}`;
 return <div className="purchase-confirm-scrim" onClick={event=>{if(event.target===event.currentTarget)onCancel();}}><section ref={dialog} className="purchase-confirm" role="dialog" aria-modal="true" aria-labelledby="purchase-confirm-title" aria-describedby="purchase-confirm-description" onKeyDown={event=>{
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();onCancel();}
  if(event.key==='Tab'){
   event.stopPropagation();const controls=Array.from(dialog.current?.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')??[]),first=controls[0],last=controls.at(-1);
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}
  }
 }}>
  <header><small>{replacement?'新品への交換':'パーツカウンター'}</small><h2 id="purchase-confirm-title">購入の確認</h2></header>
  <div className="purchase-confirm-part"><PartArtwork part={part}/><div><h3>{part.name}</h3><p id="purchase-confirm-description">このパーツを{replacement?'新品に交換':'購入'}しますか？</p></div></div>
  <p className="purchase-confirm-description">{partSummary(part)}</p>
  <dl><div><dt>価格</dt><dd>{yen(part.price)}</dd></div><div><dt>現在の所持金</dt><dd>{yen(money)}</dd></div><div><dt>購入後の所持金</dt><dd>{money>=part.price?yen(money-part.price):'所持金が足りません'}</dd></div></dl>
  {consumable&&<p className="purchase-confirm-note">{replacement?(part.category==='motor'?'所持中の同じモーターを新品に交換します。慣らし・摩耗・使用時間がリセットされ、新品を自動装着します。':'所持中の同じ電池を残量100%の新品に交換し、自動装着します。'):'購入後、新品を自動装着します。'}</p>}
  {error&&<p role="alert" className="purchase-confirm-error">{error}</p>}
  <footer><button autoFocus onClick={onCancel}>キャンセル</button><button className="purchase-confirm-accept" disabled={!allowed} onClick={onConfirm}>{replacement?'新品に交換する':'購入する'}</button></footer>
 </section></div>;
}
