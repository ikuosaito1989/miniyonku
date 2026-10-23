import { starterEquipment } from './machine';
import type { Entrant } from './rivals';
export const challenger:Entrant={
  id:'go',name:'黒岩 豪',lane:0,color:0x59365f,motorSeconds:60,
  equipment:{...starterEquipment,body:'body-sport',motor:'motor-wind',gear:'gear-4',chassis:'chassis-low',battery:'battery-power',tire:'tire-1',wheel:'wheel-light',shaft:'shaft-1',terminal:'terminal-entry',accessory:'accessory-support'},
};
export const challengerSpot={x:465,y:430};
export const challengerInvitation='ふん、お前がここの優勝者か。俺は黒岩 豪。この店で勝ったくらいで、いい気になるなよ。これが俺からの挑戦状だ！ 俺のアイアンバイソンと勝負しろ！ 1位になれたら、ひなた模型店への紹介状をやる。口だけじゃないところを見せてみろよ。';
