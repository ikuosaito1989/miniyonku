import type { Part } from './data/parts';
import {partBadges,partStats,partSummary} from './data/partStats';
import './part-description.css';
export function PartDescription({part,peers,reference}:{part:Part;peers?:readonly Part[];reference?:Part}){
 const stats=partStats(part,peers,reference),badges=partBadges(part);
 return <div className="part-description">
  <p className="part-summary">{partSummary(part)}</p>
  {badges.length>0&&<div className="part-traits">{badges.map(badge=><span key={badge}>{badge}</span>)}</div>}
  <div className="part-stats" role="list" aria-label={`${part.name}の性能比較`}>
   {stats.map(stat=><div className="part-stat" role="listitem" key={stat.id} title={stat.help}>
    <div className="part-stat-heading"><span>{stat.label}</span><strong>{stat.display}</strong></div>
    <div className="part-stat-track" role="meter" aria-label={stat.label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(stat.score)} aria-valuetext={`${stat.display}${stat.reference?`、装着中 ${stat.reference.display}`:''}`}>
     <span className="part-stat-fill" style={{width:`${stat.score}%`}}/>
     {stat.reference&&<i className="part-stat-reference" aria-hidden="true" title={`装着中 ${stat.reference.display}`} style={{left:`${stat.reference.score}%`}}/>}
    </div>
   </div>)}
  </div>
 </div>;
}
