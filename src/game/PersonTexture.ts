import Phaser from 'phaser';
import { personSpriteSize } from './PeopleArt';
import type { PixelShape } from './pixelDrawing';

/** Render each existing character drawing as a softly shaded, high-density sprite. */
export function createPersonTexture(scene:Phaser.Scene,key:string,drawing:readonly PixelShape[]){
  if(scene.textures.exists(key))return;
  const scale=6,texture=scene.textures.createCanvas(key,personSpriteSize.width*scale,personSpriteSize.height*scale)!;
  const ctx=texture.context;
  ctx.scale(scale,scale);ctx.lineJoin='round';ctx.lineCap='round';
  // A small painted contact shadow gives shoes and lower clothing a grounded edge.
  for(const shape of drawing)paintShape(ctx,shape,.65,1.05,'#172333',.16,false);
  // Preserve original silhouettes, but shade each hair, skin and fabric plane.
  for(const shape of drawing)paintShape(ctx,shape,0,0,shape.color,shape.alpha,true);
  texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
}

function paintShape(ctx:CanvasRenderingContext2D,shape:PixelShape,dx:number,dy:number,color:string,alpha:number,volume:boolean){
  const points=shape.kind==='rect'?[[shape.x,shape.y],[shape.x+shape.w,shape.y+shape.h]] as const:shape.points;
  const xs=points.map(([x])=>x),ys=points.map(([,y])=>y),left=Math.min(...xs)+dx,top=Math.min(...ys)+dy;
  const width=Math.max(.1,Math.max(...xs)-Math.min(...xs)),height=Math.max(.1,Math.max(...ys)-Math.min(...ys));
  const fill=volume?ctx.createLinearGradient(left,top,left+width*.72,top+height):null;
  if(fill){fill.addColorStop(0,blend(color,'#fff0cc',.22));fill.addColorStop(.36,color);fill.addColorStop(1,blend(color,'#162439',.24));}
  ctx.fillStyle=fill??color;ctx.globalAlpha=alpha;
  if(shape.kind==='rect'){
    ctx.beginPath();ctx.roundRect(shape.x+dx,shape.y+dy,shape.w,shape.h,Math.min(.55,shape.w/5,shape.h/5));ctx.fill();
    if(volume&&shape.w>3&&shape.h>3){ctx.globalAlpha=alpha*.38;ctx.strokeStyle=blend(color,'#fff1d4',.55);ctx.lineWidth=.24;ctx.beginPath();ctx.moveTo(shape.x+dx+.35,shape.y+dy+shape.h-.45);ctx.lineTo(shape.x+dx+.35,shape.y+dy+.45);ctx.lineTo(shape.x+dx+shape.w-.45,shape.y+dy+.45);ctx.stroke();}
  }else{
    ctx.beginPath();shape.points.forEach(([x,y],i)=>i?ctx.lineTo(x+dx,y+dy):ctx.moveTo(x+dx,y+dy));ctx.closePath();ctx.fill();
    if(volume&&width>4&&height>4){ctx.globalAlpha=alpha*.34;ctx.strokeStyle=blend(color,'#fff1d4',.42);ctx.lineWidth=.2;ctx.stroke();}
  }
}

function blend(color:string,tint:string,amount:number){
  const parse=(value:string)=>{
    const match=value.match(/^#([\da-f]{6})$/i);
    if(match)return [0,2,4].map(i=>parseInt(match[1].slice(i,i+2),16));
    const rgb=value.match(/[\da-f]{2}/gi)?.map(part=>parseInt(part,16));return rgb?.slice(0,3)??[100,100,100];
  };
  const from=parse(color),to=parse(tint);
  return `rgb(${from.map((value,index)=>Math.round(value*(1-amount)+to[index]*amount)).join(' ')})`;
}
