// 入門店の経済設定。参加費なし、完走賞で消耗品と次の改造費を賄う。
export const INITIAL_MONEY = 2000;
export const RACE_PRIZES = [500, 300, 220, 180, 150] as const;
export const AOZORA_PRIZES = [1000, 600, 450, 350, 250] as const;
export const prizesForCircuit=(id:string)=>id==='leaf'?RACE_PRIZES:AOZORA_PRIZES;
