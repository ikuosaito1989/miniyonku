import { doctorDrawing } from './game/PeopleArt';
export function DoctorPortrait(){
  return <svg viewBox="0 0 60 44" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" aria-hidden="true">
    <rect width="60" height="44" fill="#385b58"/>
    {doctorDrawing('down').map((shape,index)=>shape.kind==='rect'
      ?<rect key={index} x={shape.x} y={shape.y} width={shape.w} height={shape.h} fill={shape.color} opacity={shape.alpha}/>
      :<polygon key={index} points={shape.points.map(point=>point.join(',')).join(' ')} fill={shape.color} opacity={shape.alpha}/>)}
  </svg>;
}
