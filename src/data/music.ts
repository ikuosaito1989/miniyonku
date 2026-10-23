import shop from '../assets/music/shop.bgm?url';
import race from '../assets/music/race.bgm?url';
const eventAssets=import.meta.glob<string>('../assets/music/event.bgm',{eager:true,query:'?url',import:'default'});
const event=eventAssets['../assets/music/event.bgm'];
export const musicTracks={
  shop:{ready:true,url:shop,title:'今日の空も',author:'POLARIS PLUS',source:'https://opentracks.com/bgm/detail/23752'},
  race:{ready:true,url:race,title:'Rush Recklessly',author:'FLASH☆BEAT',source:'https://opentracks.com/bgm/detail/23946/track/2'},
  event:{ready:!!event,url:event??shop,title:'解答Quizman',author:'shimtone',source:'https://opentracks.com/bgm/detail/23958'},
} as const;
export type {MusicScene} from '../game/musicScene';
