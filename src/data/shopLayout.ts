import { fixtures, room } from './shop';
import type { ShopId } from './world';
export const mirroredShop=(id:ShopId)=>id==='aozora';
export function shopLayout(id:ShopId){
  return fixtures.map(source=>({source,target:mirroredShop(id)?{...source,x:room.width-source.x-source.w}:source}));
}
