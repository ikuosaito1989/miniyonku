import { challenger } from './challenger';
import { hinataRivals, offroadRival, type Entrant } from './rivals';
export const officialRace={name:'若葉公式ダート杯',venueId:'stadium-5',invitation:'ひなた優勝、おめでとう！ 若葉公式ダート杯への出場権を獲得したよ。街の若葉レース場で受付中だ。森野 陸、黒岩 豪、それに2人のレーサーと5台で勝負しよう。第1戦は長距離の高速舗装、第2戦はダート。戦間でセッティングを組み直し、両方で1位を取ると大会優勝だよ。'};
export const officialRivals:Entrant[]=[
 {...offroadRival,equipment:{...offroadRival.equipment,terminal:'terminal-1',motor:'motor-rally',gear:'gear-4'}},
 {...challenger,equipment:{...hinataRivals[1].equipment,body:challenger.equipment.body,motor:'motor-trail',rollerSide:'roller-double'}},
 ...hinataRivals.slice(2,4),
];

export type OfficialRound='speed'|'dirt';
export const officialRounds={speed:{name:'第1戦・高速ロングレース',circuitId:'sprint' as const},dirt:{name:'第2戦・オフロードレース',circuitId:'sun' as const}};
export const officialSpeedRivals:Entrant[]=officialRivals.map(r=>({...r,equipment:{...r.equipment,body:r.id==='go'?'body-sport':'body-champion',motor:'motor-wind',gear:'gear-3.5',tire:'tire-1',chassis:'chassis-low',accessory:'accessory-support',rollerFront:'roller-0',rollerSide:'roller-0',rollerRear:'roller-0'}}));
