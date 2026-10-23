import { shopExit } from '../data/shop';
export interface Point { x:number;y:number }
export interface Obstacle { x:number;y:number;width:number;height:number }
export const walkBounds={left:56,right:904,top:136,bottom:582};
export function canStand(p:Point,obstacles:Obstacle[]){
  return p.x>=walkBounds.left&&p.x<=walkBounds.right&&p.y>=walkBounds.top&&p.y<=walkBounds.bottom&&!obstacles.some(r=>p.x>=r.x-11&&p.x<=r.x+r.width+11&&p.y>=r.y-14&&p.y<=r.y+r.height+3);
}
export function canTravel(a:Point,b:Point,obstacles:Obstacle[]){
  const steps=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.y-a.y)/2));
  for(let i=0;i<=steps;i++)if(!canStand({x:a.x+(b.x-a.x)*i/steps,y:a.y+(b.y-a.y)*i/steps},obstacles))return false;
  return true;
}

// 足元の衝突サイズで障害物を膨らませ、8px格子を4方向探索する。
// 棚をタップした場合は、タップ位置に最も近い到達可能な通路へ案内する。
export function findWalkingPath(start:Point,target:Point,obstacles:Obstacle[]):Point[]{
  if(!canStand(start,obstacles))return [];
  const size=8,cols=Math.floor((walkBounds.right-walkBounds.left)/size)+1,rows=Math.floor((walkBounds.bottom-walkBounds.top)/size)+1;
  const point=(id:number):Point=>({x:walkBounds.left+(id%cols)*size,y:walkBounds.top+Math.floor(id/cols)*size});
  const free=Array.from({length:cols*rows},(_,id)=>canStand(point(id),obstacles));
  const connect=(a:Point,b:Point):Point[]|null=>{
    for(const corner of [{x:b.x,y:a.y},{x:a.x,y:b.y}])if(canTravel(a,corner,obstacles)&&canTravel(corner,b,obstacles))return [corner,b];
    return null;
  };
  let first=-1,nearest=Infinity;
  for(let id=0;id<free.length;id++)if(free[id]){const p=point(id),d=(p.x-start.x)**2+(p.y-start.y)**2;if(d<nearest&&connect(start,p)){first=id;nearest=d;}}
  if(first<0)return [];
  const previous=new Int32Array(free.length).fill(-1),distance=new Int32Array(free.length);previous[first]=first;
  const queue=[first];let best=first,bestDistance=Infinity;
  for(let head=0;head<queue.length;head++){
    const id=queue[head],p=point(id),score=(p.x-target.x)**2+(p.y-target.y)**2;
    if(score<bestDistance||(score===bestDistance&&distance[id]<distance[best])){best=id;bestDistance=score;}
    const candidates=[id%cols>0?id-1:-1,id%cols<cols-1?id+1:-1,id-cols,id+cols];
    for(const next of candidates)if(next>=0&&next<free.length&&free[next]&&previous[next]===-1&&canTravel(p,point(next),obstacles)){
      previous[next]=id;distance[next]=distance[id]+1;queue.push(next);
    }
  }
  const ids=[best];while(ids.at(-1)!==first)ids.push(previous[ids.at(-1)!]);ids.reverse();
  const route=[...(connect(start,point(first))??[]),...ids.slice(1).map(point)];
  const end=connect(point(best),target);if(end)route.push(...end);
  // 同一直線上の中間点を削り、各区間を水平または垂直に保つ。
  const result:Point[]=[];let before=start;
  for(let i=0;i<route.length;i++){
    const p=route[i],next=route[i+1];
    if(p.x===before.x&&p.y===before.y)continue;
    if(next&&((before.x===p.x&&p.x===next.x)||(before.y===p.y&&p.y===next.y)))continue;
    result.push(p);before=p;
  }
  return result;
}

export function isAtShopExit(point:Point){
  return point.x>=shopExit.x&&point.x<=shopExit.x+shopExit.width&&point.y>=shopExit.y&&point.y<=shopExit.y+shopExit.height;
}
