import { useId } from 'react';
import type { Part } from './data/parts';
import { partAppearance } from './data/partAppearance';
import { BodyArtwork } from './BodyArtwork';
import './part-artwork.css';

// 外部画像ではなく独自のベクター原画。カテゴリ内もIDごとに形状・素材を描き分ける。
export function PartArtwork({part}:{part:Part}){
  const id=useId().replace(/:/g,'');
  const a=partAppearance(part),c=part.category;
  const metal=`url(#${id}-metal)`,rubber=`url(#${id}-rubber)`;
  return <svg className="part-artwork" viewBox="0 0 160 100" role="img" aria-label={`${part.name}のパーツイラスト`}>
    <defs><linearGradient id={`${id}-metal`} x1="0" y1="0" x2=".6" y2="1"><stop stopColor="#f1f6f7"/><stop offset=".34" stopColor={a.color}/><stop offset=".55" stopColor="#f6fbfd"/><stop offset="1" stopColor="#657b92"/></linearGradient><linearGradient id={`${id}-rubber`} x2="0" y2="1"><stop stopColor={a.color}/><stop offset="1" stopColor="#111827"/></linearGradient></defs>
    <ellipse cx="82" cy="84" rx="54" ry="7" fill="#020b1a" opacity=".25"/>
    <g stroke="#22374b" strokeWidth="1.5" strokeLinejoin="round">
    {c==='body'&&<BodyArtwork id={part.id} color={a.color}/>}
    {c==='chassis'&&<g><path d="M25 62L78 21 136 43 83 82ZM25 62v6l58 21 53-40v-6" fill={a.color}/><path d="M42 58L80 30 119 45 82 73Z" fill="#112840"/>{[0,1].map(i=><path key={i} d={`M${55+i*20} ${54+i*6}l26-19 11 4-26 20Z`} fill={a.accent}/>)}{a.detail===2&&[0,1,2].map(i=><ellipse key={i} cx={47+i*17} cy={64+i*6} rx="5" ry="2" fill="#0a1c31"/>)}<path d="M22 54L42 65M112 30l26 11" stroke={a.accent} strokeWidth="4"/></g>}
    {c==='battery'&&<g transform="rotate(-18 80 50)">{[0,30].map(y=><g key={y}><path d={`M33 ${24+y}h91v21H33Z`} fill={a.color}/><ellipse cx="33" cy={34.5+y} rx="6" ry="10.5" fill={a.accent}/><ellipse cx="124" cy={34.5+y} rx="6" ry="10.5" fill={metal}/><path d={`M125 ${31+y}h8v7h-8`} fill={metal}/><text x="75" y={39+y} textAnchor="middle" fontFamily="monospace" fontSize="9" fill="#173049" stroke="none">{a.mark} +</text></g>)}</g>}
    {c==='wheel'&&<g><ellipse cx="89" cy="54" rx="33" ry="27" fill={a.accent}/><ellipse cx="73" cy="47" rx="33" ry="27" fill={a.color}/><ellipse cx="73" cy="47" rx="26" ry="21" fill="#1c3550"/>{Array.from({length:a.detail},(_,i)=><path key={i} transform={`rotate(${360*i/a.detail} 73 47)`} d="M69 41L64 26 77 26 77 41Z" fill={a.color}/>)}<ellipse cx="73" cy="47" rx="9" ry="7" fill={metal}/><ellipse cx="73" cy="47" rx="3" ry="3" fill="#10243c"/>{a.detail===3&&<ellipse cx="73" cy="47" rx="14" ry="11" fill="none" stroke={a.accent} strokeWidth="3"/>}</g>}
    {c==='accessory'&&(a.detail===0?<g stroke={a.color}><circle cx="80" cy="48" r="26" fill="none"/><path d="M62 30l36 36" strokeWidth="5"/></g>:<g><path d={a.detail===1?'M40 62l20-26 65 15-20 27ZM40 62v8l65 16v-8 8l20-27v-8':'M37 67l18-37 69 15-17 35-10-3 12-25-46-10-12 29Z'} fill={metal}/>{[0,1].map(i=><ellipse key={i} cx={64+i*35} cy={54+i*8} rx="4" ry="3" fill="#1b334b"/>)}<text x="80" y="65" textAnchor="middle" fontSize="10" fill={a.accent} stroke="none">{a.mark}</text></g>)}
    {c==='motor'&&<g transform="rotate(-20 80 50)">
      <path d="M111 44h26v7h-26" fill={metal}/><path d="M35 27h68q13 0 13 23t-13 23H35Z" fill={metal}/>
      <ellipse cx="36" cy="50" rx="13" ry="23" fill={a.accent}/><ellipse cx="104" cy="50" rx="12" ry="23" fill={metal}/><ellipse cx="105" cy="49" rx="6" ry="10" fill="#617689"/>
      <path d="M25 30v-8h7v9M27 69v9h7v-9" stroke="#e2bd6a" strokeWidth="4"/>
      {Array.from({length:a.detail},(_,i)=><path key={i} d={`M${47+i*11} 30v8m0 24v7`} stroke="#344557" strokeWidth="4"/>)}
      <path d="M46 41h44v18H46z" fill={a.accent} stroke="none"/><text x="68" y="54" textAnchor="middle" fontSize="10" fontFamily="monospace" fontWeight="bold" fill="#14273e" stroke="none">{a.mark}</text><path d="M41 29h53" stroke="#fff" opacity=".7"/>
    </g>}
    {c==='gear'&&<g>
      <g transform="translate(65 48) scale(1 .8)"><circle r="31" fill={a.accent}/>{Array.from({length:a.detail},(_,i)=><path key={i} transform={`rotate(${i*360/a.detail})`} d="M-4-28v-10h8v10" fill={a.color}/>)}<circle r="27" fill={a.color}/><circle r="13" fill={a.accent}/><circle r="5" fill="#18304b"/>{[0,120,240].map(r=><circle key={r} transform={`rotate(${r})`} cy="-20" r="4" fill="#1a3752"/>)}</g>
      <g transform="translate(108 65) scale(1 .8)"><circle r="17" fill={a.accent}/>{Array.from({length:10},(_,i)=><path key={i} transform={`rotate(${i*36})`} d="M-3-14v-7h6v7" fill={a.color}/>)}<circle r="10" fill={a.color}/><circle r="4" fill="#17314b"/></g><text x="126" y="25" textAnchor="middle" fill={a.color} stroke="none" fontSize="10" fontFamily="monospace">{a.mark}</text>
    </g>}
    {c==='tire'&&<g transform="translate(78 49) rotate(-18)">
      <ellipse cx="12" cy="6" rx="38" ry="32" fill={rubber}/><path d="M-28-19L-16-27M-27 25l12 8M30-19l12 8" stroke="#727d8a"/><ellipse rx="36" ry="32" fill={a.color}/><ellipse rx="24" ry="22" fill="#172439"/><ellipse rx="21" ry="19" fill={a.accent}/>
      {Array.from({length:a.detail},(_,i)=><path key={i} transform={`rotate(${i*360/a.detail})`} d="M-4-7L-7-18 5-19 4-7Z" fill="#23384d"/>)}<circle r="7" fill={metal}/><circle r="3" fill="#1c2f46"/>
      {part.id==='tire-1'?Array.from({length:24},(_,i)=><circle key={i} cx={Math.cos(i*2.4)*30} cy={Math.sin(i*2.4)*26} r="1.2" fill="#93939c" stroke="none"/>):<ellipse rx="30" ry="27" fill="none" stroke={part.id==='tire-2'?'#7096ae':'#566171'} strokeWidth="1"/>}
    </g>}
    {c==='roller'&&<g><path d="M43 48v15c0 24 76 24 76 0V48" fill={part.id==='roller-1'?rubber:metal}/><ellipse cx="81" cy="46" rx="38" ry="24" fill={a.color}/><ellipse cx="81" cy="46" rx="29" ry="17" fill={a.accent}/>
      {Array.from({length:a.detail},(_,i)=><ellipse key={i} cx={81+Math.cos(i*Math.PI*2/a.detail)*22} cy={46+Math.sin(i*Math.PI*2/a.detail)*12} rx={part.id==='roller-2'?3:4} ry="3" fill={part.id==='roller-2'?'#e6f6ff':'#183954'}/>)}<ellipse cx="81" cy="46" rx="13" ry="9" fill={metal}/><ellipse cx="81" cy="46" rx="5" ry="4" fill="#182e46"/><path d="M78 40V24h6v16" fill={metal}/><ellipse cx="81" cy="24" rx="4" ry="2" fill="#eff8fc"/>{part.id==='roller-1'&&<ellipse cx="81" cy="46" rx="35" ry="21" fill="none" stroke="#78828a" strokeWidth="3"/>}</g>}
    {c==='shaft'&&<g transform="rotate(-24 80 50)">{[0,17].map(y=><g key={y}><path d={`M24 ${39+y}h112v7H24z`} fill={metal}/><path d={`M30 ${40+y}h99`} stroke="#f7fcff"/><ellipse cx="24" cy={42.5+y} rx="4" ry="4.5" fill={a.color}/><ellipse cx="136" cy={42.5+y} rx="4" ry="4.5" fill={a.color}/>{a.detail===1&&<><ellipse cx="136" cy={42.5+y} rx="2" ry="2.5" fill="#182a3f"/><path d={`M35 ${44+y}h91`} stroke="#6b8ba0" strokeDasharray="4 3"/></>}</g>)}</g>}
    {c==='terminal'&&<g fill={part.id==='terminal-1'?a.color:metal}>{[0,49].map(x=><g key={x} transform={`translate(${x} 0)`}><path d="M30 74L42 33Q46 23 55 25L66 29 60 41 52 38 45 62 58 65 55 78Z"/><path d="M42 33l8-17 14 4 2 9-11-4" fill={a.accent}/><path d="M36 70l8-31M46 34l7-3 6 2" stroke="#fff5c4"/><circle cx="45" cy="66" r="3" fill="#1c344b"/>{a.detail===1&&<path d="M42 50l8 3" stroke="#9c691e" strokeWidth="3"/>}</g>)}</g>}
    </g>
  </svg>;
}
