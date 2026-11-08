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
      const {enabled,seVolume}=useAudioSettings.getState();
      if(enabled)purchaseAudio.play(seVolume);
    });
    return()=>{unsubscribe();purchaseAudio.dispose();};
  },[]);
  const player=useRef<MusicPlayer|null>(null);
  const scene=useGame(selectMusicScene);
  const enabled=useAudioSettings(s=>s.enabled),volume=useAudioSettings(s=>s.volume),duck=useAudioSettings(s=>s.raceDuck);
  useEffect(()=>{
    const music=new MusicPlayer(musicTracks,status=>useAudioSettings.setState({status}));player.current=music;
    const unlock=()=>music.unlock();
    const key=(event:KeyboardEvent)=>{if(!event.repeat)unlock();};
    const visibility=()=>music.setVisible(!document.hidden);
    window.addEventListener('pointerdown',unlock,true);window.addEventListener('pointerup',unlock,true);window.addEventListener('touchend',unlock,true);window.addEventListener('keydown',key,true);
    document.addEventListener('visibilitychange',visibility);
    window.addEventListener('focus',visibility);window.addEventListener('pageshow',visibility);visibility();
    return()=>{window.removeEventListener('pointerdown',unlock,true);window.removeEventListener('pointerup',unlock,true);window.removeEventListener('touchend',unlock,true);window.removeEventListener('keydown',key,true);document.removeEventListener('visibilitychange',visibility);window.removeEventListener('focus',visibility);window.removeEventListener('pageshow',visibility);music.dispose();player.current=null;};
  },[]);
  useEffect(()=>{player.current?.setScene(scene==='event'&&!musicTracks.event.ready?'shop':scene);},[scene]);
  useEffect(()=>{player.current?.setSettings(enabled,volume*duck);},[enabled,volume,duck]);
  return null;
}

export function AudioControls({floating=false}:{floating?:boolean}){
  const {enabled,volume,seVolume,status,toggle,setVolume,setSeVolume}=useAudioSettings();
  return <details className={`audio-controls${floating?' audio-floating':''}`} data-audio-controls>
    <summary aria-label="BGM・効果音の設定">音 {enabled?'ON':'OFF'}</summary>
    <div className="audio-panel">
      <button onClick={toggle} aria-pressed={enabled}>{enabled?'BGM・効果音を消す':'BGM・効果音を鳴らす'}</button>
      <label>BGM {Math.round(volume*100)}%<input aria-label="BGMの音量" type="range" min="0" max="100" value={Math.round(volume*100)} onChange={event=>setVolume(Number(event.target.value)/100)}/></label>
      <label>効果音 {Math.round(seVolume*100)}%<input aria-label="効果音の音量" type="range" min="0" max="100" value={Math.round(seVolume*100)} onChange={event=>setSeVolume(Number(event.target.value)/100)}/></label>
      <small role="status">{status==='error'?'BGMを再生できません。HTTPS接続・通信を確認してください。':status==='waiting'?'画面のタップで再生します':status==='loading'?'BGM読み込み中…':status==='muted'?'消音中':status==='paused'?'BGM休止中':'BGM再生中'}</small>
      <small>BGM：OpenTracks{Object.values(musicTracks).filter(track=>track.ready).map(track=><a key={track.url} href={track.source} target="_blank" rel="noreferrer">{track.title} ／ {track.author}</a>)}</small>
    </div>
  </details>;
}
