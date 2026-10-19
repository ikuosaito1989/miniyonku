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
  private visibility=()=>{
    if(document.hidden)void this.context?.suspend().catch(()=>{});
    else if(this.enabled)void this.context?.resume().catch(()=>{});
  };

  constructor(){document.addEventListener('visibilitychange',this.visibility);}

  /** スマホの自動再生制限に合わせ、ユーザーの発進操作から呼ぶ。 */
  unlock(){
    if(this.disposed||!this.enabled)return;
    try{
      if(!this.context){
        const context=new AudioContext();this.context=context;
        this.master=context.createGain();this.master.gain.value=this.volume;this.master.connect(context.destination);
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
      if(!document.hidden)void this.context.resume().catch(()=>{});
    }catch{ /* 音声非対応でもレースは継続する。 */ }
  }

  setEnabled(enabled:boolean){
    const changed=this.enabled!==enabled;
    this.enabled=enabled;
    if(enabled&&changed)this.unlock();
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
    const now=context.currentTime,duration=go?0.48:0.12;
    oscillator.type='square';oscillator.frequency.value=go?1760:880;
    envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(0.12,now+0.008);
    envelope.gain.setValueAtTime(0.12,now+duration-0.025);envelope.gain.linearRampToValueAtTime(0,now+duration);
    oscillator.connect(envelope).connect(master);oscillator.start(now);oscillator.stop(now+duration);
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
  }

  update(state:RaceState){
    const cue=raceSoundCue(state);
    if(cue!==this.cue){
      if(this.enabled&&!document.hidden&&(cue==='go'||['3','2','1'].includes(cue)))this.beep(cue==='go');
      this.cue=cue;
    }
    const context=this.context;if(!context||!this.rush||!this.filter||!this.motor||!this.motorGain)return;
    const moving=state.racers.filter(r=>r.driving.status==='running');
    const speed=moving.reduce((sum,r)=>sum+r.driving.speed,0)/Math.max(1,moving.length);
    const intensity=Math.min(1,speed/7),now=context.currentTime;
    this.rush.gain.setTargetAtTime(intensity*0.65,now,0.12);
    this.filter.frequency.setTargetAtTime(1000+intensity*2600,now,0.12);
    this.motor.frequency.setTargetAtTime(140+speed*65,now,0.1);
    this.motorGain.gain.setTargetAtTime(intensity*0.045,now,0.12);
  }

  dispose(){
    this.disposed=true;document.removeEventListener('visibilitychange',this.visibility);
    this.noise?.stop();this.motor?.stop();
    void this.context?.close().catch(()=>{});this.context=null;
  }
}
