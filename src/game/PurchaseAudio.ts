/** 購入成功を知らせる、短いオリジナルの上昇チャイム。 */
export class PurchaseAudio {
  private context:AudioContext|null=null;

  play(volume:number){
    if(document.hidden||volume<=0)return;
    try{
      const context=this.context??=new AudioContext();
      void context.resume().catch(()=>{});
      const now=context.currentTime;
      for(const [index,frequency] of [1046.5,1318.5,1568].entries()){
        const oscillator=context.createOscillator(),gain=context.createGain();
        const start=now+index*0.065,end=start+0.16;
        oscillator.type='sine';oscillator.frequency.value=frequency;
        gain.gain.setValueAtTime(0,start);
        gain.gain.linearRampToValueAtTime(volume*0.2,start+0.005);
        gain.gain.exponentialRampToValueAtTime(0.001,end);
        oscillator.connect(gain).connect(context.destination);
        oscillator.start(start);oscillator.stop(end);
        oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
      }
    }catch{ /* 音声非対応でも購入は継続する。 */ }
  }

  dispose(){void this.context?.close().catch(()=>{});this.context=null;}
}
