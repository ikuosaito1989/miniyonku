import { starterShop } from './progression';
import type { Point } from '../game/navigation';

export const townShops = [
  {id:'komorebi',name:starterShop.name,x:100,y:150,width:250,height:180,color:0x427b69,owner:'小野寺 春夫'},
  {id:'aozora',name:'あおぞら模型店',x:600,y:150,width:250,height:180,color:0x527fa3,owner:'店員'},
] as const;
export type ShopId=typeof townShops[number]['id'];
export const shopById=(id:ShopId)=>townShops.find(shop=>shop.id===id)!;
export const townObstacles=townShops.map(shop=>({x:shop.x,y:shop.y,width:shop.width,height:shop.height}));
export function townDoor(id:ShopId):Point{const shop=shopById(id);return {x:shop.x+shop.width/2,y:354};}
export function townReturnPosition(id:ShopId):Point{return {...townDoor(id),y:414};}
export function shopAtEntrance(point:Point):ShopId|null{
  const shop=townShops.find(shop=>Math.abs(point.x-(shop.x+shop.width/2))<=25&&point.y>=346&&point.y<=365);
  return shop?.id??null;
}
