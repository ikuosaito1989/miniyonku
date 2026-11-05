import {pixelPen,type PixelShape} from './pixelDrawing';
import type {Facing} from './PeopleArt';
export const playerPalette={ink:'#20283e',hair:'#50372d',hairLight:'#987047',white:'#f2f4eb',whiteShade:'#9daebe',blue:'#267fc4',blueLight:'#67c5ed',blueShade:'#164877',skin:'#f0bf91',skinLight:'#ffdcab',skinShade:'#be8064'};
/** 白青のキャップ、半袖ジャージ、短パンの小学生レーサー。既存の48×64表示を維持。 */
export function playerDrawing(direction:Facing,frame=0):PixelShape[]{
 const c=playerPalette,pen=pixelPen(),r=pen.rect,p=pen.polygon;
 const side=direction==='right'||direction==='left',back=direction==='up',step=frame===1?2:frame===3?-2:0,bob=step?1:0;
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
 const drawing=pen.shapes;
 return direction==='left'?drawing.map(s=>s.kind==='rect'?{...s,x:60-s.x-s.w}:{...s,points:s.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}
