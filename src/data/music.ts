import shop from '../assets/music/shop.bgm?url';
import race from '../assets/music/race.bgm?url';
import modelShop from '../assets/music/model-shop.bgm?url';
const eventAssets=import.meta.glob<string>('../assets/music/event.bgm',{eager:true,query:'?url',import:'default'});
const event=eventAssets['../assets/music/event.bgm'];
const officialAssets=import.meta.glob<string>('../assets/music/official.bgm',{eager:true,query:'?url',import:'default'});
const official=officialAssets['../assets/music/official.bgm'];
const podiumAssets=import.meta.glob<string>('../assets/music/podium.bgm',{eager:true,query:'?url',import:'default'});
const podium=podiumAssets['../assets/music/podium.bgm'];
export const musicTracks={
  shop:{ready:true,url:shop,title:'今日の空も',author:'POLARIS PLUS',source:'https://opentracks.com/bgm/detail/23752'},
  'model-shop':{ready:true,url:modelShop,title:'カジノでエンジョイ！',author:'こばっと',source:'https://opentracks.com/bgm/detail/24020'},
  race:{ready:true,url:race,title:'Rush Recklessly',author:'FLASH☆BEAT',source:'https://opentracks.com/bgm/detail/23946/track/2'},
  event:{ready:!!event,url:event??shop,title:'解答Quizman',author:'shimtone',source:'https://opentracks.com/bgm/detail/23958'},
  official:{ready:!!official,url:official??race,title:'Thrilling Race',author:'こばっと',source:'https://opentracks.com/bgm/detail/7817'},
  podium:{ready:!!podium,url:podium??(event??shop),title:'祝福の鐘',author:'マニーラ',source:'https://opentracks.com/bgm/detail/14881'},
} as const;
export type {MusicScene} from '../game/musicScene';
