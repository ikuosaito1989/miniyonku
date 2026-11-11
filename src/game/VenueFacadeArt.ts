import Phaser from 'phaser';
import type {TownVenue,ShopId} from '../data/world';
import {shopThemes} from '../data/shopThemes';
import {SceneryPen} from './SceneryCanvas';

function roofBlock(p:SceneryPen,x:number,y:number,w:number,h:number,top:string,front:string,side:string){
 p.poly([[x,y],[x+8,y-5],[x+w+8,y-5],[x+w,y]],side);
 p.poly([[x,y],[x+w,y],[x+w,y+h],[x,y+h]],front);
 p.poly([[x+w,y],[x+w+8,y-5],[x+w+8,y+h-5],[x+w,y+h]],side);
 p.poly([[x,y],[x+8,y-5],[x+w+8,y-5],[x+w,y]],top);
 p.line([[x+3,y+2],[x+w-3,y+2]],'#ffffff55',1);
}

function paintRaceArena(p:SceneryPen,v:TownVenue,x:number,y:number){
 const {c}=p,w=v.w,h=v.h,cx=x+w/2;
 p.ellipse(cx+20,y+h+16,w*.62,30,'#22374735');
 // The arena is a low, wide hall with a glazed oval roof and a deep right side.
 p.poly([[x+54,y+170],[x+w-78,y+170],[x+w+24,y+111],[x+w+24,y+h-38],[x+w-56,y+h-9],[x+54,y+h-9]],'#34475c');
 p.poly([[x+22,y+181],[x+w-78,y+181],[x+w-78,y+h-18],[x+22,y+h-18]],'#71869a');
 p.gradient(x+28,y+191,w-112,h-217,'#e2e9ea','#9baeb8');
 p.rect(x+34,y+h-28,w-120,8,'#526981');p.rect(x+36,y+h-27,w-124,2,'#f1e4c4');
 // Layered ellipse bands make a dome while remaining crisp at the existing 1x raster.
 p.ellipse(cx+10,y+137,w*.53,143,'#2a4057');
 p.ellipse(cx+5,y+129,w*.505,136,'#cad4de');
 p.ellipse(cx+3,y+122,w*.47,126,'#7790ac');
 p.ellipse(cx,y+116,w*.448,119,'#2b76b4');
 p.ellipse(cx,y+116,w*.405,105,'#58a7d5');
 p.ellipse(cx-4,y+111,w*.34,82,'#7ac6e5');
 c.save();c.beginPath();c.ellipse(cx,y+116,w*.448,119,0,Math.PI,Math.PI*2);c.clip();
 for(let i=-4;i<=4;i++){
  const dx=i*w*.085;c.strokeStyle=i%2===0?'#d9e7ed':'#a8cee1';c.lineWidth=i===0?8:5;c.beginPath();c.moveTo(cx+dx*.2,y+13);c.lineTo(cx+dx*1.58,y+228);c.stroke();
 }
 for(const yy of [y+66,y+104,y+145]){c.strokeStyle='#d0e2ed';c.lineWidth=4;c.beginPath();c.ellipse(cx,yy,w*.45,24,0,Math.PI,Math.PI*2);c.stroke();}
 c.restore();
 p.ellipse(cx,y+221,w*.515,31,'#d2dce5');p.ellipse(cx,y+216,w*.485,25,'#507392');
 // Front portico: trophy plaque, checker trim, tall columns and glazed doors.
 p.poly([[x-4,y+223],[cx-88,y+223],[cx-62,y+184],[cx+62,y+184],[cx+88,y+223],[x+w+4,y+223],[x+w+4,y+278],[x-4,y+278]],'#24384f');
 p.poly([[x+5,y+218],[cx-82,y+218],[cx-58,y+190],[cx+58,y+190],[cx+82,y+218],[x+w-5,y+218],[x+w-5,y+269],[x+5,y+269]],'#3f6288');
 p.round(cx-59,y+174,118,65,4,'#e0d9bd');p.round(cx-53,y+180,106,53,3,'#25384d');
 p.trophy(cx,y+189,1.05);p.line([[cx-44,y+196],[cx-33,y+186],[cx-26,y+201]],'#e5c96e',3);p.line([[cx+44,y+196],[cx+33,y+186],[cx+26,y+201]],'#e5c96e',3);
 for(const side of [x+27,x+w-51])for(let i=0;i<5;i++){p.rect(side+i*5,y+245,3,7,i%2?'#f4f1df':'#4a8dcc');p.rect(side+i*5,y+252,3,5,i%2?'#445c78':'#f4f1df');}
 p.round(cx-111,y+258,222,52,3,'#213b59');p.round(cx-104,y+263,208,42,2,'#397bb0');
 c.save();c.font='bold 13px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff2ca';c.fillText(v.name,cx,y+284,194);c.restore();
 for(const bx of [x+74,x+w-102]){p.poly([[bx,y+270],[bx+18,y+270],[bx+18,y+h-112],[bx,y+h-104]],'#324a64');p.rect(bx+4,y+279,3,h-400,'#e6dcbf');p.rect(bx+12,y+279,2,h-400,'#99b4bf');}
 const doorW=Math.min(210,w*.34),doorY=y+h-183;
 p.round(cx-doorW/2-8,doorY-8,doorW+16,104,3,'#263b54');p.gradient(cx-doorW/2,doorY,doorW,88,'#83b7cc','#375b7c');
 for(let i=1;i<5;i++){const dx=cx-doorW/2+i*doorW/5;p.rect(dx,doorY+8,3,73,'#d8e2d9');p.rect(dx+3,doorY+12,1,55,'#6c93a4');}
 p.rect(cx-2,doorY+8,4,78,'#f0e0b9');
 for(let step=0;step<6;step++){const sw=doorW/2+34+step*15,sy=y+h-85+step*8;p.poly([[cx-sw,sy],[cx+sw,sy],[cx+sw-6,sy+7],[cx-sw+6,sy+7]],step%2?'#8695a1':'#e3dfd0');}
 p.rect(x+18,y+h-18,w-94,7,'#485e72');p.rect(x+21,y+h-18,w-100,2,'#f1e7cc');
}

