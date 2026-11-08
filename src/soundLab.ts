import {RaceSoundLayer} from './game/RaceSoundLayer';
import {RaceAudio} from './game/RaceAudio';
import {createRaceState,COUNTDOWN_TICKS} from './game/race';
import {starterEquipment} from './data/machine';

const button=(id:string)=>document.getElementById(id) as HTMLButtonElement;
const speed=document.getElementById('speed') as HTMLInputElement,output=document.getElementById('speed-value')!,status=document.getElementById('status')!;
let context:AudioContext|null=null,layer:RaceSoundLayer|null=null,raceAudio:RaceAudio|null=null,frame=0,last=0;
const stop=()=>{cancelAnimationFrame(frame);raceAudio?.dispose();raceAudio=null;layer?.dispose();layer=null;void context?.close();context=null;status.textContent='停止中';};
async function start(legacy:boolean){
 stop();const c=new AudioContext();context=c;await c.resume();if(context!==c)return;
 const master=c.createGain(),limiter=c.createDynamicsCompressor();master.gain.value=.3;limiter.threshold.value=-8;limiter.ratio.value=4;master.connect(limiter).connect(c.destination);
 layer=new RaceSoundLayer(c,master,legacy);const active=layer;
 if(!legacy){status.textContent='音素材を読み込み中';for(let i=0;i<50&&!active.samplesReady;i++){await new Promise(resolve=>setTimeout(resolve,100));if(layer!==active)return;}}
 const race=createRaceState(starterEquipment);race.phase='running';race.playerStartOffset=0;active.update(race,undefined,true);
 for(const racer of race.racers){racer.driving.status=racer.id==='player'?'running':'ready';racer.driving.speed=0;}
 const update=(now:number)=>{if(!layer)return;const delta=last?Math.min(.1,(now-last)/1000):0;last=now;const player=race.racers.find(r=>r.id==='player')!;player.driving.speed=Number(speed.value);player.driving.time+=delta;player.driving.distance+=player.driving.speed*delta;race.time+=delta;layer.update(race,undefined,true);frame=requestAnimationFrame(update);};
 last=0;status.textContent=legacy?'変更前を再生中':active.samplesReady?'変更後を再生中':'素材を読み込めないため変更前の音を再生中';frame=requestAnimationFrame(update);
}
button('before').onclick=()=>void start(true);button('after').onclick=()=>void start(false);button('stop').onclick=stop;speed.oninput=()=>{output.textContent=speed.value;};window.addEventListener('pagehide',stop);

function countdown(legacy:boolean){
 stop();const audio=new RaceAudio(legacy);raceAudio=audio;audio.unlock();const race=createRaceState(starterEquipment);race.phase='countdown';const startTime=performance.now();
 const tick=(now:number)=>{if(raceAudio!==audio)return;const elapsed=(now-startTime)/1000;race.countdownTicks=Math.max(0,COUNTDOWN_TICKS-Math.floor(elapsed*120));if(elapsed>=3)race.phase='running';audio.update(race);if(elapsed<3.6)frame=requestAnimationFrame(tick);else status.textContent='カウントダウン終了';};
 status.textContent=legacy?'変更前のカウントダウン':'変更後のカウントダウン';frame=requestAnimationFrame(tick);
}
button('count-before').onclick=()=>countdown(true);button('count-after').onclick=()=>countdown(false);
