import type { Category } from './parts';

export type Equipment = Record<Category, string>;

// 無料で付属する入門用の一式。購入分と同じIDで管理する。
export const starterEquipment: Equipment = {
  motor: 'motor-stock', gear: 'gear-5', tire: 'tire-0',
  roller: 'roller-0', shaft: 'shaft-0', terminal: 'terminal-0',
};
export function createStarterInventory(): Record<string, number> {
  return Object.fromEntries(Object.values(starterEquipment).map(id => [id, 1]));
}
