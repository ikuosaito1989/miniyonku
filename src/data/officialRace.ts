import { challenger } from './challenger';
import { hinataRivals, offroadRival, type Entrant } from './rivals';
export const officialRace={name:'若葉公式ダート杯',venueId:'stadium-5',briefing:'若葉公式ダート杯の受付です。左が第1戦・高速舗装、右が第2戦・ダートのコースです。戦間は左のピットでマシンを組み直せます。森野 陸・黒岩 豪・2人のレーサーと対戦し、総合3位以内でわかば模型店、総合優勝で第3公式大会の出場権を獲得できます。一度限りの2戦です。',invitation:'ひなた優勝、おめでとう！ 若葉公式ダート杯への出場権を獲得したよ。街の若葉レース場へ入って、会場の受付と2つのコースを調べてね。森野 陸、黒岩 豪、それに2人のレーサーと5台で勝負しよう。第1戦は長距離の高速舗装、第2戦はダート。戦間でセッティングを組み直し、2戦の得点で総合順位が決まり、3位以内で次の模型店、優勝で第3公式大会の出場権がもらえる。一度限りの勝負だよ。'};
export const officialRivals:Entrant[]=[
 {...offroadRival,equipment:{...offroadRival.equipment,terminal:'terminal-1',motor:'motor-rally',gear:'gear-4'}},
 {...challenger,equipment:{...hinataRivals[1].equipment,body:challenger.equipment.body,motor:'motor-trail',rollerSide:'roller-double'}},
 ...hinataRivals.slice(2,4),
];

export type OfficialRound='speed'|'dirt'|'technical'|'final';
export const officialRounds={final:{name:'第4公式大会・緑川グランプリ',circuitId:'grandprix' as const},technical:{name:'第3公式大会・星空テクニカル杯',circuitId:'comet' as const},speed:{name:'第1戦・高速ロングレース',circuitId:'sprint' as const},dirt:{name:'第2戦・オフロードレース',circuitId:'sun' as const}};
export const officialSpeedRivals:Entrant[]=officialRivals.map(r=>({...r,equipment:{...r.equipment,body:r.id==='go'?'body-sport':'body-champion',motor:'motor-wind',gear:'gear-3.5',tire:'tire-1',chassis:'chassis-low',accessory:'accessory-support',rollerFront:'roller-0',rollerSide:'roller-0',rollerRear:'roller-0'}}));

export const technicalRivals:Entrant[]=officialRivals.map(r=>({...r,equipment:{...r.equipment,body:r.id==='go'?'body-sport':'body-champion',motor:'motor-torque',gear:'gear-4',tire:'tire-1',chassis:'chassis-low',accessory:'accessory-weight',accessory2:'accessory-support',accessory3:'accessory-none',rollerFront:'roller-1',rollerSide:'roller-0',rollerRear:'roller-1',wheel:'wheel-light',battery:'battery-endurance'}}));

// わかばの常連は販売中の上位パーツを使い、慣らしと長距離用電池も整えている。
export const wakabaRivals:Entrant[]=technicalRivals.map((r,i)=>({...r,motorSeconds:60,equipment:{...r.equipment,body:i===1?'body-sedan':'body-arrow',motor:'motor-turn',chassis:'chassis-turn',tire:'tire-turn',wheel:'wheel-diff',rollerFront:'roller-turn',rollerSide:'roller-turn',rollerRear:'roller-turn',accessory:'accessory-stabilizer',accessory2:'accessory-support',accessory3:'accessory-damper-light',battery:'battery-endurance'}}));

export const seniorEquipment={...wakabaRivals[0].equipment,body:'body-proto',motor:'motor-surge',tire:'tire-landing',wheel:'wheel-floating',rollerFront:'roller-ceramic',rollerSide:'roller-ceramic',rollerRear:'roller-lowdouble',shaft:'shaft-1',terminal:'terminal-1',accessory:'accessory-stabilizer',accessory2:'accessory-support',accessory3:'accessory-slide-rear'};
export const senior:Entrant={id:'jin',name:'黒瀬 迅',lane:0,color:0x612b3e,motorSeconds:60,equipment:seniorEquipment};
export const grandprixRivals:Entrant[]=[senior,
 {...challenger,motorSeconds:60,equipment:{...seniorEquipment,body:'body-sport',motor:'motor-surge',wheel:'wheel-floating',rollerFront:'roller-2',rollerSide:'roller-2',rollerRear:'roller-2'}},
 ...wakabaRivals.filter(r=>r.id==='sou'||r.id==='ren').map(r=>({...r,motorSeconds:60,equipment:{...r.equipment,body:'body-sedan',motor:'motor-rally',accessory3:'accessory-damper-light'}})),
];
