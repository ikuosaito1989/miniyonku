import type {CharacterSpritePose} from './characterSprites';
export type PixelShape={color:string;alpha:number;sprite?:CharacterSpritePose}&(
  {kind:'rect';x:number;y:number;w:number;h:number}|{kind:'polygon';points:readonly (readonly [number,number])[]}
);
export function pixelPen(){
  const shapes:PixelShape[]=[];
  return {shapes,
    rect(x:number,y:number,w:number,h:number,color:string,alpha=1){shapes.push({kind:'rect',x,y,w,h,color,alpha});},
    polygon(points:readonly (readonly [number,number])[],color:string,alpha=1){shapes.push({kind:'polygon',points,color,alpha});},
  };
}
export function paintPixels(ctx:CanvasRenderingContext2D,shapes:readonly PixelShape[]){
  ctx.save();
  for(const shape of shapes){
    ctx.fillStyle=shape.color;ctx.globalAlpha=shape.alpha;
    if(shape.kind==='rect'){
      ctx.fillRect(shape.x,shape.y,shape.w,shape.h);
      // Half-pixel seams/edge light on broad fabric and skin shapes; preserve silhouettes.
      if(shape.w>=5&&shape.h>=7&&shape.alpha>=.9&&/^#[\da-f]{6}$/i.test(shape.color)){
        const light=[1,3,5].reduce((sum,k)=>sum+parseInt(shape.color.slice(k,k+2),16),0)/3;
        if(light>70){ctx.globalAlpha=shape.alpha*.17;ctx.fillStyle='#fff0cf';ctx.fillRect(shape.x+.5,shape.y+.5,Math.max(1,shape.w-2),.5);ctx.fillRect(shape.x+.5,shape.y+1,.5,Math.max(1,shape.h-3));ctx.globalAlpha=shape.alpha*.13;ctx.fillStyle='#1c3448';ctx.fillRect(shape.x+1,shape.y+shape.h-1,Math.max(1,shape.w-2),.5);}
      }
    }
    else{
      ctx.beginPath();shape.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();
      if(shape.points.length>=4&&shape.alpha>=.9&&/^#[\da-f]{6}$/i.test(shape.color)){
        const light=[1,3,5].reduce((sum,k)=>sum+parseInt(shape.color.slice(k,k+2),16),0)/3;
        const xs=shape.points.map(p=>p[0]),ys=shape.points.map(p=>p[1]),x=Math.min(...xs),y=Math.min(...ys),w=Math.max(...xs)-x,h=Math.max(...ys)-y;
        if(light>85&&w>=8&&h>=8){ctx.save();ctx.clip();ctx.globalAlpha=.12;ctx.fillStyle='#fff0cb';ctx.fillRect(x+.5,y+1,1.5,h-3);ctx.fillRect(x+2,y+1,w-4,.5);ctx.globalAlpha=.09;ctx.fillStyle='#1c3448';ctx.fillRect(x+w-2,y+2,1.5,h-3);ctx.fillRect(x+2,y+h-2,w-4,1);ctx.restore();}
      }
    }
  }
  ctx.restore();
}
