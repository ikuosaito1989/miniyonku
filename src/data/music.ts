import shop from '../assets/music/shop.bgm?url';
import race from '../assets/music/race.bgm?url';
export const musicTracks={
  shop:{url:shop,title:'今日の空も',author:'POLARIS PLUS',source:'https://opentracks.com/bgm/detail/23752'},
  race:{url:race,title:'Rush Recklessly',author:'FLASH☆BEAT',source:'https://opentracks.com/bgm/detail/23946/track/2'},
} as const;
export type MusicScene=keyof typeof musicTracks;
