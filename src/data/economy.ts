// 参加費なし。わかばの優勝2,500円を基準に、進行と難度に合わせて完走賞を設定。
export const INITIAL_MONEY = 2000;
export const RACE_PRIZES = [800,500,350,300,250] as const;
export const AOZORA_PRIZES = [1200,750,550,450,350] as const;
export const HINATA_PRIZES = [1800,1100,800,650,500] as const;
export const WAKABA_PRIZES = [2500,1500,1100,900,700] as const;
export const OFFICIAL_PRIZES = [3000,1800,1350,1050,800] as const;
export const TECHNICAL_PRIZES = [4000,2400,1800,1400,1000] as const;
export const GRANDPRIX_PRIZES=[6000,4000,2500,1800,1200] as const;
export const YUUNAGI_PRIZES=[3000,0,0,0,0] as const;
export const prizesForCircuit=(id:string)=>id==='grandprix'?GRANDPRIX_PRIZES:id==='trail'?YUUNAGI_PRIZES:id==='leaf'?RACE_PRIZES:id==='wind'?AOZORA_PRIZES:id==='sun'?HINATA_PRIZES:id==='grove'?WAKABA_PRIZES:id==='comet'?TECHNICAL_PRIZES:OFFICIAL_PRIZES;
