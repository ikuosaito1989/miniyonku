import {drawPaintedScenery,drawPaintedFixture} from './PaintedScenery';
import type Phaser from 'phaser';
import {officialFixturesFor} from '../data/officialVenue';
import {getCircuitTrack} from '../data/circuit';
import {drawShopTrack} from './ShopTrackArt';
import {SceneryPen} from './SceneryCanvas';

export function paintArena(p:SceneryPen,id:string){
 const accent=id==='stadium-5'?'#74b8a2':id==='stadium-9'?'#b19bd2':id==='stadium-10'?'#df9c83':'#e7c783';
 const dark=id==='stadium-5'?'#244e54':id==='stadium-9'?'#3c3c67':id==='stadium-10'?'#573645':'#263454';
 p.rect(0,0,960,640,'#111e30');p.gradient(40,35,880,570,'#94a7ab','#bac1b7');
 for(let y=115,row=0;y<605;y+=28,row++)for(let x=40;x<920;x+=28){p.rect(x+1,y+1,27,27,(Math.floor(x/28)+row)%2?'#b9c5be':'#a4b4af');p.line([[x+3,y+4],[x+16,y+17],[x+22,y+14]],'#dbe6d52b',.6);}
 // 遠景の観客席・大屋根・照明トラス。中央の走行空間を明確に。
 p.gradient(40,35,880,79,'#14273e',dark);for(let row=0;row<3;row++)for(let i=0;i<70;i++){const x=51+i*12.3,y=45+row*17;p.round(x,y+6,9,8,2,[dark,'#6d7592','#788f97'][row]);p.ellipse(x+4,y+2,3,3,['#d9aa8d','#efccb0','#b4816d'][i%3]);p.round(x+1,y+5,7,6,2,['#a9858b','#678da2','#c0aa74','#6f9b8e'][i%4]);}
 p.gradient(40,98,880,16,'#7a8b9a','#233d56');p.rect(40,105,880,3,accent);p.rect(40,112,880,3,'#fff1c8');
 p.line([[45,36],[915,36]],'#a6b9bf',4);for(let x=48;x<908;x+=36)p.line([[x,36],[x+18,52],[x+36,36],[x+18,36],[x+36,52]],'#607a8d',1.5);
 for(const x of [87,264,696,873]){p.round(x-20,39,40,12,3,'#334a60');for(let i=0;i<5;i++)p.round(x-16+i*7,41,5,7,1,'#fff1ba');p.glow(x,83,74,'#fff0b728');p.poly([[x-10,51],[x+10,51],[x+54,114],[x-54,114]],'#fff4c00c');}
 // 優勝トロフィーの大型デジタルビジョン。抽象のレース映像、文字なし。
 p.shadow(348,38,264,66);p.round(348,38,264,66,7,'#142437');p.round(352,42,256,58,5,accent);p.gradient(355,45,250,52,dark,'#182b45');
 p.trophy(480,48,1.3);for(const side of [-1,1]){const x=480+side*79;p.checker(x-22,61,44,18,6);for(let i=0;i<4;i++)p.line([[x-29+i*5,87],[x-4+i*5,87]],accent,1);}
 // 金縁の入場カーペット・床のサーキットパターン。
 p.round(416,441,128,162,2,dark);p.rect(419,442,2,156,accent);p.rect(539,442,2,156,accent);for(let y=451;y<593;y+=8)p.rect(425,y,108,.6,'#c6b99122');
 p.ellipse(480,497,38,23,accent+'40');p.trophy(480,480,.75);p.checker(435,561,90,14,7);p.poly([[473,584],[487,584],[480,593]],'#f6dfac');
 for(const x of [48,899]){p.gradient(x,117,13,440,'#b6c2c1','#5e7a8a');p.rect(x+2,119,2,436,'#e4e5ce');p.rect(x+9,119,2,436,accent);}
 // 入口のエアロアーチ、チェッカー旗、光沢のある縁。
 for(const x of [71,871]){p.rect(x,535,16,52,dark);p.rect(x+2,536,3,48,accent);p.line([[x+8,530],[x+8,496]],'#708b99',2);p.checker(x+9,497,27,19,5);}
}
export function drawOfficialVenue(scene:Phaser.Scene,id='stadium-5'){
 const key=`arena-v3-${id}`;
 if(!scene.textures.exists(key)){const texture=scene.textures.createCanvas(key,1920,1280)!;texture.context.scale(2,2);paintArena(new SceneryPen(texture.context),id);texture.refresh();}
 if(!drawPaintedScenery(scene,id))scene.add.image(0,0,key).setOrigin(0).setDisplaySize(960,640).setDepth(-20);
 const accent=id==='stadium-5'?0x77b79f:id==='stadium-9'?0xb19bd2:id==='stadium-10'?0xdf9c83:0xe7c783;
 for(const f of officialFixturesFor(id)){
  const {x,y,w,h}=f,tk=`arena-fixture-${id}-${f.id}`;
  if(!scene.textures.exists(tk)){const t=scene.textures.createCanvas(tk,(w+10)*2,(h+12)*2)!;t.context.scale(2,2);const p=new SceneryPen(t.context);p.shadow(0,0,w,h);p.round(0,0,w,h,5,'#20394e');p.gradient(2,2,w-4,h-5,'#d8d7c1','#6b8394');p.rect(5,5,w-10,2,`#${accent.toString(16)}`);
   if(f.id.startsWith('stand')){for(let row=0;row<3;row++){p.gradient(6,7+row*17,w-12,17,'#8da4a6','#4f6b7d');for(let i=0;i<11;i++){const xx=12+i*15,yy=9+row*17;p.round(xx,yy+3,11,9,2,['#987f8a','#648d9e','#baaa7b','#7d9d89'][i%4]);p.ellipse(xx+5,yy,3,3,['#dfb397','#bc967c','#f1c8a4'][i%3]);p.rect(xx+4,yy-3,6,2,['#4c4556','#72544f','#333c50'][i%3]);}p.rect(5,21+row*17,w-10,1,'#e9dfb9');}}
   else if(f.id==='pit'){p.round(7,14,w-14,h-28,4,'#3c6065');for(let xx=12;xx<w-10;xx+=9)p.line([[xx,17],[xx,h-17]],'#a9c8aa33',.5);for(let i=0;i<3;i++){p.round(15+i*32,24,25,27,3,'#b4c6c1');p.wheel(27+i*32,36,7,'#d2bb84');p.rect(16+i*32,58,3,26,'#b6c6c1');p.round(13+i*32,76,9,17,2,['#b7807d','#7c9bb1','#d2b67b'][i]);}p.wheel(w/2,h-25,9,'#dad5b3');}
   else if(f.id==='reception'){p.gradient(7,13,w-14,h-21,'#dfcd9f','#9d8866');p.round(13,19,34,24,2,'#344d63');p.gradient(16,22,28,17,'#80b6bd','#426980');p.round(10,45,41,5,1,'#d7d9c9');p.round(w-38,21,24,25,2,'#eee3bd');p.checker(w-35,25,18,12,3);p.rect(w-35,42,18,1,'#ad9e79');}
   else {p.round(7,12,w-14,h-23,5,'#334e5c');p.rect(9,h-12,w-18,2,`#${accent.toString(16)}`);for(const xx of [12,w-19]){p.rect(xx,h-7,6,8,'#7d959e');}}
   t.refresh();}
  if(!drawPaintedFixture(scene,id,f))scene.add.image(x,y,tk).setOrigin(0).setDisplaySize(w+10,h+12).setDepth(y+h);
  if(['speed','dirt','technical','final','zenith'].includes(f.id)){
   const track=getCircuitTrack(f.id==='zenith'?'zenith':f.id==='final'?'grandprix':f.id==='technical'?'comet':f.id==='dirt'?'sun':'sprint');
   drawShopTrack(scene,{...f,x:x+8,y:y+12,w:w-16,h:h-28,kind:'track',text:''},track,y+h+1,scene.textures.exists(`painted-scenery-${id}`));
   const g=scene.add.graphics().setDepth(y+h+2);g.lineStyle(2,accent).strokeRoundedRect(x+5,y+7,w-10,h-15,6);for(const xx of [x+5,x+w-7])g.fillStyle(0xffeac0).fillRect(xx,y+9,2,h-21);
  }
 }
}
