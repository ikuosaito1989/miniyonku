import type {RaceState} from './race';
import {getCircuitTrack} from '../data/circuit';
import {RaceSoundEvents,racerSoundProfile,type RaceSoundPerspective,type RaceSoundEvent} from './raceSoundscape';
import {LegacyRaceSoundLayer} from './LegacyRaceSoundLayer';

const urls={slow:new URL('../assets/sfx/motor-slow.mp3',import.meta.url).href,fast:new URL('../assets/sfx/motor-fast.mp3',import.meta.url).href,rolling:new URL('../assets/sfx/wheel-roll.mp3',import.meta.url).href,click:new URL('../assets/sfx/gate-click.mp3',import.meta.url).href,landing:new URL('../assets/sfx/landing.mp3',import.meta.url).href};
type SampleName=keyof typeof urls;
type Samples=Record<SampleName,AudioBuffer>;
export function preloadRaceSounds(){if(typeof window!=='undefined'&&typeof window.fetch==='function')void loadAssets().catch(()=>{});}
type Voice={sources:AudioBufferSourceNode[];gains:GainNode[];filters:BiquadFilterNode[];pan:StereoPannerNode|GainNode};
// Cache compressed assets across races; AudioBuffers remain owned by their context.
let assets:Promise<Record<SampleName,ArrayBuffer>>|undefined;
function loadAssets(){
 if(!assets)assets=Promise.all((Object.keys(urls) as SampleName[]).map(async key=>{const response=await fetch(urls[key]);if(!response.ok)throw new Error(`SE読み込み失敗: ${key}`);return [key,await response.arrayBuffer()] as const;})).then(entries=>Object.fromEntries(entries) as Record<SampleName,ArrayBuffer>).catch(error=>{assets=undefined;throw error;});
 return assets;
}
/** Remove clicks by overlapping the end with the start before looping. */
export function seamlessLoop(context:AudioContext,input:AudioBuffer){
 const fade=Math.min(Math.floor(input.sampleRate*.09),Math.floor(input.length/4)),length=input.length-fade;
 const output=context.createBuffer(input.numberOfChannels,length,input.sampleRate);
 for(let channel=0;channel<input.numberOfChannels;channel++){
  const source=input.getChannelData(channel),target=output.getChannelData(channel);target.set(source.subarray(fade));
  for(let i=0;i<fade;i++){const t=(i+1)/(fade+1),index=length-fade+i;target[index]=source[input.length-fade+i]*(1-t)+source[i]*t;}
 }
 return output;
}
/** Recorded toy motor and wheel samples, with five spatially bounded voices. */
export class RaceSoundLayer{
 private buffers:Samples|null=null;private voices=new Map<string,Voice>();private events=new RaceSoundEvents();
 private fallback:LegacyRaceSoundLayer|null;private fallbackGain:GainNode;private fadingFallback:LegacyRaceSoundLayer|null=null;private fadeTimer:ReturnType<typeof setTimeout>|null=null;private transient=new Set<AudioBufferSourceNode>();private disposed=false;
 constructor(private context:AudioContext,private master:GainNode,private readonly legacyOnly=false){
  this.fallbackGain=context.createGain();this.fallbackGain.connect(master);this.fallback=new LegacyRaceSoundLayer(context,this.fallbackGain);
  if(legacyOnly||typeof context.decodeAudioData!=='function')return;
  void loadAssets().then(async data=>{
   const entries=await Promise.all((Object.keys(urls) as SampleName[]).map(async name=>[name,await context.decodeAudioData(data[name].slice(0))] as const));
   if(this.disposed)return;
   const decoded=Object.fromEntries(entries) as Samples;
   for(const name of ['slow','fast','rolling'] as const)decoded[name]=seamlessLoop(context,decoded[name]);
   this.buffers=decoded;this.fadingFallback=this.fallback;this.fallback=null;this.fallbackGain.gain.setTargetAtTime(0,context.currentTime,.04);this.fadeTimer=setTimeout(()=>{this.fadingFallback?.dispose();this.fadingFallback=null;this.fallbackGain.disconnect();this.fadeTimer=null;},250);
  }).catch(()=>{/* Keep the previous sound available if files cannot be loaded. */});
 }
 get samplesReady(){return this.buffers!==null;}
 private panner(){return typeof this.context.createStereoPanner==='function'?this.context.createStereoPanner():this.context.createGain();}
 private voice(id:string){
  let voice=this.voices.get(id);if(voice)return voice;if(!this.buffers||this.voices.size>=5)return;
  const c=this.context,pan=this.panner(),sources:AudioBufferSourceNode[]=[],gains:GainNode[]=[],filters:BiquadFilterNode[]=[];pan.connect(this.master);
  for(const [name,frequency] of [['slow',3300],['fast',5000],['rolling',2600]] as const){
   const source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter();source.buffer=this.buffers[name];source.loop=true;gain.gain.value=0;filter.type='lowpass';filter.frequency.value=frequency;filter.Q.value=.45;
   source.connect(filter).connect(gain).connect(pan);source.start();sources.push(source);gains.push(gain);filters.push(filter);
  }
  voice={sources,gains,filters,pan};this.voices.set(id,voice);return voice;
 }
 private play(event:RaceSoundEvent){
  if(!this.buffers||this.transient.size>=12||event.level<.008)return;
  const c=this.context,now=c.currentTime,source=c.createBufferSource(),gain=c.createGain(),filter=c.createBiquadFilter(),pan=this.panner();
  source.buffer=event.kind==='land'?this.buffers.landing:event.kind==='launch'||event.kind==='joint'?this.buffers.click:this.buffers.rolling;
  source.playbackRate.value=event.kind==='launch'?1.08:event.kind==='land'?.88:1.15;
  filter.type='lowpass';filter.frequency.value=event.kind==='land'?2400:4200;
  if('pan' in pan)pan.pan.value=event.pan;
  const duration=Math.min(source.buffer.duration,event.kind==='pass'?.3:.32),level=event.level*(event.kind==='launch'?1.2:.8);
  gain.gain.setValueAtTime(.0001,now);gain.gain.linearRampToValueAtTime(level,now+.006);gain.gain.setValueAtTime(level,now+Math.max(.008,duration-.09));gain.gain.linearRampToValueAtTime(0,now+duration);
  source.connect(filter).connect(gain).connect(pan).connect(this.master);this.transient.add(source);
  source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();pan.disconnect();this.transient.delete(source);};source.start(now);source.stop(now+duration);
  if(event.kind==='launch'&&this.transient.size<12){
   // A quiet filtered mechanical impact under the click, not an explosion.
   const thump=c.createBufferSource(),low=c.createBiquadFilter(),body=c.createGain();thump.buffer=this.buffers.landing;thump.playbackRate.value=.72;low.type='lowpass';low.frequency.value=650;
   body.gain.setValueAtTime(0,now);body.gain.linearRampToValueAtTime(event.level*.38,now+.008);body.gain.linearRampToValueAtTime(0,now+.18);
   thump.connect(low).connect(body).connect(pan);this.transient.add(thump);thump.onended=()=>{thump.disconnect();low.disconnect();body.disconnect();this.transient.delete(thump);};thump.start(now);thump.stop(now+.18);
  }
 }
 update(state:RaceState,view:RaceSoundPerspective|undefined,audible:boolean){
  if(this.fallback){this.fallback.update(state,view,audible);return;}
  const c=this.context,track=view?.track??getCircuitTrack(state.circuitId),events=this.events.update(state,view);
  for(const racer of state.racers){
   const voice=this.voice(racer.id);if(!voice)continue;const p=racerSoundProfile(racer,track,view),speed=Math.max(0,p.speed),ratio=Math.min(1,speed/9),curve=Math.sqrt(ratio),level=audible?p.level:0;
   const corner=Math.min(1,track.sampleLanePath(racer.driving.distance,racer.lane).curvature*2.5),rolling=p.airborne?0:Math.min(1,speed/5);
   const rates=[.7+curve*.6,.65+curve*.9,.7+curve*.55],levels=[level*curve*(1-ratio*.65)*.12,level*curve*(.025+ratio*.08),level*rolling*(.025+corner*.025+p.roughness*.04)];
   for(let i=0;i<3;i++){voice.sources[i].playbackRate.setTargetAtTime(rates[i],c.currentTime,.12);voice.gains[i].gain.setTargetAtTime(levels[i],c.currentTime,.1);}
   voice.filters[2].frequency.setTargetAtTime(1300+curve*1100+p.roughness*900,c.currentTime,.1);
   if('pan' in voice.pan)voice.pan.pan.setTargetAtTime(p.pan,c.currentTime,.08);
  }
  if(audible)for(const event of events)this.play(event);
 }
 dispose(){
  this.disposed=true;if(this.fadeTimer!==null)clearTimeout(this.fadeTimer);this.fadingFallback?.dispose();this.fadingFallback=null;this.fallback?.dispose();this.fallback=null;this.fallbackGain.disconnect();
  for(const voice of this.voices.values()){for(const source of voice.sources){try{source.stop();}catch{}source.disconnect();}for(const node of [...voice.gains,...voice.filters,voice.pan])node.disconnect();}
  for(const source of this.transient){source.onended?.(new Event('ended'));source.onended=null;try{source.stop();}catch{}}this.transient.clear();this.voices.clear();
 }
}
