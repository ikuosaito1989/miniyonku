import { countdownNumber, type RaceState } from './race';

/** 描画・走行計算と独立した、Web Audioによるオリジナルのレース効果音。 */
export function raceSoundCue(state:RaceState){
  return state.phase==='countdown'?String(countdownNumber(state)):state.phase==='running'?'go':state.phase;
}

export class RaceAudio {
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private rush:GainNode|null=null;
  private filter:BiquadFilterNode|null=null;
  private noise:AudioBufferSourceNode|null=null;
  private motor:OscillatorNode|null=null;
  private motorGain:GainNode|null=null;
  private cue='ready';
  private enabled=true;
  private volume=0.35;
  private disposed=false;
  private lastState:RaceState|null=null;
  private gesture=()=>this.unlock();
  private stateChange=()=>{if(this.context&&this.context.state!=='running'&&this.context.state!=='closed'&&!document.hidden&&this.enabled)this.unlock();};
  private visibility=()=>{
    if(document.hidden)void this.context?.suspend().catch(()=>{});
    else this.unlock();
  };

  constructor(){
    document.addEventListener('visibilitychange',this.visibility);
    for(const event of ['pointerdown','pointerup','touchend','keydown','focus','pageshow'])globalThis.window?.addEventListener(event,this.gesture,true);
  }

  /** スマホの自動再生制限に合わせ、ユーザーの発進操作から呼ぶ。 */
  unlock(){
    if(this.disposed||!this.enabled)return;
    try{
      if(this.context?.state==='closed'){this.context=null;this.noise=null;this.motor=null;}
      if(!this.context){
        const context=new AudioContext();this.context=context;
        this.master=context.createGain();this.master.gain.value=this.volume;
        const limiter=context.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=12;limiter.ratio.value=4;limiter.attack.value=.003;limiter.release.value=.15;
        this.master.connect(limiter).connect(context.destination);
        context.onstatechange=this.stateChange;
        const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate);
        const samples=buffer.getChannelData(0);
        for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
        this.noise=context.createBufferSource();this.noise.buffer=buffer;this.noise.loop=true;
        this.filter=context.createBiquadFilter();this.filter.type='bandpass';this.filter.frequency.value=1800;this.filter.Q.value=0.65;
        this.rush=context.createGain();this.rush.gain.value=0;
        this.noise.connect(this.filter).connect(this.rush).connect(this.master);this.noise.start();
        this.motor=context.createOscillator();this.motor.type='triangle';this.motor.frequency.value=180;
        this.motorGain=context.createGain();this.motorGain.gain.value=0;
        this.motor.connect(this.motorGain).connect(this.master);this.motor.start();
      }
      if(!document.hidden&&this.context.state!=='running'){
        const context=this.context;
        void context.resume().then(()=>{if(!this.disposed&&this.context===context&&this.lastState)this.update(this.lastState);}).catch(()=>{});
      }
    }catch{ /* 音声非対応でもレースは継続する。 */ }
  }

  setEnabled(enabled:boolean){
    const changed=this.enabled!==enabled;
    this.enabled=enabled;
    if(enabled&&(changed||(this.context!==null&&this.context.state!=='running')))this.unlock();
    if(this.context&&this.master){
      this.master.gain.setTargetAtTime(enabled?this.volume:0,this.context.currentTime,0.025);
    }
  }
  setVolume(volume:number){
    this.volume=volume;
    if(this.context&&this.master)this.master.gain.setTargetAtTime(this.enabled?volume:0,this.context.currentTime,0.025);
  }

  private beep(go:boolean){
    const context=this.context,master=this.master;if(!context||!master)return;
    const oscillator=context.createOscillator(),envelope=context.createGain();
    const now=context.currentTime,duration=go?0.48:0.16,level=go?.34:.26;
    oscillator.type='square';oscillator.frequency.value=go?1760:880;
    envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level,now+0.008);
    envelope.gain.setValueAtTime(level,now+duration-0.025);envelope.gain.linearRampToValueAtTime(0,now+duration);
    oscillator.connect(envelope).connect(master);oscillator.start(now);oscillator.stop(now+duration);
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
  }

  update(state:RaceState){
    this.lastState=state;
    const cue=raceSoundCue(state);
    if(cue!==this.cue){
      const audible=this.enabled&&!document.hidden&&this.context?.state==='running';
      const signal=cue==='go'||['3','2','1'].includes(cue);
      if(audible&&signal)this.beep(cue==='go');
      if(audible||!signal||!this.enabled||document.hidden)this.cue=cue;
    }
    const context=this.context;if(!context||!this.rush||!this.filter||!this.motor||!this.motorGain)return;
    const moving=state.racers.filter(r=>r.driving.status==='running');
    const speed=moving.reduce((sum,r)=>sum+r.driving.speed,0)/Math.max(1,moving.length);
    const intensity=Math.min(1,speed/7),now=context.currentTime;
    this.rush.gain.setTargetAtTime(intensity*1.3,now,0.12);
    this.filter.frequency.setTargetAtTime(1000+intensity*2600,now,0.12);
    this.motor.frequency.setTargetAtTime(140+speed*65,now,0.1);
    this.motorGain.gain.setTargetAtTime(intensity*0.07,now,0.12);
  }

  dispose(){
    this.disposed=true;document.removeEventListener('visibilitychange',this.visibility);
    for(const event of ['pointerdown','pointerup','touchend','keydown','focus','pageshow'])globalThis.window?.removeEventListener(event,this.gesture,true);
    if(this.context)this.context.onstatechange=null;
    try{this.noise?.stop();this.motor?.stop();}catch{}
    this.lastState=null;
    void this.context?.close().catch(()=>{});this.context=null;
  }
}
