import {cupComplete,cupStandings,type CupProgress} from './game/cup';
export function CupScore({cup,kind}:{cup:CupProgress;kind:'wakaba'|'technical'|'final'}){
 const complete=cupComplete(cup,kind);return <section className="cup-score" aria-label="大会総合順位"><h4>{complete?'大会総合順位':'途中総合順位'}（{cup.results.length}/{kind==='wakaba'?2:1}戦）</h4><p>{kind==='final'?'2位以内の完走でゲームクリア。3位以下・リタイアはゲームオーバー。':''}得点：1位10・2位6・3位4・4位2・5位1、棄権0。同点は完走数、合計タイムで判定。</p><ol>{cupStandings(cup).map(e=><li key={e.id} className={e.id==='player'?'cup-player':''}><b>{e.place}位</b> {e.name} <strong>{e.points}点</strong></li>)}</ol></section>;
}
