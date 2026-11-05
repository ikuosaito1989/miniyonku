import {townSpawn,townWalkBounds,type WorldLocation} from '../data/world';
import {findWalkingPath,walkBounds,type Obstacle,type Point} from './navigation';
import {stepOpeningWalk,type OpeningWalk} from './opening';
export const KOYA_ESCORT_END=6;
export const koyaEscortActive=(step:number)=>step>0&&step<KOYA_ESCORT_END;
export const koyaEscortWalking=(step:number)=>step===1||step===3||step===4;
export const koyaEscortLocation=(step:number):WorldLocation=>step===4?'town':step>=5?'stadium-9':'wakaba';
export const koyaVenueSpot={x:440,y:535};
export const koyaEscortSpawn=(step:number):Point=>step===4?townSpawn('wakaba'):{x:480,y:535};
export const koyaEscortText=(step:number)=>step===1?'山城 昊也が、店の入口からやってきた。':step===2?'わかばでの優勝、おめでとう。僕は山城 昊也。君のコーナリング、見せてもらったよ。次は第3公式大会・星空テクニカル杯だ。僕も出場するんだ。会場まで一緒に行こう。':step===3?'昊也と一緒に、模型店の外へ。':step===4?'昊也の案内で、星空レース場へ向かう。':'ここが星空レース場だよ。連続コーナーが続く長距離戦だ。まずはピットで電池やローラーを確認しよう。準備ができたらコースへ。大会は一度きり、3位以内に入れば次の模型店への道が開ける。コースでは僕もライバルだ。いいレースにしよう！';
function walk(from:Point,route:Point[]):OpeningWalk{return {position:{...from},route,facing:'up',walkTime:0,done:route.length===0};}
export function escortWalk(from:Point,to:Point,obstacles:Obstacle[],town=false):OpeningWalk{
 const route=findWalkingPath(from,to,obstacles,town?townWalkBounds:walkBounds),last=route.at(-1);
 if(!last||Math.hypot(last.x-to.x,last.y-to.y)>1)throw new Error('昊也の案内経路を作成できません。');
 return walk(from,route);
}
// A shared path keeps the guide close even when the route turns around buildings.
export function townEscortWalks(obstacles:Obstacle[]):{player:OpeningWalk;guide:OpeningWalk}{
 const start=townSpawn('wakaba'),door=townSpawn('stadium-9'),full=escortWalk(start,{x:door.x,y:door.y-20},obstacles,true);
 const guide=stepOpeningWalk(full,40,800);
 const points=[start,...full.route];let remaining=24,cut=points.length-1;
 while(cut>0){const a=points[cut-1],b=points[cut],length=Math.hypot(b.x-a.x,b.y-a.y);if(length>=remaining){points[cut]={x:b.x+(a.x-b.x)*remaining/length,y:b.y+(a.y-b.y)*remaining/length};break;}remaining-=length;cut--;}
 return {player:walk(start,points.slice(1,cut+1)),guide};
}
