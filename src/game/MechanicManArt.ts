import {npcDrawing} from './NpcPeopleArt';
import {pixelPen,type PixelShape} from './pixelDrawing';
import type {Facing} from './PeopleArt';
/** 共通の職人の体格・解像度。紺の作業服、青い帽子、大きな保護ゴーグル。 */
export function mechanicManDrawing(direction:Facing='down',frame=0):PixelShape[]{
 const facing=direction==='left'?'right':direction;
 const colors:Record<string,string>={'#d5b35c':'#315d78','#d4d5c6':'#91a7b9','#4b5363':'#1e354e','#b89a72':'#284c67','#e0c59b':'#8ca4b2','#927d66':'#173b54','#ead3ac':'#b9ccd1','#c1a888':'#7896a8'};
 const base=npcDrawing('starter',facing,frame).map(s=>({...s,color:colors[s.color]??s.color}));
 const pen=pixelPen(),bob=frame===1||frame===3?1:0;
 if(facing!=='up'){
  pen.rect(28,7+bob,5,1,'#e6bf63');pen.rect(27,7+bob,1,3,'#e6bf63');pen.rect(32,6+bob,2,2,'#e6bf63');
  for(const x of facing==='right'?[34]:[19,33]){
   pen.rect(x-1,20+bob,10,10,'#1c293d');pen.rect(x,21+bob,8,8,'#bdc7bd');pen.rect(x+1,22+bob,6,6,'#254761');pen.rect(x+2,22+bob,2,4,'#a6d4de');pen.rect(x+4,26+bob,2,1,'#5b91ab');
  }
  pen.rect(facing==='right'?29:28,24+bob,facing==='right'?6:5,2,'#b8c6bd');
  pen.polygon([[24,32+bob],[28,34+bob],[34,34+bob],[39,31+bob],[37,37+bob],[30,39+bob],[25,36+bob]],'#686871');
  pen.rect(28,33+bob,7,1,'#e2c7a1');pen.rect(23,48+bob,12,8,'#183a57');pen.rect(25,49+bob,3,5,'#a6bcc3');
 }
 const shapes=[...base,...pen.shapes];return direction==='left'?shapes.map(s=>s.kind==='rect'?{...s,x:60-s.x-s.w}:{...s,points:s.points.map(([x,y])=>[60-x,y] as const)}):shapes;
}
