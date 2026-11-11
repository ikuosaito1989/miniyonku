import {withCharacterSprite} from './characterSprites';
import {personDrawing,type Facing} from './PeopleArt';
import {pixelPen,type PixelShape} from './pixelDrawing';
export type LegendPerson='rei'|'gaku'|'towa'|'koya';
const palettes={
 rei:{shirt:'#42679f',light:'#9bbfe9',shade:'#29456f',hair:'#53243e',highlight:'#96536b'},
 gaku:{shirt:'#c49b3d',light:'#f3d98a',shade:'#8b6529',hair:'#6e3029',highlight:'#b25e4e'},
 towa:{shirt:'#34313f',light:'#a68487',shade:'#1d1d2b',hair:'#24202f',highlight:'#575066'},
 koya:{shirt:'#75828e',light:'#dce4e9',shade:'#424e5b',hair:'#252c34',highlight:'#687380'},
};
/** レジェンドは共通の服の原画に、各人専用の頭部・輪郭・目元を組み合わせる。 */
function legendPersonDrawingFallback(id:LegendPerson,direction:Facing,frame=0):PixelShape[]{
 const facing=direction==='left'?'right':direction,c=palettes[id],bob=frame===1||frame===3?1:0;
 const colors:Record<string,string>={'#b14b67':c.shirt,'#ec9aa2':c.light,'#7f3757':c.shade};
 const body=personDrawing('rival',facing,frame).filter(shape=>(shape.kind==='rect'?shape.y:Math.min(...shape.points.map(([,y])=>y)))>=35).map(shape=>({...shape,color:colors[shape.color]??shape.color}));
 const pen=pixelPen(),ink='#222737',skin='#f3c5a0',shadow='#c89078',light='#ffe2ba';
 const p=(points:number[][],color:string)=>pen.polygon(points.map(([x,y])=>[x,y+bob] as const),color);
 const r=(x:number,y:number,w:number,h:number,color:string)=>pen.rect(x,y+bob,w,h,color);
 r(26,33,9,7,shadow);r(28,34,5,4,skin);
 if(facing==='up'){
  const bottom=id==='towa'?48:36;
  p([[19,7],[25,3],[36,3],[43,8],[46,17],[44,bottom-4],[38,bottom],[21,bottom],[15,bottom-5],[14,16]],ink);
  p([[20,8],[27,5],[35,5],[41,9],[43,17],[41,bottom-4],[36,bottom-2],[23,bottom-2],[18,bottom-6],[17,17]],c.hair);
  r(21,10,16,2,c.highlight);if(id==='koya')r(18,8,23,7,c.hair);if(id==='gaku')for(let i=0;i<4;i++)p([[17+i*7,11],[19+i*7,3],[24+i*7,10]],c.hair);
 }else if(facing==='right'){
  p([[23,11],[36,10],[43,16],[44,23],[49,26],[48,29],[42,30],[41,35],[35,39],[24,35],[20,25]],ink);
  p([[25,13],[35,12],[41,17],[42,24],[47,26],[46,28],[40,29],[39,34],[34,36],[26,33],[23,25]],skin);r(29,15,9,2,light);
  p(id==='koya'?[[20,10],[23,6],[37,6],[43,11],[43,17],[39,16],[38,13],[25,13],[25,26],[21,27]]:id==='gaku'?[[18,12],[20,4],[27,8],[30,2],[34,8],[39,5],[44,12],[43,17],[35,14],[29,15],[25,22],[21,24]]:id==='towa'?[[19,9],[28,3],[38,5],[45,12],[43,21],[39,16],[35,15],[30,23],[28,43],[21,47],[17,34]]:[[19,10],[27,4],[37,5],[44,12],[41,19],[36,15],[32,20],[27,27],[22,30],[17,24]],c.hair);
  r(22,10,12,2,c.highlight);
  const eyeHeight=id==='gaku'?6:2;r(36,22,5,eyeHeight,'#fff2dd');r(38,22,2,eyeHeight,id==='gaku'?'#8c511e':id==='towa'?'#713044':id==='rei'?'#45617a':'#3d614a');
  if(id==='towa')p([[35,21],[42,18],[42,20],[35,23]],ink);else r(35,19,7,id==='gaku'?2:1,ink);
  r(39,32,id==='gaku'?6:4,id==='gaku'?3:1,'#825057');if(id==='gaku')r(40,32,4,1,'#fff5dc');
  if(id==='koya'){r(34,21,9,1,ink);r(34,21,1,8,ink);r(42,21,1,8,ink);r(34,28,9,1,ink);r(25,23,9,1,ink);}
 }else{
  const outline=id==='gaku'?[[19,9],[30,7],[41,10],[46,20],[45,31],[39,38],[23,38],[15,31],[13,21]]:id==='koya'?[[18,10],[40,10],[46,18],[45,33],[39,39],[22,39],[15,33],[14,20]]:id==='towa'?[[20,9],[31,6],[41,11],[45,21],[41,30],[31,40],[20,32],[16,21]]:[[21,9],[31,7],[40,12],[43,21],[40,31],[32,39],[23,33],[18,23]];
  p(outline,ink);p(outline.map(([x,y])=>[30+(x-30)*.86,22+(y-22)*.9]),shadow);p(outline.map(([x,y])=>[30+(x-30)*.76,21+(y-22)*.8]),skin);r(23,15,13,2,light);
  if(id==='towa'){
   p([[16,21],[17,10],[24,4],[31,3],[40,7],[46,16],[45,38],[40,47],[37,45],[40,28],[38,17],[33,12],[30,15],[27,12],[22,18],[21,30],[24,43],[18,47],[14,34]],c.hair);
   r(20,13,2,14,c.highlight);r(40,17,2,18,c.highlight);
  }else if(id==='rei'){
   p([[16,24],[15,14],[20,7],[29,3],[39,5],[45,13],[43,21],[38,15],[34,11],[31,17],[26,23],[22,26],[21,18],[18,29]],c.hair);
   p([[18,16],[23,8],[31,6],[36,8],[28,12],[24,20]],c.highlight);
  }else if(id==='gaku'){
   p([[15,20],[14,12],[20,13],[18,5],[25,9],[28,2],[32,9],[38,4],[40,11],[46,10],[45,21],[41,17],[35,15],[30,17],[24,14],[19,18]],c.hair);r(23,9,12,2,c.highlight);
  }else{
   p([[15,22],[15,12],[19,7],[40,7],[45,12],[45,23],[41,22],[40,15],[20,15],[19,23]],c.hair);r(20,9,19,3,c.highlight);
  }
  for(const x of [21,34]){
   if(id==='gaku'){r(x-1,23,7,7,'#fff4dc');r(x+1,23,4,6,'#a36524');r(x+2,24,2,5,ink);r(x+1,23,1,2,'#fffdf0');r(x-1,20,7,2,ink);}
   else if(id==='towa'){p([[x-1,25],[x+6,22],[x+5,25],[x+1,27]],'#f6ead5');r(x+2,24,2,2,'#79283f');p([[x-1,21],[x+6,19],[x+6,20],[x-1,23]],ink);}
   else{r(x,24,5,2,'#fff2df');r(x+2,24,2,2,id==='rei'?'#48687f':'#405f49');r(x,21,6,1,ink);}
  }
  if(id==='gaku'){r(25,32,12,4,'#7d3b47');r(26,32,10,1,'#fff3da');r(28,35,5,1,'#e5998b');}
  else{r(id==='koya'?25:28,34,id==='koya'?12:6,1,'#8b535c');r(29,29,id==='koya'?4:2,2,'#c48d76');}
  if(id==='koya'){
   for(const x of [19,33]){r(x,22,10,1,ink);r(x,22,1,8,ink);r(x+9,22,1,8,ink);r(x,29,10,1,ink);}r(29,25,4,1,ink);
  }
 }
 const drawing=[...body,...pen.shapes];
 return direction==='left'?drawing.map(shape=>shape.kind==='rect'?{...shape,x:60-shape.x-shape.w}:{...shape,points:shape.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}

export function legendPersonDrawing(id:LegendPerson,direction:Facing,frame=0):PixelShape[]{
 return withCharacterSprite(legendPersonDrawingFallback(id,direction,frame),id,direction,frame);
}
