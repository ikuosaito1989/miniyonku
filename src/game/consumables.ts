import { parts } from '../data/parts';
import type { Equipment } from '../data/machine';
import type { UnitInventory } from './condition';
export function replaceConsumable(state:{inventory:Record<string,number>;equipment:Equipment;units:UnitInventory;selectedUnits:Record<'motor'|'battery',string>;unitSerial:number},id:string){
  const part=parts.find(p=>p.id===id)!;
  if(part.category!=='motor'&&part.category!=='battery')throw new Error('交換対象が不正です。');
  const slot=part.category,inventory={...state.inventory},units={...state.units};
  delete inventory[id];delete units[id];
  const unitSerial=state.unitSerial+1,unit={id:`unit-${unitSerial}`,seconds:0};
  inventory[id]=1;units[id]=[unit];
  return {inventory,units,unitSerial,equipment:{...state.equipment,[slot]:id},selectedUnits:{...state.selectedUnits,[slot]:unit.id}};
}
