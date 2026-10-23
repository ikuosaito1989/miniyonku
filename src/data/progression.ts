export const MAX_PART_LEVEL=10;
import { bodies } from './bodies';
// レベルは単純な速度倍率ではなく、入手段階の目安。
export const partLevels:Record<string,number>={
  'motor-trail':4,'motor-rally':4,'tire-trail':4,'tire-sand':4,'accessory-damper':4,'accessory-damper-light':4,'roller-double':4,'roller-trail':4,'chassis-trail':4,
  ...Object.fromEntries(bodies.map(body=>[body.id,body.grade])),
  'chassis-basic':1,'chassis-light':2,'chassis-low':3,
  'motor-rescue':1,'motor-stock':1,'motor-rev':2,'motor-torque':2,'motor-wind':3,'motor-apex':10,
  'gear-5':1,'gear-4':2,'gear-3.5':4,
  'battery-basic':1,'battery-recharge':1,'battery-entry':2,'battery-power':3,'battery-endurance':4,
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
  return !part.id.startsWith('body-legend-')&&part.id!=='body-entry'&&part.id!=='body-champion'&&part.id!=='accessory-none'&&part.id!=='battery-recharge'&&part.id!=='motor-rescue'&&part.level>=1&&part.level<=Math.min(MAX_PART_LEVEL,shop.maxPartLevel);
}
