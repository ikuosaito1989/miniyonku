export const raceCamera = {
  // スタート台を正面寄りの斜め上から大きく映す。
  start: { offset: [-7,8,7] as const, height:0.85, minWidth:1.35, lookBehind:0.15 },
  running: { offset: [-7,8,7] as const, height:1.9, minWidth:1.9, lookAhead:0.12 },
  finish: { offset: [-7,7,7] as const, height:1.25, minWidth:1.65, lookBehind:0.25 },
  transitionSeconds:0.9,
};
