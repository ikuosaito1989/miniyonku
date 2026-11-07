import {getCircuitTrack,type CircuitTrack} from '../data/circuit';
import type {RaceState,Racer} from './race';
export type SoundPoint={x:number;y:number;z:number};
export type RaceSoundPerspective={track:CircuitTrack;listener:SoundPoint;right:SoundPoint};
export type RaceSoundEvent={kind:'launch'|'land'|'pass';id:string;level:number;pan:number;roughness:number};
export function racerSoundProfile(racer:Racer,track:CircuitTrack,view?:RaceSoundPerspective){
 const p=track.sampleLanePath(racer.driving.distance,racer.lane),dx=p.x-(view?.listener.x??p.x),dy=(racer.driving.flightY??p.y)-(view?.listener.y??p.y),dz=p.z-(view?.listener.z??p.z),distance=Math.hypot(dx,dy,dz);
 const attenuation=view?1/(1+(distance/1.7)**2):racer.id==='player'?1:.2;
 const speed=racer.driving.status==='running'?racer.driving.speed:0,airborne=racer.driving.flightY!==undefined,roughness=track.surfaceAt(racer.driving.distance).roughness;
 return {id:racer.id,speed,frequency:125+racer.performance.freeSpeed*8+Math.min(35,speed)*36,level:attenuation*(racer.id==='player'?1:.7),pan:view?Math.max(-.95,Math.min(.95,(dx*view.right.x+dy*view.right.y+dz*view.right.z)/Math.max(.45,distance))):0,roughness,rolling:airborne?0:Math.min(1,speed/6),airborne};
}
/** Observe simulation counters; rendering a state twice never repeats an impact. */
export class RaceSoundEvents{
 private previous=new Map<string,{launched:boolean;landings:number;relative:number;passTime:number}>();
 update(state:RaceState,view?:RaceSoundPerspective):RaceSoundEvent[]{
  const track=view?.track??getCircuitTrack(state.circuitId),player=state.racers.find(r=>r.id==='player'),events:RaceSoundEvent[]=[];
  for(const racer of state.racers){
   const d=racer.driving,profile=racerSoundProfile(racer,track,view);
   let relative=d.distance-(player?.driving.distance??0);if(!track.open)relative=((relative+track.circuitLength/2)%track.circuitLength+track.circuitLength)%track.circuitLength-track.circuitLength/2;
   const before=this.previous.get(racer.id),launched=d.status!=='ready'&&d.speed>.25;
   if(before&&(state.phase==='running'||state.phase==='countdown')){
    if(!before.launched&&launched)events.push({kind:'launch',id:racer.id,level:profile.level*.18,pan:profile.pan,roughness:profile.roughness});
    if((d.landings??0)>before.landings&&d.status!=='out')events.push({kind:'land',id:racer.id,level:profile.level*Math.min(.42,.12+d.speed*.025)*(1-racer.performance.damping*.55),pan:profile.pan,roughness:profile.roughness});
    if(view&&racer.id!=='player'&&d.time>1&&(player?.driving.time??0)>.4&&relative*before.relative<=0&&Math.abs(relative-before.relative)>.015&&Math.abs(relative-before.relative)<5&&profile.level>.16&&state.time-before.passTime>1){events.push({kind:'pass',id:racer.id,level:profile.level*.2,pan:profile.pan,roughness:profile.roughness});before.passTime=state.time;}
   }
   this.previous.set(racer.id,{launched:state.phase==='ready'?false:(before?.launched??launched)||launched,landings:d.landings??0,relative,passTime:state.phase==='ready'?-2:before?.passTime??-2});
  }
  return events;
 }
}
