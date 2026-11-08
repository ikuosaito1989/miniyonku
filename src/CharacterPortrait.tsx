import type { ComponentType } from 'react';
import type { PixelShape } from './game/pixelDrawing';

/** Walk sprites, race ranking and dialogue portraits share the same character drawing. */
export function CharacterPortrait({draw, label=''}:{draw:()=>PixelShape[];label?:string}){
  return <svg className="shared-character-portrait" width="100%" height="100%" viewBox="8 0 44 42" role={label?'img':undefined} aria-label={label||undefined} aria-hidden={label?undefined:true} preserveAspectRatio="xMidYMid slice">
    <rect x="0" y="0" width="60" height="44" fill="#31595a"/>
    <path d="M0 35h60v9H0z" fill="#28484e" opacity=".65"/>
    {draw().map((shape,i)=>shape.kind==='rect'
      ?<rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.color} opacity={shape.alpha}/>
      :<polygon key={i} points={shape.points.map(p=>p.join(',')).join(' ')} fill={shape.color} opacity={shape.alpha}/>)}
  </svg>;
}
