import {equipmentSlots,type Equipment,type EquipmentSlot} from '../data/machine';

/** 参照ではなく、見た目を決める装備と塗色で再生成の要否を決める。 */
export function machinePreviewKey(equipment:Equipment,bodyPaint:number|null){
 return JSON.stringify([(Object.keys(equipmentSlots) as EquipmentSlot[]).map(slot=>equipment[slot]),bodyPaint]);
}
