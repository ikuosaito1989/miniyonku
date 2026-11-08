import type {CircuitTrack} from '../data/circuit';

export const pavedCourseColors={white:0xf4f2ea,red:0xc51f3b,blue:0x0864b5} as const;
const palettes=new WeakMap<CircuitTrack,Uint8Array|null>();

function buildPalette(track:CircuitTrack):Uint8Array|null{
 if(track.circuit.surface.roughness>0)return null;
 const count=Math.max(720,Math.min(1440,track.circuit.samples)),curvature=Array.from({length:count},(_,i)=>track.sampleCircuit(i/count*track.circuitLength).curvature),maximum=Math.max(...curvature);
 if(!Number.isFinite(maximum)||maximum<=0)return new Uint8Array(count);
 const threshold=Math.max(.012,maximum*.62),raw=curvature.map(value=>value>=threshold),mask=raw.map((_,i)=>{
  let votes=0;for(let offset=-2;offset<=2;offset++){let index=i+offset;if(!track.open)index=(index+count)%count;else if(index<0||index>=count)continue;if(raw[index])votes++;}
  return votes>=3;
 });
 const runs:{start:number;end:number}[]=[];let start=-1;
 for(let i=0;i<=count;i++){
  const active=i<count&&mask[i];
  if(active&&start<0)start=i;
  else if(!active&&start>=0){runs.push({start,end:i});start=-1;}
 }
 if(!track.open&&runs.length>1&&mask[0]&&mask[count-1]){const first=runs.shift()!,last=runs.pop()!;runs.unshift({start:last.start,end:first.end+count});}
 const minimum=Math.max(5,Math.floor(count*.008)),curves=runs.filter(run=>run.end-run.start>=minimum);
 const palette=new Uint8Array(count);
 const paint=(from:number,to:number,color:number)=>{for(let i=from;i<to;i++){const index=track.open?i:(i+count)%count;if(index>=0&&index<count)palette[index]=color;}};
 curves.forEach((run,index)=>paint(run.start,run.end,index%2===0?1:2));
 if(new Set(palette).size<3){
  const first=curves[0],center=first?(first.start+first.end)/2:(track.open?count*.22:count*.2),width=first?Math.min(count*.16,Math.max(minimum*2,(first.end-first.start)*.8)):count*.14;
  if(!palette.some(value=>value===1))paint(Math.floor(center-width/2),Math.ceil(center+width/2),1);
  const secondCenter=track.open?(center<count*.5?count*.72:count*.28):(center<count*.5?center+count*.5:center-count*.5);
  if(!palette.some(value=>value===2))paint(Math.floor(secondCenter-width/2),Math.ceil(secondCenter+width/2),2);
 }
 for(const color of [1,2]){
  const covered=palette.reduce((total,value)=>total+(value===color?1:0),0);
  if(covered<count*.075){const curveIndex=curves.findIndex((_,index)=>index%2===color-1),run=curves[curveIndex];const center=run?(run.start+run.end)/2:(color===1?count*.2:count*.7),width=count*.075;paint(Math.floor(center-width/2),Math.ceil(center+width/2),color);}
 }
 return palette;
}

/** Returns the red/blue moulding color at a raw course distance; off-road stays unpainted. */
export function courseRailColorAt(track:CircuitTrack,distance:number,offset=0):number|null{
 if(track.circuit.surface.roughness>0)return null;
 const length=track.circuitLength,raw=distance+offset,progress=track.open?Math.max(0,Math.min(length-1e-8,raw)):((raw%length)+length)%length;
 if(track.surfaceAt(progress).roughness>0)return null;
 let palette=palettes.get(track);if(palette===undefined){palette=buildPalette(track);palettes.set(track,palette);}
 if(!palette)return null;
 const section=palette[Math.min(palette.length-1,Math.floor(progress/length*palette.length))];
 return section===1?pavedCourseColors.red:section===2?pavedCourseColors.blue:pavedCourseColors.white;
}
