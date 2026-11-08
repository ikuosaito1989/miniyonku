import {useEffect,useState} from 'react';

interface BreakInBenchProps{seconds:number;factor:number;disabled?:boolean;onBreakIn:()=>void;notice:string}

const clock=(seconds:number)=>`${Math.floor(seconds/60).toString().padStart(2,'0')}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;

export function BreakInBench({seconds,factor,disabled,onBreakIn,notice}:BreakInBenchProps){
  const [running,setRunning]=useState(false);
  const [cycle,setCycle]=useState(0);
  useEffect(()=>{if(!running)return;const timer=window.setTimeout(()=>setRunning(false),1700);return()=>window.clearTimeout(timer);},[running,cycle]);
  const progress=Math.max(0,Math.min(100,seconds/60*100));
  const power=Math.max(0,Math.min(100,Math.round((factor-.55)/(1.08-.55)*100)));
  const activate=()=>{onBreakIn();setCycle(value=>value+1);setRunning(true);};
  return <div className="breakin-bench">
    <div className={`breakin-rig${running?' is-running':''}`} key={cycle}>
      <svg viewBox="0 0 920 390" role="img" aria-labelledby="breakin-title breakin-desc">
        <title id="breakin-title">ミニ四駆ブレークインベンチ</title>
        <desc id="breakin-desc">ローラー台の上でモーターをブレークインする演出。タイマーと出力表示は装飾です。</desc>
        <defs>
          <linearGradient id="rig-top" x2="0" y2="1"><stop stopColor="#f04b4a"/><stop offset="1" stopColor="#9f2229"/></linearGradient>
          <linearGradient id="rig-face" x2="0" y2="1"><stop stopColor="#25303b"/><stop offset="1" stopColor="#101820"/></linearGradient>
          <linearGradient id="car-shell" x2="0" y2="1"><stop stopColor="#f6f8f4"/><stop offset=".52" stopColor="#dce8eb"/><stop offset="1" stopColor="#9daeb7"/></linearGradient>
          <filter id="soft-shadow" x="-.2" y="-.2" width="1.4" height="1.5"><feGaussianBlur stdDeviation="7"/></filter>
        </defs>
        <ellipse cx="427" cy="295" rx="366" ry="28" fill="#000" opacity=".35" filter="url(#soft-shadow)"/>
        <path d="M90 265h666l35 26H72z" fill="#c83339" stroke="#f56a66" strokeWidth="5"/>
        <path d="M111 285h624v37H111z" fill="#212a31" stroke="#66737c" strokeWidth="5"/>
        <path d="M133 321h570l-22 18H155z" fill="#11171c"/>
        <circle cx="181" cy="320" r="10" fill="#080c10" stroke="#59636a" strokeWidth="4"/><circle cx="681" cy="320" r="10" fill="#080c10" stroke="#59636a" strokeWidth="4"/>

        {/* Power leads: decorative low-voltage cables from the bench to the car. */}
        <path className="breakin-cable-red" d="M736 233C690 184 691 76 556 66S369 82 351 146" fill="none" stroke="#ee4245" strokeWidth="11" strokeLinecap="round"/>
        <path className="breakin-cable-dark" d="M757 234C718 185 718 91 576 82S389 93 376 150" fill="none" stroke="#14191d" strokeWidth="10" strokeLinecap="round"/>
        <path d="M338 139l48 8-4 24-50-9z" fill="#303941" stroke="#101519" strokeWidth="4"/>

        {/* Miniature chassis on a pair of rollers. */}
        <g className="breakin-car">
          <path d="M149 211h493l30 18v30H135v-24z" fill="#171b20" stroke="#05080a" strokeWidth="5"/>
          <path d="M224 206l29-29h238l48 25 45 3 15 23H199z" fill="url(#car-shell)" stroke="#6f7f89" strokeWidth="5"/>
          <path d="M290 181l25-23h116l37 24z" fill="#243947" stroke="#131d25" strokeWidth="4"/>
          <path d="M323 178l13-14h31v14z" fill="#8bb1bf" opacity=".8"/>
          <path d="M235 205h45l-16 17h-51zM513 199h29l36 15h-58z" fill="#d34248"/>
          <path d="M166 227h465" stroke="#48545c" strokeWidth="5"/>
          <path d="M201 247h425" stroke="#080c10" strokeWidth="7"/>
          <g transform="translate(258 231)"><g className="breakin-wheel"><circle r="54" fill="#101316" stroke="#050607" strokeWidth="7"/><circle r="39" fill="#e4e6e2" stroke="#b2b9ba" strokeWidth="5"/><circle r="10" fill="#727e83"/><path d="M0-33v23m0 20v23M-33 0h23m20 0h23M-23-23l16 16m14 14 16 16m0-46L7-7M-7 7l-16 16" stroke="#aab3b4" strokeWidth="7" strokeLinecap="round"/></g></g>
          <g transform="translate(555 231)"><g className="breakin-wheel"><circle r="54" fill="#101316" stroke="#050607" strokeWidth="7"/><circle r="39" fill="#e4e6e2" stroke="#b2b9ba" strokeWidth="5"/><circle r="10" fill="#727e83"/><path d="M0-33v23m0 20v23M-33 0h23m20 0h23M-23-23l16 16m14 14 16 16m0-46L7-7M-7 7l-16 16" stroke="#aab3b4" strokeWidth="7" strokeLinecap="round"/></g></g>
        </g>
        <path d="M201 283h111v7H201zm288 0h111v7H489z" fill="#d3dadd" opacity=".78"/>

        {/* Bench control panel. */}
        <path d="M91 291h654v-98q0-17 18-17h23q18 0 18 18v104H91z" fill="url(#rig-face)" stroke="#080d11" strokeWidth="5"/>
        <path d="M108 197h638v89H108z" fill="#121a21" stroke="#6a7378" strokeWidth="3"/>
        <text x="130" y="218" className="breakin-brand">KOMOREBI  /  MINI BREAK-IN BENCH</text>
        <text x="133" y="241" className="breakin-label">RUN TIME</text>
        <rect x="128" y="248" width="157" height="39" rx="3" fill="#260d12" stroke="#4f3437" strokeWidth="3"/>
        <text x="145" y="278" className="breakin-digits">{clock(seconds)}</text>
        <text x="307" y="241" className="breakin-label">MOTOR OUTPUT</text>
        <rect x="302" y="248" width="126" height="39" rx="3" fill="#101a13" stroke="#4c6250" strokeWidth="3"/>
        <text x="318" y="278" className="breakin-volts">{power.toString().padStart(2,'0')}<tspan className="breakin-unit"> %</tspan></text>
        <text x="132" y="306" className="breakin-caption">ACCUMULATED</text>
        <text x="308" y="306" className="breakin-caption">SIMULATED</text>
        <text x="499" y="241" className="breakin-label">BREAK-IN</text>
        <rect x="494" y="250" width="198" height="12" rx="6" fill="#080d10" stroke="#657179" strokeWidth="2"/>
        <rect x="498" y="254" width={`${Math.max(0,Math.min(190,190*progress/100))}`} height="4" rx="2" fill="#f3c94d"/>
        <text x="496" y="281" className="breakin-caption">{Math.min(60,Math.floor(seconds))} / 60 SEC TO PEAK</text>
        <circle cx="714" cy="250" r="35" fill="#e64748" stroke="#f7d7d5" strokeWidth="8"/>
        <circle cx="714" cy="250" r="23" fill="#c32e35" stroke="#83232a" strokeWidth="3"/>
        <path d="M714 229v20l12 10" fill="none" stroke="#ff8b82" strokeWidth="4" strokeLinecap="round"/>
        <text x="702" y="300" className="breakin-caption">OUTPUT</text>
        <circle cx="786" cy="275" r="7" fill={running?'#72f29b':'#d3b746'} className="breakin-lamp"/>
      </svg>
    </div>
    <div className="breakin-controls">
      <div><strong>ブレークイン・ベンチ</strong><small>累積時間 {clock(seconds)} ／ 60秒でピーク</small></div>
      <button onClick={activate} disabled={disabled}>30秒ブレークインを実行</button>
    </div>
    <p className="breakin-note">{disabled?'消耗しないモーターはブレークイン不要です。':<>出力メーターは演出表示です。性能は保存された累積使用時間に基づいて反映されます。実行しても電池残量は減りません。</>}</p>
    <p role="status" className="breakin-status">{notice}</p>
  </div>;
}
