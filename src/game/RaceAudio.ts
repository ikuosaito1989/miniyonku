import {RaceSoundLayer,preloadRaceSounds} from './RaceSoundLayer';
import type {RaceSoundPerspective} from './raceSoundscape';
import { countdownNumber, type RaceState } from './race';

/** 描画・走行計算と独立した、Web Audioによるオリジナルのレース効果音。 */
export function raceSoundCue(state:RaceState){
  return state.phase==='countdown'?String(countdownNumber(state)):state.phase==='running'?'go':state.phase;
}

export class RaceAudio {
  private context:AudioContext|null=null;
  private master:GainNode|null=null;
  private layer:RaceSoundLayer|null=null;
  private cue='ready';
  private enabled=true;
  private volume=0.35;
  private disposed=false;
  private lastState:RaceState|null=null;
  private lastView:RaceSoundPerspective|undefined;
  private gesture=()=>this.unlock();
  private stateChange=()=>{if(this.context&&this.context.state!=='running'&&this.context.state!=='closed'&&!document.hidden&&this.enabled)this.unlock();};
  private visibility=()=>{
    if(document.hidden)void this.context?.suspend().catch(()=>{});
    else this.unlock();
  };

  constructor(private readonly legacy=false){
    if(!legacy)preloadRaceSounds();
    document.addEventListener('visibilitychange',this.visibility);
    for(const event of ['pointerdown','pointerup','touchend','keydown','focus','pageshow'])globalThis.window?.addEventListener(event,this.gesture,true);
  }

  /** スマホの自動再生制限に合わせ、ユーザーの発進操作から呼ぶ。 */
  unlock(){
    if(this.disposed||!this.enabled)return;
    try{
      if(this.context?.state==='closed'){this.context=null;this.layer=null;}
      if(!this.context){
        const context=new AudioContext();this.context=context;
        this.master=context.createGain();this.master.gain.value=this.volume;
        const limiter=context.createDynamicsCompressor();limiter.threshold.value=-8;limiter.knee.value=12;limiter.ratio.value=4;limiter.attack.value=.003;limiter.release.value=.15;
        this.master.connect(limiter).connect(context.destination);
        context.onstatechange=this.stateChange;
        this.layer=new RaceSoundLayer(context,this.master,this.legacy);
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

  private beep(go:boolean,cue:string){
    const context=this.context,master=this.master;if(!context||!master)return;
    const oscillator=context.createOscillator(),envelope=context.createGain();
    const now=context.currentTime,duration=go?0.48:0.16,level=go?.34:.26;
    oscillator.type=this.legacy?'square':'triangle';oscillator.frequency.value=go?1760:this.legacy?880:cue==='3'?784:cue==='2'?831:880;
    envelope.gain.setValueAtTime(0,now);envelope.gain.linearRampToValueAtTime(level,now+0.008);
    envelope.gain.setValueAtTime(level,now+duration-0.025);envelope.gain.linearRampToValueAtTime(0,now+duration);
    oscillator.connect(envelope).connect(master);oscillator.start(now);oscillator.stop(now+duration);
    // A soft lower harmonic adds body without a harsh square-wave edge.
    if(!this.legacy){const undertone=context.createOscillator(),undertoneGain=context.createGain();undertone.type='sine';undertone.frequency.value=go?660:440;
    undertoneGain.gain.setValueAtTime(0,now);undertoneGain.gain.linearRampToValueAtTime(go?.09:.06,now+.012);undertoneGain.gain.linearRampToValueAtTime(0,now+duration);
    undertone.connect(undertoneGain).connect(master);undertone.start(now);undertone.stop(now+duration);
    undertone.onended=()=>{undertone.disconnect();undertoneGain.disconnect();};}
    oscillator.onended=()=>{oscillator.disconnect();envelope.disconnect();};
  }

  update(state:RaceState,view?:RaceSoundPerspective){
    this.lastState=state;this.lastView=view??this.lastView;
    const cue=raceSoundCue(state);
    if(cue!==this.cue){
      const audible=this.enabled&&!document.hidden&&this.context?.state==='running';
      const signal=cue==='go'||['3','2','1'].includes(cue);
      if(audible&&signal)this.beep(cue==='go',cue);
      if(audible||!signal||!this.enabled||document.hidden)this.cue=cue;
    }
    this.layer?.update(state,this.lastView,this.enabled&&!document.hidden&&this.context?.state==='running');
  }

  dispose(){
    this.disposed=true;document.removeEventListener('visibilitychange',this.visibility);
    for(const event of ['pointerdown','pointerup','touchend','keydown','focus','pageshow'])globalThis.window?.removeEventListener(event,this.gesture,true);
    if(this.context)this.context.onstatechange=null;
    this.layer?.dispose();this.layer=null;
    this.lastState=null;
    void this.context?.close().catch(()=>{});this.context=null;
  }
}
