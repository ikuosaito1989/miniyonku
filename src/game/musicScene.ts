import type { GameState } from './store';
export type MusicScene='shop'|'race'|'official'|'podium'|'event';
type SceneState=Pick<GameState,'overlay'|'arrivalEvent'|'dialogueStage'|'speaker'|'officialChallengeActive'>;
const eventSpeakers=['風見怜','火野岳','黒岩豪','橘斗和','山城昊也','青葉源蔵'];
export function selectMusicScene(state:SceneState):MusicScene{
  if(state.overlay==='podium')return 'podium';
  if(state.overlay==='race')return state.officialChallengeActive?'official':'race';
  if(state.overlay==='arrival'&&state.arrivalEvent)return 'event';
  if(state.overlay==='dialogue'){
    if(state.dialogueStage!=='none')return 'event';
    const speaker=state.speaker.replace(/[\s　]/g,'');
    if(eventSpeakers.some(name=>speaker.includes(name)))return 'event';
  }
  return 'shop';
}
