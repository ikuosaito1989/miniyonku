import {yuunagiTimeLimit} from './data/yuunagiCircuit';
import { CupScore } from './CupScore';
import {cupComplete,cupPlayerPlace} from './game/cup';
import { raceIntroDuration, raceIntroAt, courseIntroduction } from './game/raceIntro';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from './game/store';
import { TrialRenderer } from './game/TrialRenderer';
import { canViewRaceResults, countdownNumber, createRaceState, officialTime, rankRacers } from './game/race';
import { getCircuitTrack } from './data/circuit';
import { officialRace, officialRounds } from './data/officialRace';
import { currentShop, modelShops } from './data/world';
import './trial.css';
import { createFinishPresentation } from './game/finishPresentation';
import { equippedCondition, batteryLabel, motorFactor } from './game/condition';
import { RaceRanking } from './RaceRanking';
import { nextShopRace } from './data/shopHints';
import { AudioControls } from './GameAudio';
import { useAudioSettings } from './game/audioSettings';
import starterPortrait from './assets/portraits/starter-pop.webp';
import { prizesForCircuit } from './data/economy';

function clock(seconds:number,roundUp=false){
  const centiseconds=roundUp?Math.ceil(seconds*100-1e-7):Math.floor(seconds*100);
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
  const officialChallenge=useGame(s=>s.officialChallengeActive),officialQualificationNotice=useGame(s=>s.officialQualificationNotice);
  const challenge=officialChallenge?'official' as const:legendChallenge?true:villainChallenge?'villain' as const:false;
  const location=useGame(s=>s.location),shop=officialChallenge?modelShops.hinata:currentShop(location);
  const officialRound=useGame(s=>s.officialRound),wakabaCup=useGame(s=>s.wakabaCup),technicalCup=useGame(s=>s.technicalCup),gameOver=useGame(s=>s.gameOver),thirdQualified=useGame(s=>s.thirdOfficialQualified);
  const cup=location==='stadium-9'?technicalCup:wakabaCup,kind=location==='stadium-9'?'technical' as const:'wakaba' as const;
  const circuitId=officialChallenge?officialRounds[officialRound].circuitId:shop.circuitId;
  const raceName=officialChallenge?(location==='stadium-9'?officialRounds.technical.name:`${officialRace.name}・${officialRounds[officialRound].name}`):'';
  const timeTrial=circuitId==='trail',finalQualified=useGame(s=>s.finalQualified),bestTime=useGame(s=>s.yuunagiBestTime);
  const raceClock=(seconds:number)=>clock(seconds,timeTrial);
  const prizes=prizesForCircuit(circuitId);
  const {circuit,circuitLength,sampleLanePath}=getCircuitTrack(circuitId);
  const [state,setState]=useState(()=>createRaceState(equipment,useGame.getState().raceSeed,undefined,challenge,circuitId));
  const [intro,setIntro]=useState(()=>raceIntroAt(0));
  const introducing=intro.stage!=='done';
  const introduction=courseIntroduction(circuitId,officialChallenge);
  const [finish,setFinish]=useState(createFinishPresentation);
  const [overview,setOverview]=useState(false);
  const [error,setError]=useState('');
  const sound=useAudioSettings(s=>s.enabled),volume=useAudioSettings(s=>s.volume);

  useEffect(()=>{
    const stored=useGame.getState();
    const condition=equippedCondition(equipment,stored.units,stored.selectedUnits);
    setState(createRaceState(equipment,stored.raceSeed,condition,challenge,circuitId));setFinish(createFinishPresentation());setError('');setOverview(false);setIntro(raceIntroAt(0));
    const raceAttempt=useGame.getState().raceAttempt;
    try{renderer.current=new TrialRenderer(host.current!,equipment,race=>{
      useGame.getState().settleRace(raceAttempt,race);
      setState(race);
    },setFinish,condition,stored.raceSeed,challenge,circuitId,setIntro);}
    catch{setError('3D表示を開始できませんでした。WebGL対応ブラウザで再試行してください。');}
    return()=>{renderer.current?.dispose();renderer.current=null;};
  },[equipment,challenge,circuitId]);
  useEffect(()=>{renderer.current?.setSound(sound,volume);},[sound,volume,equipment]);

  const requestClose=useCallback(()=>{
    if(!error&&state.phase!=='finished'&&!window.confirm(`レースを終了して${officialChallenge?'会場':'模型店'}に戻りますか？\n${officialChallenge?'公式戦は一度限りです。このレースは棄権として記録され、やり直せません。':'途中で戻ると、このレースの賞金は受け取れません。'}`))return;
    close();
  },[close,error,state.phase,officialChallenge]);
  const skipIntro=useCallback(()=>renderer.current?.skipIntro(),[]);
  const start=useCallback(()=>renderer.current?.start(),[]);
  const showRaceResults=useCallback(()=>renderer.current?.showResults(),[]);
  useEffect(()=>{
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();if(!event.repeat)requestClose();return;}
      if(event.target instanceof Element&&event.target.closest('[data-audio-controls]'))return;
      if(event.repeat&&['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();return;}
      if(error)return;
      if(event.target instanceof HTMLButtonElement&&event.code!=='KeyZ')return;
      if(canViewRaceResults(state)&&finish.stage!=='results'&&['KeyZ','Enter','Space'].includes(event.code)){
        event.preventDefault();showRaceResults();return;
      }
      if(state.phase==='finished'||(state.phase!=='ready'&&state.playerStartOffset!==null))return;
      if(['KeyZ','Enter','Space'].includes(event.code)){event.preventDefault();start();}
    };
    window.addEventListener('keydown',handleKey);
    return()=>window.removeEventListener('keydown',handleKey);
  },[state.phase,state.playerStartOffset,state.racers,finish.stage,error,start,showRaceResults,requestClose]);

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
  const canViewResults=canViewRaceResults(state)&&!showResults&&!error;
  const lastArrival=finish.arrivals.at(-1);
  const lastFinisher=state.racers.find(r=>r.id===lastArrival?.id);
  const firstFinisher=state.racers.find(r=>r.id===finish.arrivals[0]?.id);
  const winner=standings.find(r=>r.driving.status==='finished');
  const recentGoal=lastArrival&&lastArrival.age<1.8;
  const message=error||(introducing?'レース場を紹介します。紹介の後は、カウント開始を押すまで発進しません。':showTally?'全マシンの走行が終了！ フライング加算も含めて、公式記録を集計しています。':
    showResults?(timeTrial?(driving.status==='finished'?(playerTime<=yuunagiTimeLimit?'規定40秒をクリア！ 第4公式大会・緑川グランプリの出場権を獲得！':'40秒を超えたよ。セッティングを変えて何度でも再挑戦しよう。'):'今回は完走できなかったよ。旋回とジャンプ着地を見直して再挑戦しよう。'):legendChallenge?'伝説の2人は異次元の速さ！ 背中が遠い……この悔しさを次の挑戦につなげよう。':villainChallenge?(position===1&&driving.status==='finished'?'黒岩 豪に勝利！ ひなた模型店への紹介状を手に入れた。模型店に戻って黒岩の話を聞こう。':'黒岩 豪との勝負は敗北。店内の黒岩に話しかければ、準備して再挑戦できるよ。'):driving.status==='out'?(driving.stopReason==='lapped'?'周回遅れでリタイア。セッティングを見直して挑戦しよう！':driving.stopReason==='battery'?'今回は電池切れ。電池を交換しよう！':'今回はコースアウト。次は完走を目指そう！'):`最終結果！ あなたは ${position}位。公式記録は ${raceClock(playerTime)}${penaltyText?`（${penaltyText}込み）`:''}。`):
    ready?'画面をタップでカウント開始 → GOで再タップして発進！':
    counting?(state.falseStartPenalty>0?`${penaltyText}。GOより早く発進した分を記録に加えるよ。`:`${countdownNumber(state)}…… GOまで待とう。今押すとフライングだよ！`):
    waitingForGo?'GO！ 画面のどこでもタップして発進！':
    driving.status==='finished'?`ゴール！ 記録は ${raceClock(playerTime)}。画面をタップすると結果を見られます。`:
    recentGoal?`${lastFinisher?.name}、ゴールイン！ 公式タイム ${raceClock(officialTime(state,lastFinisher!))}。${state.falseStartPenalty>0?'最終順位は加算後のタイムで決まります。':''}`:
    finished?'全車のゴールを確認！ まもなく最終結果を発表します。':
    finish.stage==='approach'?'いよいよ最終ストレート！ 先頭のマシンがゴールへ飛び込んでくる！':
    driving.status==='out'?(driving.stopReason==='lapped'?'先頭に1周差をつけられ、マシンがコース外へ！ リタイアです。':driving.stopReason==='battery'?'電池切れで停止！ 別の電池に交換しよう。':'コースアウト！ マシンを回収したよ。ほかのマシンは走行中。'):
    state.time<2?'スタート！ GOからの反応時間も記録に含まれるよ。':timeTrial?`ゴールまで残り${Math.max(0,circuitLength-driving.distance).toFixed(0)}m。規定40秒以内を目指そう！`:playerPath.changing?`レーンチェンジ！ ${playerPath.from+1}コースから ${playerPath.to+1}コースへ。５周で全レーンを走るよ。`:`あなたは現在 ${position}位！ 赤いマシンの上の黄色い印が目印だよ。`);

  return <section className="trial retro-race" data-camera={overview?'overview':'broadcast'} aria-label={legendChallenge?'レジェンド挑戦レース':villainChallenge?'黒岩 豪との挑戦レース':timeTrial?'一本道タイムアタック':'5台の3Dレース'} data-phase={introducing?'introduction':state.phase} data-intro-stage={intro.stage} data-finish-stage={finish.stage} onClick={event=>{
    // 操作ボタン自身の処理と二重発火させない。カメラ・音・退出も発進しない。
    if(event.target instanceof Element&&event.target.closest('button,a,input,select,textarea,[data-audio-controls]'))return;
    if(canViewResults)showRaceResults();
    else if(!error&&(ready||waitingForLaunch))start();
  }}>
    <header className="race-header"><h2>{officialChallenge?raceName:legendChallenge?'レジェンド挑戦':villainChallenge?'黒岩 豪からの挑戦':circuit.name}<span>{timeTrial?'一本道・1台タイムアタック':`${circuit.lanes}レーン・${circuit.laps}周レース`}</span></h2><nav aria-label="レース操作">
      <AudioControls/>
      <button className="race-camera-button" disabled={introducing} onClick={()=>{renderer.current?.setCamera(overview?'broadcast':'overview');setOverview(!overview);}} aria-pressed={overview}>{overview?'マシンを見る':'コース全体'}</button>
      <button onClick={requestClose}>{officialChallenge?'会場へ':'模型店へ'} <small>Esc</small></button>
    </nav></header>
    {!introducing&&(timeTrial?<div className="time-trial-target"><span>規定 <strong>{yuunagiTimeLimit.toFixed(2)}秒以内</strong></span><span>{bestTime!==null?`自己ベスト ${(Math.ceil(bestTime*100-1e-7)/100).toFixed(2)}秒`:'初挑戦'}</span><span>{finalQualified?'出場権獲得済み':'クリアで第4大会出場権'}</span></div>:<RaceRanking race={state}/>)}
    <div className="race-viewport">
      <div className="trial-canvas" ref={host}/>
      <div className="race-scanlines"/>
      {introducing&&!error&&<section className={`race-intro race-intro-${intro.stage}`} aria-label="レース場紹介">
        <div className="race-intro-heading"><span>COURSE INTRODUCTION</span><p>{officialChallenge?raceName:shop.name}</p><h2>{introduction.name}</h2></div>
        <div className="race-intro-caption" key={intro.stage}><span>{intro.stage==='overview'?'コース全景':intro.stage==='tour'?'コースの見どころ':'スターティンググリッド'}</span><p>{intro.stage==='overview'?`${timeTrial?'一本道・1台タイムアタック':`${introduction.lanes}レーン・${introduction.laps}周`} ／ 全長 約${introduction.distance}m`:intro.stage==='tour'?introduction.feature:introduction.advice}</p><small>{introduction.surface} ／ {timeTrial?'全長':'1周'} 約{introduction.lapLength}m ／ {legendChallenge?'特別レース・賞金なし':`${timeTrial?'完走賞':'1位賞金'} ${introduction.winnerPrize.toLocaleString('ja-JP')}円`}</small></div>
        <button className="race-intro-skip" onClick={skipIntro}>紹介をスキップ <small>Z / Enter / Space</small></button>
        <div className="race-intro-progress" aria-hidden="true"><i style={{transform:`scaleX(${intro.age/raceIntroDuration})`}}/></div>
      </section>}
      {!introducing&&!error&&!showTally&&!showResults&&<><div className="race-condition">電池 {batteryLabel(player.equipment.battery,player.performance.batterySeconds+driving.time)} ／ モーター {(motorFactor(player.performance.motorSeconds+driving.time,player.equipment.motor)*100).toFixed(1)}%</div>
        <div className="race-lane">{playerPath.changing?`${playerPath.from+1} → ${playerPath.to+1}`:playerPath.lane+1}コース <span>あなた・{playerPath.changing?'レーンチェンジ中':timeTrial?'タイムアタック':'入門マシン'}</span></div>
        {ready&&!overview&&<div className="race-start-mark" aria-hidden="true">START<span>▼</span></div>}
        {counting&&<div className="race-countdown" aria-label={`スタートまで ${countdownNumber(state)}`} key={countdownNumber(state)}>{countdownNumber(state)}</div>}
        {state.phase==='running'&&(state.time<1||waitingForGo)&&<div className="race-go" aria-hidden="true">GO!</div>}
        {penaltyText&&<div className="race-penalty" role="note">{penaltyText}</div>}
        {recentGoal&&<div className="race-goal-in">GOAL IN! <span>{lastFinisher?.name}</span></div>}
        <div className="race-timing" aria-label="走行状況">{firstFinisher?<><span>TIME <b>{raceClock(playerTime)}</b></span><span>{timeTrial?'規定':finished?'WINNER':'先着TIME'} <b>{raceClock(timeTrial?yuunagiTimeLimit:officialTime(state,finished?winner!:firstFinisher))}</b></span></>:<><span>POS <b>{ready||counting?'—':position} / {state.racers.length}</b></span><span>{timeTrial?'残り':'LAP'} <b>{timeTrial?`${Math.max(0,circuitLength-driving.distance).toFixed(0)}m`:`${Math.min(circuit.laps,Math.floor(driving.distance/circuitLength)+1)} / ${circuit.laps}`}</b></span><span>TIME <b>{raceClock(playerTime)}</b></span><span className="race-speed"><b>{(driving.speed*3.6).toFixed(1)}</b> km/h</span></>}</div>
      </>}
      {showTally&&<section className="race-tally" aria-label="記録集計中"><span>TINY DRIVE</span><h3>レース記録を集計中…</h3><p>公式タイムで最終順位を確定します</p></section>}
      {showResults&&<section className="race-results" aria-label="レース最終結果"><p className="result-eyebrow">{officialChallenge?(location==='stadium-9'?'星空公式レース会場':'若葉公式レース会場'):shop.name}</p><h3>{officialChallenge?raceName:circuit.name} <span>レース結果</span></h3>
        {winner&&<p className="result-winner">{timeTrial?'TIME ATTACK':'WINNER'} <strong>{winner.name}</strong> <b>{raceClock(officialTime(state,winner))}</b></p>}
        <table><thead><tr><th>{timeTrial?'判定':'順位'}</th><th>マシン</th><th>スタート</th><th>公式タイム</th></tr></thead><tbody>{standings.map((r,i)=><tr key={r.id} className={r.id==='player'?'result-player':''}><td style={{whiteSpace:'nowrap'}}>{r.driving.status==='out'?'—':timeTrial?officialTime(state,r)<=yuunagiTimeLimit?'クリア':'超過':i+1}</td><td><i style={{backgroundColor:`#${r.color.toString(16).padStart(6,'0')}`}}/>{r.name}</td><td>{r.lane+1}コース</td><td>{r.driving.status==='out'?(r.driving.stopReason==='lapped'?'周回遅れ':r.driving.stopReason==='battery'?'BATTERY EMPTY':'COURSE OUT'):raceClock(officialTime(state,r))}</td></tr>)}</tbody></table>
        <p className="result-note">{penaltyText?`${penaltyText}を公式タイムに反映済み`:'公式タイムにはGO後の反応時間を含みます'}</p>
        <p className="result-note" role="status">{legendChallenge?'特別レースのため賞金はありません。':prize>0?`${!timeTrial&&winner?.id==='player'?'優勝賞金':'完走賞'} +${prize}円！`:'今回の賞金はありません。'} 所持金 {money.toLocaleString('ja-JP')}円</p>
        {timeTrial&&<p className="result-note" role="status">{driving.status==='finished'&&playerTime<=yuunagiTimeLimit?'規定40秒クリア！ 第4公式大会・緑川グランプリの出場権を獲得しました。大会は開催準備中です。':driving.status==='finished'?'規定タイムを超えました。装備を変えて再挑戦できます。':'完走できませんでした。再挑戦できます。'}{bestTime!==null?` 自己ベスト ${(Math.ceil(bestTime*100-1e-7)/100).toFixed(2)}秒。`:''}</p>}
        {legendChallenge&&<p className="result-note" role="status">風見 怜と火野 岳が圧倒的な走りを披露した。次こそ追いつこう！</p>}
        {officialQualificationNotice&&<p className="result-note" role="status">ひなた初優勝！ 若葉公式ダート杯の出場権を獲得しました。街の若葉レース場へ向かおう。</p>}
        {officialChallenge&&<><CupScore cup={cup} kind={kind}/><p className="result-note" role="status">{cupComplete(cup,kind)?gameOver?`総合${cupPlayerPlace(cup)}位。3位以内に入れなかったためゲームオーバーです。`:kind==='wakaba'?`総合${cupPlayerPlace(cup)}位！ わかば模型店が開放されました。${thirdQualified?'全4大会の第3公式大会・星空テクニカル杯の出場権を獲得！':'わかば模型店で優勝すると第3公式大会の出場権を獲得できます。'}`:`星空テクニカル杯・${cupPlayerPlace(cup)===1?'優勝':'入賞'}！ 街のゆうなぎ模型店が開放されました。一本道40秒チャレンジへ進もう。`:`第1戦を記録しました。ピットで装備を変更して第2戦へ。第1戦の再走はできません。`}</p></>}
        {shop.id==='wakaba'&&thirdQualified&&!officialChallenge&&<p className="result-note" role="status">第3公式大会・星空テクニカル杯の出場権を獲得！ 街の星空レース場へ進もう。</p>}
        {qualificationNotice&&<p className="result-note" role="status">初優勝！ {nextShopRace.shopName}のレース参加資格を獲得！ 店に戻り、訪ねてきた最強兄弟と特別レースを走ろう。その後、出口から街へ進めます。</p>}
        {qualificationNotice&&<p className="result-note" role="status">最強兄弟が挑戦を待っています。特別レースを終えると、博士からセイランボディを受け取れます。</p>}
        {shop.id==='aozora'&&aozoraWon&&!villainChallenge&&!villainDefeated&&<p className="result-note" role="status">あおぞらの優勝者に、黒岩 豪から挑戦状！ 模型店へ戻って話を聞こう。</p>}
        {thirdShopNotice&&<p className="result-note" role="status">黒岩 豪を撃破！ ひなた模型店が解放されました。町に出て、あおぞら模型店の右隣へ進もう。</p>}
      </section>}
    </div>
    <footer className="race-message">
      <div className="race-speaker"><StarterPortrait/><span>コース係</span></div>
      <div className="race-commentary"><p className="race-phase">{error?'表示エラー':introducing?'レース場紹介':showResults?'最終結果':showTally?'記録集計中':ready?'スタート待機':counting?'スタートまで':waitingForGo?'GO・発進操作待ち':finish.stage==='finish'?'ゴールイン':finish.stage==='approach'?'最終ストレート':'レース中'}</p><p role="status" aria-live="polite">{message}</p><small>{introducing?'Z / Enter / Space で紹介をスキップ':canViewResults?'画面タップ / Z・Enter・Space で結果を見る':ready?'Z / Enter / Space で３カウント開始':waitingForLaunch?'Z / Enter / Space で発進。GO前の発進は残り秒数を加算。':finished?legendChallenge?'特別レース・賞金なし':`参加費なし・${timeTrial?'完走賞':'優勝'}${prizes[0].toLocaleString('ja-JP')}円${timeTrial?'・40秒以内で大会出場権':'／2〜5位も完走賞'}${prize>0?'（受取済み）':''}`:penaltyText||'走行は自動です。Esc で模型店に戻れます。'}</small></div>
      <div className="race-commands">
        {ready&&!introducing&&!error?<button className="race-start-button" onClick={start}>▶ カウント開始</button>:null}
        {waitingForLaunch&&!error&&<button className="race-start-button" onClick={start}>{counting?'▶ 発進（早出）':'▶ GO！ 発進'}</button>}
        {canViewResults&&<button className="race-start-button" onClick={showRaceResults}>▶ 結果を見る</button>}
        {(showResults||error)&&<button onClick={requestClose}>{gameOver?'ゲームオーバーへ':officialChallenge?'会場へ戻る':'模型店へ戻る'}</button>}
        {!ready&&!finished&&!waitingForLaunch&&!canViewResults&&!error&&<span className="race-running">走行中<span>●</span></span>}
      </div>
    </footer>
  </section>;
}
