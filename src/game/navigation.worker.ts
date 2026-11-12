import {findWalkingPath,type Obstacle,type Point,type WalkBounds} from './navigation';
let previousSignature='';
let previousObstacles:Obstacle[]=[];
self.onmessage=(event:MessageEvent<{id:number;start:Point;target:Point;obstacles:Obstacle[];bounds:WalkBounds}>)=>{
 const {id,start,target,obstacles,bounds}=event.data;
 try{
  // Preserve the obstacle array identity so navigation's grid and edge cache
  // can be reused, but invalidate it whenever the geometry changes.
  const signature=JSON.stringify(obstacles);
  if(signature!==previousSignature){previousSignature=signature;previousObstacles=obstacles;}
  self.postMessage({id,route:findWalkingPath(start,target,previousObstacles,bounds)});
 }catch{self.postMessage({id,error:true});}
};
