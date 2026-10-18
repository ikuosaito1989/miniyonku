import { useGame } from './game/store';
import { proficiency, proficiencyRanks, proficiencyStandings } from './data/proficiency';
import { story } from './data/story';

export function ProficiencyBoard(){
  const points=useGame(s=>s.proficiencyPoints),close=useGame(s=>s.close);
  const skill=proficiency(points);
  return <div className="scrim proficiency-scrim"><section className="proficiency-board" role="dialog" aria-modal="true" aria-labelledby="proficiency-title" onKeyDown={e=>{if(e.key==='Tab'){e.preventDefault();e.currentTarget.querySelector<HTMLButtonElement>('button')?.focus();}}}>
    <header><div><small>こもれび模型店・整備手帳</small><h2 id="proficiency-title">熟練度表</h2></div><button autoFocus onClick={close} aria-label="熟練度表を閉じる">閉じる</button></header>
    <div className="proficiency-self"><span>{story.player}</span><strong>{skill.rank.name}</strong><p>熟練度 {skill.points} pt {skill.next?`／ 次の称号まで ${skill.remaining} pt`:'／ 最高の称号に到達！'}</p><div className="proficiency-meter" role="progressbar" aria-label="次の熟練度称号への進み具合" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(skill.progress*100)}><i style={{width:`${skill.progress*100}%`}}/></div></div>
    <table aria-label="緑川町の熟練度順位"><thead><tr><th>順位</th><th>レーサー</th><th>熟練度</th></tr></thead><tbody>{proficiencyStandings(points).map((person,i)=><tr key={person.id} className={person.id==='player'?'proficiency-current':''}><td>{person.id==='player'?'▶ ':''}{i+1}</td><td>{person.name}{person.id==='player'?'（自分）':''}</td><td>{person.points} pt</td></tr>)}</tbody></table>
    <details className="proficiency-ranks"><summary>称号と必要熟練度を見る</summary><table><thead><tr><th>段階</th><th>称号</th><th>必要熟練度</th></tr></thead><tbody>{proficiencyRanks.map((rank,i)=><tr key={rank.name} className={i===skill.index?'proficiency-current':''} aria-current={i===skill.index?'step':undefined}><td>{i===skill.index?'▶ ':''}{i+1}</td><td>{rank.name}</td><td>{rank.points} pt</td></tr>)}</tbody></table></details>
    <p className="proficiency-guide">完走で5pt、優勝ならさらに5pt。最初の60秒までの慣らしは30秒分で1pt（端数は蓄積）。リタイアでも走行していれば1pt。</p><small>熟練度はプレイヤーの整備経験です。現在ライバルの数値は固定。パーツ性能や品揃えは自動では変化しません。セーブ未対応のため再読み込みでリセットされます。</small>
  </section></div>;
}
