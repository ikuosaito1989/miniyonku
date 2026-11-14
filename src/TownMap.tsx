import {isMasterCourse,masterCourseIds} from './data/masterCourses';
import {isPracticeCourse,practiceCourses,practiceCourseIds} from './data/practiceCourses';
import {useEffect,useState} from 'react';
import {townPaths} from './data/townPaths';
import {currentMission} from './game/mission';
import {useGame} from './game/store';
import {townVenues,townSize,townMainRoads,townBlocks,townSpawn,townPlaza,townEntranceX,isVenueOpen,specialistUnlockMessages} from './data/world';
export function TownMap(){
 const [pending,setPending]=useState<string|null>(null);
 const [routing,setRouting]=useState(false);
 useEffect(()=>{const handler=(e:Event)=>setRouting(!!(e as CustomEvent<boolean>).detail);window.addEventListener('town-route-status',handler);return()=>window.removeEventListener('town-route-status',handler);},[]);
 const state=useGame(),mission=currentMission(state),[position,setPosition]=useState(()=>townSpawn(state.townReturnVenue??state.lastShop));
 useEffect(()=>{const handler=(e:Event)=>setPosition((e as CustomEvent<{x:number;y:number}>).detail);window.addEventListener('town-position',handler);return()=>window.removeEventListener('town-position',handler);},[]);
 useEffect(()=>{
  if(!pending)return;
  let second=0,third=0,fourth=0;
  const first=requestAnimationFrame(()=>{second=requestAnimationFrame(()=>{
   useGame.setState({overlay:null});
   // Allow the overlay's input reset to finish before starting the route.
   third=requestAnimationFrame(()=>{fourth=requestAnimationFrame(()=>{
    if(useGame.getState().location==='town'&&useGame.getState().overlay===null)
     window.dispatchEvent(new CustomEvent('town-navigate',{detail:pending}));
    setPending(null);
   });});
  });});
  return()=>{cancelAnimationFrame(first);cancelAnimationFrame(second);cancelAnimationFrame(third);cancelAnimationFrame(fourth);};
 },[pending]);
 const unlockHint=(id:string)=>Object.hasOwn(specialistUnlockMessages,id)?specialistUnlockMessages[id as keyof typeof specialistUnlockMessages]:'未開放・場所を確認 →';
 const navigate=(id:string)=>{if(!pending)setPending(id);};

 if(state.location!=='town')return routing?<div className="town-route-status" role="status">ルートを準備中…</div>:null;
 if(state.overlay!==null&&state.overlay!=='town-map')return null;
 const places=[...townVenues].sort((a,b)=>(a.id==='komorebi'?0:a.kind==='library'?1:a.id==='atelier'?2:3)-(b.id==='komorebi'?0:b.kind==='library'?1:b.id==='atelier'?2:3));
 const drawing=<svg viewBox={`0 0 ${townSize.width} ${townSize.height}`} aria-label="緑川町の全体地図" role="img">
  <rect width={townSize.width} height={townSize.height} fill="#879b77"/>
  <path d={`M${townSize.width-210} 0H${townSize.width}V${townSize.height}H${townSize.width-210}Z`} fill="#6197ad"/>
  <rect x={townPlaza.x} y={townPlaza.y} width={townPlaza.w} height={townPlaza.h} rx="28" fill="#62835c" stroke="#d2c9a4" strokeWidth="20"/>
  <rect x={townPlaza.x+258} y={townPlaza.y+128} width="140" height="90" rx="35" fill="#5595a0"/>
  {townMainRoads.vertical.map((r,i)=><path key={`v-${i}`} d={`M${r.x} ${r.from}V${r.to}`} stroke="#59676a" strokeWidth="140"/>)}
  {townMainRoads.horizontal.map((r,i)=><path key={`h-${i}`} d={`M${r.from} ${r.y}H${r.to}`} stroke="#59676a" strokeWidth="140"/>)}
  {townPaths.filter(p=>p.kind!=='hidden').map((p,i)=><polyline key={`path-${i}`} points={p.points.map(q=>`${q.x},${q.y}`).join(' ')} fill="none" stroke="#d1c7a9" strokeWidth={p.kind==='lane'?44:36} strokeLinecap="round" strokeLinejoin="round"/>)}
  {townVenues.map(v=>{const x=townEntranceX(v),y=v.y+v.h+30,road=townMainRoads.horizontal.filter(r=>x>=r.from&&x<=r.to).reduce((a,b)=>Math.abs(b.y-y)<Math.abs(a.y-y)?b:a);return <path key={`access-${v.id}`} d={`M${x} ${y}V${road.y}`} stroke="#d1c7a9" strokeWidth="60"/>;})}
  {townBlocks.map((b,i)=><rect key={`house-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} rx="12" fill="#b1bca0" stroke="#687e70" strokeWidth="10"/>)}
  {townVenues.map(v=><g key={v.id}><rect x={v.x+12} y={v.y+18} width={v.w} height={v.h} fill="#23374b" opacity=".3"/><rect x={v.x} y={v.y} width={v.w} height={v.h} fill={isVenueOpen(v,state)?v.id==='atelier'?'#d8b6f2':isMasterCourse(v.id)?'#efc96f':v.kind==='outdoor'?'#65ad91':v.kind==='stadium'?'#efd083':'#86b9db':'#596575'} stroke={v.id===mission.destination?'#ffed86':'#384758'} strokeWidth={v.id===mission.destination?24:10}/><text x={v.x+v.w/2} y={v.y+v.h*.7} textAnchor="middle" fontSize={Math.min(v.h*.65,110)} fill="#23374b">{v.kind==='stadium'?'🏆':v.kind==='outdoor'?'▱':v.kind==='library'?'▤':'◆'}</text><text x={v.x+v.w/2} y={v.y-24} textAnchor="middle" fontSize="65" fill="#fff4d3">{isMasterCourse(v.id)?`MASTER ${masterCourseIds.indexOf(v.id)+1}`:isPracticeCourse(v.id)?`${practiceCourseIds.indexOf(v.id)+1}`:v.name}</text></g>)}
  <circle cx={position.x} cy={position.y} r="48" fill="#e77764" stroke="#fff2c3" strokeWidth="17"/>
 </svg>;
 if(state.overlay!=='town-map')return <><button className="town-map-open" aria-label="街の地図" onClick={()=>useGame.setState({overlay:'town-map'})}>{drawing}<span>街の地図</span></button>{routing&&<div className="town-route-status" role="status">ルートを準備中…</div>}</>;
 return <div className="scrim town-map-scrim"><section aria-busy={!!pending} className="town-map-panel" role="dialog" aria-modal="true" aria-labelledby="town-map-title"><header><div><small>MIDORIKAWA EXPLORER</small><h1 id="town-map-title">緑川町・広域マップ</h1></div><button autoFocus onClick={state.close}>閉じる</button></header>{drawing}<div className="town-map-legend"><span>◆ 模型店・工房</span><span>🏆 大会会場</span><span>▱ 屋外コース（番号）</span><span>▤ 図書館</span><span>● 現在地 / 金枠：目的地</span></div>{pending&&<div className="town-map-loading" role="status" aria-live="polite"><i/><strong>ルートを準備中…</strong><span>{townVenues.find(v=>v.id===pending)?.name}へ向かいます</span></div>}<div className="town-mission-destination"><strong>次の目標：{mission.title}</strong>{mission.destination&&<button onClick={()=>{if(mission.destination)navigate(mission.destination);}}>目的地：{mission.place}へ向かう →</button>}</div><p>赤い印が現在地。行き先を選ぶと、入口まで自動で歩きます。移動操作で中断できます。</p><div className="town-map-places">{places.map(v=><button key={v.id} onClick={()=>{navigate(v.id);}}><span>{v.kind==='library'?'▤':v.id==='atelier'?'★':v.kind==='outdoor'?'🏁':v.kind==='stadium'?'🏆':'◆'} {isPracticeCourse(v.id)?`${practiceCourseIds.indexOf(v.id)+1}. ${v.name}`:v.name}</span><small>{isVenueOpen(v,state)?isPracticeCourse(v.id)?practiceCourses[v.id].feature+' 調べるとそのままレース →':v.kind==='library'?'最初から無料・全パーツ図鑑 →':v.id==='atelier'?'入場可能・各25万円 →':'入場可能 →':unlockHint(v.id)}</small></button>)}</div></section></div>;
}
