import {shopLayout} from './shopLayout';
import type {ShopId} from './world';
/** コース台の右下の端。出口・本棚・作業台の通路は塞がない。 */
export function timeBoardPlacement(shop:ShopId){
 const track=shopLayout(shop).find(f=>f.target.kind==='track')!.target;
 return {x:track.x+track.w-142,y:track.y+track.h+5,w:142,h:74};
}
export function timeBoardObstacle(shop:ShopId){const p=timeBoardPlacement(shop);return {x:p.x+8,y:p.y+p.h-10,width:p.w-16,height:10};}

export function officialTimeBoards(location:string){
 const courses=location==='stadium-5'?['sprint','sun'] as const:location==='stadium-9'?['comet'] as const:location==='stadium-10'?['grandprix'] as const:location==='stadium-7'?['zenith'] as const:[];
 return courses.map((circuitId,index)=>({circuitId,x:index===0?90:730,y:465,w:130,h:64}));
}
