import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import {paintPixels,type PixelShape} from './pixelDrawing';

/** High-resolution material rendering shared by every direction and character. */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
  const scale=8,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  const ctx=texture.context;ctx.scale(scale,scale);ctx.lineJoin='round';ctx.lineCap='round';
  // Extrude the complete silhouette down and right to create an actual visible side face.
  const mask=document.createElement('canvas');mask.width=texture.width;mask.height=texture.height;
  const maskCtx=mask.getContext('2d')!;maskCtx.scale(scale,scale);paintPixels(maskCtx,drawing);
  maskCtx.globalCompositeOperation='source-in';maskCtx.fillStyle='#182235';maskCtx.fillRect(0,0,personSpriteSize.width,personSpriteSize.height);
  ctx.setTransform(1,0,0,1,0,0);ctx.drawImage(mask,scale*1.35,scale*1.8);ctx.setTransform(scale,0,0,scale,0,0);
  // Warm contact shade below the feet, over the extruded side face.
  const contact=ctx.createRadialGradient(30,77,2,30,77,17);contact.addColorStop(0,'#17223566');contact.addColorStop(1,'#17223500');
  ctx.fillStyle=contact;ctx.fillRect(10,69,40,11);
  // Material planes get a clear top-left highlight and a shaded lower-right edge.
  for(const shape of drawing)paint(ctx,shape,0,0,shape.color,shape.alpha,true);
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function paint(ctx:CanvasRenderingContext2D,shape:PixelShape,dx:number,dy:number,color:string,alpha:number,volume:boolean){
  const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]] as const:shape.points;
  const xs=points.map(([x])=>x),ys=points.map(([,y])=>y),x=Math.min(...xs)+dx,y=Math.min(...ys)+dy;
  const w=Math.max(.1,Math.max(...xs)-Math.min(...xs)),h=Math.max(.1,Math.max(...ys)-Math.min(...ys));
  const gradient=volume?ctx.createLinearGradient(x,y,x+w*.78,y+h):null;
  if(gradient){gradient.addColorStop(0,lighten(color,.3));gradient.addColorStop(.3,lighten(color,.12));gradient.addColorStop(.67,color);gradient.addColorStop(1,darken(color,.24));}
  ctx.globalAlpha=alpha;ctx.fillStyle=gradient??color;
  if(shape.kind==='rect'){
    ctx.beginPath();ctx.roundRect(shape.x+dx,shape.y+dy,shape.w,shape.h,Math.min(.4,shape.w/6,shape.h/6));ctx.fill();
    if(volume&&shape.w>=5&&shape.h>=6){
      ctx.globalAlpha=alpha*.35;ctx.strokeStyle=lighten(color,.55);ctx.lineWidth=.22;
      ctx.beginPath();ctx.moveTo(shape.x+dx+.35,shape.y+dy+shape.h-.5);ctx.lineTo(shape.x+dx+.35,shape.y+dy+.35);ctx.lineTo(shape.x+dx+shape.w-.5,shape.y+dy+.35);ctx.stroke();
      // Fine cloth grain follows large sleeves, aprons and trouser panels.
      if(shape.h>=10&&shape.w>=7){ctx.globalAlpha=alpha*.11;ctx.strokeStyle=lighten(color,.7);ctx.lineWidth=.18;for(let yy=shape.y+dy+3;yy<shape.y+dy+shape.h-1;yy+=3){ctx.beginPath();ctx.moveTo(shape.x+dx+1,yy);ctx.lineTo(shape.x+dx+shape.w-1,yy+.35);ctx.stroke();}}
    }
  }else{
    ctx.beginPath();shape.points.forEach(([px,py],i)=>i?ctx.lineTo(px+dx,py+dy):ctx.moveTo(px+dx,py+dy));ctx.closePath();ctx.fill();
    if(volume&&w>5&&h>6){ctx.globalAlpha=alpha*.28;ctx.strokeStyle=lighten(color,.55);ctx.lineWidth=.2;ctx.stroke();}
  }
}

function channels(color:string){
  const hex=color.match(/^#([\da-f]{6})$/i)?.[1];
  if(hex)return [0,2,4].map(i=>parseInt(hex.slice(i,i+2),16));
  const rgb=color.match(/[\da-f]{2}/gi)?.map(v=>parseInt(v,16));return rgb?.slice(0,3)??[120,120,120];
}
function tint(color:string,target:number[],amount:number){return `rgb(${channels(color).map((v,i)=>Math.round(v*(1-amount)+target[i]*amount)).join(' ')})`;}
function lighten(color:string,amount:number){return tint(color,[255,239,207],amount);}
function darken(color:string,amount:number){return tint(color,[24,35,53],amount);}
