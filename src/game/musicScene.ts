import type { GameState } from './store';
export type MusicScene='shop'|'race'|'event';
type SceneState=Pick<GameState,'overlay'|'arrivalEvent'|'dialogueStage'|'speaker'>;
const eventSpeakers=['風見怜','火野岳','黒岩豪','黒瀬迅','青葉源蔵'];
export function selectMusicScene(state:SceneState):MusicScene{
  if(state.overlay==='race')return 'race';
  if(state.overlay==='arrival'&&state.arrivalEvent)return 'event';
  if(state.overlay==='dialogue'){
    if(state.dialogueStage!=='none')return 'event';
    const speaker=state.speaker.replace(/[\s　]/g,'');
    if(eventSpeakers.some(name=>speaker.includes(name)))return 'event';
  }
  return 'shop';
}
