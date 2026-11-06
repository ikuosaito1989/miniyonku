import {useState} from 'react';
import {getCircuitTrack,type CircuitId} from './data/circuit';
import type {Performance} from './game/driving';
import {courseProfile,setupCourses,setupProfile} from './game/setupProfile';
export function SetupDashboard({current,preview,initialCourse,comparing}:{current:Performance;preview:Performance;initialCourse:CircuitId;comparing:boolean}){
 const [course,setCourse]=useState(initialCourse);
 const metrics=setupProfile(preview,course),before=setupProfile(current,course);
 const {track,rough}=courseProfile(course);
 return <section className="setting-panel setup-dashboard" aria-labelledby="setup-profile-title">
  <div className="setup-dashboard-heading"><h2 id="setup-profile-title">マシン全体の特徴 <small>{comparing?'交換プレビュー':'装着中'}</small></h2><label>走るコース<select value={course} onChange={e=>setCourse(e.target.value as CircuitId)}>{setupCourses.map(id=><option key={id} value={id}>{getCircuitTrack(id).circuit.name}</option>)}</select></label></div>
  <p className="setup-course-features">{Math.round(track.circuitLength*track.circuit.laps)}m ／ {rough>0?'悪路あり':'舗装'} ／ {track.obstacles?'坂・ジャンプあり':'平地中心'}{course==='forge'||course==='zenith'?'・縦ループあり':''}</p>
  <p className="setup-course-focus">重視する特徴：{rough>0?'悪路の接地・駆動力・制振':course==='sprint'?'直線の速度・電池の持ち':track.obstacles?'旋回・登坂の力・着地':'旋回と速度のバランス'}</p>
  <p>長い棒ほどその特徴が強め。{comparing?'金の目印は現在の装備。':''} 総合点は付けず、コースに必要な特徴を選ぼう。</p>
  <div className="setup-meters" role="list">{metrics.map((m,i)=><div className="setup-meter" role="listitem" key={m.id} title={m.help}><div><span>{m.label}</span><strong>{m.display}</strong></div><div className="setup-meter-track" role="meter" aria-label={m.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.score)} aria-valuetext={m.display}><span style={{width:`${m.score}%`}}/>{comparing&&<i style={{left:`${before[i].score}%`}}/>}</div>{comparing&&<small>現在 {before[i].display}</small>}</div>)}</div>
  <details><summary>特徴の読み方</summary><p>直線は速度、登坂や再加速は駆動力、連続コーナーは旋回と抵抗、悪路は接地と制振を見よう。高グリップは横擦れも増え、高速ギアは登坂の力が下がります。制振やブレーキを増やすと重量や制動も増えるため、全部を大きくするだけでは最速になりません。</p><p>現在の電池残量とモーターの状態を反映。バーの尺度はコースを変えても共通です。到達速度・加速・旋回は局所的な目安で、完走や勝利を保証する値ではありません。</p>{metrics.map(m=><p key={m.id}><strong>{m.label}：</strong>{m.help}</p>)}</details>
 </section>;
}