function paintHobbyShop(p:SceneryPen,v:TownVenue,x:number,y:number){
 const {c}=p,w=v.w,h=v.h;
 p.ellipse(x+w/2+22,y+h+11,w*.61,22,'#22374735');
 // Rooftop air handlers and a deep side wall make the workshop read as a solid block.
 p.poly([[x+w-50,y+84],[x+w+30,y+37],[x+w+30,y+h-16],[x+w-50,y+h+2]],'#263d58');
 p.poly([[x+4,y+105],[x+w-49,y+105],[x+w-49,y+h-10],[x+4,y+h-10]],'#405978');
 p.poly([[x-9,y+93],[x+45,y+33],[x+w-44,y+33],[x+w+17,y+91],[x+w+11,y+111],[x-5,y+111]],'#243950');
 p.poly([[x,y+90],[x+49,y+41],[x+w-48,y+41],[x+w+9,y+91],[x+w+4,y+100],[x-4,y+100]],'#647f9c');
 p.poly([[x+17,y+85],[x+57,y+49],[x+w-54,y+49],[x+w-3,y+91],[x+w-9,y+96],[x+12,y+96]],'#829bb1');
 p.poly([[x+28,y+80],[x+62,y+54],[x+w-61,y+54],[x+w-12,y+89],[x+w-18,y+93],[x+23,y+91]],'#304a68');
 for(const [bx,by,bw,bh] of [[x+65,y+34,64,32],[x+146,y+45,42,23],[x+w-93,y+38,59,30]] as const){
  roofBlock(p,bx,by,bw,bh,'#dce0dd','#718397','#354b62');
  p.rect(bx+6,by+6,bw-12,3,'#354c64');p.rect(bx+7,by+12,bw-14,2,'#a8bbc4');
 }
 // Raised sign box and crossed wrench motif.
 p.round(x+19,y+105,w-38,42,3,'#233955');p.round(x+25,y+110,w-50,31,2,'#2364a2');
 p.rect(x+31,y+112,w-62,2,'#d8e8ef');
 c.save();c.font='bold 12px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff3d2';c.fillText(v.name,x+w*.43,y+128,w*.68);c.restore();
 const wx=x+w-64,wy=y+126;p.line([[wx-12,wy+12],[wx+12,wy-12]],'#ffd45d',7);p.ellipse(wx-14,wy+14,8,8,'#ffd45d');p.ellipse(wx-14,wy+14,3,3,'#2364a2');p.line([[wx+8,wy-16],[wx+16,wy-8]],'#ffd45d',4);
 // Blue and cream striped awning over the display windows.
 p.poly([[x-3,y+151],[x+w+7,y+151],[x+w+20,y+181],[x-12,y+181]],'#203852');
 const stripeW=(w+16)/12;for(let i=0;i<12;i++)p.poly([[x-7+i*stripeW,y+153],[x-7+(i+1)*stripeW,y+153],[x-2+(i+1)*stripeW,y+178],[x-2+i*stripeW,y+178]],i%2?'#eef0e6':'#2c72b8');
 p.rect(x-4,y+178,w+16,5,'#dde5e5');p.rect(x-4,y+183,w+16,3,'#385c7e');
 const bayY=y+191,bayH=Math.min(86,h-222),bayW=(w-58)/3;
 for(let i=0;i<3;i++){
  const bx=x+12+i*(bayW+11);p.round(bx-3,bayY-4,bayW+6,bayH+8,2,'#263b54');p.gradient(bx,bayY,bayW,bayH,'#8ac5dc','#315879');
  p.rect(bx+3,bayY+bayH*.55,bayW-6,2,'#e4d7b8');p.rect(bx+3,bayY+bayH*.77,bayW-6,2,'#e4d7b8');
  for(let shelf=0;shelf<2;shelf++){const sy=bayY+bayH*(.34+shelf*.22);p.rect(bx+4,sy,bayW-8,2,'#d9e0d5');for(let n=0;n<2;n++){const px=bx+9+n*(bayW/2);p.round(px,sy-11,Math.min(25,bayW/2-8),8,1,n?'#e7c866':'#dd765d');p.rect(px+2,sy-8,Math.min(15,bayW/2-13),2,'#f4e8c4');}}
  p.rect(bx+bayW*.48,bayY,2,bayH,'#e2e5db');
 }
 const doorX=x+w-56,doorY=y+192;p.round(doorX,doorY,40,bayH+3,2,'#273e58');p.gradient(doorX+4,doorY+4,32,bayH-5,'#a1d0dd','#527d98');p.rect(doorX+21,doorY+5,2,bayH-8,'#f3e5c5');p.rect(doorX+32,doorY+bayH/2,3,3,'#f4d776');
 p.rect(x+5,y+h-16,w-14,7,'#334d65');p.rect(x+8,y+h-16,w-20,2,'#e8d9b4');
 for(const bx of [x+3,x+w-15]){p.round(bx,y+h-42,12,25,2,'#c8a06d');p.ellipse(bx+6,y+h-47,9,12,'#5e8658');p.ellipse(bx+3,y+h-51,7,9,'#7ca367');}
}

