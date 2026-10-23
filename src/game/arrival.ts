import { canStand,findWalkingPath,type Obstacle,type Point } from './navigation';
export type ArrivalKind='legend'|'villain';
export interface ArrivalActor {position:Point;route:Point[];facing:'up'|'down'|'left'|'right';walkTime:number;distance:number;arrived:boolean}
export const arrivalSpeed=95,contactDistance=38;
// 主人公の周囲の通行可能な接触位置まで、家具と来店客を避けて歩く。
export function createArrival(player:Point,obstacles:Obstacle[],count:number):ArrivalActor[]{
  const starts=[480,440,520,360,600,280,680,200,760,120,840].map(x=>({x,y:550}));
  const goals=[[-24,0],[24,0],[0,28],[0,-24],[-24,16],[24,16],[-24,-16],[24,-16]].map(([x,y])=>({x:player.x+x,y:player.y+y}));
  const used:Point[]=[],spawned:Point[]=[];
  return Array.from({length:count},()=>{
    for(const start of starts.filter(p=>canStand(p,obstacles)&&Math.hypot(p.x-player.x,p.y-player.y)>=90&&!spawned.some(s=>Math.hypot(p.x-s.x,p.y-s.y)<28))){
      for(const goal of goals.filter(p=>canStand(p,obstacles)&&!used.some(g=>Math.hypot(p.x-g.x,p.y-g.y)<25))){
        const route=findWalkingPath(start,goal,obstacles),end=route.at(-1);
        if(end&&Math.hypot(end.x-goal.x,end.y-goal.y)<1){
          used.push(goal);spawned.push(start);
          return {position:{...start},route,facing:'up' as const,walkTime:0,distance:0,arrived:false};
        }
      }
    }
    // 狭い通路では最も近い到達可能地点を接触位置にする。
    for(const start of starts.filter(p=>canStand(p,obstacles))){
      const route=findWalkingPath(start,player,obstacles),end=route.at(-1);
      if(end&&Math.hypot(end.x-player.x,end.y-player.y)<=contactDistance){
        const prefix:Point[]=[];let previous=start;
        for(const target of route){
          const steps=Math.max(1,Math.ceil(Math.hypot(target.x-previous.x,target.y-previous.y)));
          for(let step=1;step<=steps;step++){
            const point={x:previous.x+(target.x-previous.x)*step/steps,y:previous.y+(target.y-previous.y)*step/steps};
            if(Math.hypot(point.x-player.x,point.y-player.y)<=contactDistance&&(Math.abs(point.x-player.x)>=24||Math.abs(point.y-player.y)>=28)){
              return {position:{...start},route:[...prefix,point],facing:'up' as const,walkTime:0,distance:0,arrived:false};
            }
          }
          prefix.push(target);previous=target;
        }
      }
    }
    throw new Error('登場キャラクターが主人公に到達できません。');
  });
}
export function stepArrivalActor(actor:ArrivalActor,player:Point,delta:number):ArrivalActor{
  if(actor.arrived)return actor;
  const position={...actor.position},route=[...actor.route];let facing=actor.facing,budget=arrivalSpeed*Math.max(0,Math.min(delta,40))/1000,distance=0;
  while(route.length&&budget>0){
    const target=route[0],dx=target.x-position.x,dy=target.y-position.y;
    const remaining=Math.hypot(dx,dy),travel=Math.min(budget,remaining);
    if(remaining<.001){route.shift();continue;}
    facing=dx?dx<0?'left':'right':dy<0?'up':'down';
    position.x+=dx/remaining*travel;position.y+=dy/remaining*travel;distance+=travel;budget-=travel;
    if(travel>=remaining)route.shift();
  }
  return {...actor,position,route,facing,walkTime:actor.walkTime+(distance?delta:0),distance:actor.distance+distance,arrived:route.length===0&&Math.hypot(position.x-player.x,position.y-player.y)<=contactDistance};
}
