import { rankRacers, type RaceState } from './game/race';

function RacerPortrait({id,color}:{id:string;color:number}){
  const jacket=`#${color.toString(16).padStart(6,'0')}`;
  const hair=id==='ren'?'#65514a':id==='momo'?'#574148':'#323947';
  return <svg className="ranking-portrait" viewBox="0 0 28 34" aria-hidden="true" shapeRendering="crispEdges">
    <path fill="#050925" d="M5 30h19v3H5z"/>
    <path fill="#343e5a" d="M8 23h5v7H8zM17 23h5v7h-5z"/>
    <path fill="#dce5db" d="M7 29h7v2H7zM17 29h7v2h-7z"/>
    <path fill="#202a40" d="M7 15h16v11H7z"/><path fill={jacket} d="M8 16h14v9H8zM5 17h4v6H5z"/>
    <path fill="#f1ebcc" d="M11 17h3v6h-3zM9 23h12v2H9z"/>
    <path fill="#d8a280" d="M5 23h4v3H5zM22 19h3v6h-3z"/>
    <path fill={hair} d="M9 3h11v2H9zM7 5h16v9H7zM9 13h12v3H9z"/>
    <path fill="#efc7a0" d="M14 7h8v8h-8zM20 10h5v3h-5zM13 14h7v3h-7z"/>
    <path fill="#d69e80" d="M17 14h5v2h-5z"/><path fill="#f9dfb4" d="M15 8h6v2h-6z"/>
    <path fill="#263047" d="M20 10h2v3h-2z"/><path fill="#fff2d0" d="M20 10h1v1h-1z"/>
    <path fill={hair} d="M8 6h13v3H8zM8 8h6v7H8zM14 7h3v3h-3z"/>
    {id==='player'?<><path fill="#e2bd68" d="M8 3h13v4H8zM17 6h9v2h-9z"/><path fill="#f9dc8d" d="M10 2h9v1h-9z"/></>:id==='nagi'?<path fill="#849eaf" d="M10 3h8v2h-8zM16 5h5v1h-5z"/>:id==='momo'?<><path fill={hair} d="M4 8h5v10H4zM3 13h4v8H3z"/><path fill="#f5d890" d="M4 9h4v2H4z"/></>:id==='sou'?<><path fill="#e0e9df" d="M8 3h13v4H8zM18 6h8v2h-8z"/><path fill="#78a88d" d="M10 3h4v3h-4z"/></>:<><path fill="#6380b1" d="M8 3h13v4H8z"/><path fill="#dfe6e5" d="M10 2h10v2H10zM18 5h6v2h-6z"/></>}
  </svg>;
}

export function RaceRanking({race}:{race:RaceState}){
  const waiting=race.phase==='ready'||race.phase==='countdown';
  return <section className="race-ranking-strip" aria-label={waiting?'出場レーサー一覧':'右から順位順のレーサー一覧'}>
    <span className="ranking-edge ranking-last" aria-hidden="true">{waiting?'出場':'後方'}<span>▶</span></span>
    <ol className="ranking-racers">{rankRacers(race).map((r,i)=>{
      const out=r.driving.status==='out';
      return <li key={r.id} style={{left:`${(race.racers.length-1-i)*20}%`}} className={`${r.id==='player'?'ranking-player':''} ${out?'ranking-out':''}`} aria-label={`${waiting?'出場':out?'リタイア':`${i+1}位`}：${r.name}${r.id==='player'?'（あなた）':''}${out?(r.driving.stopReason==='battery'?'、電池切れ':'、コースアウト'):''}`} title={`${r.name} / ${out?'リタイア':waiting?'スタート待機':`${i+1}位`}`}>
        <span className="ranking-place">{r.id==='player'&&<i>▼</i>}{waiting?'—':out?'OUT':`${i+1}位`}</span>
        <RacerPortrait id={r.id} color={r.color}/>
        <span className="ranking-name">{r.name.split(' ').at(-1)}{r.id==='player'?'（自分）':''}</span>
      </li>;
    })}</ol>
    <span className="ranking-edge ranking-first" aria-hidden="true"><span>▧</span>{waiting?'ゴール側':race.phase==='finished'?'1位':'先頭'}</span>
  </section>;
}
