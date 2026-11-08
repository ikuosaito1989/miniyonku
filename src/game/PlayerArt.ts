import {pixelPen,type PixelShape} from './pixelDrawing';
import type {Facing} from './PeopleArt';
export const playerPalette={ink:'#354653',hair:'#50372d',hairLight:'#987047',white:'#f2f4eb',whiteShade:'#9daebe',blue:'#267fc4',blueLight:'#67c5ed',blueShade:'#164877',skin:'#f0bf91',skinLight:'#ffdcab',skinShade:'#be8064'};
/** 白青のキャップ、半袖ジャージ、短パンの小学生レーサー。既存の48×64表示を維持。 */
export function playerDrawing(direction:Facing,frame=0):PixelShape[]{
 const c=playerPalette,pen=pixelPen(),r=pen.rect,p=pen.polygon;
 const side=direction==='right'||direction==='left',back=direction==='up',step=frame===1?2.5:frame===3?-2.5:0,bob=step?.5:0;
 for(let leg=0;leg<2;leg++){
  const x=side?25+leg*5:21+leg*11,offset=leg?step:-step;
  p([[x,54],[x+7,54],[x+7,69+offset],[x+9,74+offset],[x+8,77+offset],[x-2,77+offset],[x-2,73+offset],[x,68+offset]],c.ink);
  r(x+1,57,5,11+offset,leg&&side?c.skinShade:c.skin);r(x+1,60,1,6,c.skinLight);
  r(x,67+offset,6,6,c.white);r(x,69+offset,6,1,c.blue);r(x+1,67+offset,4,1,'#ffffff');
  p([[x,72+offset],[x+5,72+offset],[x+8,75+offset],[x+8,76+offset],[x-1,76+offset]],c.blueShade);
  r(x+1,73+offset,4,2,c.blueLight);r(x,76+offset,8,1,c.white);r(x+2,73+offset,3,.5,'#ffffff');
 }
 p([[22,30+bob],[37,30+bob],[42,37+bob],[40,53],[36,57],[22,57],[18,51],[18,38+bob]],c.ink);
 p([[23,32+bob],[36,32+bob],[39,38+bob],[37,51],[22,51],[20,39+bob]],c.white);
 p([[35,34+bob],[39,39+bob],[37,51],[33,51]],c.whiteShade);
 p([[21,34+bob],[24,32+bob],[23,48],[21,49],[20,39+bob]],'#ffffff');
 r(side?26:21,49,side?12:17,3,c.blueShade);
 p([[21,52],[38,52],[38,61],[32,61],[30,55],[28,61],[20,61]],c.blueShade);
 r(22,53,6,6,c.blue);r(32,53,4,6,c.blue);r(22,59,5,1,c.blueLight);r(33,59,3,1,c.blueLight);
 if(!back){
  p([[25,31+bob],[30,35+bob],[34,31+bob],[33,29+bob],[27,29+bob]],c.skinShade);
  p([[25,32+bob],[30,36+bob],[35,32+bob],[34,36+bob],[30,39+bob],[25,36+bob]],c.blueShade);
  r(30,37+bob,1,11,c.blue);r(33,41+bob,4,3,c.blue);r(34,41+bob,2,1,c.blueLight);
 }else{r(24,33+bob,12,2,c.blueShade);r(27,39+bob,6,6,c.blue);r(28,40+bob,4,1,c.white);r(28,42+bob,3,1,c.white);}
 for(let arm=0;arm<(side?1:2);arm++){
  const x=side?36:arm?38:15,swing=arm?-step:step;
  p([[x+1,34+bob],[x+6,37+bob],[x+6,44+swing],[x+5,54+swing],[x+2,57+swing],[x,55+swing],[x,42+swing]],c.ink);
  p([[x+1,36+bob],[x+5,38+bob],[x+5,43+swing],[x+1,43+swing]],c.white);
  r(x+1,42+swing,4,2,c.blue);r(x+1,44+swing,4,10,c.skinShade);r(x+1,45+swing,3,8,c.skin);r(x+1,46+swing,1,5,c.skinLight);r(x+2,54+swing,2,1,c.skinLight);
 }
 // 首と髪。顔を小さくし、帽子から不揃いの前髪を出す。
 r(27,27+bob,7,6,c.skinShade);r(28,28+bob,4,4,c.skin);
 p([[20,9+bob],[25,5+bob],[35,5+bob],[40,10+bob],[42,21+bob],[39,29+bob],[34,32+bob],[24,31+bob],[19,27+bob],[18,18+bob]],c.ink);
 if(back){
  p([[21,13+bob],[39,13+bob],[40,23+bob],[36,30+bob],[24,30+bob],[20,25+bob]],c.hair);
  r(23,25+bob,3,3,c.hairLight);r(29,27+bob,3,2,c.hairLight);r(35,24+bob,2,4,c.hairLight);
 }else if(side){
  p([[29,13+bob],[38,13+bob],[41,18+bob],[41,22+bob],[45,23+bob],[44,26+bob],[40,27+bob],[37,30+bob],[30,30+bob],[26,26+bob]],c.skinShade);
  p([[30,15+bob],[37,15+bob],[39,19+bob],[39,23+bob],[43,24+bob],[39,26+bob],[36,29+bob],[31,28+bob],[28,24+bob]],c.skin);
  r(31,16+bob,6,1,c.skinLight);r(36,19+bob,4,1,c.ink);r(36,21+bob,4,5,c.white);r(38,21+bob,2,5,c.ink);r(38,21+bob,1,1,'#ffffff');r(38,28+bob,3,1,'#87584e');
  p([[20,12+bob],[37,12+bob],[39,16+bob],[34,15+bob],[32,19+bob],[29,16+bob],[27,24+bob],[24,28+bob],[21,25+bob]],c.hair);
  r(25,16+bob,2,5,c.hairLight);r(28,13+bob,3,2,c.hairLight);r(27,24+bob,3,4,c.skinShade);
 }else{
  p([[22,13+bob],[36,13+bob],[40,20+bob],[39,26+bob],[35,30+bob],[29,32+bob],[23,29+bob],[20,24+bob]],c.skinShade);
  p([[23,14+bob],[35,14+bob],[38,20+bob],[37,26+bob],[33,29+bob],[29,30+bob],[24,27+bob],[22,23+bob]],c.skin);
  r(24,16+bob,10,1,c.skinLight);
  for(const x of [24,33]){r(x,19+bob,4,1,c.hair);r(x,21+bob,4,5,c.white);r(x+1,21+bob,2,5,c.ink);r(x+1,21+bob,1,1,'#ffffff');}
  r(29,25+bob,2,2,c.skinShade);r(28,28+bob,5,1,'#85564c');r(30,29+bob,3,.5,c.skinLight);
  p([[20,12+bob],[39,12+bob],[39,17+bob],[35,15+bob],[33,19+bob],[29,15+bob],[26,19+bob],[24,16+bob],[21,22+bob]],c.hair);
  r(23,14+bob,2,2,c.hairLight);r(29,14+bob,2,1,c.hairLight);
 }
 // 白いスポーツキャップ。青いパネルと独自の小さなウイングマーク。
 p([[19,12+bob],[20,6+bob],[25,3+bob],[34,3+bob],[39,6+bob],[41,13+bob]],c.ink);
 p([[21,11+bob],[22,7+bob],[26,5+bob],[33,5+bob],[37,7+bob],[39,11+bob]],c.whiteShade);
 p([[22,10+bob],[24,6+bob],[29,4+bob],[33,5+bob],[32,10+bob]],c.white);
 r(side?32:28,5+bob,side?5:6,6,c.blueShade);r(side?33:29,6+bob,3,3,c.blue);
 if(!back){p(side?[[33,8+bob],[37,7+bob],[35,10+bob]]:[[29,7+bob],[33,7+bob],[31,10+bob]],'#f0ca51');}
 p(side?[[23,11+bob],[43,11+bob],[47,14+bob],[41,16+bob],[25,14+bob]]:[[18,11+bob],[39,11+bob],[42,13+bob],[36,15+bob],[20,14+bob]],c.blueShade);
 r(side?29:22,12+bob,side?13:14,1,c.blueLight);
 // モブ・レジェンドと同じ半ドット単位の髪、瞳、布、靴の仕上げ。
 const ry=(x:number,y:number,w:number,h:number,color:string,alpha=1)=>r(x,y+bob,w,h,color,alpha);
 const py=(points:readonly (readonly [number,number])[],color:string)=>p(points.map(([x,y])=>[x,y+bob] as const),color);
 py([[23,7],[26,5.5],[28,5],[27,6.5],[24,8]],'#ffffff');
 py([[35,6.5],[37,8],[38,10],[36.5,9.5],[35.5,8]],'#7b8fa9');
 for(let i=0;i<5;i++)ry((side?29:22)+i*2.2,12,.8,.5,'#c4e5ec');
 ry(side?34:30,6,.5,3,'#478bbf');ry(side?35:31,7,1,.5,'#88b8dc');
 if(back){
  for(const [x,y] of [[23,17],[28,20],[34,16],[36,24],[25,25]]){py([[x,y],[x+1,y-2],[x+1.5,y+3],[x+.5,y+4]],'#73513a');ry(x,y+3,.5,2,'#392e2a');}
  ry(24,30,3,.5,'#b28658');ry(34,29,2,.5,'#b28658');
  ry(26,36,9,.5,'#c9d9e1');ry(25,38,.5,8,'#c9d6dc');ry(36,39,.5,8,'#6c859e');
  py([[24,44],[27,46],[29,47],[23,46]],'#c4d2dc');
 }else{
  const locks=side?[[24,16],[28,15],[32,14]]:[[23,16],[28,15],[34,16]];
  for(const [x,y] of locks){py([[x,y],[x+1.5,y-1],[x+1,y+2.5],[x,y+4]],'#ad8054');ry(x+.5,y,1,.5,'#c09b6a');ry(x-.5,y+2,.5,2,'#362b2b');}
  if(side){
   ry(36,20,3,.5,'#b87960');ry(38,23,1,2,'#82522f');ry(38,21,.7,.8,'#fff7dd');ry(40,26,1,.5,'#e8a98a');ry(34,29,3,.5,'#ffd7a4');
   py([[28,24],[29,23],[30,24],[29,26],[28,26]],'#d69874');ry(28.5,24,1,.5,'#f6c79d');
  }else{
   for(const x of [24,33]){ry(x,20,4,.5,'#c18a67');ry(x+1,23,2,2,'#7f512e');ry(x+1,21,.8,1,'#fff9de');ry(x+2,25,1,.5,'#b38751');ry(x-.5,26,3,.5,'#de9d7c');}
   ry(29,24,.7,1,'#ffe4b6');ry(30,26,.8,.5,'#af755f');ry(28,28,4,.5,'#f8ddae');ry(23,27,2,.5,'#e6a384');ry(35,27,2,.5,'#e6a384');
  }
  ry(27,32,1.5,.5,'#ffd8aa');ry(31,34,1,.5,'#122f59');
  py([[22,37],[24,36],[25,39],[23,44],[22,43]],'#ffffff');
  py([[35,38],[37,40],[36,48],[34,49],[35,44]],'#8199b0');
  py([[24,46],[28,47],[29,48],[23,48]],'#c2d1db');ry(26,41,.5,3,'#d3dfe4');
 }
 for(const x of side?[37]:[16,39]){ry(x,38,2,.5,'#ffffff');ry(x,41,2,.5,'#a7bdcd');ry(x+1,45,.7,5,'#ffd7a7');ry(x+2,50,.7,2,'#d99b78');}
 for(let leg=0;leg<2;leg++){
  const x=side?25+leg*5:21+leg*11,offset=leg?step:-step;
  r(x+4,62,1,4+offset,'#d49b73');r(x+1,65+offset,2,.5,'#ffd9aa');r(x+2,66+offset,2,.5,'#bc8667');
  r(x+4,68+offset,1,4,'#a9bbcb');r(x+1,70+offset,3,.5,'#d9e8e9');r(x+1,72+offset,3,.5,'#8bc6de');
  for(let lace=0;lace<3;lace++)r(x+2+lace*.7,73.5+offset+lace*.5,2,.5,'#edf2e9');
  r(x+1,75.5+offset,5,.5,'#78a8be');r(x,77+offset,7,.5,'#b6c4ce');
 }
 // 共通の60×80原画の中で、モブと同じ頭身・横幅・半ドット格子へ揃える。
 const dot=(n:number)=>Math.round(n*2)/2;
 const yAt=(y:number)=>y<=3?y:y<=32?3+(y-3)*36/29:39+(y-32)*41/48;
 const headScale=side?1.4:1.5;
 const xAt=(x:number,y:number)=>30+(x-30)*(y<=30?headScale:y>=40?1.15:headScale-(y-30)*(headScale-1.15)/10);
 const drawing:PixelShape[]=pen.shapes.map(shape=>{
  if(shape.kind==='polygon')return {...shape,points:shape.points.map(([x,y])=>[dot(xAt(x,y)),dot(yAt(y))] as const)};
  const x=dot(xAt(shape.x,shape.y+shape.h/2)),y=dot(yAt(shape.y));
  return {...shape,x,y,w:Math.max(.5,dot(xAt(shape.x+shape.w,shape.y+shape.h/2))-x),h:Math.max(.5,dot(yAt(shape.y+shape.h))-y)};
 });
 return direction==='left'?drawing.map(s=>s.kind==='rect'?{...s,x:60-s.x-s.w}:{...s,points:s.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}
