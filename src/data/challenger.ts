import { starterEquipment } from './machine';
import type { Entrant } from './rivals';
export const challenger:Entrant={
  id:'riku',name:'影山 陸',lane:0,color:0x59365f,motorSeconds:60,
  equipment:{...starterEquipment,body:'body-sport',motor:'motor-wind',gear:'gear-4',chassis:'chassis-low',battery:'battery-power',tire:'tire-1',wheel:'wheel-light',shaft:'shaft-1',terminal:'terminal-entry',accessory:'accessory-support'},
};
export const challengerSpot={x:465,y:430};
export const challengerInvitation='ふん、お前がここの優勝者か。俺は影山 陸。この町の速さは俺が決める。俺のダスクファングと勝負しろ！ 1位になれたら、ひなた模型店への紹介状をやる。口だけじゃないところを見せてみろよ。';
