import { useEffect, useRef, useState } from 'react';
import garage from './assets/title/garage.svg';
import machine from './assets/title/seiran-machine.webp';
import './title.css';

export function TitleScreen({ onStart,needsName,onName }: { onStart: () => void;needsName:boolean;onName:(name:string)=>void }) {
  const [naming,setNaming]=useState(false),[name,setName]=useState('朝倉 湊');
  const start=()=>{if(needsName){setNaming(true);return;}onStart();};
  const startButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    startButton.current?.focus();
    const startWithZ = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'z' && document.activeElement === startButton.current) {
        event.preventDefault();start();
      }
    };
    window.addEventListener('keyup', startWithZ);
    return () => window.removeEventListener('keyup', startWithZ);
  }, [onStart]);

  return <section className="title-screen" aria-labelledby="game-title">
    <div className="title-artboard">
      <img className="title-garage" src={garage} alt="" />
      <div className="title-logo">
        <p className="title-badge">チビ四駆</p>
        <h1 id="game-title" aria-label="チビ四駆 セイラン"><svg viewBox="0 0 720 230" role="img" aria-label="セイラン">
          <defs><linearGradient id="seiran-letter" x2="0" y2="1"><stop stopColor="#ffffff"/><stop offset=".46" stopColor="#f8fbff"/><stop offset=".5" stopColor="#8ddaf7"/><stop offset="1" stopColor="#376acb"/></linearGradient></defs>
          <path d="m53 109 140-63-15 24L372 25l-47 35 299-22-55 36 111-7-95 64 51 2-127 48 21-25-213 48 53-36-250 32 51-33-112 18 44-40-73 9z" fill="#070912" stroke="#d0c9b4" strokeWidth="3"/>
          <path d="m75 140 163-55-40 33 307-57-74 44 195-40-109 69-194 40 62-37-209 40 35-29-144 23z" fill="#f3c83e"/>
          <path d="m213 191 187-40-47 34 246-64-69 49-283 41z" fill="#4334af" stroke="#9b8fe0" strokeWidth="2"/>
          <g transform="translate(65 0) skewX(-12)" fontFamily="'Noto Sans JP','Hiragino Kaku Gothic ProN',sans-serif" fontWeight="900" fontSize="144" letterSpacing="-13">
            <text x="16" y="169" textLength="565" lengthAdjust="spacingAndGlyphs" fill="#172658" stroke="#02030a" strokeWidth="18" paintOrder="stroke">セイラン</text>
            <text x="10" y="158" textLength="565" lengthAdjust="spacingAndGlyphs" fill="url(#seiran-letter)" stroke="#080c17" strokeWidth="10" paintOrder="stroke">セイラン</text>
          </g>
          <path d="m116 65-17 37 35-18-19 33 45-61zM583 142l31-20-9 22 29-16-40 43z" fill="#ffffff"/>
        </svg></h1>
        <p className="title-tagline">走れ、きみだけの一台。</p>
      </div>
      <img className="title-machine" src={machine} alt="青と白のボディに金色のラインが入ったセイラン" fetchPriority="high"/>
      <button className="title-start" aria-label="ゲーム開始" ref={startButton} onClick={start}>
        <span className="title-start-coins" aria-hidden="true">{'START'.split('').map((letter,i)=><span key={i}>{letter}</span>)}</span>
        <span className="title-start-caption">ゲーム開始</span>
      </button>
      {naming&&<div className="title-name-scrim"><form className="title-name" onSubmit={event=>{event.preventDefault();const value=name.trim();if(!value)return;onName(value);setNaming(false);onStart();}}><h2>名前を決めよう</h2><p>レースやオンライン記録に表示されます。</p><label>プレイヤー名<input autoFocus value={name} maxLength={24} onChange={event=>setName(event.target.value)} /></label><div><button type="submit" disabled={!name.trim()}>この名前で始める</button><button type="button" onClick={()=>setNaming(false)}>戻る</button></div></form></div>}
      <footer className="title-footer"><span>CHIBI 4WD · SEIRAN</span><small>進行はこのブラウザに自動保存されます</small></footer>
    </div>
  </section>;
}
