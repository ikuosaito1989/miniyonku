import {story} from '../data/story';
import {townSpawn,townVenues,townBlocks,townWalkBounds,type WorldLocation,type ShopId} from '../data/world';
import {room} from '../data/shop';
import {canStand,findWalkingPath,walkBounds,type Point,type Obstacle} from './navigation';
export const openingScenes=[
 {kind:'dialogue',speaker:story.player,portrait:'player',text:'ここが、チビ四駆でにぎわう緑川町かー！ どんなマシンやレーサーに会えるんだろう。楽しみだなー！',next:'町を見渡す'},
 {kind:'dialogue',speaker:story.player,portrait:'player',text:'あ、あそこに模型店がある！ こもれび模型店……まずは、あのお店に入ってみよう。',next:'模型店へ歩く'},
 {kind:'town-walk',speaker:'',portrait:'player',text:'こもれび模型店へ、てくてく。',next:''},
 {kind:'dialogue',speaker:story.owner,portrait:'owner',text:'いらっしゃい！ この町は初めてかい？ ゆっくり見ていってね。作業台のところにいる匠くんが、マシンのことをいろいろ教えてくれるよ。',next:'作業台の方へ'},
 {kind:'shop-walk',speaker:'',portrait:'mechanic',text:'作業台の方へ歩いていく。',next:''},
 {kind:'dialogue',speaker:'佐伯 匠',portrait:'mechanic',text:'はじめまして！ 僕は匠。湊くんもチビ四駆を始めるんだね。最初は分からないことがあって当たり前。僕でよかったら、何でも聞いてよ！',next:'よろしく、匠くん！'},
 {kind:'dialogue',speaker:'佐伯 匠',portrait:'mechanic',text:'まずは今のマシンで走ってみよう。模型店のコースなら、参加費はかからないし、完走するだけでも賞金がもらえるよ。いきなり一番を目指さなくても大丈夫！',next:'走って覚えていこう'},
 {kind:'dialogue',speaker:'佐伯 匠',portrait:'mechanic',text:'パーツの交換は、この作業台でできるよ。街や店内の何もない場所をダブルタップしても、セッティング画面を開けるんだ。速いモーターだけじゃなく、ギア、タイヤ、ローラーの組み合わせが大事なんだ。買い足したいときは、カウンターの店主さんに声をかけてね。',next:'作業台とカウンターだね'},
 {kind:'dialogue',speaker:'佐伯 匠',portrait:'mechanic',text:'電池の残量とモーターの消耗は、パーツの上のメーターで確認できるよ。このあと一緒にセッティングを見て、ギアを買って装着して、レースまでやってみよう！ 困ったときは、いつでも僕に声をかけてね。',next:'マシンを見てみる'},
] as const;
export const OPENING_END=openingScenes.length;
export type OpeningTour={step:number;location:WorldLocation;lastShop:ShopId;townReturnVenue:'stadium-5'|'stadium-9'|'stadium-10'|'stadium-7'|null};
export type OpeningState={openingStep:number;openingTour:OpeningTour|null};
export const openingIndex=(state:OpeningState)=>state.openingTour?.step??state.openingStep;
export const openingIsWalk=(step:number)=>openingScenes[step]?.kind==='town-walk'||openingScenes[step]?.kind==='shop-walk';
export const openingLocation=(step:number)=>step<=2?'town' as const:'komorebi' as const;
const townObstacles:Obstacle[]=[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h}));
export function openingDoor(){const p=townSpawn('komorebi');return {x:p.x,y:p.y-24};}
export function openingTownStart(){
 const door=openingDoor();
 for(const [dx,dy] of [[140,130],[-140,130],[160,80],[0,180]]){
  const start={x:door.x+dx,y:door.y+dy};
  if(canStand(start,townObstacles,townWalkBounds)){const path=findWalkingPath(start,door,townObstacles,townWalkBounds);if(path.at(-1)&&Math.hypot(path.at(-1)!.x-door.x,path.at(-1)!.y-door.y)<1)return start;}
 }
 return townSpawn('komorebi');
}
export const openingMentorSpot={x:548,y:285};
export function openingSpawn(step:number){return step<=2?openingTownStart():step<=4?{...room.spawn}:{...openingMentorSpot};}
export interface OpeningWalk {position:Point;route:Point[];facing:'up'|'down'|'left'|'right';walkTime:number;done:boolean}
export function createOpeningWalk(step:number,from:Point,obstacles:Obstacle[]):OpeningWalk{
 const goal=step===2?openingDoor():openingMentorSpot,bounds=step===2?townWalkBounds:walkBounds;
 const route=findWalkingPath(from,goal,obstacles,bounds),last=route.at(-1);
 if(!last||Math.hypot(last.x-goal.x,last.y-goal.y)>1)throw new Error('はじまりのシーンの歩行経路を作成できません。');
 return {position:{...from},route,facing:'up',walkTime:0,done:false};
}
export function stepOpeningWalk(walk:OpeningWalk,delta:number):OpeningWalk{
 if(walk.done)return walk;
 const position={...walk.position},route=[...walk.route];let budget=110*Math.max(0,Math.min(delta,40))/1000,facing=walk.facing,moved=false;
 while(route.length&&budget>0){const point=route[0],dx=point.x-position.x,dy=point.y-position.y,distance=Math.hypot(dx,dy);if(distance<.001){route.shift();continue;}const travel=Math.min(budget,distance);facing=Math.abs(dx)>.01?dx<0?'left':'right':dy<0?'up':'down';position.x+=dx/distance*travel;position.y+=dy/distance*travel;budget-=travel;moved=true;if(travel>=distance)route.shift();}
 return {position,route,facing,walkTime:walk.walkTime+(moved?Math.max(0,Math.min(delta,40)):0),done:route.length===0};
}
