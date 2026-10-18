import type { Category } from './parts';

export const equipmentSlots = {
  body:{label:'ボディ',category:'body'},chassis:{label:'シャーシ',category:'chassis'},motor:{label:'モーター',category:'motor'},gear:{label:'ギア',category:'gear'},battery:{label:'電池',category:'battery'},tire:{label:'タイヤ',category:'tire'},wheel:{label:'ホイール',category:'wheel'},
  rollerFront:{label:'フロントローラー',category:'roller'},rollerSide:{label:'サイドローラー',category:'roller'},rollerRear:{label:'リヤローラー',category:'roller'},shaft:{label:'シャフト',category:'shaft'},terminal:{label:'ターミナル',category:'terminal'},accessory:{label:'その他',category:'accessory'},
} satisfies Record<string,{label:string;category:Category}>;
export type EquipmentSlot = keyof typeof equipmentSlots;
export type Equipment = Record<EquipmentSlot, string>;

// 無料で付属する入門用の一式。購入分と同じIDで管理する。
export const starterEquipment: Equipment = {
  motor: 'motor-stock', gear: 'gear-5', tire: 'tire-0',
  rollerFront:'roller-0',rollerSide:'roller-0',rollerRear:'roller-0',shaft:'shaft-0',terminal:'terminal-0',
  body:'body-stream',chassis:'chassis-basic',battery:'battery-basic',wheel:'wheel-basic',accessory:'accessory-none',
};
export function createStarterInventory(): Record<string, number> {
  const inventory:Record<string,number>={'battery-recharge':1};
  for(const id of Object.values(starterEquipment))inventory[id]=(inventory[id]??0)+1;
  return inventory;
}
