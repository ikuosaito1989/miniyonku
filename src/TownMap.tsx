import {isMasterCourse,masterCourseIds} from './data/masterCourses';
import {isPracticeCourse,practiceCourses,practiceCourseIds} from './data/practiceCourses';
import {useEffect,useState} from 'react';
import {currentMission} from './game/mission';
import {useGame} from './game/store';
import {townVenues,townSize,townRoads,townSpawn,townPlaza,townWalkBounds,isVenueOpen} from './data/world';
export function TownMap(){
 const [pending,setPending]=useState<string|null>(null);
 const state=useGame(),mission=currentMission(state),[position,setPosition]=useState(()=>townSpawn(state.townReturnVenue??state.lastShop));
 useEffect(()=>{const handler=(e:Event)=>setPosition((e as CustomEvent<{x:number;y:number}>).detail);window.addEventListener('town-position',handler);return()=>window.removeEventListener('town-position',handler);},[]);
 useEffect(()=>{
  if(!pending)return;
  let second=0;
  const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{
   useGame.setState({overlay:null});
   try{window.dispatchEvent(new CustomEvent('town-navigate',{detail:pending}));}
   finally{setPending(null);}
  });});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);};
 },[pending]);
 const navigate=(id:string)=>{if(!pending)setPending(id);};

 if(state.location!=='town'||state.overlay!==null&&state.overlay!=='town-map')return null;
 const places=[...townVenues].sort((a,b)=>(a.id==='komorebi'?0:a.kind==='library'?1:a.id==='atelier'?2:3)-(b.id==='komorebi'?0:b.kind==='library'?1:b.id==='atelier'?2:3));
 const drawing=<svg viewBox={`0 0 ${townSize.width} ${townSize.height}`} aria-label="緑川町の全体地図" role="img"><rect width={townSize.width} height={townSize.height} fill="#788a68"/><path d={`M${townSize.width-210} 0H${townSize.width}V${townSize.height}H${townSize.width-210}Z`} fill="#6197ad"/>{townRoads.vertical.map(x=><path key={`v-${x}`} d={`M${x} ${townWalkBounds.top-24}V${townWalkBounds.bottom+24}`} stroke="#59676a" strokeWidth="140"/>)}{townRoads.horizontal.map(y=><path key={`h-${y}`} d={`M64 ${y}H${townSize.width-256}`} stroke="#59676a" strokeWidth="140"/>)}{townRoads.vertical.slice(0,-1).flatMap((x,i)=>townRoads.horizontal.slice(0,-1).map((y,j)=><rect key={`block-${i}-${j}`} x={x+82} y={y+82} width={townRoads.vertical[i+1]-x-164} height={townRoads.horizontal[j+1]-y-164} rx="14" fill={i===2&&j===2?'#709166':'#b8b39d'} stroke="#716f63" strokeWidth="8"/>))}<rect x={townPlaza.x} y={townPlaza.y} width={townPlaza.w} height={townPlaza.h} rx="28" fill="#62835c" stroke="#e0d2ae" strokeWidth="20"/><rect x={townPlaza.x+258} y={townPlaza.y+128} width="140" height="90" rx="35" fill="#5595a0" stroke="#c6b98f" strokeWidth="16"/><path d="M4640 1010H6500V2320H4640Z" fill="#8f9b83" stroke="#d1c7a9" strokeWidth="20"/><text x="5570" y="1080" textAnchor="middle" fontSize="74" fill="#fff1c8">大会コース地区</text>{townVenues.map(v=><g key={v.id}><rect x={v.x+12} y={v.y+18} width={v.w} height={v.h} fill="#23374b" opacity=".3"/><rect x={v.x} y={v.y} width={v.w} height={v.h} fill={v.id==='atelier'?'#d8b6f2':isVenueOpen(v,state)?isMasterCourse(v.id)?'#efc96f':v.kind==='outdoor'?'#65ad91':v.kind==='stadium'?'#efd083':'#86b9db':'#596575'} stroke={v.id===mission.destination?'#ffed86':'#384758'} strokeWidth={v.id===mission.destination?24:10}/><text x={v.x+v.w/2} y={v.y+v.h*.7} textAnchor="middle" fontSize={Math.min(v.h*.65,110)} fill="#23374b">{v.kind==='stadium'?'🏆':v.kind==='outdoor'?'▱':v.kind==='library'?'▤':'◆'}</text><text x={v.x+v.w/2} y={v.y-24} textAnchor="middle" fontSize="65" fill="#fff4d3">{isMasterCourse(v.id)?`MASTER ${masterCourseIds.indexOf(v.id)+1}`:isPracticeCourse(v.id)?`${practiceCourseIds.indexOf(v.id)+1}`:v.name}</text></g>)}<circle cx={position.x} cy={position.y} r="48" fill="#e77764" stroke="#fff2c3" strokeWidth="17"/></svg>;
 if(state.overlay!=='town-map')return <button className="town-map-open" aria-label="街の地図" onClick={()=>useGame.setState({overlay:'town-map'})}>{drawing}<span>街の地図</span></button>;
 return <div className="scrim town-map-scrim"><section aria-busy={!!pending} className="town-map-panel" role="dialog" aria-modal="true" aria-labelledby="town-map-title"><header><div><small>MIDORIKAWA EXPLORER</small><h1 id="town-map-title">緑川町・広域マップ</h1></div><button autoFocus onClick={state.close}>閉じる</button></header>{drawing}<div className="town-map-legend"><span>◆ 模型店・工房</span><span>🏆 大会会場</span><span>▱ 屋外コース（番号）</span><span>▤ 図書館</span><span>● 現在地 / 金枠：目的地</span></div>{pending&&<div className="town-map-loading" role="status" aria-live="polite"><i/><strong>ルートを準備中…</strong><span>{townVenues.find(v=>v.id===pending)?.name}へ向かいます</span></div>}<div className="town-mission-destination"><strong>次の目標：{mission.title}</strong>{mission.destination&&<button onClick={()=>{if(mission.destination)navigate(mission.destination);}}>目的地：{mission.place}へ向かう →</button>}</div><p>赤い印が現在地。行き先を選ぶと、入口まで自動で歩きます。移動操作で中断できます。</p><div className="town-map-places">{places.map(v=><button key={v.id} onClick={()=>{navigate(v.id);}}><span>{v.kind==='library'?'▤':v.id==='atelier'?'★':v.kind==='outdoor'?'🏁':v.kind==='stadium'?'🏆':'◆'} {isPracticeCourse(v.id)?`${practiceCourseIds.indexOf(v.id)+1}. ${v.name}`:v.name}</span><small>{isVenueOpen(v,state)?isPracticeCourse(v.id)?practiceCourses[v.id].feature+' 調べるとそのままレース →':v.kind==='library'?'最初から無料・全パーツ図鑑 →':v.id==='atelier'?'序盤から入場可・各25万円 →':'入場可能 →':'未開放・場所を確認 →'}</small></button>)}</div></section></div>;
}
