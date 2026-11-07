import { offroaderDrawing } from './game/PeopleArt';
export function OffroaderPortrait(){
  return <svg viewBox="0 0 60 44" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="60" height="44" fill="#41573d"/>
    {offroaderDrawing('down').map((shape,i)=>shape.kind==='rect'
      ?<rect key={i} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.color} opacity={shape.alpha}/>
      :<polygon key={i} points={shape.points.map(p=>p.join(',')).join(' ')} fill={shape.color} opacity={shape.alpha}/>)}
  </svg>;
}
