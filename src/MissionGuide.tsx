import {useGame} from './game/store';
import {currentMission,missionNextAction} from './game/mission';
export function MissionGuide(){
 const state=useGame(),mission=currentMission(state),next=missionNextAction(state,mission);
 if(state.overlay!==null&&state.overlay!=='mission')return null;
 if(state.overlay!=='mission')return <button className="mission-hud" aria-label={`次のミッション：${mission.title}。詳しく見る`} onClick={()=>useGame.setState({overlay:'mission'})}><small>{mission.complete?'MISSION CLEAR':'次のミッション'}</small><strong>{mission.title}</strong><span>{mission.complete?'通常レースや改造を楽しもう':state.location===mission.destination?'この場所で進めよう':`目的地：${mission.place}`}  <b>詳細 ›</b></span></button>;
 return <div className="scrim mission-scrim"><section className="mission-panel" role="dialog" aria-modal="true" aria-labelledby="mission-title"><header><small>MISSION / 次にやること</small><button autoFocus onClick={state.close}>閉じる</button></header><h1 id="mission-title">{mission.title}</h1><p className="mission-destination">目的地：{mission.place}</p><p className="mission-next">{next}</p><ol>{mission.steps.map((step,i)=><li key={step}><span>{i+1}</span>{step}</li>)}</ol><aside><strong>攻略のヒント</strong><p>{mission.hint}</p></aside>{state.location==='town'&&mission.destination?<button className="mission-primary" onClick={()=>useGame.setState({overlay:'town-map'})}>目的地を街の地図で見る</button>:<button className="mission-primary" onClick={state.close}>閉じて進める</button>}</section></div>;
}
