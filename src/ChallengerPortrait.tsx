import { challengerDrawing } from './game/PeopleArt';

// 会話顔・店内キャラ・順位欄を同じ原画から描き、特徴を一致させる。
export function ChallengerPortrait(){
  return <svg viewBox="0 0 60 44" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="60" height="44" fill="#42344c"/>
    {challengerDrawing('down').map((shape,index)=>shape.kind==='rect'
      ?<rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.color} opacity={shape.alpha}/>
      :<polygon key={index} points={shape.points.map(point=>point.join(',')).join(' ')} fill={shape.color} opacity={shape.alpha}/>)}
  </svg>;
}
