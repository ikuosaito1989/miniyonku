import {withCharacterSprite} from './characterSprites';
import {npcAppearances,type NpcAppearanceId,type NpcAppearance} from '../data/npcAppearance';
import {personDrawing,type Facing} from './PeopleArt';
import {pixelPen,type PixelShape} from './pixelDrawing';
/** 名前で固定された別々の輪郭・眼・髪型。方向と歩行が変わっても同じ人物を保つ。 */
function npcDrawingFallback(id:NpcAppearanceId,direction:Facing,frame=0):PixelShape[]{
 const a:NpcAppearance=npcAppearances[id],facing=direction==='left'?'right':direction,bob=frame===1||frame===3?.5:0;
 const original=a.kind==='owner'?['#607ca0','#b0c8de','#415674']:a.kind==='guide'?['#9c568c','#e6a6c5','#693f73']:a.kind==='mechanic'?['#317d91','#9bd3cc','#24536f']:['#b14b67','#ec9aa2','#7f3757'];
 const colors:Record<string,string>={[original[0]]:a.shirt,[original[1]]:a.light,[original[2]]:a.shade};
 const body=personDrawing(a.kind,facing,frame).filter(s=>(s.kind==='rect'?s.y:Math.min(...s.points.map(([,y])=>y)))>=35).map(s=>({...s,color:colors[s.color]??s.color}));
 const pen=pixelPen(),ink='#42505a',shadow='#ba8575',skin=a.skin;
 const r=(x:number,y:number,w:number,h:number,c:string)=>pen.rect(x,y+bob,w,h,c);
 const p=(points:number[][],c:string)=>pen.polygon(points.map(([x,y])=>[x,y+bob] as const),c);
 r(26,33,9,7,shadow);r(28,34,5,4,skin);
 if(facing==='up'){
  p([[30-a.width,12],[20,4],[37,4],[30+a.width,12],[30+a.width,29],[30+a.jaw,37],[30-a.jaw,37],[30-a.width,29]],a.hair);
  r(22,9,17,3,a.highlight);r(22,32,16,2,a.hair);
 }else{
  const side=facing==='right',cx=side?33:30,w=side?a.width*.84:a.width;
  const outline=[[cx-w,13],[cx-w*.6,7],[cx+w*.55,7],[cx+w,15],[cx+w,29],[cx+a.jaw*.65,36],[cx,39],[cx-a.jaw*.8,35],[cx-w,28]];
  p(outline,ink);p(outline.map(([x,y])=>[cx+(x-cx)*.91,23+(y-23)*.91]),shadow);p(outline.map(([x,y])=>[cx+(x-cx)*.82,22+(y-23)*.82]),skin);
  r(cx-w*.55,15,w,2,'#ffe0b0');
  if(a.haircut==='bald'){p([[13,15],[16,7],[23,5],[21,12],[19,17],[17,29],[13,26]],a.hair);p([[38,6],[45,11],[47,27],[43,31],[41,17]],a.hair);r(27,8,8,1,'#bf9077');}
  else if(a.haircut==='spiky'||a.haircut==='crop'||a.haircut==='curls'){
   for(let i=0;i<6;i++){const x=13+i*6;p([[x,17],[x+1,4+i%2*3],[x+5,9],[x+7,5],[x+8,17]],a.hair);}r(18,12,25,5,a.hair);r(22,10,14,2,a.highlight);
  }else if(a.haircut==='slick'){p([[14,20],[15,8],[24,3],[38,4],[46,12],[45,24],[41,17],[37,12],[25,11],[20,17]],a.hair);for(let i=0;i<3;i++)p([[19+i*7,12],[25+i*5,6],[27+i*5,6],[21+i*7,13]],a.highlight);}
  else if(a.haircut==='wave'){p([[12,20],[12,11],[17,7],[20,2],[28,6],[34,2],[43,6],[47,15],[43,22],[37,16],[32,18],[28,13],[24,20],[18,17],[16,29]],a.hair);r(19,9,17,2,a.highlight);}
  else if(a.haircut==='fringe'){p([[14,29],[13,13],[19,5],[32,2],[43,7],[47,18],[41,16],[36,12],[30,23],[24,32],[24,16],[20,19],[19,34]],a.hair);p([[18,24],[20,9],[27,5],[23,25]],a.highlight);}
  else if(a.haircut==='bob'||a.haircut==='braids'||a.haircut==='ponytail'){
   p([[12,29],[13,10],[21,3],[36,3],[45,11],[46,33],[40,38],[39,17],[33,12],[28,18],[23,13],[19,23],[20,35],[15,37]],a.hair);r(20,8,15,2,a.highlight);
   if(a.haircut==='braids')for(const x of [12,43])for(let i=0;i<4;i++){p([[x,25+i*4],[x+4,23+i*4],[x+6,29+i*4],[x+2,31+i*4]],i%2?a.highlight:a.hair);r(x+1,40,4,2,'#d0a098');}
   if(a.haircut==='ponytail')p([[38,9],[44,7],[50,16],[51,37],[47,48],[43,43],[44,26],[42,17]],a.hair);
  }else if(a.haircut==='beard'){
   p([[13,28],[12,13],[19,4],[35,3],[45,11],[47,28],[41,19],[39,13],[21,16],[18,27]],a.hair);p([[16,29],[25,33],[30,31],[35,33],[44,28],[42,39],[35,46],[28,48],[20,41]],a.hair);r(22,39,15,2,a.highlight);
  }else{p([[13,25],[12,12],[20,5],[34,2],[44,9],[47,19],[40,16],[35,10],[30,20],[26,15],[21,26],[18,33]],a.hair);p([[17,17],[22,8],[33,5],[26,12],[21,21]],a.highlight);}
  const eyes=side?[36]:[21,34];
  for(const x of eyes){
   if(a.eyes==='smile')p([[x-1,25],[x+1,22],[x+4,22],[x+6,25],[x+4,24],[x+1,24]],ink);
   else {const eh=a.eyes==='round'?6:a.eyes==='sleepy'?2:3;p([[x,22],[x+5,21],[x+6,24+eh],[x+1,24+eh]],'#fff1d8');r(x+2,23,3,eh,a.hair);r(x+2,23,1,1,'#fff4dc');if(a.eyes==='sharp')p([[x-1,20],[x+6,18],[x+6,20],[x,23]],ink);else r(x,20,6,a.eyes==='round'?1:2,a.hair);}
   if(a.glasses){p([[x-2,21],[x+7,21],[x+8,28],[x+6,30],[x-2,29],[x-3,24],[x-2,21]],'#b8c6b8');p([[x-1,22],[x+6,22],[x+6,28],[x-1,28],[x-1,22]],'#353c4c');r(x,23,5,4,skin);r(x+2,23,2,3,ink);}
  }
  if(a.glasses)r(side?27:28,24,side?8:5,1,ink);
  if(a.freckles)for(const x of [19,24,37,41])r(x,30,1,1,'#b77465');
  r(side?43:29,28,2,3,shadow);
  if(a.eyes==='round'||a.eyes==='smile'){p([[side?36:26,33],[side?43:35,33],[side?41:33,37],[side?38:28,37]],'#85515a');r(side?37:27,33,5,1,'#fff1dc');}else r(side?39:28,34,5,1,'#8c5a5c');
  if(id==='akatsukiOwner')p([[26,31],[29,29],[32,31],[35,29],[39,31],[36,33],[29,32]],a.hair);
 }
 if(a.haircut==='cap'){
  const color=id==='sou'?'#e4e8db':id==='starter'?'#354f70':'#e0c382';p([[16,14],[19,5],[27,2],[36,4],[42,13]],color);p([[13,14],[43,12],[48,16],[38,18],[16,16]],color);r(20,8,17,1,'#fff0c8');
 }
 // 左上からの光を全住人で揃え、髪の束と服の縫い目を半ドットで描く。
 // 帽子・髪型・顔の輪郭を塗り替えず、方向と歩行の上下動に追従する。
 if(facing==='up'){
  for(const [x,y] of [[20,17],[25,13],[31,15],[37,18]]){
   r(x,y,1,6,a.highlight);r(x+1,y+5,.5,2,a.hair);
  }
 }else{
  for(const [x,y] of (facing==='right'?[[20,15],[25,12],[30,10]]:[[18,16],[23,12],[29,10],[35,13]])){
   r(x,y,1.5,.5,a.highlight);r(x+1,y+1,.5,2,a.highlight);
  }
  if(!a.glasses){
   const eyeXs=facing==='right'?[36]:[21,34];
   for(const x of eyeXs){r(x+2,23,1,.5,'#fff9e7');r(x+1,28,2,.5,'#d49c83');}
  }
  r(facing==='right'?38:26,34,3,.5,'#edc0a0');
 }
 // 束の根元に影、先端に短い反射を置き、髪を面ではなく房で読む。
 if(a.haircut!=='bald'&&a.haircut!=='cap'){
  const locks=facing==='up'?[[22,12],[28,10],[34,12],[39,17]]:facing==='right'?[[19,12],[24,9],[30,8]]:[[18,12],[23,8],[29,7],[35,9]];
  for(const [x,y] of locks){
   p([[x,y],[x+2,y-1],[x+3,y+3],[x+2,y+6],[x+1,y+3]],a.highlight);
   r(x+3,y+2,.5,4,ink);r(x+.5,y,1,.5,'#e6cfaa');
  }
 }
 if(facing!=='up'){
  // 瞳の下部と頬の反射で、小さい表示でも目線を読みやすくする。
  if(!a.glasses&&a.eyes!=='smile')for(const x of facing==='right'?[36]:[21,34]){
   r(x+2,24,2,2,ink);r(x+2,23,1,1,'#fff9ed');
   if(a.eyes==='round')r(x+2,27,2,1,a.highlight);
  }
  r(facing==='right'?40:19,29,2,1,'#edb39a');
  if(facing!=='right')r(38,29,2,1,'#edb39a');
 }
 // 襟・前立て・ポケット・裾の折り返しを同じ服色の明暗で描く。
 p([[24,38],[28,40],[30,43],[27,42]],a.light);
 r(30,43,1,10,a.shade);r(29,44,.5,8,a.light);
 r(33,44,4,.5,a.shade);r(33,45,.5,3,a.light);
 for(const y of [44,48,52])r(30,y,.5,.5,'#e8e1ca');
 r(23,55,5,.5,a.shade);r(33,55,4,.5,a.light);
 // Fine fabric seams sit below the portrait and move with the torso.
 for(const [x,y,w] of [[22,44,3],[34,47,3],[24,54,4]]){
  r(x,y,w,.5,a.light);r(x+1,y+1,1,.5,a.shade);
 }
 const shapes=[...body,...pen.shapes];return direction==='left'?shapes.map(s=>s.kind==='rect'?{...s,x:60-s.x-s.w}:{...s,points:s.points.map(([x,y])=>[60-x,y] as const)}):shapes;
}

export function npcDrawing(id:NpcAppearanceId,direction:Facing,frame=0):PixelShape[]{
 return withCharacterSprite(npcDrawingFallback(id,direction,frame),id,direction,frame);
}
