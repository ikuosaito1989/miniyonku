import { pixelPen, type PixelShape } from './pixelDrawing';
export type Facing='down'|'up'|'left'|'right';
export type PersonKind='player'|'owner'|'rival'|'guide'|'mechanic';
export const personSpriteSize={width:60,height:80,displayWidth:48,displayHeight:64} as const;
const outfits={
  player:{ink:'#25334d',shirt:'#3868bd',light:'#89b7ed',shade:'#264782',hair:'#51404a',hairLight:'#98706b',pants:'#455d84'},
  owner:{ink:'#35374e',shirt:'#607ca0',light:'#b0c8de',shade:'#415674',hair:'#656176',hairLight:'#ada0ac',pants:'#414f67'},
  rival:{ink:'#3d3048',shirt:'#b14b67',light:'#ec9aa2',shade:'#7f3757',hair:'#39304b',hairLight:'#89637c',pants:'#4c4e70'},
  guide:{ink:'#40314b',shirt:'#9c568c',light:'#e6a6c5',shade:'#693f73',hair:'#593d50',hairLight:'#ad7887',pants:'#65587e'},
  mechanic:{ink:'#273c50',shirt:'#317d91',light:'#9bd3cc',shade:'#24536f',hair:'#333e54',hairLight:'#728091',pants:'#365777'},
} as const;
const challengerColors:Record<string,string>={'#b14b67':'#514164','#ec9aa2':'#a49ab9','#7f3757':'#30283f','#39304b':'#242532','#89637c':'#535369','#4c4e70':'#343347'};
/** 共通の小学生原画から、丸い頬・幅広の胴・太い眉で黒岩を描き分ける。 */
export function challengerDrawing(direction:Facing,frame=0):PixelShape[]{
  const facing=direction==='left'?'right':direction;
  const widen=(x:number,y:number)=>Math.round(30+(x-30)*(y<36?1.25:1.45));
  const shapes:PixelShape[]=personDrawing('rival',facing,frame).map(shape=>{
    const color=challengerColors[shape.color]??shape.color;
    if(shape.kind==='rect')return {...shape,color,x:widen(shape.x,shape.y),w:widen(shape.x+shape.w,shape.y)-widen(shape.x,shape.y)};
    return {...shape,color,points:shape.points.map(([x,y])=>[widen(x,y),y] as const)};
  });
  const pen=pixelPen(),bob=frame===1||frame===3?1:0;
  if(facing!=='up'){
    if(facing==='down'){
      pen.polygon([[19,18+bob],[27,21+bob],[27,23+bob],[19,21+bob]],'#242532');
      pen.polygon([[33,21+bob],[41,18+bob],[41,21+bob],[33,23+bob]],'#242532');
      pen.polygon([[25,30+bob],[36,29+bob],[34,33+bob],[27,34+bob]],'#713d50');
      pen.rect(27,30+bob,7,1,'#fff0d8');
      pen.rect(17,29+bob,5,2,'#e4a08b');pen.rect(39,29+bob,5,2,'#e4a08b');
    }else{
      pen.polygon([[36,18+bob],[43,20+bob],[43,23+bob],[36,21+bob]],'#242532');
      pen.rect(39,30+bob,6,2,'#713d50');pen.rect(40,30+bob,4,1,'#fff0d8');
    }
    // 黒と金の横縞ジャケット。体格を服のシルエットでも伝える。
    pen.rect(facing==='down'?17:25,47+bob,facing==='down'?27:16,4,'#b9a15c');
    pen.rect(facing==='down'?18:25,52+bob,facing==='down'?25:16,2,'#30283f');
  }
  const drawing=[...shapes,...pen.shapes];
  return direction==='left'?drawing.map(shape=>shape.kind==='rect'?{...shape,x:60-shape.x-shape.w}:{...shape,points:shape.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}

/** 役割ごとの服・体型と、方向別の独立したシルエットを持つオリジナル原画。 */
export function personDrawing(kind:PersonKind,direction:Facing,frame:number):PixelShape[]{
  const pen=pixelPen(),r=pen.rect,p=pen.polygon,c=outfits[kind];
  const side=direction==='left'||direction==='right',back=direction==='up';
  const step=frame===1?2:frame===3?-2:0,bob=step?1:0;
  const adult=kind==='owner',wide=kind==='owner'?2:0;
  const skin='#f3c5a0',skinLight='#ffe2b6',skinShadow='#ca8d79';
  // 後ろ側の腕、左右に分かれたズボンと踵。横顔では遠い足を暗くする。
  if(side){
    p([[24,48-step],[20,52-step],[21,63-step],[25,65-step],[28,61-step],[28,51-step]],c.ink);
    r(22,52-step,4,9,skinShadow);
  }
  for(let leg=0;leg<2;leg++){
    const x=side?25+leg*5:20+leg*12,offset=leg?step:-step;
    p([[x,57],[x+9,57],[x+8,70+offset],[x+10,74+offset],[x+9,77+offset],[x-2,77+offset],[x-2,73+offset],[x+1,68+offset]],c.ink);
    r(x+1,60,5,10+offset,leg&&side?'#36415c':c.pants);r(x+2,62,1,7,c.light);
    r(x-1,74+offset,9,2,'#b7c5d8');r(x-1,76+offset,10,1,'#263247');
    r(x,73+offset,3,1,'#eef1e9');
  }
  const left=side?21:16-wide,right=side?38:43+wide;
  p([[left+5,35+bob],[right-5,35+bob],[right,42+bob],[right-1,58],[right-4,63],[left+3,63],[left,58],[left,43+bob]],c.ink);
  p([[left+6,37+bob],[right-6,37+bob],[right-2,43+bob],[right-3,58],[left+4,60],[left+2,44+bob]],c.shirt);
  p([[left+5,40+bob],[left+8,38+bob],[left+8,56],[left+4,58],[left+3,45]],c.light);
  p([[right-6,41],[right-2,44],[right-3,58],[right-7,60]],c.shade);
  r(left+5,59,right-left-9,2,'#c8cdd9');
  if(!back){
    p([[25,36+bob],[30,40+bob],[35,36+bob],[33,34+bob],[27,34+bob]],'#f4dfbd');
    r(30,41+bob,1,17,'#b9d6e5');r(31,44+bob,1,1,'#e8f2ec');
  }else{r(24,39+bob,12,1,c.light);r(29,44,1,11,c.shade);}
  if(kind==='owner'){
    // エプロンは背中の結び目も別に描く。
    if(back){r(21,45,20,2,'#d8b98b');p([[29,45],[34,45],[37,50],[31,48],[27,50]],'#a78868');}
    else{
      p([[23,40],[35,40],[39,59],[21,59]],'#b89a72');r(23,43,2,13,'#e0c59b');r(26,49,8,6,'#927d66');r(26,49,8,1,'#ead3ac');
      r(27,50,5,1,'#c1a888');r(34,42,2,4,'#637d96');
    }
  }else if(kind==='mechanic'){
    r(side?28:22,42,side?7:15,16,'#9cb8b6');r(side?29:24,43,1,14,'#e0e5cd');
    r(side?30:26,48,7,5,'#638f98');r(side?31:27,49,5,1,'#bed6ce');r(35,44,1,6,'#e2aa72');
  }else if(kind==='player'&&!back){
    r(24,44,5,4,'#f0d58d');r(25,45,3,1,'#fff0c5');r(33,52,4,3,'#274d92');r(33,52,4,1,'#83b5df');
  }else if(kind==='guide'){
    p([[21,55],[40,55],[43,65],[18,65]],c.shade);r(21,60,19,2,c.light);r(28,62,2,2,'#f0c4ce');
  }
  // 袖→肘→手首の太さを変え、左右の振りを交互にする。
  for(let arm=0;arm<(side?1:2);arm++){
    const x=side?34:arm?40+wide:13-wide,swing=arm?-step:step;
    p([[x+2,40+bob],[x+7,43+bob],[x+7,51+swing],[x+5,53+swing],[x,50+swing],[x,44+bob]],c.ink);
    p([[x+2,42+bob],[x+6,44+bob],[x+5,48+swing],[x+1,47+swing]],c.shirt);
    r(x+1,46+swing,5,2,kind==='mechanic'?'#c3d4cb':c.light);
    p([[x+1,49+swing],[x+5,49+swing],[x+6,58+swing],[x+4,61+swing],[x+1,60+swing],[x,57+swing]],skinShadow);
    p([[x+1,49+swing],[x+4,49+swing],[x+4,58+swing],[x+2,59+swing],[x+1,57+swing]],skin);
    r(x+1,54+swing,1,3,skinLight);r(x+3,59+swing,2,1,'#aa726a');
  }
  // 大きな顔と明瞭な目を持つ、昔のRPG風の共通の頭部原画。
  // 服の上まで顎を重ね、輪郭を黒い輪で囲わず、髪・肌それぞれの影で形を出す。
  r(26,32+bob,9,6,skinShadow);r(28,33+bob,6,4,skin);
  const headY=bob;
  p([[19,5+headY],[24,2+headY],[35,2+headY],[42,6+headY],[47,14+headY],[47,28+headY],[43,34+headY],[36,38+headY],[23,38+headY],[16,34+headY],[12,27+headY],[12,14+headY]],c.ink);
  if(back){
    p([[19,7+bob],[26,4+bob],[35,4+bob],[42,9+bob],[45,17+bob],[44,29+bob],[38,35+bob],[23,35+bob],[16,29+bob],[15,16+bob]],c.hair);
    p([[18,15+bob],[22,8+bob],[29,5+bob],[36,7+bob],[28,9+bob],[24,14+bob],[20,24+bob],[17,25+bob]],c.hairLight);
    r(22,32+bob,17,2,c.ink);r(25,34+bob,11,1,skinShadow);
  }else if(side){
    p([[26,13+bob],[36,11+bob],[43,16+bob],[44,23+bob],[48,25+bob],[48,28+bob],[43,29+bob],[41,34+bob],[35,36+bob],[26,33+bob],[22,26+bob]],skinShadow);
    p([[29,14+bob],[37,13+bob],[42,17+bob],[42,24+bob],[46,25+bob],[46,27+bob],[41,28+bob],[39,32+bob],[34,34+bob],[28,31+bob]],skin);
    r(31,16+bob,8,2,skinLight);
    p([[18,8+bob],[27,4+bob],[37,6+bob],[44,13+bob],[43,19+bob],[37,16+bob],[33,19+bob],[29,15+bob],[27,24+bob],[23,28+bob],[23,33+bob],[17,29+bob],[15,22+bob]],c.hair);
    p([[19,14+bob],[23,8+bob],[30,6+bob],[35,8+bob],[27,10+bob],[23,16+bob],[20,22+bob]],c.hairLight);
    r(36,20+bob,6,1,c.ink);r(36,22+bob,5,6,'#fff1d5');r(38,22+bob,3,6,c.ink);r(38,22+bob,1,2,'#fffaf0');
    r(39,31+bob,4,1,'#9d6064');r(37,29+bob,3,1,'#e5a292');
    r(24,24+bob,5,6,skinShadow);r(25,24+bob,3,4,skin);
  }else{
    p([[19,13+bob],[29,10+bob],[39,13+bob],[44,20+bob],[43,29+bob],[38,34+bob],[32,36+bob],[25,35+bob],[18,31+bob],[15,23+bob]],skinShadow);
    p([[20,14+bob],[29,12+bob],[38,14+bob],[41,20+bob],[41,28+bob],[36,32+bob],[30,34+bob],[23,32+bob],[18,28+bob],[17,21+bob]],skin);
    p([[21,15+bob],[29,13+bob],[36,15+bob],[35,18+bob],[21,19+bob]],skinLight);
    const fringe=kind==='rival'?[[14,19+bob],[14,11+bob],[20,9+bob],[20,4+bob],[28,6+bob],[34,1+bob],[38,6+bob],[44,10+bob],[46,19+bob],[40,17+bob],[37,20+bob],[32,15+bob],[27,19+bob],[23,16+bob],[18,22+bob]]:
      [[14,22+bob],[14,13+bob],[19,7+bob],[27,4+bob],[37,6+bob],[44,13+bob],[45,21+bob],[39,17+bob],[35,19+bob],[29,14+bob],[24,17+bob],[20,19+bob],[17,26+bob]];
    p(fringe as [number,number][],c.hair);
    p([[18,14+bob],[22,8+bob],[29,6+bob],[36,8+bob],[29,9+bob],[24,12+bob],[21,17+bob]],c.hairLight);
    for(const x of [21,34]){r(x,21+bob,6,1,c.ink);r(x,23+bob,5,6,'#fff2d8');r(x+2,23+bob,3,6,c.ink);r(x+2,23+bob,1,2,'#fffdf2');}
    r(29,27+bob,2,3,'#d39b80');r(27,32+bob,7,1,'#995f62');r(28,33+bob,5,1,'#ffe5b7');r(19,29+bob,4,1,'#e5a092');r(38,29+bob,3,1,'#e5a092');
    r(14,23+bob,3,5,skinShadow);r(15,24+bob,2,3,skin);
  }
  if(kind==='player'){
    p([[17,12+bob],[19,5+bob],[23,2+bob],[34,2+bob],[39,6+bob],[40,12+bob]],'#a87a49');
    p([[19,10+bob],[21,6+bob],[25,4+bob],[33,4+bob],[37,7+bob],[38,10+bob]],'#e4bc6c');
    r(24,4+bob,8,1,'#ffe5a0');r(28,5+bob,1,5,'#f6d28b');
    p(side?[[24,12+bob],[44,12+bob],[47,15+bob],[42,17+bob],[26,15+bob]]:[[15,12+bob],[41,12+bob],[43,14+bob],[37,16+bob],[18,15+bob]],'#f1d18c');
    r(20,12+bob,16,1,'#ffe8af');
  }else if(kind==='owner'&&!back){
    if(side){r(34,21+bob,7,1,'#4d596e');r(34,21+bob,1,7,'#4d596e');r(40,21+bob,1,7,'#4d596e');r(34,27+bob,7,1,'#4d596e');r(28,23+bob,6,1,'#4d596e');}
    else for(const x of [20,33]){r(x,21+bob,9,1,'#4d596e');r(x,21+bob,1,7,'#4d596e');r(x+8,21+bob,1,7,'#4d596e');r(x,27+bob,9,1,'#4d596e');r(29,23+bob,4,1,'#4d596e');}
  }
  if(kind==='guide'){
    p([[39,14+bob],[45,16+bob],[46,27+bob],[43,35+bob],[39,36+bob],[41,27+bob]],c.hair);
    r(40,17+bob,4,2,'#f1a9ba');r(43,22+bob,1,7,c.hairLight);
  }
  if(adult)r(side?32:18,30+bob,2,1,'#d49781');
  // 半ドットの原画仕上げ。顔の輪郭を保ちながら瞳・布・髪へ素材ごとの光を描く。
  // 全方向で同じ光源（左上）を使い、歩行時は衣服と一緒に上下させる。
  const by=bob;
  if(back){
    p([[20,17+by],[23,13+by],[24,14+by],[22,22+by],[20,25+by]],c.hairLight,.65);
    p([[32,13+by],[35,15+by],[38,24+by],[37,29+by],[35,27+by]],c.ink,.3);
    r(25,30+by,3,.5,c.hairLight,.8);r(30,31+by,4,.5,c.hairLight,.55);
    p([[24,42+by],[28,43+by],[27,53],[25,55]],c.light,.45);
    r(26,55,9,.5,c.shade);r(25,57,3,.5,c.light);
  }else{
    // 白い反射を残し、虹彩の下端に暖色を入れる。
    for(const x of side?[38]:[23,36]){r(x,28+bob,2,.5,c.hairLight);r(x,23+bob,1,1.5,'#fffdf0');}
    r(side?41:29,27+by,1,.5,'#ffe5c0');
    p(side?[[37,30+by],[40,29.5+by],[41,30+by],[39,31+by]]:[[26,30+by],[29,30.5+by],[32,30+by],[32,31+by],[27,31+by]],'#9d6668');
    r(side?38:28,31.5+by,2,.5,'#ffe7c4');
    if(kind!=='owner'){
      r(side?32:20,27.5+by,2.5,.5,'#e7ac98',.8);
      if(!side)r(36,27.5+by,2.5,.5,'#e7ac98',.8);
    }
    if(kind!=='player'){
      p([[22,10+by],[27,8+by],[31,8.5+by],[27,10+by],[24,13+by]],c.hairLight,.7);
      r(21,13+by,2,.5,'#e2c1ab',.5);
      p([[32,12+by],[34,12+by],[36,16+by],[34,17+by]],c.ink,.3);
      r(19,18+by,.5,3,c.hairLight,.7);
    }
    // 襟、ステッチ、ポケット、ファスナーの金属光。
    if(kind!=='owner'){
      p([[25,36.5+by],[29,40+by],[28,41.5+by],[24,38+by]],c.light);
      r(side?31:30,43+by,.5,13,'#e1dfc3',.7);
      for(let i=0;i<4;i++)r(side?32:31,44+by+i*3,.5,.75,c.ink,.7);
      r(side?33:34,50+by,3,.5,c.light);r(side?33:34,50+by,.5,4,c.shade);
      p([[side?27:20,54],[side?30:25,55],[side?28:23,57]],c.light,.5);
    }else{
      r(24,44,.5,12,'#f7dbad');r(27,51,5,.5,'#d4b58b');r(33,51,.5,3,'#6f6460');
      r(35,43,1,3,'#d4ac6b');r(35,43,1,.5,'#f8dfae');
      // 眼鏡の光と口元の年齢差。
      for(const x of side?[35]:[21,34])r(x,22+by,2,.5,'#e3ede2');
      r(side?33:19,29+by,1.5,.5,'#bb867a');r(side?37:35,32+by,2,.5,'#bb867a');
    }
  }
  if(kind==='player'){
    // キャップのパネル、ツバ裏の影、青いジャケットのワッペン。
    r(23,6+by,.5,4,'#a77c52');r(33,6+by,.5,4,'#bd955e');
    p([[20,10+by],[23,11+by],[35,11+by],[38,10+by],[36,12+by],[21,12+by]],'#bc925a');
    r(side?31:20,14+by,side?10:16,.5,'#a77c52');r(side?34:25,5+by,2,.5,'#fff0be');
    if(!back){r(25,45+by,2.5,.5,'#fff4d3');r(25.5,46+by,1,.5,'#b58c5f');r(34,54+by,2,.5,c.light);}
  }
  // 靴底・靴紐・膝の反射。左右の足の前後と一緒に動く。
  for(let leg=0;leg<2;leg++){
    const x=side?25+leg*5:20+leg*12,offset=leg?step:-step;
    r(x+2,66+offset,3,.5,c.light,.65);r(x+1,70+offset,4,.5,c.shade);
    r(x,73+offset,6,.5,'#e3ddce');r(x+2,72+offset,3,.5,'#c8c5bb');r(x+1,74.5+offset,5,.5,'#7f91a5');
  }
  if(direction==='left')return pen.shapes.map(shape=>shape.kind==='rect'?{...shape,x:60-shape.x-shape.w}:{...shape,points:shape.points.map(([x,y])=>[60-x,y] as const)});
  return pen.shapes;
}

/** 店主と同じ大人の原画を基に、白衣・白髪・丸眼鏡の研究家を描く。 */
export function doctorDrawing(direction:Facing,frame=0):PixelShape[]{
  const facing=direction==='left'?'right':direction;
  const colors:Record<string,string>={'#607ca0':'#e4ece6','#b0c8de':'#ffffff','#415674':'#a9c3ba','#656176':'#d6e1dc','#ada0ac':'#ffffff','#b89a72':'#e4ece6','#e0c59b':'#ffffff','#927d66':'#b9d0c7','#ead3ac':'#ffffff','#c1a888':'#d6e4dc','#d8b98b':'#e4ece6','#a78868':'#a9c3ba'};
  const shapes=personDrawing('owner',facing,frame).map(shape=>({...shape,color:colors[shape.color]??shape.color}));
  const pen=pixelPen(),bob=frame===1||frame===3?1:0;
  if(facing==='down'){
    pen.rect(18,20+bob,10,8,'#2e4c54');pen.rect(31,20+bob,10,8,'#2e4c54');
    pen.rect(20,22+bob,6,4,'#d6f0eb');pen.rect(33,22+bob,6,4,'#d6f0eb');pen.rect(28,22+bob,3,2,'#2e4c54');
    pen.polygon([[28,40],[32,40],[34,48],[30,52],[27,48]],'#397d78');
  }else if(facing==='right'){
    pen.rect(34,20+bob,9,8,'#2e4c54');pen.rect(36,22+bob,5,4,'#d6f0eb');pen.rect(27,21+bob,7,2,'#2e4c54');
  }
  const drawing=[...shapes,...pen.shapes];
  return direction==='left'?drawing.map(shape=>shape.kind==='rect'?{...shape,x:60-shape.x-shape.w}:{...shape,points:shape.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}

// 共通の小学生の顔・体を再利用し、森野陸は土色の髪と緑の服で統一する。
export function offroaderDrawing(direction:Facing,frame=0):PixelShape[]{
  const colors:Record<string,string>={'#317d91':'#58784b','#9bd3cc':'#c0d398','#24536f':'#3a5136','#333e54':'#5c4635','#728091':'#a08156'};
  return personDrawing('mechanic',direction,frame).map(shape=>({...shape,color:colors[shape.color]??shape.color}));
}

/** 共通原画に肩までの黒髪と落ち着いた目元を加えた黒瀬 迅。 */
export function seniorDrawing(direction:Facing,frame=0):PixelShape[]{
 const facing=direction==='left'?'right':direction,bob=frame===1||frame===3?1:0;
 const base=personDrawing('rival',facing,frame).map(shape=>({...shape,color:({'#b14b67':'#322b3c','#ec9aa2':'#ae5266','#7f3757':'#1e2130','#39304b':'#242532','#89637c':'#535369','#4c4e70':'#343442'} as Record<string,string>)[shape.color]??shape.color}));
 const back=pixelPen(),front=pixelPen();
 if(facing==='down'||facing==='up'){
  back.polygon([[17,12+bob],[42,12+bob],[46,24+bob],[45,43+bob],[40,48+bob],[35,43+bob],[23,44+bob],[15,47+bob],[13,37+bob],[14,23+bob]],'#242532');
  for(const x of [16,19,40,43])back.rect(x,23+bob,1,19,'#535369');
 }else{
  back.polygon([[20,13+bob],[37,11+bob],[42,20+bob],[37,30+bob],[37,43+bob],[27,48+bob],[19,43+bob],[17,31+bob]],'#242532');
  back.rect(21,22+bob,2,20,'#535369');back.rect(25,29+bob,1,15,'#686078');
 }
 if(facing==='down'){
  front.polygon([[16,13+bob],[24,6+bob],[38,8+bob],[43,17+bob],[35,14+bob],[28,17+bob],[20,28+bob],[17,35+bob]],'#242532');
  front.polygon([[22,12+bob],[30,9+bob],[25,16+bob],[20,21+bob]],'#535369');
  front.rect(23,20+bob,5,1,'#242532');front.rect(33,20+bob,6,1,'#242532');
  for(const x of [21,34]){front.rect(x,23+bob,6,7,'#f3c5a0');front.rect(x,24+bob,5,2,'#fff2d8');front.rect(x+2,24+bob,2,2,'#303443');}front.rect(27,31+bob,8,4,'#f3c5a0');front.rect(28,32+bob,6,1,'#845269');
  front.rect(20,44+bob,20,2,'#a44858');front.rect(29,39+bob,2,19,'#a44858');
 }else if(facing==='up'){
  front.polygon([[17,12+bob],[24,6+bob],[38,8+bob],[44,18+bob],[44,40+bob],[37,47+bob],[24,45+bob],[16,43+bob],[14,25+bob]],'#242532');
  for(const x of [20,24,29,34,39])front.rect(x,17+bob,1,25,'#535369');
 }else{
  front.polygon([[22,12+bob],[31,7+bob],[41,13+bob],[43,19+bob],[35,16+bob],[31,24+bob],[27,38+bob],[22,44+bob]],'#242532');
  front.rect(25,16+bob,1,23,'#535369');front.rect(38,21+bob,6,1,'#242532');front.rect(36,23+bob,6,6,'#f3c5a0');front.rect(37,24+bob,5,2,'#fff2d8');front.rect(39,24+bob,2,2,'#303443');front.rect(37,30+bob,7,4,'#f3c5a0');front.rect(39,32+bob,5,1,'#845269');front.rect(28,44+bob,10,2,'#a44858');
 }
 const drawing=[...back.shapes,...base,...front.shapes];
 return direction==='left'?drawing.map(shape=>shape.kind==='rect'?{...shape,x:60-shape.x-shape.w}:{...shape,points:shape.points.map(([x,y])=>[60-x,y] as const)}):drawing;
}
