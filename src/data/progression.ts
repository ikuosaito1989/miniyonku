export const MAX_PART_LEVEL=10;
// レベルは単純な速度倍率ではなく、入手段階の目安。
export const partLevels:Record<string,number>={
  'body-stream':1,'body-entry':2,'body-arrow':4,'body-manta':3,
  'chassis-basic':1,'chassis-light':2,'chassis-low':3,
  'motor-stock':1,'motor-rev':2,'motor-torque':2,'motor-apex':10,
  'gear-5':1,'gear-4':2,'gear-3.5':4,
  'battery-basic':1,'battery-entry':2,'battery-power':3,'battery-endurance':4,
  'tire-0':1,'tire-1':2,'tire-2':2,
  'wheel-basic':1,'wheel-light':2,'wheel-oneway':5,
  'roller-0':1,'roller-1':2,'roller-2':5,
  'shaft-0':1,'shaft-entry':2,'shaft-1':3,
  'terminal-0':1,'terminal-entry':2,'terminal-1':4,
  'accessory-none':1,'accessory-weight':2,'accessory-support':3,
};
export interface ShopStock { name:string; maxPartLevel:number }
export const starterShop:ShopStock={name:'こもれび模型店',maxPartLevel:2};
export function isStocked(part:{id:string;level:number},shop:ShopStock=starterShop){
  return part.id!=='accessory-none'&&part.level>=1&&part.level<=Math.min(MAX_PART_LEVEL,shop.maxPartLevel);
}
