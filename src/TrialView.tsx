import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './game/store';
import { TrialRenderer } from './game/TrialRenderer';
import { countdownNumber, createRaceState, officialTime, rankRacers } from './game/race';
import { circuit, circuitLength, sampleLanePath } from './data/circuit';
import './trial.css';
import { createFinishPresentation } from './game/finishPresentation';
import { equippedCondition, batteryCharge, motorFactor } from './game/condition';
import { RaceRanking } from './RaceRanking';

function clock(seconds:number){
  const centiseconds=Math.floor(seconds*100);
  return `${String(Math.floor(centiseconds/6000)).padStart(2,'0')}:${String(Math.floor(centiseconds/100)%60).padStart(2,'0')}.${String(centiseconds%100).padStart(2,'0')}`;
}

function StarterPortrait(){
  return <svg className="starter-portrait" viewBox="0 0 32 40" aria-hidden="true" shapeRendering="crispEdges">
    <path fill="#17224b" d="M0 0h32v40H0z"/>
    <path fill="#31588b" d="M5 7h22v8H5zM8 3h17v8H8z"/>
    <path fill="#f6d16a" d="M13 5h5v5h-5z"/>
    <path fill="#754937" d="M7 14h19v10H7z"/>
    <path fill="#f4c49b" d="M8 15h16v12H8zM5 18h3v6H5zM24 18h3v6h-3z"/>
    <path fill="#283546" d="M10 18h3v3h-3zM20 18h3v3h-3z"/>
    <path fill="#a87058" d="M13 24h7v2h-7z"/>
    <path fill="#e7aa4d" d="M6 29h21v11H6zM2 33h5v7H2zM27 33h4v7h-4z"/>
    <path fill="#f1e3bb" d="M13 29h7v5h-7z"/>
  </svg>;
}

