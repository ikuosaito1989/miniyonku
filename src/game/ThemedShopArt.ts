import {isPracticeCourse} from '../data/practiceCourses';
import {isSpecialtyShop} from '../data/specialtyParts';
import {drawPaintedScenery,drawPaintedFixture} from './PaintedScenery';
import Phaser from 'phaser';
import type {ShopId} from '../data/world';
import {shopThemes,type ShopTheme} from '../data/shopThemes';
import type {Fixture} from '../data/shop';
import {SceneryPen} from './SceneryCanvas';

function texture(scene:Phaser.Scene,key:string,w:number,h:number,paint:(p:SceneryPen)=>void){
 if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,Math.ceil(w*2),Math.ceil(h*2))!;t.context.scale(2,2);paint(new SceneryPen(t.context));t.refresh();}
 scene.textures.get(key).setFilter(Phaser.Textures.FilterMode.NEAREST);
 return key;
}
function car(p:SceneryPen,x:number,y:number,s:number,color:string){
 p.round(x-18*s,y-9*s,36*s,20*s,3*s,'#263541');for(const side of [-1,1])for(const end of [-1,1]){p.round(x+side*16*s-3*s,y+end*6*s-3*s,6*s,7*s,2*s,'#24313e');p.rect(x+side*17*s,y+end*6*s-2*s,1.5*s,4*s,'#a2b9ba');}
 p.poly([[x-12*s,y-11*s],[x+10*s,y-9*s],[x+15*s,y+10*s],[x-16*s,y+9*s]],color);p.poly([[x-8*s,y-5*s],[x+6*s,y-4*s],[x+8*s,y+2*s],[x-9*s,y+1*s]],'#254556');p.line([[x-11*s,y+4*s],[x+10*s,y+5*s]],'#f4e4bc',2*s);p.rect(x-2*s,y+4*s,3*s,7*s,'#f9e4ac');p.rect(x-19*s,y-12*s,38*s,2*s,'#b5c8c5');p.rect(x-18*s,y+12*s,36*s,2*s,'#b5c8c5');
}
function icon(p:SceneryPen,x:number,y:number,id:ShopId){
 const t=shopThemes[id];p.ellipse(x,y,20,20,t.ink);p.ellipse(x,y,18,18,t.accent);
 if(id==='torque'){p.wheel(x,y,12,t.light);p.ellipse(x,y,4,4,t.ink);}
 else if(id==='velocity'){for(let i=0;i<3;i++)p.line([[x-12+i*7,y-8],[x-4+i*7,y],[x-12+i*7,y+8]],t.light,2);}
 else if(id==='terrain'){p.poly([[x-13,y+9],[x,y-12],[x+13,y+9]],t.light);p.poly([[x-6,y-2],[x,y-12],[x+6,y-2]],t.ink);}
 else if(id==='atelier'){for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+Math.cos(a)*7,y+Math.sin(a)*7],[x+Math.cos(a)*14,y+Math.sin(a)*14]],t.light,2);}p.ellipse(x,y,5,5,t.light);}
 else if(id==='wakaba'||id==='komorebi'){p.poly([[x,y+12],[x-10,y-3],[x-4,y-12],[x+9,y-11],[x+7,y+1]],'#e4e5b7');p.line([[x,y+12],[x+2,y-7]],t.ink,1.5);}
 else if(id==='hinata'){p.wheel(x,y,12,t.light);}
 else if(id==='yuunagi'){for(let i=0;i<3;i++)p.line([[x-12,y-6+i*6],[x-5,y-9+i*6],[x+4,y-3+i*6],[x+12,y-6+i*6]],t.light,2);}
 else if(id==='akatsuki')p.trophy(x,y-11,.65);
 else {p.ellipse(x,y,10,10,t.light);for(let i=0;i<8;i++){const a=i*Math.PI/4;p.line([[x+Math.cos(a)*12,y+Math.sin(a)*12],[x+Math.cos(a)*15,y+Math.sin(a)*15]],t.light,1.4);}}
}
export function paintShopRoom(p:SceneryPen,id:ShopId){
 const t=shopThemes[id],c=p.c;p.rect(0,0,960,640,t.ink);p.gradient(40,35,880,570,t.wall,t.floorDark);
 // 素材そのものを作り分ける。家具の通路・衝突座標は維持。
 c.save();c.beginPath();c.rect(40,115,880,489);c.clip();p.rect(40,115,880,489,t.floor);
 if(t.pattern==='parquet'||t.pattern==='deck'){
  for(let y=116,row=0;y<602;y+=18,row++)for(let x=40-row%2*80;x<920;x+=160){p.rect(Math.max(40,x),y,Math.min(158,920-Math.max(40,x)),17,row%3?t.floor:t.floorDark);for(let k=0;k<4;k++)p.line([[Math.max(40,x)+4,y+3+k*3],[Math.min(917,x+153),y+4+k*3]],'#f6e3b414',.6);p.line([[Math.max(40,x),y+17],[Math.min(920,x+160),y+17]],t.floorDark,.7);}
 }else if(t.pattern==='marble'||t.pattern==='mosaic'){
  for(let y=116,row=0;y<602;y+=44,row++)for(let x=40,col=0;x<920;x+=44,col++){p.rect(x+.5,y+.5,43,43,(row+col)%2?t.floor:t.floorDark);p.line([[x+3,y+4],[x+16,y+17],[x+20,y+14],[x+40,y+35]],'#d5c1ae18',.8);if(t.pattern==='mosaic')p.poly([[x+22,y+7],[x+37,y+22],[x+22,y+37],[x+7,y+22]],'#bba6cf18');}
  p.line([[69,136],[891,136],[891,577],[69,577],[69,136]],t.metal,2);p.line([[74,141],[886,141],[886,572],[74,572],[74,141]],'#dfc18755',.7);
 }else if(t.pattern==='stone'||t.pattern==='tile'){
  const cell=t.pattern==='stone'?36:48;for(let y=116,row=0;y<604;y+=cell,row++)for(let x=40;x<920;x+=cell){p.rect(x+1,y+1,cell-1,cell-1,(Math.floor(x/cell)+row)%3?t.floor:t.floorDark);p.line([[x+2,y+2],[x+cell-2,y+2]],'#f6f6da55',.8);}
 }else{
  for(let i=0;i<1600;i++){const x=42+(i*137%877),y=118+(i*79%481);p.rect(x,y,1.5,.7,i%3?'#f0ebd824':'#3d44401a');}for(let x=40;x<920;x+=110)p.line([[x,116],[x,603]],'#4b4d4b38',1);p.line([[40,355],[920,355]],'#4b4d4b30',1);
  for(const x of [74,870])for(let y=128;y<598;y+=24){p.poly([[x,y],[x+14,y],[x+4,y+12],[x-10,y+12]],'#d6af5f66');}
 }
 if(isSpecialtyShop(id)){for(let i=0;i<2800;i++){const x=42+(i*137%877),y=118+(i*79%481);p.rect(x,y,i%4?1:.65,i%3?.6:1.2,i%3?'#f6f1db28':'#3e534125');}for(let y=116;y<604;y+=48)p.line([[40,y],[920,y]],'#4f605328',.7);}
 if(isPracticeCourse(id)){p.checker(44,117,872,9,8);for(let i=0;i<16;i++){const x=66+i*54;p.line([[x,124],[x,137]],t.metal,1);p.poly([[x,125],[x+20,129],[x,137]],i%2?t.accent:t.light);}}
 c.restore();
 // アーキテクチャ：柱・窓・梁・展示壁をスタイルごとに変更。
 p.gradient(40,35,880,80,t.wall,t.ink);p.rect(40,108,880,8,t.wood);p.rect(40,109,880,1,t.metal);
 if(t.style==='timber'||t.style==='garden'){
  for(const x of [48,345,648,905]){p.gradient(x,37,9,77,t.wood,t.ink);p.rect(x+1,38,2,73,'#ecd4a955');}
  for(const x of [91,390,694]){p.round(x,42,152,55,16,t.wood);p.gradient(x+4,45,144,47,'#bed1bc','#6d9793');p.rect(x+73,45,3,47,t.wood);p.rect(x+4,65,144,2,t.wood);p.poly([[x+7,47],[x+43,47],[x+19,89],[x+7,89]],'#f9efd455');}
  if(t.style==='garden')for(let x=53;x<905;x+=24){p.line([[x,36],[x+8,63],[x+5,91]],'#527658',1.4);for(let y=40;y<96;y+=12)p.ellipse(x+(y%24?7:1),y,5,2.8,y%24?'#80a16d':'#abc18b');}
 }else if(t.style==='glass'){
  for(let x=48;x<912;x+=72){p.gradient(x,38,68,65,'#b8e1e7','#54859c');p.poly([[x+3,39],[x+32,39],[x+13,100],[x+3,100]],'#effcff55');p.rect(x+63,38,5,67,'#8ea9b4');p.line([[x+3,71],[x+63,71]],'#d9eef3',1);}
  p.rect(45,105,870,3,'#ddf7fa');
 }else if(t.style==='garage'){
  for(let x=45;x<918;x+=10){p.rect(x,36,3,70,'#d5d9ca22');p.rect(x+5,36,1,70,'#283e4a22');}
  for(const x of [55,337,637,899]){p.rect(x,36,12,73,'#39484c');p.line([[x+2,40],[x+10,101],[x+2,101],[x+10,40]],'#9fa9a1',1);}
  for(const x of [125,430,737]){p.rect(x,43,86,9,'#263943');p.gradient(x+2,44,82,5,'#f9eac1','#d8b66e');p.glow(x+43,80,73,'#f9df9d30');}
 }else if(t.style==='harbor'){
  for(let x=60;x<905;x+=98){p.ellipse(x+25,69,25,27,t.wood);p.ellipse(x+25,68,21,23,t.metal);p.ellipse(x+25,68,18,20,'#4c678e');p.poly([[x+13,53],[x+23,49],[x+17,84],[x+11,80]],'#afc9da88');for(let i=0;i<8;i++){const a=i*Math.PI/4;p.ellipse(x+25+Math.cos(a)*23,68+Math.sin(a)*25,1,1,'#f8e2b4');}}
  p.line([[52,102],[901,102]],'#c4ac8a',2.5);
 }else{
  for(let x=47;x<914;x+=88){p.round(x,39,78,61,15,t.wood);p.round(x+3,42,72,55,13,t.ink);p.line([[x+9,90],[x+9,58],[x+39,44],[x+69,58],[x+69,90]],t.metal,1);p.rect(x+10,95,58,2,t.metal);}
  for(const x of [75,480,881]){p.glow(x,63,45,'#ffe3aa30');p.trophy(x,48,.7);}
 }
 // 台座、光沢、光の反射。文字の代わりに店固有のシンボル。
 icon(p,294,74,id);p.rect(40,599,880,12,t.wood);p.rect(40,600,880,1,t.metal);
 p.round(410,571,140,28,4,t.ink);for(let x=416;x<546;x+=5)p.rect(x,574,1,20,t.accent+'55');p.poly([[472,579],[488,579],[480,588]],t.light);
 c.save();c.beginPath();c.rect(41,117,878,452);c.clip();for(const x of [129,430,736]){p.poly([[x,117],[x+48,117],[x+205,546],[x+96,546]],t.light+'0b');}c.restore();
}
function paintFixture(p:SceneryPen,f:Fixture,t:ShopTheme){
 const w=f.w,h=f.h;p.shadow(1,0,w-6,h-7);
 const casework=()=>{p.round(0,0,w,h,4,t.ink);p.gradient(2,2,w-4,h-6,t.metal,t.wood);p.rect(4,3,w-8,2,'#f9efd999');p.rect(5,h-6,w-10,3,t.ink);p.material(4,3,w-8,h-8,'wood',Math.round(w+h));for(const x of [4,w-5])for(const y of [4,h-8]){p.rect(x,y,1,1,t.light);p.rect(x+.5,y+.5,.5,.5,t.ink);}};
 if(f.kind==='plant'){p.plant(w/2,h*.65,1.2);return;}
 if(f.kind==='track'){casework();p.round(6,6,w-12,h-12,5,t.ink);p.line([[8,h-9],[w-8,h-9]],t.metal,1);return;}
 if(f.kind==='legends'){casework();p.gradient(6,5,w-12,h-12,t.ink,'#152f40');for(let i=0;i<4;i++){const x=16+i*(w-26)/4;p.glow(x+24,31,28,t.light+'30');p.round(x,12,52,46,4,'#173543');car(p,x+26,35,.62,['#5d95d5','#d4ad5e','#b2bdc5','#6778a8'][i]);p.rect(x+3,12,45,1,t.light);p.line([[x+2,14],[x+7,52],[x+16,52],[x+12,14]],'#e3f8ec33',1);}return;}
 if(f.kind==='counter'){casework();p.gradient(5,5,w-10,h*.45,'#e7e1c7',t.wood);p.round(7,6,w*.55,h*.4,3,t.ink);p.gradient(10,9,w*.52,h*.32,'#659b9c','#264a5f');for(let i=0;i<3;i++){car(p,29+i*26,24,.35,['#c26c69','#779dc2','#d4bd72'][i]);}p.poly([[11,10],[42,10],[28,37],[11,37]],'#e4f0da33');p.round(w-41,9,28,17,2,'#354955');p.rect(w-37,12,20,9,'#a3c8b7');p.round(w-45,29,36,5,1,'#d8d0b3');p.rect(w-63,11,12,17,'#e3d6b5');for(let i=0;i<4;i++)p.rect(w-61,14+i*3,8,1,'#9f977e');p.rect(5,h*.5,w-10,h*.42,t.wood);for(let x=15;x<w-10;x+=23)p.line([[x,h*.54],[x,h-11]],'#fae3bb22');p.rect(8,h*.54,w-16,1,t.metal);return;}
 if(f.kind==='bookshelf'){casework();for(let row=0;row<2;row++){p.rect(6,6+row*20,w-12,17,t.ink);for(let i=0;i<13;i++){const x=9+i*(w-20)/13;p.rect(x,8+row*20,8,14,['#9d5a68','#5f8b99','#bba15c','#7b9c7e'][i%4]);p.rect(x+1,8+row*20,1,14,'#eee4bf88');p.rect(x+2,11+row*20,5,1,'#e5dcbd');}p.rect(5,23+row*20,w-10,2,t.metal);}return;}
 if(f.kind==='board'){casework();p.gradient(5,5,w-10,h-10,'#294d5b','#1a3344');for(let row=0;row<5;row++){const y=17+row*15;p.ellipse(11,y,3,3,['#e0c584','#a3bac0','#b99478'][Math.min(row,2)]);p.rect(19,y-1,w-29,2,'#92ac9f88');}return;}
 if(f.kind==='shelf'){casework();for(let row=0;row<3;row++){const y=6+row*(h-17)/3;p.rect(6,y,w-12,(h-17)/3-4,t.ink);for(let i=0;i<4;i++){const x=9+i*(w-18)/4;p.round(x,y+3,(w-25)/4,(h-17)/3-10,1,'#e4e5d8');p.rect(x,y+3,(w-25)/4,3,[t.accent,'#b2867a','#748fa0','#b6aa76'][(i+row)%4]);car(p,x+(w-25)/8,y+14,.24,[t.accent,'#be6f76','#759eb4'][i%3]);}p.rect(5,y+(h-17)/3-3,w-10,2,t.metal);}return;}
 // 精密なピット作業台：カッティングマット、治具、工具、トレー。
 casework();p.round(8,7,w-16,h-27,3,'#426b65');for(let x=14;x<w-12;x+=12)p.line([[x,9],[x,h-24]],'#b0cfad33',.5);for(let y=11;y<h-24;y+=11)p.line([[10,y],[w-10,y]],'#b0cfad33',.5);
 car(p,w*.43,h*.39,1.05,'#c25e66');for(let i=0;i<3;i++){const x=w-42+i*10;p.round(x,13,5,23,2,'#b8c6bf');p.round(x-1,31,7,9,2,['#bb716a','#63899a','#c5ac6e'][i]);p.rect(x+1,14,1,12,'#f3ecdb');}p.round(11,12,17,32,2,'#b1beb5');p.ellipse(19,21,5,5,'#55747a');p.rect(14,35,10,3,'#e2cf9e');p.rect(12,h-19,w-24,10,t.metal);for(const x of [w*.25,w*.7])p.round(x,h-17,18,3,1,t.ink);
}
export function drawThemedRoom(scene:Phaser.Scene,id:ShopId){if(drawPaintedScenery(scene,id))return;const key=texture(scene,`room-v3-${id}`,960,640,p=>paintShopRoom(p,id));scene.add.image(0,0,key).setOrigin(0).setDisplaySize(960,640).setDepth(-100);}
export function drawThemedFixture(scene:Phaser.Scene,f:Fixture,id:ShopId){if(drawPaintedFixture(scene,id,f))return;const key=texture(scene,`fixture-v3-${id}-${f.kind}-${f.w}-${f.h}`,f.w+9,f.h+10,p=>{if(isPracticeCourse(id)&&f.kind==='shelf'){const t=shopThemes[id];p.rect(0,0,f.w,f.h,t.ink);for(let row=0;row<6;row++){const y=row*29;p.gradient(2,y+1,f.w-4,26,t.metal,t.ink);for(let col=0;col<3;col++){const x=10+col*(f.w-20)/3;p.round(x,y+4,15,13,2,row%2?t.accent:t.wood);p.ellipse(x+7,y+4,4,4,['#d4b991','#bd9277','#e6c89d'][col]);p.rect(x+4,y+15,7,7,'#354e65');}}}else paintFixture(p,f,shopThemes[id]);});scene.add.image(f.x,f.y,key).setOrigin(0).setDisplaySize(f.w+9,f.h+10).setDepth(f.y+f.h);}
