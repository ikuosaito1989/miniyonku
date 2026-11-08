import type {Performance} from './game/driving';
import {setupProfile} from './game/setupProfile';
export function SetupDashboard({current,preview,comparing}:{current:Performance;preview:Performance;comparing:boolean}){
 const metrics=setupProfile(preview),before=setupProfile(current);
 return <section className="setting-panel setup-dashboard" aria-labelledby="setup-profile-title">
  <h2 id="setup-profile-title">マシン全体の特徴 <small>{comparing?'交換プレビュー':'装着中'}</small></h2>
  <p>装備の組み合わせで決まる基本性能。長い棒ほどその特徴が強め。{comparing?'金の目印は現在の装備。':''}</p>
  <div className="setup-meters" role="list">{metrics.map((m,i)=><div className="setup-meter" role="listitem" key={m.id} title={m.help}><div><span>{m.label}</span><strong>{m.display}</strong></div><div className="setup-meter-track" role="meter" aria-label={m.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(m.score)} aria-valuetext={m.display}><span style={{width:`${m.score}%`}}/>{comparing&&<i style={{left:`${before[i].score}%`}}/>}</div>{comparing&&<small>現在 {before[i].display}</small>}</div>)}</div>
  <p>直線なら最高速、坂なら加速力、連続カーブなら旋回、砂地なら接地。特徴を見て組み合わせ、レースで試そう。</p>
  <details><summary>特徴の読み方</summary><p>高速ギアは最高速が伸びる代わりに駆動力が下がり、高グリップは安定する代わりに旋回抵抗が増えます。制振やブレーキは重量や制動も増えるため、全部を大きくするだけでは最速になりません。</p><p>基準は固定で、コース・店舗・電池残量・モーターの摩耗によってメーターは変わりません。実走の状態はコンディション欄を確認しよう。</p>{metrics.map(m=><p key={m.id}><strong>{m.label}：</strong>{m.help}</p>)}</details>
 </section>;
}
