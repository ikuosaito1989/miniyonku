export type PixelShape={color:string;alpha:number}&(
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
    if(shape.kind==='rect')ctx.fillRect(shape.x,shape.y,shape.w,shape.h);
    else{ctx.beginPath();shape.points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
  }
  ctx.restore();
}