function entranceCue(p:SceneryPen,v:TownVenue,open:boolean,x:number,y:number){
 const w=v.w,h=v.h;
 if(open)p.poly([[x+w/2-7,y+h+14],[x+w/2+7,y+h+14],[x+w/2,y+h+22]],'#e5d8a4');
 else{p.round(x+w/2-17,y+h-30,34,22,3,'#26394be8');p.round(x+w/2-6,y+h-37,12,13,6,'#c9b87d');p.round(x+w/2-9,y+h-29,18,14,3,'#ebd99d');p.ellipse(x+w/2,y+h-23,2,2,'#596174');}
}

export function paintVenueFacade(p:SceneryPen,v:TownVenue,open:boolean){
 if(v.kind==='outdoor')return;
 const w=v.w,h=v.h,x=40,y=91,c=p.c;
 if(v.id==='stadium-5'){
  paintRaceArena(p,v,x,y);entranceCue(p,v,open,x,y);c.globalAlpha=1;return;
 }
 if(v.id==='komorebi'){
  paintHobbyShop(p,v,x,y);entranceCue(p,v,open,x,y);c.globalAlpha=1;return;
 }
 p.ellipse(x+w/2+10,y+h+9,w*.6,13,'#21323b33');
 if(v.kind==='library'){
  p.round(x,y,w,h,3,'#465e6c');p.gradient(x+3,y+3,w-6,h-6,'#e1d7bd','#b4b4a0');
  p.poly([[x-9,y+4],[x+w/2,y-36],[x+w+9,y+4]],'#526574');p.poly([[x+6,y],[x+w/2,y-27],[x+w-6,y]],'#8c9f9e');
  p.round(x+w/2-23,y-15,46,27,3,'#304d59');
  p.poly([[x+w/2,y+5],[x+w/2-16,y],[x+w/2-16,y-10],[x+w/2,y-6],[x+w/2+16,y-10],[x+w/2+16,y],[x+w/2,y+5]],'#e8d7a7');p.line([[x+w/2,y-6],[x+w/2,y+5]],'#9e875d',1);
  for(const side of [x+12,x+w-61]){p.round(side,y+26,49,74,3,'#556c77');p.gradient(side+3,y+29,43,68,'#b4d7d3','#6b929d');for(let row=0;row<3;row++){p.rect(side+5,y+43+row*21,39,3,'#84715b');for(let col=0;col<6;col++)p.rect(side+6+col*6,y+31+row*21,4,11,['#647c83','#9b7469','#b49e63'][col%3]);}p.rect(side+23,y+29,2,68,'#d7d8c2');}
  p.round(x+w/2-22,y+48,44,h-49,3,'#475c65');p.gradient(x+w/2-18,y+53,36,h-57,'#b3d1c5','#5f8690');p.rect(x+w/2-1,y+53,2,h-57,'#d9d6ba');p.rect(x+w/2+10,y+h-24,3,11,'#dfc581');
  for(const col of [x+5,x+w-12]){p.gradient(col,y+13,7,h-14,'#ece2cb','#999e97');p.rect(col-2,y+12,11,4,'#c1b99d');}
  p.round(x-15,y+h-25,18,25,3,'#9e7c61');p.ellipse(x-6,y+h-29,15,12,'#66876a');p.round(x+w+1,y+h-25,18,25,3,'#9e7c61');p.ellipse(x+w+10,y+h-29,15,12,'#66876a');
  p.round(x+w/2-48,y+13,96,14,2,'#425764');p.rect(x+w/2-45,y+15,90,1,'#eee0c1');c.save();c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff0cb';c.fillText('緑川町立図書館',x+w/2,y+21,88);c.restore();
 }else if(v.kind==='stadium'){
  const colors:Record<string,string[]>={'stadium-5':['#376f73','#91bdac'],'stadium-9':['#4e527f','#bd9ace'],'stadium-10':['#745153','#e5b97a'],'stadium-7':['#354968','#dcc080']};
  const [dark,accent]=colors[v.id]??colors['stadium-5'];
  // Broad roof planes and a deep side return give the hall a clear 3/4 footprint.
  // Keep the shapes large and simple; added volume comes from geometry and shadow,
  // not from increasing the pixel density.
  p.poly([[x+7,y+52],[x+w-29,y+52],[x+w+26,y+22],[x+w+26,y+h-18],[x+w-25,y+h-5],[x+7,y+h-5]],'#253b50');
  p.poly([[x+8,y+49],[x+w-31,y+49],[x+w-31,y+h-5],[x+8,y+h-5]],'#9aaea9');
  p.gradient(x+12,y+53,w-48,42,'#667d86','#344e61');
  for(let row=0;row<3;row++){
   const yy=y+56+row*13;p.rect(x+15,yy,w-55,2,accent);
   for(let col=0;col<14;col++){const xx=x+19+col*(w-65)/14;p.rect(xx,yy+3,Math.max(5,(w-80)/18),6,['#304a60','#527083','#375c6b','#755d67'][col%4]);p.rect(xx+1,yy+3,2,2,'#d1b28c');}
  }
  // Cantilever roof with a lit fascia, exposed truss braces and a shaded right return.
  p.poly([[x-13,y+53],[x+27,y-42],[x+w-34,y-42],[x+w+20,y+34],[x+w+14,y+58],[x-9,y+69]],'#24394d');
  p.poly([[x-7,y+48],[x+31,y-34],[x+w-35,y-34],[x+w+12,y+36],[x+w+6,y+50],[x-3,y+61]],dark);
  p.poly([[x-7,y+48],[x+31,y-34],[x+31,y-20],[x+3,y+54]],accent);
  p.poly([[x+31,y-34],[x+w-35,y-34],[x+w+12,y+36],[x+w+6,y+50],[x+w/2,y-20]],'#526b79');
  p.poly([[x+w/2,y-20],[x+w+6,y+50],[x+w+6,y+57],[x+w/2,y-11]],'#263b4b');
  roofBlock(p,x+w/2-31,y-8,62,22,'#d3d5c1',dark,'#263b4b');
  for(const ventX of [x+22,x+w-42])roofBlock(p,ventX,y-34,17,9,'#d5d5c0','#526571','#263d4a');
  for(let band=0;band<4;band++){const yy=y-24+band*15;p.line([[x+22+band*6,yy],[x+w-28+band*6,yy+1]],band%2?'#d0d3bd77':'#263c4a88',2);}
  p.rect(x+30,y-28,w-68,2,'#e3e0c8');p.rect(x+29,y-22,w-62,2,'#1e3444');
  for(let i=0;i<8;i++){const tx=x+38+i*(w-88)/8;p.line([[tx,y-20],[tx+12,y+20],[tx+23,y-20]],'#d4d6c366',1);}
  // A modest name board sits in the canopy fascia instead of an oversized trophy emblem.
  p.round(x+w/2-55,y+24,110,17,2,'#1d3448');p.rect(x+w/2-52,y+26,104,1,'#f0dfb4');c.save();c.font='bold 7px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff0c9';c.fillText(v.name,x+w/2,y+33,100);c.restore();
  // Two storey window bands sit below the canopy. The entrance overlays their
  // center bays, leaving visible windows on both sides of the lobby.
  for(const yy of [y+59,y+73])for(let col=0;col<6;col++){
   const bx=x+12+col*15;p.round(bx,yy,11,9,1,'#405967');p.rect(bx+2,yy+2,7,5,'#77a6ad');p.rect(bx+2,yy+2,3,2,'#d1dfd0');p.rect(bx+1,yy+10,9,2,accent);
  }
  // Glass entrance, stairs, side columns and a small race pennant establish use and scale.
  const doorY=y+h-57;p.round(x+w/2-24,doorY-5,48,64,3,'#263d51');p.gradient(x+w/2-20,doorY,40,49,'#a7c5c2','#547989');
  p.rect(x+w/2-2,doorY,4,49,'#e1d3aa');p.rect(x+w/2-17,doorY+6,12,31,'#34566a');p.rect(x+w/2+5,doorY+6,12,31,'#34566a');p.rect(x+w/2-15,doorY+9,8,2,'#c8dcd2');p.rect(x+w/2+7,doorY+9,8,2,'#c8dcd2');p.rect(x+w/2-20,doorY+47,40,3,accent);
  for(const bx of [x+13,x+w-35]){p.rect(bx,y+56,10,h-77,'#536c75');p.rect(bx+2,y+58,2,h-81,'#d7d8c2');p.rect(bx+7,y+58,2,h-81,'#334d5a');}
  for(let step=0;step<4;step++){p.poly([[x+w/2-67-step*6,y+h-18+step*5],[x+w/2+67+step*6,y+h-18+step*5],[x+w/2+61+step*6,y+h-14+step*5],[x+w/2-61-step*6,y+h-14+step*5]],step%2?'#737f80':'#d1c7ae');}
  for(const bx of [x+4,x+w-14]){p.rect(bx,y+27,2,38,'#bac9c4');p.poly([[bx+2,y+28],[bx+22,y+33],[bx+2,y+41]],accent);p.rect(bx+4,y+31,12,2,'#fff0c4');}
 }else{
  const t=shopThemes[(v.shopId??'komorebi') as ShopId];
  const shopId=v.shopId??'komorebi',style=['komorebi','aozora','hinata','wakaba','yuunagi','akatsuki','hoshikuzu','atelier','endurance','torque','velocity','terrain'].indexOf(shopId);
  // A deep service side wall, plinth and raised roof make each shop read as a building,
  // while the saved venue footprint and its entrance remain exactly where they are.
  p.poly([[x+w-25,y+10],[x+w+25,y-20],[x+w+25,y+h-8],[x+w-25,y+h-2]],'#263c41');
  p.poly([[x+w-21,y+14],[x+w+20,y-11],[x+w+20,y+h-14],[x+w-21,y+h-7]],t.floorDark);
  for(let row=0;row<5;row++){const sy=y+22+row*22;p.line([[x+w-19,sy],[x+w+18,sy-22]],'#eadfc13b',1);}
  // A deep, overhanging roof is seen above the front wall. Its large planes,
  // ridge and fascia establish volume at the same one-pixel source resolution.
  p.poly([[x-13,y+9],[x+21,y-57],[x+w-23,y-57],[x+w+25,y+2],[x+w+21,y+18],[x-9,y+25]],'#30464d');
  p.poly([[x-7,y+5],[x+25,y-50],[x+w-21,y-50],[x+w+16,y+3],[x+w+12,y+14],[x-4,y+17]],t.accent);
  // Keep shop roofs flat and stepped, like the low-rise commercial blocks in
  // the references; the raised plant room and parapet make the profile read.
  const roofTone=style===3?'#526b54':style===5?'#a65554':t.accent;
  p.poly([[x-6,y+5],[x+25,y-50],[x+w-21,y-50],[x+w+16,y+3],[x+w+12,y+14],[x-4,y+17]],roofTone);
  p.poly([[x+2,y+2],[x+29,y-45],[x+w-24,y-45],[x+w+10,y+5]],t.light);
  p.poly([[x+29,y-45],[x+w-24,y-45],[x+w+10,y+5],[x+w+4,y+7]],roofTone);
  for(let seam=0;seam<3;seam++){const yy=y-35+seam*12;p.line([[x+28+seam*5,yy],[x+w-25+seam*5,yy]],'#394c4b66',1);}
  // Rooftop plant room and vents echo the stacked, practical shop buildings
  // in the references. Their silhouette carries the detail, not extra pixels.
  roofBlock(p,x+30,y-26,w-60,25,t.light,t.floorDark,t.ink);
  for(const [vx,vy,vw,vh] of [[x+16,y-33,12,15],[x+w-34,y-27,16,10],[x+w/2+5,y-42,12,7]] as const){
   roofBlock(p,vx,vy,vw,vh,'#c7d0bc','#667d78','#344b4d');
   p.rect(vx+3,vy+3,Math.max(3,vw-6),2,'#263e49');
  }
  // Existing floorplans remain walkable. Compress the front elevation against
  // the unchanged ground line so the roof and right return occupy more of the
  // silhouette, like the reference's strongly top-down 3/4 buildings.
  c.save();c.translate(0,y+h);c.scale(1,.76);c.translate(0,-(y+h));
  p.round(x,y,w,h,3,t.ink);p.gradient(x+3,y+3,w-6,h-7,'#e3d8bc',t.floorDark);
  p.material(x+5,y+6,w-10,h-14,'stone',v.x+v.y);
  for(let row=0;row<5;row++){
   const yy=y+7+row*8,offset=row%2?0:7;
   p.line([[x+6+offset,yy],[x+w-7,yy]],'#3146512c',.6);
   for(let xx=x+7+offset;xx<x+w-8;xx+=19)p.line([[xx,yy],[xx,yy+7]],'#f4ead02d',.5);
  }
  p.poly([[x-8,y-24],[x+w/2,y-34],[x+w+8,y-24],[x+w+8,y+5],[x-8,y+5]],t.ink);
  p.poly([[x-5,y-24],[x+w/2,y-31],[x+w+5,y-24],[x+w+5,y+1],[x-5,y+1]],style===3?'#526b54':style===5?'#a65554':t.accent);
  for(let yy=y-23;yy<y;yy+=7){p.line([[x-3,yy],[x+w+3,yy]],'#dae0d066',1);for(let xx=x+3;xx<x+w;xx+=14){p.line([[xx,yy+1],[xx,yy+5]],'#30475855',1);p.rect(xx+2,yy+2,2,1,'#eff0cf25');}}
  p.rect(x-8,y+2,w+16,4,t.wood);p.rect(x-7,y+2,w+14,1,t.metal);
  for(let xx=x+13;xx<x+w-18;xx+=35){p.shadow(xx,y+14,26,25);p.round(xx,y+14,26,25,1,'#5e6e7b');p.gradient(xx+2,y+16,22,20,'#a5c9c9','#7198a6');p.poly([[xx+3,y+17],[xx+10,y+17],[xx+5,y+31],[xx+3,y+31]],'#f6f3da42');p.rect(xx+4,y+17,3,17,'#e5ecce88');p.rect(xx+12,y+16,1,20,'#d8d9bc');p.rect(xx-1,y+38,28,2,t.wood);p.rect(xx,y+40,27,1,'#354c5266');}
  // Raised storefront sign and miniature machine badge identify each usable shop.
  // A deep glass display bay replaces the flat emblem panel with a visible
  // showroom window and a small machine displayed behind its shelves.
  p.round(x+7,y+46,w-14,25,2,t.wood);p.round(x+10,y+48,w-20,21,1,'#31484d');
  p.gradient(x+12,y+50,w-24,17,'#a8c9c4','#587986');
  for(let shelf=0;shelf<2;shelf++)p.rect(x+14,y+56+shelf*7,w-28,1,'#e2d8b8');
  p.wheel(x+w/2-14,y+61,6,t.metal);p.wheel(x+w/2+14,y+61,6,t.metal);p.poly([[x+w/2-20,y+58],[x+w/2-7,y+52],[x+w/2+12,y+54],[x+w/2+21,y+59]],t.accent);
  p.poly([[x+w/2-10,y+56],[x+w/2-4,y+53],[x+w/2+6,y+54],[x+w/2+10,y+57]],'#e8efdc');p.poly([[x+w/2-8,y+56],[x+w/2-3,y+54],[x+w/2+4,y+55],[x+w/2+8,y+57]],'#527582');p.rect(x+w/2-22,y+60,4,2,'#f3d48a');p.rect(x+w/2+19,y+60,4,2,'#f3d48a');
  for(const bx of [x+18,x+w-26])p.rect(bx,y+59,7,6,bx%2?t.light:t.accent);
  const shopNames:Record<string,string>={komorebi:'こもれび模型店',aozora:'あおぞら模型店',hinata:'ひなた模型店',wakaba:'わかば模型店',yuunagi:'ゆうなぎ模型店',akatsuki:'あかつき模型店',hoshikuzu:'ほしくず模型店',atelier:'星霧模型工房',endurance:'持久力パーツ館',torque:'トルク専門店',velocity:'スピード専門店',terrain:'オフロード専門店'};
  const signX=x+14,signY=y+7,signW=w-28;p.round(signX+2,signY+2,signW,14,2,'#21384488');p.round(signX,signY,signW,14,2,t.wood);p.round(signX+2,signY+2,signW-4,10,1,t.ink);p.rect(signX+3,signY+2,signW-6,1,t.light);
  c.save();c.font='bold 6px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillStyle='#fff0ca';c.fillText(shopNames[shopId]??v.name,signX+signW/2,signY+7,signW-8);c.restore();
  for(let i=0;i<12;i++){const xx=x+4+i*(w-8)/12;p.rect(xx,y+76,(w-8)/12,7,i%2?'#e4dec6':t.accent);p.rect(xx,y+83,(w-8)/12-1,3,i%2?'#b9b39e':t.wood);}
  for(const xx of [x+12,x+w-62]){p.round(xx-2,y+90,54,42,2,'#344a50');p.round(xx,y+92,50,37,2,t.ink);p.gradient(xx+3,y+94,44,30,'#a3c8c7','#6d969e');p.poly([[xx+5,y+95],[xx+16,y+95],[xx+8,y+123],[xx+5,y+123]],'#f6efcc66');p.rect(xx+4,y+94,41,.7,'#eff0d9');for(let i=0;i<4;i++){p.rect(xx+5+i*10,y+115,8,9,[t.accent,'#b87e78','#c6b884','#829fb0'][i]);p.rect(xx+6+i*10,y+116,6,1,'#eee5c6');p.rect(xx+7+i*10,y+118,1,4,'#32464a');}p.rect(xx+2,y+130,50,2,t.wood);p.rect(xx+4,y+132,46,1,'#3b4e4d');}
  const dx=x+w/2-14;p.round(dx,y+91,28,h-94,2,t.ink);p.gradient(dx+3,y+94,22,25,'#c7d9cc','#7b9fa9');p.rect(dx+21,y+123,3,3,'#dec388');p.gradient(x+4,y+h-6,w-8,6,'#d1c6aa','#8a8a7c');
  p.plant(x+4,y+h-4,.75);p.plant(x+w-5,y+h-4,.75);
  if(v.id==='hinata'){p.wheel(x+20,y+h-14,9,'#aa9170');p.wheel(x+22,y+h-21,9,'#b5a281');}
  if(v.id==='wakaba')for(let i=0;i<7;i++){p.ellipse(x+3+i*4,y+75-i%3*4,4,2,'#719969');p.ellipse(x+w-6-i*3,y+75-i%3*3,3,2,'#8ca979');}
  if(v.id==='aozora'){p.rect(x+w-11,y-12,1,26,'#d2dbd1');p.poly([[x+w-10,y-12],[x+w+9,y-7],[x+w-10,y+2]],'#84b8cb');}
  if(v.id==='yuunagi')for(let i=0;i<3;i++)p.line([[x+15,y+57+i*4],[x+20,y+55+i*4],[x+25,y+59+i*4],[x+30,y+57+i*4]],'#a9b9d7',1);
  if(v.id==='akatsuki')p.trophy(x+w-21,y+49,.4);
  if(v.id==='hoshikuzu')for(const xx of [x+20,x+w-20]){p.line([[xx,y+49],[xx,y+68]],'#e7d5a2',2);p.line([[xx-7,y+58],[xx+7,y+58]],'#e7d5a2',2);}
  if(v.id==='torque'){p.ellipse(x+23,y+58,10,10,t.ink);p.ellipse(x+23,y+58,5,5,t.accent);for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+23+Math.cos(a)*8,y+58+Math.sin(a)*8],[x+23+Math.cos(a)*13,y+58+Math.sin(a)*13]],t.ink,3);}}
  if(v.id==='velocity')for(let i=0;i<3;i++)p.line([[x+12+i*7,y+49],[x+20+i*7,y+57],[x+12+i*7,y+65]],t.light,2);
  if(v.id==='terrain'){p.poly([[x+9,y+66],[x+22,y+46],[x+36,y+66]],t.ink);p.poly([[x+17,y+54],[x+22,y+46],[x+28,y+55]],t.light);}
  if(v.id==='atelier'){p.ellipse(x+23,y+58,7,7,'#a6a0bc');p.ellipse(x+23,y+58,3,3,t.ink);for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+23+Math.cos(a)*6,y+58+Math.sin(a)*6],[x+23+Math.cos(a)*9,y+58+Math.sin(a)*9]],'#c7bed6',1.5);}}
  c.restore();
 }

 // Roof grain, masonry corners, drainpipes and contact shading share the town palette.
  // Side-wall corner shade keeps the front and return plane visually separate.
  p.poly([[x+w-23,y+13],[x+w+19,y-12],[x+w+19,y+h-13],[x+w-23,y+h-5]],'#243a3f55');
 p.rect(x+3,y+6,1,h-12,'#fff0cf66');p.rect(x+w-5,y+7,2,h-12,'#334c4c33');
 for(let yy=y+8;yy<y+h-9;yy+=9){p.rect(x+4,yy,4,.5,'#efe3bd60');p.rect(x+w-9,yy+3,5,.5,'#334b4e22');}
 if(v.kind==='shop'){
  p.rect(x+w+1,y+7,2,h-11,'#476364');p.rect(x+w+1,y+8,.5,h-14,'#c4c9af');
  for(const yy of [y+28,y+67,y+h-10])p.rect(x+w,yy,4,1,'#344d57');
  p.material(x+5,y+40,w-10,5,'wood',3);p.material(x+5,y+h-11,w-10,7,'stone',7);
 }
 p.rect(x+3,y+h-4,w-6,1,'#e5d3a177');
 // 入口の視覚的な案内。閉鎖時は鎖と鍵、開放時は床の三角形。
 if(open){p.poly([[x+w/2-7,y+h+14],[x+w/2+7,y+h+14],[x+w/2,y+h+22]],'#e5d8a4');}
 else{p.round(x+w/2-17,y+h-30,34,22,3,'#26394be8');p.round(x+w/2-6,y+h-37,12,13,6,'#c9b87d');p.round(x+w/2-9,y+h-29,18,14,3,'#ebd99d');p.ellipse(x+w/2,y+h-23,2,2,'#596174');}
 c.globalAlpha=1;
}
export function drawVenueFacade(scene:Phaser.Scene,v:TownVenue,open:boolean){
 const key=`facade-v9-${v.id}-${open}`,width=v.w+80,height=v.h+145,resolution=1;
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,width*resolution,height*resolution)!;t.context.scale(resolution,resolution);paintVenueFacade(new SceneryPen(t.context),v,open);t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}
 scene.add.image(v.x-40,v.y-91,key).setOrigin(0).setDisplaySize(width,height).setDepth(v.y+v.h);
}
