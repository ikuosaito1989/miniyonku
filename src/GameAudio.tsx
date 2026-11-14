import { useEffect, useRef } from 'react';
import { selectMusicScene } from './game/musicScene';
import { musicTracks } from './data/music';
import { useGame } from './game/store';
import { MusicPlayer } from './game/MusicPlayer';
import { useAudioSettings } from './game/audioSettings';
import { PurchaseAudio } from './game/PurchaseAudio';

export function GameAudio(){
  useEffect(()=>{
    const purchaseAudio=new PurchaseAudio();
    const unsubscribe=useGame.subscribe((state,previous)=>{
      if(state.purchaseCount===previous.purchaseCount)return;
      const {enabled,volume}=useAudioSettings.getState();
      if(enabled)purchaseAudio.play(volume);
    });
    return()=>{unsubscribe();purchaseAudio.dispose();};
  },[]);
  const player=useRef<MusicPlayer|null>(null);
  const scene=useGame(selectMusicScene);
  useEffect(()=>{
    const music=new MusicPlayer(musicTracks,status=>useAudioSettings.setState({status}));player.current=music;
    const applySettings=()=>{const {enabled,volume}=useAudioSettings.getState();music.setSettings(enabled,volume);};
    applySettings();
    // Apply the toggle during the user gesture; a later React effect may no
    // longer be allowed to resume audio on browsers with autoplay restrictions.
    const unsubscribe=useAudioSettings.subscribe((state,previous)=>{if(state.enabled!==previous.enabled||state.volume!==previous.volume)applySettings();});
    const unlock=()=>music.unlock();
    const key=(event:KeyboardEvent)=>{if(!event.repeat)unlock();};
    const visibility=()=>music.setVisible(!document.hidden);
    window.addEventListener('pointerdown',unlock,true);window.addEventListener('pointerup',unlock,true);window.addEventListener('touchend',unlock,true);window.addEventListener('keydown',key,true);
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('focus',visibility);window.addEventListener('pageshow',visibility);visibility();
    return()=>{unsubscribe();window.removeEventListener('pointerdown',unlock,true);window.removeEventListener('pointerup',unlock,true);window.removeEventListener('touchend',unlock,true);window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('focus',visibility);window.removeEventListener('pageshow',visibility);music.dispose();player.current=null;};
  },[]);
  useEffect(()=>{
    const fallback:Record<typeof scene,typeof scene>={shop:'shop','model-shop':'model-shop',race:'race',event:musicTracks.event.ready?'event':'shop',official:musicTracks.official.ready?'official':'race',podium:musicTracks.podium.ready?'podium':musicTracks.event.ready?'event':'shop'};
    player.current?.setScene(fallback[scene]);
  },[scene]);
  return null;
}

export function AudioControls({floating=false}:{floating?:boolean}){
  const {enabled,volume,status,toggle,setVolume}=useAudioSettings();
  return <details className={`audio-controls${floating?' audio-floating':''}`} data-audio-controls>
    <summary aria-label="BGM・効果音の設定">音 {enabled?'ON':'OFF'}</summary>
    <div className="audio-panel">
      <button onClick={toggle} aria-pressed={enabled}>{enabled?'BGM・効果音を消す':'BGM・効果音を鳴らす'}</button>
      <label>音量 {Math.round(volume*100)}%<input aria-label="BGM・効果音の音量" type="range" min="0" max="100" value={Math.round(volume*100)} onChange={event=>setVolume(Number(event.target.value)/100)}/></label>
      <small role="status">{status==='error'?'BGMを再生できません。HTTPS接続・通信を確認してください。':status==='waiting'?'画面のタップで再生します':status==='loading'?'BGM読み込み中…':status==='muted'?'消音中':status==='paused'?'BGM休止中':'BGM再生中'}</small>
      <small>BGM：OpenTracks{Object.values(musicTracks).filter(track=>track.ready).map(track=><a key={track.url} href={track.source} target="_blank" rel="noreferrer">{track.title} ／ {track.author}</a>)}</small>
    </div>
  </details>;
}
