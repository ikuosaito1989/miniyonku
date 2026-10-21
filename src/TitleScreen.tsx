import { useEffect, useRef } from 'react';
import interior from './assets/shop/interior-v1.webp';
import './title.css';

export function TitleScreen({ onStart }: { onStart: () => void }) {
  const startButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    startButton.current?.focus();
    const startWithZ = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'z' && document.activeElement === startButton.current) {
        event.preventDefault();
        onStart();
      }
    };
    window.addEventListener('keyup', startWithZ);
    return () => window.removeEventListener('keyup', startWithZ);
  }, [onStart]);

  return <section className="title-screen" aria-labelledby="game-title">
    <img className="title-interior" src={interior} alt="" />
    <div className="title-shade" />
    <header className="title-topline"><span>緑川町・こもれび模型店</span><span>SMALL MACHINES. BIG DREAMS.</span></header>
    <div className="title-content">
      <p className="title-kicker">小さなマシンで、大きな夢を。</p>
      <h1 id="game-title">TINY<span>DRIVE<span className="title-period">.</span></span></h1>
      <p className="title-subtitle">こもれび模型店</p>
      <div className="title-rule" />
      <p className="title-story">お気に入りの一台を、きみの手で。<br />パーツを選んで、走らせて、少しずつ速くなる。</p>
      <button className="title-start" ref={startButton} onClick={onStart}>模型店へ <span aria-hidden="true">→</span></button>
      <p className="title-input">タップ / Enter / Space / Z でスタート</p>
    </div>
    <footer className="title-footer"><span>進行はこのブラウザに自動保存されます</span><span>TINY DRIVE · v0.1</span></footer>
  </section>;
}
