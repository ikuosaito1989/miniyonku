import { parts } from '../data/parts';
import { equipmentSlots, type Equipment, type EquipmentSlot } from '../data/machine';

// 装着は所持品への参照。交換してもパーツを消費しない。
export function equipPart(equipment: Equipment, inventory: Record<string, number>, id: string, target?: EquipmentSlot): Equipment {
  const part = parts.find(p => p.id === id);
  if (!part || !(inventory[id] > 0)) return equipment;
  const slot=target??(Object.keys(equipmentSlots) as EquipmentSlot[]).find(s=>equipmentSlots[s].category===part.category);
  if(!slot||equipmentSlots[slot].category!==part.category)return equipment;
  if(part.category==='roller')return {...equipment,rollerFront:id,rollerSide:id,rollerRear:id};
  const used=Object.entries(equipment).filter(([key,value])=>key!==slot&&value===id).length;
  if(used>=inventory[id])return equipment;
  return { ...equipment, [slot]: id };
}
