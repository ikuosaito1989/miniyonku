import {rankRacers,officialTime,type RaceState} from './race';
import type {CircuitId} from '../data/circuit';
export interface CupEntry{id:string;name:string;place:number;finished:boolean;time:number}
export interface CupHeat{circuitId:CircuitId;entries:CupEntry[]}
export interface CupProgress{entered:boolean;pending:CircuitId|null;results:CupHeat[]}
export const emptyCup=():CupProgress=>({entered:false,pending:null,results:[]});
export const cupHeatCount=(kind:'wakaba'|'technical'|'final'|'zenith')=>kind==='wakaba'?2:1;
export const cupComplete=(cup:CupProgress,kind:'wakaba'|'technical'|'final'|'zenith')=>cup.results.length>=cupHeatCount(kind);
export function cupStandings(cup:CupProgress){
 const rows=new Map<string,CupEntry&{points:number;finishes:number}>();
 for(const heat of cup.results)for(const e of heat.entries){const old=rows.get(e.id);rows.set(e.id,{...e,time:(old?.time??0)+e.time,points:(old?.points??0)+(e.finished?([10,6,4,2,1][e.place-1]??0):0),finishes:(old?.finishes??0)+Number(e.finished)});}
 return [...rows.values()].sort((a,b)=>b.points-a.points||b.finishes-a.finishes||a.time-b.time||a.id.localeCompare(b.id)).map((e,i)=>({...e,place:i+1}));
}
export const cupPlayerPlace=(cup:CupProgress)=>cupStandings(cup).find(e=>e.id==='player')?.place??0;
export function enterCupHeat(cup:CupProgress,circuitId:CircuitId,kind:'wakaba'|'technical'|'final'|'zenith'):CupProgress{
 if(cup.pending||cupComplete(cup,kind))return cup;
 const expected=kind==='zenith'?'zenith':kind==='final'?'grandprix':kind==='technical'?'comet':cup.results.length===0?'sprint':'sun';
 return circuitId===expected?{...cup,entered:true,pending:circuitId}:cup;
}
export function finishCupHeat(cup:CupProgress,heat:CupHeat):CupProgress{
 return cup.pending!==heat.circuitId?cup:{entered:true,pending:null,results:[...cup.results,heat]};
}
export function raceCupHeat(race:RaceState):CupHeat{
 return {circuitId:race.circuitId,entries:rankRacers(race).map((r,i)=>({id:r.id,name:r.name,place:i+1,finished:r.driving.status==='finished',time:r.driving.status==='finished'?officialTime(race,r):1_000_000}))};
}
export function forfeitCupHeat(cup:CupProgress):CupProgress{
 if(!cup.pending)return cup;
 const people=cup.pending==='zenith'?[['legend-rei','風見 怜'],['legend-gaku','火野 岳'],['go','黒岩 豪'],['jin','黒瀬 迅'],['player','朝倉 湊']]:cup.pending==='grandprix'?[['jin','黒瀬 迅'],['go','黒岩 豪'],['sou','石川 蒼'],['ren','高橋 蓮'],['player','朝倉 湊']]:[['riku','森野 陸'],['go','黒岩 豪'],['sou','石川 蒼'],['ren','高橋 蓮'],['player','朝倉 湊']];
 return finishCupHeat(cup,{circuitId:cup.pending,entries:people.map(([id,name],i)=>({id,name,place:i+1,finished:id!=='player',time:id==='player'?1_000_000:120+i}))});
}
export function cupProgression(wakabaCup:CupProgress,technicalCup:CupProgress,qualified=false,finalCup:CupProgress=emptyCup(),zenithCup:CupProgress=emptyCup()){
 const place=cupPlayerPlace(wakabaCup),completed=cupComplete(wakabaCup,'wakaba'),technicalComplete=cupComplete(technicalCup,'technical');
 const finalComplete=cupComplete(finalCup,'final'),finalPlace=cupPlayerPlace(finalCup),finalFinished=finalCup.results.some(h=>h.entries.some(e=>e.id==='player'&&e.finished));
 const zenithComplete=cupComplete(zenithCup,'zenith'),zenithPlace=cupPlayerPlace(zenithCup),zenithFinished=zenithCup.results.some(h=>h.entries.some(e=>e.id==='player'&&e.finished));
 return {wakabaCup,technicalCup,finalCup,zenithCup,zenithCleared:zenithComplete&&zenithFinished&&zenithPlace>0&&zenithPlace<=2,grandprixCleared:finalComplete&&finalFinished&&finalPlace>0&&finalPlace<=2,yuunagiUnlocked:technicalComplete&&cupPlayerPlace(technicalCup)>0&&cupPlayerPlace(technicalCup)<=3,officialWon:completed&&place===1,wakabaUnlocked:completed&&place>0&&place<=3,thirdOfficialQualified:qualified||completed&&place===1,gameOver:completed&&place>3||technicalComplete&&cupPlayerPlace(technicalCup)>3||finalComplete&&(!finalFinished||finalPlace>2)||zenithComplete&&(!zenithFinished||zenithPlace>2),
 officialSpeedWon:wakabaCup.results.some(h=>h.circuitId==='sprint'&&h.entries.some(e=>e.id==='player'&&e.finished&&e.place===1)),officialDirtWon:wakabaCup.results.some(h=>h.circuitId==='sun'&&h.entries.some(e=>e.id==='player'&&e.finished&&e.place===1))};
}
export function legacyCup(speed:boolean,dirt:boolean,won=false):CupProgress{
 let cup=emptyCup();
 if(dirt){speed=true;}
 for(const id of [...(speed||won?['sprint' as const]:[]),...(dirt||won?['sun' as const]:[])]){
  const entries=[['player','朝倉 湊'],['riku','森野 陸'],['go','黒岩 豪'],['sou','石川 蒼'],['ren','高橋 蓮']].map(([id,name],i)=>({id,name,place:i+1,finished:true,time:120+i}));
  cup={entered:true,pending:null,results:[...cup.results,{circuitId:id,entries}]};
 }
 return cup;
}
export function decodeCup(value:unknown,kind:'wakaba'|'technical'|'final'|'zenith',fallback:CupProgress):CupProgress{
 if(value===undefined)return fallback;
 const fail=()=>{throw new Error('公式大会の出場記録が不正です。');};
 if(!value||typeof value!=='object'||Array.isArray(value))return fail();const c=value as Record<string,unknown>;
 const order:CircuitId[]=kind==='wakaba'?['sprint','sun']:kind==='final'?['grandprix']:kind==='zenith'?['zenith']:['comet'];
 if(typeof c.entered!=='boolean'||!Array.isArray(c.results)||c.results.length>order.length)return fail();
 const results:CupHeat[]=c.results.map((raw,i)=>{
  if(!raw||typeof raw!=='object')return fail();const h=raw as Record<string,unknown>;
  if(h.circuitId!==order[i]||!Array.isArray(h.entries)||h.entries.length!==5)return fail();
  const ids=new Set<string>(),places=new Set<number>();const entries:CupEntry[]=h.entries.map((raw:unknown)=>{
   if(!raw||typeof raw!=='object')return fail();const e=raw as Record<string,unknown>;
   if(typeof e.id!=='string'||!(kind==='zenith'?['player','legend-rei','legend-gaku','go','jin']:kind==='final'?['player','jin','go','sou','ren']:['player','riku','go','sou','ren']).includes(e.id)||ids.has(e.id)||typeof e.name!=='string'||e.name.length>80||typeof e.place!=='number'||!Number.isInteger(e.place)||e.place<1||e.place>5||places.has(e.place)||typeof e.finished!=='boolean'||typeof e.time!=='number'||!Number.isFinite(e.time)||e.time<0||e.time>1e9)return fail();
   ids.add(e.id);places.add(e.place);return {id:e.id,name:e.name,place:e.place,finished:e.finished,time:e.time};
  });return {circuitId:order[i],entries};
 });
 if(c.pending!==null&&c.pending!==order[results.length]||!c.entered&&(results.length>0||c.pending!==null))return fail();
 return {entered:c.entered,pending:c.pending as CircuitId|null,results};
}
