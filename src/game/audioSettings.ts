import { create } from 'zustand';
export type MusicStatus='waiting'|'loading'|'playing'|'paused'|'muted'|'error';
export const useAudioSettings=create<{
  enabled:boolean;volume:number;seVolume:number;raceDuck:number;status:MusicStatus;
  toggle:()=>void;setVolume:(volume:number)=>void;setSeVolume:(volume:number)=>void;setRaceDuck:(value:number)=>void;
}>(set=>({enabled:true,volume:0.35,seVolume:0.35,raceDuck:1,status:'waiting',toggle:()=>set(s=>({enabled:!s.enabled})),
  setVolume:volume=>set({volume:Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):0.35}),
  setSeVolume:seVolume=>set({seVolume:Number.isFinite(seVolume)?Math.max(0,Math.min(1,seVolume)):0.35}),
  setRaceDuck:raceDuck=>set({raceDuck:Number.isFinite(raceDuck)?Math.max(0,Math.min(1,raceDuck)):1}),
}));
