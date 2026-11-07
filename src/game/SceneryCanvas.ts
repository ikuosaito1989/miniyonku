import {materialMarks} from './PixelArtMaterials';
/** Canvasで原画を一度描き、実行時は一枚のテクスチャとして描画する。 */
export class SceneryPen{
 constructor(public c:CanvasRenderingContext2D){}
 rect(x:number,y:number,w:number,h:number,color:string){this.c.fillStyle=color;this.c.fillRect(x,y,w,h);}
 round(x:number,y:number,w:number,h:number,r:number,color:string){const cut=Math.min(3,r,w/3,h/3);this.poly([[x+cut,y],[x+w-cut,y],[x+w,y+cut],[x+w,y+h-cut],[x+w-cut,y+h],[x+cut,y+h],[x,y+h-cut],[x,y+cut]],color);}
 ellipse(x:number,y:number,rx:number,ry:number,color:string){this.c.fillStyle=color;this.c.beginPath();this.c.ellipse(x,y,rx,ry,0,0,Math.PI*2);this.c.fill();}
 line(points:number[][],color:string,width=1,close=false){this.c.strokeStyle=color;this.c.lineWidth=width;this.c.beginPath();points.forEach(([x,y],i)=>i?this.c.lineTo(x,y):this.c.moveTo(x,y));if(close)this.c.closePath();this.c.stroke();}
 poly(points:number[][],color:string){this.c.fillStyle=color;this.c.beginPath();points.forEach(([x,y],i)=>i?this.c.lineTo(x,y):this.c.moveTo(x,y));this.c.closePath();this.c.fill();}
 gradient(x:number,y:number,w:number,h:number,top:string,bottom:string){
  if(!/^#[\da-f]{6}$/i.test(top)||!/^#[\da-f]{6}$/i.test(bottom)){this.rect(x,y,w,h,top);return;}
  const steps=Math.min(12,Math.max(2,Math.ceil(h/3)));
  for(let i=0;i<steps;i++){const t=i/(steps-1),color='#'+[1,3,5].map(k=>Math.round(parseInt(top.slice(k,k+2),16)*(1-t)+parseInt(bottom.slice(k,k+2),16)*t).toString(16).padStart(2,'0')).join('');const yy=Math.round((y+i*h/steps)*2)/2;this.rect(x,yy,w,Math.max(.5,Math.ceil(h/steps*2)/2),color);}
 }
 material(x:number,y:number,w:number,h:number,kind:'wood'|'stone'|'metal'|'cloth',seed=0){materialMarks(this.c,x,y,w,h,kind,seed);}
 glow(x:number,y:number,r:number,color:string){const g=this.c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,'#ffffff00');this.c.fillStyle=g;this.c.fillRect(x-r,y-r,r*2,r*2);}
 shadow(x:number,y:number,w:number,h:number){this.round(x+5,y+7,w,h,3,'#182f3820');this.round(x+3,y+4,w,h,2,'#182f3825');this.round(x+1,y+2,w,h,1,'#182f3822');}
 checker(x:number,y:number,w:number,h:number,cell=5){for(let yy=0;yy<h;yy+=cell)for(let xx=0;xx<w;xx+=cell)this.rect(x+xx,y+yy,Math.min(cell,w-xx),Math.min(cell,h-yy),(Math.floor(xx/cell)+Math.floor(yy/cell))%2?'#e8e9df':'#283647');}
 trophy(x:number,y:number,s=1){this.poly([[x-13*s,y],[x+13*s,y],[x+8*s,y+15*s],[x,y+20*s],[x-8*s,y+15*s]],'#e1bb69');this.poly([[x-10*s,y+2*s],[x-2*s,y+2*s],[x-2*s,y+15*s],[x-6*s,y+12*s]],'#fff0ba');this.line([[x-13*s,y+2*s],[x-20*s,y+2*s],[x-19*s,y+11*s],[x-9*s,y+13*s]],'#cfab66',3*s);this.line([[x+13*s,y+2*s],[x+20*s,y+2*s],[x+19*s,y+11*s],[x+9*s,y+13*s]],'#cfab66',3*s);this.rect(x-2*s,y+19*s,4*s,9*s,'#c49d60');this.round(x-12*s,y+28*s,24*s,5*s,1,'#e8c77f');}
 wheel(x:number,y:number,r:number,color='#e1c982'){this.ellipse(x,y,r,r,'#263849');this.ellipse(x,y,r*.74,r*.74,color);this.ellipse(x,y,r*.5,r*.5,'#415564');for(let i=0;i<5;i++){const a=i*Math.PI*2/5;this.line([[x,y],[x+Math.cos(a)*r*.65,y+Math.sin(a)*r*.65]],color,1.5);}this.ellipse(x,y,r*.16,r*.16,'#edf0e3');}
 plant(x:number,y:number,s=1){this.ellipse(x+4*s,y+8*s,15*s,5*s,'#203b3a24');this.poly([[x-9*s,y],[x+9*s,y],[x+6*s,y+13*s],[x-6*s,y+13*s]],'#a67456');this.rect(x-10*s,y-2*s,20*s,4*s,'#d1aa7d');for(let i=0;i<7;i++){const a=i*2.4;const xx=x+Math.cos(a)*(5+i%2*3)*s,yy=y-(8+i%3*5)*s;this.line([[x,y],[xx,yy]],'#486c50',1.5*s);this.ellipse(xx,yy,5*s,8*s,i%2?'#638963':'#99ae78');this.line([[xx,yy+3*s],[xx,yy-4*s]],'#c6cf9733',s);}}
}