export default function TrialView(){
  const host=useRef<HTMLDivElement>(null);
  const renderer=useRef<TrialRenderer|null>(null);
  const equipment=useGame(s=>s.equipment);
  const close=useGame(s=>s.close);
  const prize=useGame(s=>s.lastPrize);
  const money=useGame(s=>s.money);
  const [state,setState]=useState(()=>createRaceState(equipment));
  const [finish,setFinish]=useState(createFinishPresentation);
  const [attempt,setAttempt]=useState(0);
  const [overview,setOverview]=useState(false);
  const [error,setError]=useState('');

  useEffect(()=>{
    const stored=useGame.getState();
    const condition=equippedCondition(equipment,stored.units,stored.selectedUnits);
    setState(createRaceState(equipment,0x5eed,condition));setFinish(createFinishPresentation());setError('');setOverview(false);
    const raceAttempt=useGame.getState().raceAttempt;
    try{renderer.current=new TrialRenderer(host.current!,equipment,race=>{
      useGame.getState().settleRace(raceAttempt,race);
      setState(race);
    },setFinish,condition);}
    catch{setError('3D表示を開始できませんでした。WebGL対応ブラウザで再試行してください。');}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[equipment,attempt]);

  const start=useCallback(()=>renderer.current?.start(),[]);
  useEffect(()=>{
    const handleKey=(event:KeyboardEvent)=>{
      if(event.repeat&&['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();return;}
      if(state.phase==='finished'||(state.phase!=='ready'&&state.playerStartOffset!==null)||error)return;
      if(event.target instanceof HTMLButtonElement&&event.code!=='KeyZ')return;
      if(['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();start();}
    };
    window.addEventListener('keydown',handleKey);
    return()=>window.removeEventListener('keydown',handleKey);
  },[state.phase,state.playerStartOffset,error,start]);

  const ready=state.phase==='ready';
  const counting=state.phase==='countdown';
  const finished=state.phase==='finished';
  const player=state.racers.find(r=>r.id==='player')!;
  const driving=player.driving;
  const waitingForLaunch=!ready&&!finished&&state.playerStartOffset===null;
  const waitingForGo=state.phase==='running'&&waitingForLaunch;
  const playerTime=officialTime(state,player);
  const penaltyText=state.falseStartPenalty>0?`フライング加算 +${state.falseStartPenalty.toFixed(2)}秒`:'';
  const playerPath=sampleLanePath(driving.distance,player.lane);
  const standings=rankRacers(state);
  const position=standings.findIndex(r=>r.id==='player')+1;
  const showResults=finish.stage==='results',showTally=finish.stage==='tally';
  const lastArrival=finish.arrivals.at(-1);
  const lastFinisher=state.racers.find(r=>r.id===lastArrival?.id);
  const firstFinisher=state.racers.find(r=>r.id===finish.arrivals[0]?.id);
  const winner=standings.find(r=>r.driving.status==='finished');
  const recentGoal=lastArrival&&lastArrival.age<1.8;
  const retry=()=>{
    useGame.getState().startTrial();
    setAttempt(n=>n+1);
  };
  const message=error||(showTally?'全マシンの走行が終了！ フライング加算も含めて、公式記録を集計しています。':
    showResults?(driving.status==='out'?(driving.stopReason==='battery'?'今回は電池切れ。電池を交換しよう！':'今回はコースアウト。次は完走を目指そう！'):`最終結果！ あなたは ${position}位。公式記録は ${clock(playerTime)}${penaltyText?`（${penaltyText}込み）`:''}。`):
    ready?'まずは３カウント開始。GOが出たら、もう一度ボタンを押して自分のマシンを発進させよう！':
    counting?(state.falseStartPenalty>0?`${penaltyText}。GOより早く発進した分を記録に加えるよ。`:`${countdownNumber(state)}…… GOまで待とう。今押すとフライングだよ！`):
    waitingForGo?'GO！ きみの操作で発進！ CPUはもう走り出しているよ。':
    recentGoal?`${lastFinisher?.name}、ゴールイン！ 公式タイム ${clock(officialTime(state,lastFinisher!))}。${state.falseStartPenalty>0?'最終順位は加算後のタイムで決まります。':''}`:
    finished?'全車のゴールを確認！ まもなく最終結果を発表します。':
    finish.stage==='approach'?'いよいよ最終ストレート！ 先頭のマシンがゴールへ飛び込んでくる！':
    driving.status==='finished'?`ゴール！ 記録は ${clock(playerTime)}。ほかのマシンのゴールを待とう。`:
    driving.status==='out'?(driving.stopReason==='battery'?'電池切れで停止！ 別の電池に交換しよう。':'コースアウト！ マシンを回収したよ。ほかのマシンは走行中。'):
    state.time<2?'スタート！ GOからの反応時間も記録に含まれるよ。':playerPath.changing?`レーンチェンジ！ ${playerPath.from+1}コースから ${playerPath.to+1}コースへ。５周で全レーンを走るよ。`:`あなたは現在 ${position}位！ 赤いマシンの上の黄色い印が目印だよ。`);

  return <section className="trial retro-race" aria-label="5台の3Dレース" data-phase={state.phase} data-finish-stage={finish.stage}>
    <header className="race-header"><h2>{circuit.name}<span>{circuit.lanes}レーン・{circuit.laps}周レース</span></h2><nav aria-label="レース操作">
      <button onClick={()=>{renderer.current?.setCamera(overview?'broadcast':'overview');setOverview(!overview);}} aria-pressed={overview}>{overview?'マシンを見る':'コース全体'}</button>
      <button onClick={close}>模型店へ <small>Esc</small></button>
    </nav></header>
    <RaceRanking race={state}/>
    <div className="race-viewport">
      <p className="race-rotate-hint">スマホを横向きにすると、コースを広く見渡せます</p>
      <div className="trial-canvas" ref={host}/>
      <div className="race-scanlines"/><div className="race-condition">電池 {(batteryCharge(player.equipment.battery,player.performance.batterySeconds+driving.time)*100).toFixed(1)}% ／ モーター {(motorFactor(player.performance.motorSeconds+driving.time)*100).toFixed(1)}%</div>
      {!error&&!showTally&&!showResults&&<><div className="race-lane">{playerPath.changing?`${playerPath.from+1} → ${playerPath.to+1}`:playerPath.lane+1}コース <span>あなた・{playerPath.changing?'レーンチェンジ中':'入門マシン'}</span></div>
        {ready&&<div className="race-start-mark" aria-hidden="true">START<span>▼</span></div>}
        {counting&&<div className="race-countdown" aria-label={`スタートまで ${countdownNumber(state)}`} key={countdownNumber(state)}>{countdownNumber(state)}</div>}
        {state.phase==='running'&&(state.time<1||waitingForGo)&&<div className="race-go" aria-hidden="true">GO!</div>}
        {penaltyText&&<div className="race-penalty" role="note">{penaltyText}</div>}
        {recentGoal&&<div className="race-goal-in">GOAL IN! <span>{lastFinisher?.name}</span></div>}
        <div className="race-timing" aria-label="走行状況">{firstFinisher?<><span>TIME <b>{clock(playerTime)}</b></span><span>{finished?'WINNER':'先着TIME'} <b>{clock(officialTime(state,finished?winner!:firstFinisher))}</b></span></>:<><span>POS <b>{ready||counting?'—':position} / 5</b></span><span>LAP <b>{Math.min(circuit.laps,Math.floor(driving.distance/circuitLength)+1)} / {circuit.laps}</b></span><span>TIME <b>{clock(playerTime)}</b></span><span className="race-speed"><b>{(driving.speed*3.6).toFixed(1)}</b> km/h</span></>}</div>
      </>}
      {showTally&&<section className="race-tally" aria-label="記録集計中"><span>TINY DRIVE</span><h3>レース記録を集計中…</h3><p>公式タイムで最終順位を確定します</p></section>}
      {showResults&&<section className="race-results" aria-label="レース最終結果"><p className="result-eyebrow">KOMOREBI MODEL SHOP</p><h3>{circuit.name} <span>レース結果</span></h3>
        {winner&&<p className="result-winner">WINNER <strong>{winner.name}</strong> <b>{clock(officialTime(state,winner))}</b></p>}
        <table><thead><tr><th>順位</th><th>マシン</th><th>スタート</th><th>公式タイム</th></tr></thead><tbody>{standings.map((r,i)=><tr key={r.id} className={r.id==='player'?'result-player':''}><td>{r.driving.status==='out'?'—':i+1}</td><td><i style={{backgroundColor:`#${r.color.toString(16).padStart(6,'0')}`}}/>{r.name}</td><td>{r.lane+1}コース</td><td>{r.driving.status==='out'?(r.driving.stopReason==='battery'?'BATTERY EMPTY':'COURSE OUT'):clock(officialTime(state,r))}</td></tr>)}</tbody></table>
        <p className="result-note">{penaltyText?`${penaltyText}を公式タイムに反映済み`:'公式タイムにはGO後の反応時間を含みます'}</p>
        <p className="result-note" role="status">{prize>0?`優勝賞金 +${prize}円！`:'今回の賞金はありません。'} 所持金 {money.toLocaleString('ja-JP')}円</p>
      </section>}
    </div>
    <footer className="race-message">
      <div className="race-speaker"><StarterPortrait/><span>コース係</span></div>
      <div className="race-commentary"><p className="race-phase">{error?'表示エラー':showResults?'最終結果':showTally?'記録集計中':ready?'スタート待機':counting?'スタートまで':waitingForGo?'GO・発進操作待ち':finish.stage==='finish'?'ゴールイン':finish.stage==='approach'?'最終ストレート':'レース中'}</p><p role="status" aria-live="polite">{message}</p><small>{ready?'Z / Enter / Space で３カウント開始':waitingForLaunch?'Z / Enter / Space で発進。GO前の発進は残り秒数を加算。':finished?`参加費なし・優勝賞金300円${prize>0?'（受取済み）':''}`:penaltyText||'走行は自動です。Esc で模型店に戻れます。'}</small></div>
      <div className="race-commands">
        {ready&&!error?<button className="race-start-button" onClick={start}>▶ カウント開始</button>:null}
        {waitingForLaunch&&!error&&<button className="race-start-button" onClick={start}>{counting?'▶ 発進（早出）':'▶ GO！ 発進'}</button>}
        {(showResults||error)&&<button className="race-start-button" onClick={retry}>▶ もう一度</button>}
        {showResults&&<button onClick={close}>模型店へ戻る</button>}
        {!ready&&!finished&&!waitingForLaunch&&!error&&<span className="race-running">走行中<span>●</span></span>}
      </div>
    </footer>
  </section>;
}
