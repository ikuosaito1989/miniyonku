import {shopLayout} from './shopLayout';
import type {ShopId} from './world';
/** コース台の右下の端。出口・本棚・作業台の通路は塞がない。 */
export function speedBoardPlacement(shop:ShopId){
 const track=shopLayout(shop).find(f=>f.target.kind==='track')!.target;
 return {x:track.x+track.w-142,y:track.y+track.h+5,w:142,h:74};
}
export function speedBoardObstacle(shop:ShopId){const p=speedBoardPlacement(shop);return {x:p.x+8,y:p.y+p.h-10,width:p.w-16,height:10};}
