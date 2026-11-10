import {shopLayout} from './shopLayout';
import type {ShopId} from './world';
/** コース台の右下の端。出口・本棚・作業台の通路は塞がない。 */
export function timeBoardPlacement(shop:ShopId){
 const track=shopLayout(shop).find(f=>f.target.kind==='track')!.target;
 return {x:track.x+track.w-116,y:track.y+track.h+5,w:116,h:64};
}
export function timeBoardObstacle(shop:ShopId){const p=timeBoardPlacement(shop);return {x:p.x+8,y:p.y+p.h-10,width:p.w-16,height:10};}

export function officialTimeBoards(location:string){
 const courses=location==='stadium-5'?['sprint','sun'] as const:location==='stadium-9'?['comet'] as const:location==='stadium-10'?['grandprix'] as const:location==='stadium-7'?['zenith'] as const:[];
 return courses.map((circuitId,index)=>({circuitId,x:index===0?90:730,y:465,w:130,h:64}));
}

// 耐久コースの南東には住宅があるため、看板と会話用の通路を南西側へ寄せる。
export function outdoorTimeBoardPlacement(v:{id?:string;x:number;y:number;w:number;h:number}){return {x:v.id==='park-endurance'?v.x+8:v.x+v.w-54,y:v.y+v.h+7,w:76,h:44};}
