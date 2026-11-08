/** Small, deterministic material marks: never randomise an existing save's scenery. */
export function artNoise(x:number,y:number,seed=0){let n=(Math.imul(x+97+seed,374761393)^Math.imul(y+31,668265263))>>>0;n=Math.imul(n^(n>>>13),1274126177);return(n^(n>>>16))>>>0;}
export function materialMarks(c:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,kind:'wood'|'stone'|'metal'|'cloth',seed=0){
 c.save();c.beginPath();c.rect(x,y,w,h);c.clip();
 const r=(xx:number,yy:number,ww:number,hh:number,color:string)=>{c.fillStyle=color;c.fillRect(Math.round(xx*2)/2,Math.round(yy*2)/2,ww,hh);};
 const cell=kind==='stone'?9:kind==='wood'?8:12;
 for(let yy=0;yy<h;yy+=cell)for(let xx=0;xx<w;xx+=cell){const n=artNoise(xx,yy,seed);if(n%3===0)continue;const px=x+xx+n%5,py=y+yy+(n>>>4)%6;
  if(kind==='wood'){r(px,py,3+n%9,.5,'#fff0cd20');r(px+2,py+1,2+n%5,.5,'#29363a1c');if(n%11===0){r(px,py+2,2,1,'#36403930');r(px+2,py+1,3,.5,'#f3dbb428');}}
  else if(kind==='stone'){r(px,py,2,1,'#f2e6c52c');r(px+1,py+1,1,1,'#293b4120');if(n%7===0)r(px+3,py+3,3,.5,'#273b3d24');}
  else if(kind==='metal'){r(px,py,2+n%7,.5,'#edfff024');if(n%13===0)r(px+2,py+2,.5,2,'#20354125');}
  else if(n%2===0){r(px,py,1,.5,'#f6e7c220');r(px+1,py+1,.5,1,'#1e344524');}
 }
 c.restore();
}
/** An outlined, clustered crown rather than a stack of rectangular blocks. */
export function paintPixelTree(c:CanvasRenderingContext2D,variant:number){
 const r=(x:number,y:number,w:number,h:number,color:string)=>{c.fillStyle=color;c.fillRect(x,y,w,h);};
 const oval=(x:number,y:number,rx:number,ry:number,color:string)=>{for(let yy=-ry;yy<=ry;yy+=2){const half=Math.floor(Math.sqrt(Math.max(0,1-yy*yy/(ry*ry)))*rx/2)*2;r(x-half,y+yy,half*2+2,2,color);}};
 oval(54,108,33,8,'#203b3528');oval(49,106,24,5,'#203b3525');
 r(42,62,13,44,'#354039');r(45,65,7,40,'#705c43');r(45,67,2,35,'#ad9160');r(51,73,2,30,'#4f4b37');
 for(let i=0;i<9;i++){const y=72+i*4;r(47+i%2,y,3,.5,'#c0a271');r(51,y+1,2,1,'#3d4436');}
 r(37,104,13,3,'#4c523b');r(52,104,10,3,'#4c523b');r(39,103,7,1,'#a19561');
 const lobes=[[34,32,23,20],[58,28,22,19],[22,48,18,18],[47,48,28,24],[70,48,18,20],[33,66,21,18],[59,66,22,19]];
 for(const [i,[x,y,rx,ry]] of lobes.entries()){
  oval(x,y,rx+1,ry+1,'#2d4940');oval(x-1,y-2,rx,ry-1,['#4c7150','#557e52','#608654'][variant%3]);
  oval(x+3,y+5,rx*.75,ry*.58,'#3d6247');oval(x-5,y-6,rx*.72,ry*.65,'#76985e');oval(x-8,y-9,rx*.42,ry*.37,'#9eb477');
  for(let k=0;k<5;k++){const n=artNoise(i,k,variant+29),lx=x-rx/2+n%Math.max(2,rx),ly=y-ry/2+(n>>>5)%Math.max(2,ry);r(lx,ly,3,1,'#c2cc922e');r(lx+2,ly+2,2,1,'#304c3d3d');}
  for(let j=0;j<48;j++){const n=artNoise(i*53+j,variant,17),px=x-rx+3+n%Math.max(1,rx*2-6),py=y-ry+3+(n>>>8)%Math.max(1,ry*2-6);if((px-x)**2/(rx*rx)+(py-y)**2/(ry*ry)>.85)continue;
   const light=py<y-2&&px<x+6;r(px,py,2+n%3,1,light?'#b1c188':'#36593f');r(px+1,py+1,2,1,light?'#89a56c':'#66875a');
  }
 }
 for(let i=0;i<9;i++){const n=artNoise(i,variant);r(23+n%46,88+n%5,2,1,'#87945f');}
}
