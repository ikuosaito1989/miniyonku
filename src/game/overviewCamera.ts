import type {CircuitTrack} from '../data/circuit';
import {raceCamera} from '../data/raceCamera';
/** 実際の立体レーンをカメラ平面へ投影し、縦横どちらの画面でも余白少なめで全景を収める。 */
export function overviewFrame(track:CircuitTrack,aspect:number,allowPortraitRotation=true){
 const [ox,oy,oz]=raceCamera.running.offset,r=Math.hypot(ox,oz),length=Math.hypot(ox,oy,oz);
 let right={x:oz/r,y:0,z:-ox/r},up={x:-ox*oy/(length*r),y:r/length,z:-oz*oy/(length*r)};
 let left=Infinity,rightEdge=-Infinity,bottom=Infinity,top=-Infinity;
 for(const lane of [0,track.circuit.lanes-1])for(let i=0;i<=600;i++){
  const p=track.sampleLanePath(i/600*track.circuitLength,lane);
  for(const lift of [0,.45]){
   const x=p.x*right.x+p.z*right.z,y=p.x*up.x+(p.y+lift)*up.y+p.z*up.z;
   left=Math.min(left,x);rightEdge=Math.max(rightEdge,x);bottom=Math.min(bottom,y);top=Math.max(top,y);
  }
 }
 const safeAspect=Number.isFinite(aspect)&&aspect>0?aspect:1;
 const normalHeight=Math.max(top-bottom,(rightEdge-left)/safeAspect),rotatedHeight=Math.max(rightEdge-left,(top-bottom)/safeAspect);
 const rotated=allowPortraitRotation&&safeAspect<1&&rotatedHeight<normalHeight*.9;
 if(rotated){
  const oldRight=right,oldUp=up;right=oldUp;up={x:-oldRight.x,y:-oldRight.y,z:-oldRight.z};
  [left,rightEdge,bottom,top]=[bottom,top,-rightEdge,-left];
 }
 const centerX=(left+rightEdge)/2,centerY=(bottom+top)/2;
 return {height:Math.max(top-bottom+.35,(rightEdge-left+.35)/safeAspect)*1.08,target:{x:right.x*centerX+up.x*centerY,y:up.y*centerY,z:right.z*centerX+up.z*centerY},rotated,bounds:{left,right:rightEdge,bottom,top},right,up};
}
export function overviewCarScale(cssHeight:number,viewHeight:number){return Math.max(1,Math.min(8,18*viewHeight/(Math.max(1,cssHeight)*.24*.85)));}

/** 上の案内と下のタイム表示を避けた領域へコースを収める。 */
export function overviewViewportFrame(track:CircuitTrack,width:number,height:number){
 const top=Math.min(44,height*.12),bottom=Math.min(48,height*.13),usable=Math.max(1,height-top-bottom);
 const frame=overviewFrame(track,width/usable),shift=(top-bottom)*frame.height/(2*usable);
 return {...frame,height:frame.height*height/usable,target:{x:frame.target.x+frame.up.x*shift,y:frame.target.y+frame.up.y*shift,z:frame.target.z+frame.up.z*shift}};
}
