export const raceCamera = {
  // スタート台を正面寄りの斜め上から大きく映す。
  start: { offset: [-7,8,7] as const, height:0.85, minWidth:1.35, lookBehind:0.15 },
  running: { offset: [-7,8,7] as const, height:.85, minWidth:1.1, lookAhead:0.035 },
  finish: { offset: [-7,7,7] as const, height:1.25, minWidth:1.65, lookBehind:0.25 },
  transitionSeconds:0.9,
};
