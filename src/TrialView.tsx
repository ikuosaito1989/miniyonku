import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './game/store';
import { TrialRenderer } from './game/TrialRenderer';
import { countdownNumber, createRaceState, officialTime, rankRacers } from './game/race';
import { getCircuitTrack } from './data/circuit';
import { currentShop } from './data/world';
import './trial.css';
import { createFinishPresentation } from './game/finishPresentation';
import { equippedCondition, batteryLabel, motorFactor } from './game/condition';
import { RaceRanking } from './RaceRanking';
import { nextShopRace } from './data/shopHints';
import { AudioControls } from './GameAudio';
import { useAudioSettings } from './game/audioSettings';
import starterPortrait from './assets/portraits/starter-pop.webp';
import { prizesForCircuit } from './data/economy';

function clock(seconds:number){
  const centiseconds=Math.floor(seconds*100);
  return `${String(Math.floor(centiseconds/6000)).padStart(2,'0')}:${String(Math.floor(centiseconds/100)%60).padStart(2,'0')}.${String(centiseconds%100).padStart(2,'0')}`;
}

function StarterPortrait(){
  return <img className="starter-portrait" src={starterPortrait} alt="" decoding="async" aria-hidden="true"/>;
}

export default function TrialView(){
  const host=useRef<HTMLDivElement>(null);
  const renderer=useRef<TrialRenderer|null>(null);
  const equipment=useGame(s=>s.equipment);
  const close=useGame(s=>s.close);
  const prize=useGame(s=>s.lastPrize);
  const money=useGame(s=>s.money);
  const qualificationNotice=useGame(s=>s.qualificationNotice);
  const legendChallenge=useGame(s=>s.legendChallengeActive);
  const villainChallenge=useGame(s=>s.villainChallengeActive),thirdShopNotice=useGame(s=>s.thirdShopNotice);
  const aozoraWon=useGame(s=>s.aozoraWon),villainDefeated=useGame(s=>s.villainDefeated);
  const challenge=legendChallenge?true:villainChallenge?'villain' as const:false;
  const location=useGame(s=>s.location),shop=currentShop(location);
  const prizes=prizesForCircuit(shop.circuitId);
  const {circuit,circuitLength,sampleLanePath}=getCircuitTrack(shop.circuitId);
  const [state,setState]=useState(()=>createRaceState(equipment,useGame.getState().raceSeed,undefined,challenge,shop.circuitId));
  const [finish,setFinish]=useState(createFinishPresentation);
  const [overview,setOverview]=useState(false);
  const [error,setError]=useState('');
  const sound=useAudioSettings(s=>s.enabled),volume=useAudioSettings(s=>s.volume);

  useEffect(()=>{
    const stored=useGame.getState();
    const condition=equippedCondition(equipment,stored.units,stored.selectedUnits);
    setState(createRaceState(equipment,stored.raceSeed,condition,challenge,shop.circuitId));setFinish(createFinishPresentation());setError('');setOverview(false);
    const raceAttempt=useGame.getState().raceAttempt;
    try{renderer.current=new TrialRenderer(host.current!,equipment,race=>{
      useGame.getState().settleRace(raceAttempt,race);
      setState(race);
    },setFinish,condition,stored.raceSeed,challenge,shop.circuitId);}
    catch{setError('3D表示を開始できませんでした。WebGL対応ブラウザで再試行してください。');}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[equipment,challenge,shop.circuitId]);
  useEffect(()=>{renderer.current?.setSound(sound,volume);},[sound,volume,equipment]);

  const start=useCallback(()=>renderer.current?.start(),[]);
  const showRaceResults=useCallback(()=>renderer.current?.showResults(),[]);
  useEffect(()=>{
    const handleKey=(event:KeyboardEvent)=>{
      if(event.target instanceof Element&&event.target.closest('[data-audio-controls]'))return;
      if(event.repeat&&['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();return;}
      if(error)return;
      if(event.target instanceof HTMLButtonElement&&event.code!=='KeyZ')return;
      if(state.racers.find(r=>r.id==='player')?.driving.status==='finished'&&finish.stage!=='results'&&['KeyZ','Enter','Space'].includes(event.code)){
        event.preventDefault();showRaceResults();return;
      }
      if(state.phase==='finished'||(state.phase!=='ready'&&state.playerStartOffset!==null))return;
      if(['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();start();}
    };
    window.addEventListener('keydown',handleKey);
    return()=>window.removeEventListener('keydown',handleKey);
  },[state.phase,state.playerStartOffset,state.racers,finish.stage,error,start,showRaceResults]);

  const ready=state.phase==='ready';
  const counting=state.phase==='countdown';
  const finished=state.phase==='finished';
  const player=state.racers.find(r=>r.id==='player')!;
  const driving=player.driving;
  const waitingForLaunch=!ready&&!finished&&state.playerStartOffset===null&&driving.status==='ready';
  const waitingForGo=state.phase==='running'&&waitingForLaunch;
  const playerTime=officialTime(state,player);
  const penaltyText=state.falseStartPenalty>0?`フライング加算 +${state.falseStartPenalty.toFixed(2)}秒`:'';
  const playerPath=sampleLanePath(driving.distance,player.lane);
  const standings=rankRacers(state);
  const position=standings.findIndex(r=>r.id==='player')+1;
  const showResults=finish.stage==='results',showTally=finish.stage==='tally';
  const canViewResults=driving.status==='finished'&&!showResults&&!error;
  const lastArrival=finish.arrivals.at(-1);
  const lastFinisher=state.racers.find(r=>r.id===lastArrival?.id);
  const firstFinisher=state.racers.find(r=>r.id===finish.arrivals[0]?.id);
  const winner=standings.find(r=>r.driving.status==='finished');
  const recentGoal=lastArrival&&lastArrival.age<1.8;
  const message=error||(showTally?'全マシンの走行が終了！ フライング加算も含めて、公式記録を集計しています。':
    showResults?(legendChallenge?'伝説の2人は異次元の速さ！ 背中が遠い……この悔しさを次の挑戦につなげよう。':villainChallenge?(position===1&&driving.status==='finished'?'影山 陸に勝利！ ひなた模型店への紹介状を手に入れた。模型店に戻って影山の話を聞こう。':'影山 陸との勝負は敗北。店内の影山に話しかければ、準備して再挑戦できるよ。'):driving.status==='out'?(driving.stopReason==='lapped'?'周回遅れでリタイア。セッティングを見直して挑戦しよう！':driving.stopReason==='battery'?'今回は電池切れ。電池を交換しよう！':'今回はコースアウト。次は完走を目指そう！'):`最終結果！ あなたは ${position}位。公式記録は ${clock(playerTime)}${penaltyText?`（${penaltyText}込み）`:''}。`):
    ready?'画面をタップでカウント開始 → GOで再タップして発進！':
    counting?(state.falseStartPenalty>0?`${penaltyText}。GOより早く発進した分を記録に加えるよ。`:`${countdownNumber(state)}…… GOまで待とう。今押すとフライングだよ！`):
    waitingForGo?'GO！ 画面のどこでもタップして発進！':
    driving.status==='finished'?`ゴール！ 記録は ${clock(playerTime)}。画面をタップすると結果を見られます。`:
    recentGoal?`${lastFinisher?.name}、ゴールイン！ 公式タイム ${clock(officialTime(state,lastFinisher!))}。${state.falseStartPenalty>0?'最終順位は加算後のタイムで決まります。':''}`:
    finished?'全車のゴールを確認！ まもなく最終結果を発表します。':
    finish.stage==='approach'?'いよいよ最終ストレート！ 先頭のマシンがゴールへ飛び込んでくる！':
    driving.status==='out'?(driving.stopReason==='lapped'?'先頭に1周差をつけられ、リタイア。ほかのマシンの結果を確認しています。':driving.stopReason==='battery'?'電池切れで停止！ 別の電池に交換しよう。':'コースアウト！ マシンを回収したよ。ほかのマシンは走行中。'):
    state.time<2?'スタート！ GOからの反応時間も記録に含まれるよ。':playerPath.changing?`レーンチェンジ！ ${playerPath.from+1}コースから ${playerPath.to+1}コースへ。５周で全レーンを走るよ。`:`あなたは現在 ${position}位！ 赤いマシンの上の黄色い印が目印だよ。`);

  return <section className="trial retro-race" aria-label={legendChallenge?'レジェンド挑戦レース':villainChallenge?'影山 陸との挑戦レース':'5台の3Dレース'} data-phase={state.phase} data-finish-stage={finish.stage} onClick={event=>{
    // 操作ボタン自身の処理と二重発火させない。カメラ・音・退出も発進しない。
    if(event.target instanceof Element&&event.target.closest('button,a,input,select,textarea,[data-audio-controls]'))return;
    if(canViewResults)showRaceResults();
    else if(!error&&(ready||waitingForLaunch))start();
  }}>
    <header className="race-header"><h2>{legendChallenge?'レジェンド挑戦':villainChallenge?'影山 陸からの挑戦':circuit.name}<span>{circuit.lanes}レーン・{circuit.laps}周レース</span></h2><nav aria-label="レース操作">
      <AudioControls/>
      <button className="race-camera-button" onClick={()=>{renderer.current?.setCamera(overview?'broadcast':'overview');setOverview(!overview);}} aria-pressed={overview}>{overview?'マシンを見る':'コース全体'}</button>
      <button onClick={close}>模型店へ <small>Esc</small></button>
    </nav></header>
    <RaceRanking race={state}/>
    <div className="race-viewport">
      <div className="trial-canvas" ref={host}/>
      <div className="race-scanlines"/><div className="race-condition">電池 {batteryLabel(player.equipment.battery,player.performance.batterySeconds+driving.time)} ／ モーター {(motorFactor(player.performance.motorSeconds+driving.time,player.equipment.motor)*100).toFixed(1)}%</div>
      {!error&&!showTally&&!showResults&&<><div className="race-lane">{playerPath.changing?`${playerPath.from+1} → ${playerPath.to+1}`:playerPath.lane+1}コース <span>あなた・{playerPath.changing?'レーンチェンジ中':'入門マシン'}</span></div>
        {ready&&<div className="race-start-mark" aria-hidden="true">START<span>▼</span></div>}
        {counting&&<div className="race-countdown" aria-label={`スタートまで ${countdownNumber(state)}`} key={countdownNumber(state)}>{countdownNumber(state)}</div>}
        {state.phase==='running'&&(state.time<1||waitingForGo)&&<div className="race-go" aria-hidden="true">GO!</div>}
        {penaltyText&&<div className="race-penalty" role="note">{penaltyText}</div>}
        {recentGoal&&<div className="race-goal-in">GOAL IN! <span>{lastFinisher?.name}</span></div>}
        <div className="race-timing" aria-label="走行状況">{firstFinisher?<><span>TIME <b>{clock(playerTime)}</b></span><span>{finished?'WINNER':'先着TIME'} <b>{clock(officialTime(state,finished?winner!:firstFinisher))}</b></span></>:<><span>POS <b>{ready||counting?'—':position} / 5</b></span><span>LAP <b>{Math.min(circuit.laps,Math.floor(driving.distance/circuitLength)+1)} / {circuit.laps}</b></span><span>TIME <b>{clock(playerTime)}</b></span><span className="race-speed"><b>{(driving.speed*3.6).toFixed(1)}</b> km/h</span></>}</div>
      </>}
      {showTally&&<section className="race-tally" aria-label="記録集計中"><span>TINY DRIVE</span><h3>レース記録を集計中…</h3><p>公式タイムで最終順位を確定します</p></section>}
      {showResults&&<section className="race-results" aria-label="レース最終結果"><p className="result-eyebrow">{shop.name}</p><h3>{circuit.name} <span>レース結果</span></h3>
        {winner&&<p className="result-winner">WINNER <strong>{winner.name}</strong> <b>{clock(officialTime(state,winner))}</b></p>}
        <table><thead><tr><th>順位</th><th>マシン</th><th>スタート</th><th>公式タイム</th></tr></thead><tbody>{standings.map((r,i)=><tr key={r.id} className={r.id==='player'?'result-player':''}><td>{r.driving.status==='out'?'—':i+1}</td><td><i style={{backgroundColor:`#${r.color.toString(16).padStart(6,'0')}`}}/>{r.name}</td><td>{r.lane+1}コース</td><td>{r.driving.status==='out'?(r.driving.stopReason==='lapped'?'周回遅れ':r.driving.stopReason==='battery'?'BATTERY EMPTY':'COURSE OUT'):clock(officialTime(state,r))}</td></tr>)}</tbody></table>
        <p className="result-note">{penaltyText?`${penaltyText}を公式タイムに反映済み`:'公式タイムにはGO後の反応時間を含みます'}</p>
        <p className="result-note" role="status">{legendChallenge?'特別レースのため賞金はありません。':prize>0?`${winner?.id==='player'?'優勝賞金':'完走賞'} +${prize}円！`:'今回の賞金はありません。'} 所持金 {money.toLocaleString('ja-JP')}円</p>
        {legendChallenge&&<p className="result-note" role="status">風見 怜と火野 岳が圧倒的な走りを披露した。次こそ追いつこう！</p>}
        {qualificationNotice&&<p className="result-note" role="status">初優勝！ {nextShopRace.shopName}のレース参加資格を獲得！ 店に戻り、訪ねてきた最強兄弟と特別レースを走ろう。その後、出口から街へ進めます。</p>}
        {qualificationNotice&&<p className="result-note" role="status">優勝記念ボディ「セイラン Vortex GT」を受け取りました。セッティングで装着できます。</p>}
        {shop.id==='aozora'&&aozoraWon&&!villainChallenge&&!villainDefeated&&<p className="result-note" role="status">あおぞらの優勝者に、影山 陸から挑戦状！ 模型店へ戻って話を聞こう。</p>}
        {thirdShopNotice&&<p className="result-note" role="status">影山 陸を撃破！ ひなた模型店が解放されました。町に出て、あおぞら模型店の右隣へ進もう。</p>}
      </section>}
    </div>
    <footer className="race-message">
      <div className="race-speaker"><StarterPortrait/><span>コース係</span></div>
      <div className="race-commentary"><p className="race-phase">{error?'表示エラー':showResults?'最終結果':showTally?'記録集計中':ready?'スタート待機':counting?'スタートまで':waitingForGo?'GO・発進操作待ち':finish.stage==='finish'?'ゴールイン':finish.stage==='approach'?'最終ストレート':'レース中'}</p><p role="status" aria-live="polite">{message}</p><small>{canViewResults?'画面タップ / Z・Enter・Space で結果を見る':ready?'Z / Enter / Space で３カウント開始':waitingForLaunch?'Z / Enter / Space で発進。GO前の発進は残り秒数を加算。':finished?legendChallenge?'特別レース・賞金なし':`参加費なし・優勝${prizes[0].toLocaleString('ja-JP')}円／2〜5位も完走賞${prize>0?'（受取済み）':''}`:penaltyText||'走行は自動です。Esc で模型店に戻れます。'}</small></div>
      <div className="race-commands">
        {ready&&!error?<button className="race-start-button" onClick={start}>▶ カウント開始</button>:null}
        {waitingForLaunch&&!error&&<button className="race-start-button" onClick={start}>{counting?'▶ 発進（早出）':'▶ GO！ 発進'}</button>}
        {canViewResults&&<button className="race-start-button" onClick={showRaceResults}>▶ 結果を見る</button>}
        {(showResults||error)&&<button onClick={close}>模型店へ戻る</button>}
        {!ready&&!finished&&!waitingForLaunch&&!canViewResults&&!error&&<span className="race-running">走行中<span>●</span></span>}
      </div>
    </footer>
  </section>;
}
