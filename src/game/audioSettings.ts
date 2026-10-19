import { create } from 'zustand';
export type MusicStatus='waiting'|'loading'|'playing'|'paused'|'muted'|'error';
export const useAudioSettings=create<{
  enabled:boolean;volume:number;status:MusicStatus;
  toggle:()=>void;setVolume:(volume:number)=>void;
}>(set=>({enabled:true,volume:0.35,status:'waiting',toggle:()=>set(s=>({enabled:!s.enabled})),
  setVolume:volume=>set({volume:Number.isFinite(volume)?Math.max(0,Math.min(1,volume)):0.35}),
}));
