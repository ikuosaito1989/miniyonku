export type EventSound='arrival'|'step'|'contact';
/** 登場・足音・接触を短いオリジナル電子音で表現する。 */
export class EventAudio{
  private context:AudioContext|null=null;
  unlock(){try{this.context??=new AudioContext();void this.context.resume().catch(()=>{});}catch{}}
  play(cue:EventSound,volume:number){
    if(document.hidden||volume<=0)return;
    try{
      this.unlock();const context=this.context;if(!context)return;
      const tones=cue==='arrival'?[440,554,659]:cue==='contact'?[180,90]:[130];
      for(const [index,frequency]of tones.entries()){
        const oscillator=context.createOscillator(),gain=context.createGain(),start=context.currentTime+index*.055,duration=cue==='step'?.065:cue==='contact'?.13:.12;
        oscillator.type=cue==='arrival'?'sine':'triangle';oscillator.frequency.setValueAtTime(frequency,start);
        oscillator.frequency.exponentialRampToValueAtTime(cue==='arrival'?frequency:frequency*.55,start+duration);
        gain.gain.setValueAtTime(Math.max(.001,volume*(cue==='step'?.13:.26)),start);gain.gain.exponentialRampToValueAtTime(.001,start+duration);
        oscillator.connect(gain).connect(context.destination);oscillator.start(start);oscillator.stop(start+duration);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      }
    }catch{ /* 音声が利用できなくてもイベントは続ける。 */ }
  }
  dispose(){void this.context?.close().catch(()=>{});this.context=null;}
}
