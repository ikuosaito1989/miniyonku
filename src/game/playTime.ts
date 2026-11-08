/** Visible, active time only; background tabs do not accumulate play time. */
export function formatPlayTime(seconds:number){const total=Math.max(0,Math.floor(seconds));return `${Math.floor(total/3600)}時間 ${String(Math.floor(total/60)%60).padStart(2,'0')}分`;}
