import { rankRacers, type RaceState } from './game/race';
import { challengerDrawing, personDrawing, type PersonKind } from './game/PeopleArt';

function RacerPortrait({id,color}:{id:string;color:number}){
  const kind:PersonKind=id==='player'?'player':id==='nagi'||id==='riku'?'rival':id==='momo'?'guide':'mechanic';
  const jacket=`#${color.toString(16).padStart(6,'0')}`;
  return <svg className="ranking-portrait" viewBox="0 0 60 82" aria-hidden="true">
    <ellipse cx="30" cy="79" rx="18" ry="2" fill="#050b17" opacity=".35"/>
    {(id==='riku'?challengerDrawing('right'):personDrawing(kind,'right',0)).map((shape,i)=>{
      const fill=kind==='mechanic'&&shape.color==='#317d91'?jacket:shape.color;
      return shape.kind==='rect'
        ?<rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={fill} opacity={shape.alpha}/>
        :<polygon key={i} points={shape.points.map(p=>p.join(',')).join(' ')} fill={fill} opacity={shape.alpha}/>;
    })}
    {(id==='sou'||id==='ren')&&<path d="M18 10 21 4H36L40 12H47V15H20Z" fill={id==='sou'?'#e6efe1':'#e2bc6c'} stroke="#596c79" strokeWidth="1"/>}
  </svg>;
}

export function RaceRanking({race}:{race:RaceState}){
  const waiting=race.phase==='ready'||race.phase==='countdown';
  return <section className="race-ranking-strip" aria-label={waiting?'出場レーサー一覧':'右から順位順のレーサー一覧'}>
    <span className="ranking-edge ranking-last" aria-hidden="true">{waiting?'出場':'後方'}<span>▶</span></span>
    <ol className="ranking-racers">{rankRacers(race).map((r,i)=>{
      const out=r.driving.status==='out';
      return <li key={r.id} style={{left:`${(race.racers.length-1-i)*20}%`}} className={`${r.id==='player'?'ranking-player':''} ${out?'ranking-out':''}`} aria-label={`${waiting?'出場':out?'リタイア':`${i+1}位`}：${r.name}${r.id==='player'?'（あなた）':''}${out?(r.driving.stopReason==='lapped'?'、周回遅れ':r.driving.stopReason==='battery'?'、電池切れ':'、コースアウト'):''}`} title={`${r.name} / ${out?'リタイア':waiting?'スタート待機':`${i+1}位`}`}>
        <span className="ranking-place">{r.id==='player'&&<i>▼</i>}{waiting?'—':out?'OUT':`${i+1}位`}</span>
        <RacerPortrait id={r.id} color={r.color}/>
        <span className="ranking-name">{r.name.split(' ').at(-1)}{r.id==='player'?'（自分）':''}</span>
      </li>;
    })}</ol>
    <span className="ranking-edge ranking-first" aria-hidden="true"><span>▧</span>{waiting?'ゴール側':race.phase==='finished'?'1位':'先頭'}</span>
  </section>;
}
