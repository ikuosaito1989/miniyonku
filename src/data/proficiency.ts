import { rivals } from './rivals';
import { story } from './story';
import { legends } from './legends';
export const proficiencyRanks=[
  {name:'かけだし',short:'入門',points:0},{name:'見習い',short:'見習',points:10},
  {name:'初級整備士',short:'初級',points:30},{name:'組立上手',short:'組立',points:60},
  {name:'調整上手',short:'調整',points:100},{name:'熟練整備士',short:'熟練',points:160},
  {name:'上級整備士',short:'上級',points:240},{name:'町の名人',short:'名人',points:360},
  {name:'匠',short:'匠',points:520},{name:'マスター',short:'達人',points:750},
];
export function proficiency(points:number){
  const total=Math.max(0,Math.floor(points));
  let index=0;for(let i=1;i<proficiencyRanks.length;i++)if(total>=proficiencyRanks[i].points)index=i;
  const rank=proficiencyRanks[index],next=proficiencyRanks[index+1];
  return {index,rank,next,points:total,remaining:next?next.points-total:0,progress:next?(total-rank.points)/(next.points-rank.points):1};
}
export function breakInPractice(before:number,duration:number){return Math.max(0,Math.min(60,before+duration)-Math.min(60,before))/30;}
// ライバルの初期熟練度。現在はプレイヤーだけが経験を獲得する。
const rivalPoints:Record<string,number>={nagi:749,momo:520,sou:360,ren:240};
export function proficiencyStandings(points:number){
  return [{id:'player',name:story.player,points:Math.max(0,Math.floor(points))},...legends.map(({id,name,points})=>({id,name,points})),...rivals.map(r=>({id:r.id,name:r.name,points:rivalPoints[r.id]??0}))]
    .sort((a,b)=>b.points-a.points||a.id.localeCompare(b.id));
}
