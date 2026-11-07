import {cupStandings,cupComplete,type CupProgress} from './cup';
export function podiumRows(cup:CupProgress,kind:'wakaba'|'technical'|'final'|'zenith'){
 const overall=cupComplete(cup,kind),heat=cup.results.at(-1);
 const rows=overall?cupStandings(cup):heat?[...heat.entries].sort((a,b)=>a.place-b.place).map(e=>({...e,finishes:Number(e.finished)})):[];
 return {overall,rows,winners:rows.filter(e=>e.place<=3&&e.finishes>0)};
}
