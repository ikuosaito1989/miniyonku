import type {RaceState} from './race';
import {getCircuitTrack} from '../data/circuit';
import {RaceSoundEvents,racerSoundProfile,type RaceSoundPerspective,type RaceSoundEvent} from './raceSoundscape';

type Voice={motor:OscillatorNode;motorGain:GainNode;rolling:GainNode;filter:BiquadFilterNode;pan:StereoPannerNode|GainNode};
/** Five bounded voices share one noise source. All one-shot nodes disconnect on end. */
export class LegacyRaceSoundLayer{
 private voices=new Map<string,Voice>();
 private noise:AudioBufferSourceNode;
 private buffer:AudioBuffer;
 private events=new RaceSoundEvents();
 private transient=new Set<AudioScheduledSourceNode>();
 constructor(private context:AudioContext,private master:GainNode){
  this.buffer=context.createBuffer(1,Math.max(1,Math.floor(context.sampleRate*2)),context.sampleRate);const samples=this.buffer.getChannelData(0);let seed=0x19a2;
  for(let i=0;i<samples.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;samples[i]=seed/0x80000000-1;}
  this.noise=context.createBufferSource();this.noise.buffer=this.buffer;this.noise.loop=true;this.noise.start();
 }
 private panner(pan:number){const node=typeof this.context.createStereoPanner==='function'?this.context.createStereoPanner():this.context.createGain();if('pan' in node)node.pan.value=pan;return node;}
 private voice(id:string){
  let voice=this.voices.get(id);if(voice)return voice;if(this.voices.size>=5)return;
  const c=this.context,motor=c.createOscillator(),motorGain=c.createGain(),rolling=c.createGain(),filter=c.createBiquadFilter(),pan=this.panner(0);
  motor.type='triangle';motor.frequency.value=150;motorGain.gain.value=rolling.gain.value=0;filter.type='bandpass';filter.frequency.value=1800;filter.Q.value=.5;
  motor.connect(motorGain).connect(pan);this.noise.connect(filter).connect(rolling).connect(pan);pan.connect(this.master);motor.start();
  voice={motor,motorGain,rolling,filter,pan};this.voices.set(id,voice);return voice;
 }
 private play(event:RaceSoundEvent){
  if(this.transient.size>=12||event.level<.008)return;
  const c=this.context,now=c.currentTime,duration=event.kind==='land'?.16:event.kind==='pass'?.23:.19,source=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain(),pan=this.panner(event.pan);
  source.buffer=this.buffer;filter.type=event.kind==='pass'?'bandpass':'lowpass';filter.Q.value=event.kind==='pass'?.7:.4;filter.frequency.setValueAtTime(event.kind==='land'?850+event.roughness*1100:event.kind==='pass'?2700:1800,now);filter.frequency.linearRampToValueAtTime(event.kind==='pass'?900:260,now+duration);
  gain.gain.setValueAtTime(0,now);gain.gain.linearRampToValueAtTime(event.level,now+.007);gain.gain.linearRampToValueAtTime(0,now+duration);
  source.connect(filter).connect(gain).connect(pan).connect(this.master);this.transient.add(source);source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();this.transient.delete(source);};source.start(now,event.kind==='pass'?.4:0);source.stop(now+duration);
 }
 update(state:RaceState,view:RaceSoundPerspective|undefined,audible:boolean){
  const c=this.context,track=view?.track??getCircuitTrack(state.circuitId),events=this.events.update(state,view);
  for(const racer of state.racers){
   const voice=this.voice(racer.id);if(!voice)continue;
   const p=racerSoundProfile(racer,track,view),moving=Math.min(1,p.speed/6),level=audible?p.level:0;
   voice.motor.frequency.setTargetAtTime(p.frequency*(p.airborne?1.12:1),c.currentTime,.06);
   voice.motorGain.gain.setTargetAtTime(level*moving*.065,c.currentTime,.08);
   voice.rolling.gain.setTargetAtTime(level*p.rolling*(.035+p.roughness*.12)*(1+p.roughness*.16*Math.sin(racer.driving.time*39+racer.driving.distance*7)),c.currentTime,.035);
   voice.filter.frequency.setTargetAtTime(1100+p.speed*95+p.roughness*1600,c.currentTime,.08);
   if('pan' in voice.pan)voice.pan.pan.setTargetAtTime(p.pan,c.currentTime,.06);
  }
  if(audible)for(const event of events)this.play(event);
 }
 dispose(){
  try{this.noise.stop();}catch{}this.noise.disconnect();
  for(const voice of this.voices.values()){try{voice.motor.stop();}catch{}voice.motor.disconnect();voice.motorGain.disconnect();voice.rolling.disconnect();voice.filter.disconnect();voice.pan.disconnect();}
  for(const source of this.transient){try{source.stop();}catch{}source.onended?.(new Event('ended'));source.onended=null;}this.transient.clear();this.voices.clear();
 }
}
