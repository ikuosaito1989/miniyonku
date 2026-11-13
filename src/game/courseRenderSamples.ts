import type {CircuitTrack} from '../data/circuit';
import {courseRailColorAt} from './coursePalette';

const sampleCache=new WeakMap<CircuitTrack,number[]>();
/** Rendering-only decimation. Physical samples and track distances remain untouched. */
export function courseRenderSamples(track:CircuitTrack):number[]{
 const cached=sampleCache.get(track);if(cached)return cached;
 const count=track.circuit.samples,length=track.circuitLength,lane=(track.circuit.lanes-1)/2;
 const distance=(i:number)=>i/count*length;
 const indices=[0];
 for(let i=0;i<count;){
  let next=Math.min(count,i+2);
  if(next===i+2){
   const a=track.sampleLanePath(distance(i),lane),m=track.sampleLanePath(distance(i+1),lane),b=track.sampleLanePath(distance(next),lane);
   const error=Math.hypot(m.x-(a.x+b.x)/2,m.y-(a.y+b.y)/2,m.z-(a.z+b.z)/2);
   const orientation=Math.min(a.upX*b.upX+a.upY*b.upY+a.upZ*b.upZ,a.sideX*b.sideX+a.sideY*b.sideY+a.sideZ*b.sideZ);
   const gapA=track.isJumpGap(distance(i+.5)),gapB=track.isJumpGap(distance(i+1.5));
   const colorA=courseRailColorAt(track,distance(i),track.startDistance),colorM=courseRailColorAt(track,distance(i+1),track.startDistance),colorB=courseRailColorAt(track,distance(next),track.startDistance);
   const roughA=track.surfaceAt(distance(i)).roughness,roughM=track.surfaceAt(distance(i+1)).roughness,roughB=track.surfaceAt(distance(next)).roughness;
   if(error>.003||orientation<.999||gapA!==gapB||colorA!==colorM||colorM!==colorB||roughA!==roughM||roughM!==roughB)next=i+1;
  }
  indices.push(next);i=next;
 }
 sampleCache.set(track,indices);return indices;
}
