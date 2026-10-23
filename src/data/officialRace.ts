import { challenger } from './challenger';
import { hinataRivals, offroadRival, type Entrant } from './rivals';
export const officialRace={name:'若葉公式ダート杯',venueId:'stadium-5',invitation:'ひなた優勝、おめでとう！ 若葉公式ダート杯への出場権を獲得したよ。街の若葉レース場で受付中だ。森野 陸、黒岩 豪、それに2人のレーサーと5台で勝負しよう。悪路用の装備と電池を整えてきてね。'};
export const officialRivals:Entrant[]=[
 {...offroadRival,equipment:{...offroadRival.equipment,terminal:'terminal-1',motor:'motor-rally',gear:'gear-4'}},
 {...challenger,equipment:{...hinataRivals[1].equipment,body:challenger.equipment.body,motor:'motor-trail',rollerSide:'roller-double'}},
 ...hinataRivals.slice(2,4),
];
