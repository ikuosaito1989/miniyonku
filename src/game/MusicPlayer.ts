import type { MusicScene } from '../data/music';
import type { MusicStatus } from './audioSettings';
import { unpackMusic } from './musicPackage';

/** BGM専用。非同期ロードの世代を確認し、切替前の曲が遅れて鳴るのを防ぐ。 */
export class MusicPlayer {
  private context:AudioContext|null=null;
  private gain:GainNode|null=null;
  private source:AudioBufferSourceNode|null=null;
  private cache=new Map<MusicScene,Promise<AudioBuffer>>();
  private scene:MusicScene='shop';
  private enabled=true;
  private volume=0.35;
  private visible=true;
  private interacted=false;
  private disposed=false;
  private generation=0;
  private pending=false;
  private stateChange=()=>{
    if(this.disposed||!this.enabled||!this.visible)return;
    if(this.context?.state==='running'){this.play();return;}
    this.report('waiting');
    if(this.interacted)this.unlock();
  };

  constructor(private tracks:Record<MusicScene,{url:string}>,private report:(status:MusicStatus)=>void){}

  unlock(){
    this.interacted=true;
    if(this.disposed||!this.enabled||!this.visible)return;
    try{
      if(this.context?.state==='closed'){this.stop();this.cache.clear();this.context=null;this.gain=null;}
      if(!this.context){
        if(!globalThis.crypto?.subtle)throw new Error('BGM再生にはHTTPSが必要です');
        this.context=new AudioContext();this.context.onstatechange=this.stateChange;this.gain=this.context.createGain();
        this.gain.gain.value=this.volume*0.6;this.gain.connect(this.context.destination);
      }
      const context=this.context;
      if(context.state==='running'){this.play();return;}
      // iOSではresume()が未解決のまま残ることがある。次のタップも必ず再試行する。
      void context.resume().then(()=>{if(!this.disposed&&this.context===context&&this.enabled&&this.visible&&context.state==='running')this.play();}).catch(()=>{if(!this.disposed&&this.context===context)this.report('waiting');});
    }catch{this.report('error');}
  }

  setScene(scene:MusicScene){
    if(scene===this.scene)return;
    this.scene=scene;this.stop();
    if(this.interacted)this.unlock();
  }

  setSettings(enabled:boolean,volume:number){
    const changed=this.enabled!==enabled||this.volume!==volume;
    this.enabled=enabled;this.volume=volume;
    if(this.context&&this.gain)this.gain.gain.setTargetAtTime(enabled?volume*0.6:0,this.context.currentTime,0.03);
    if(!enabled){this.report('muted');return;}
    if(changed&&this.interacted)this.unlock();
  }

  setVisible(visible:boolean){
    this.visible=visible;
    if(!visible){void this.context?.suspend().catch(()=>{});this.report(this.enabled?'paused':'muted');}
    else if(this.interacted)this.unlock();
  }

  private play(){
    const context=this.context;if(!context||context.state!=='running'||!this.gain||!this.enabled||!this.visible)return;
    if(this.source){this.report('playing');return;}
    if(this.pending)return;
    const scene=this.scene,generation=this.generation;this.pending=true;this.report('loading');
    let buffer=this.cache.get(scene);
    if(!buffer){
      buffer=fetch(this.tracks[scene].url).then(response=>{
        if(!response.ok)throw new Error('BGMを読み込めませんでした');return response.arrayBuffer();
      }).then(unpackMusic).then(bytes=>context.decodeAudioData(bytes));
      this.cache.set(scene,buffer);
    }
    void buffer.then(decoded=>{
      if(this.disposed||generation!==this.generation)return;
      this.pending=false;
      if(!this.enabled||!this.visible)return;
      const source=context.createBufferSource();source.buffer=decoded;source.loop=true;
      source.onended=()=>{
        if(this.source!==source||this.disposed)return;
        this.source=null;source.disconnect();
        if(this.enabled&&this.visible)this.unlock();
      };
      source.connect(this.gain!);source.start();this.source=source;
      this.report(context.state==='running'?'playing':'waiting');
    }).catch(()=>{
      this.cache.delete(scene);
      if(!this.disposed&&generation===this.generation){this.pending=false;this.report('error');}
    });
  }

  private stop(){
    this.generation++;this.pending=false;
    if(this.source)this.source.onended=null;
    this.source?.stop();this.source?.disconnect();this.source=null;
  }

  dispose(){
    this.disposed=true;if(this.context)this.context.onstatechange=null;this.stop();void this.context?.close().catch(()=>{});this.context=null;this.cache.clear();
  }
}
