import {findWalkingPath,type Obstacle,type Point,type WalkBounds} from './navigation';
self.onmessage=(event:MessageEvent<{id:number;start:Point;target:Point;obstacles:Obstacle[];bounds:WalkBounds}>)=>{
 const {id,start,target,obstacles,bounds}=event.data;
 try{self.postMessage({id,route:findWalkingPath(start,target,obstacles,bounds)});}catch{self.postMessage({id,error:true});}
};
