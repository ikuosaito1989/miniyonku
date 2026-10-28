import type {CircuitTrack} from '../data/circuit';
export interface ShopTrackPoint {x:number;y:number;elevation:number}
/** 台の内寸と実コースの全点から縮尺を決める。レーン幅は模型として見える太さにする。 */
export function shopTrackLayout(track:CircuitTrack,width:number,height:number){
 const points=Array.from({length:1201},(_,i)=>{const p=track.sampleCircuit(i/1200*track.circuitLength);return {x:p.x,y:p.z-p.elevation*.65,elevation:p.elevation};});
 const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y)),bottom=Math.max(...points.map(p=>p.y));
 const laneWidth=2.3,margin=17,caption=17,scale=Math.min((width-2*margin)/(right-left),(height-2*margin-caption)/(bottom-top));
 const center={x:(left+right)/2,y:(top+bottom)/2};
 const centerline=points.map(p=>({...p,x:width/2+(p.x-center.x)*scale,y:(height-caption)/2+(p.y-center.y)*scale}));
 const paths=Array.from({length:track.circuit.lanes+1},(_,lane)=>centerline.map((p,i)=>{
  const a=centerline[Math.max(0,i-1)],b=centerline[Math.min(centerline.length-1,i+1)],dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1,offset=(lane-track.circuit.lanes/2)*laneWidth;
  return {...p,x:p.x-dy/length*offset,y:p.y+dx/length*offset};
 }));
 return {centerline,paths,laneWidth};
}
