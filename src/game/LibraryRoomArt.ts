import type Phaser from 'phaser';
import {SceneryPen} from './SceneryCanvas';
import {libraryShelves,libraryTables,libraryReadingDesk} from '../data/libraryRoom';
function book(p:SceneryPen,x:number,y:number,w=28){p.poly([[x,y+3],[x+w/2,y+7],[x+w,y+3],[x+w,y+19],[x+w/2,y+23],[x,y+19]],'#eee2bb');p.line([[x+w/2,y+7],[x+w/2,y+23]],'#a58b61',1);for(let i=0;i<3;i++){p.line([[x+3,y+8+i*4],[x+w/2-3,y+11+i*4]],'#b9a680',1);p.line([[x+w/2+3,y+11+i*4],[x+w-3,y+8+i*4]],'#b9a680',1);}}
export function drawLibraryRoom(scene:Phaser.Scene){
 const texture=(key:string,w:number,h:number,paint:(p:SceneryPen)=>void)=>{if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,w*2,h*2)!;t.context.scale(2,2);paint(new SceneryPen(t.context));t.refresh();}};
 texture('library-room-floor',960,640,p=>{
  p.rect(0,0,960,640,'#263b42');p.gradient(40,26,880,104,'#78918b','#b7c4aa');
  for(let x=50;x<920;x+=16){p.rect(x,28,1,98,'#d1d5bd33');p.rect(x+8,28,1,98,'#324b4d16');}
  for(const x of [126,354,582,810]){p.round(x-48,43,96,62,3,'#465f67');p.gradient(x-44,47,88,54,'#c6e3d3','#82aead');p.rect(x-1,47,2,54,'#e9e4c9');p.rect(x-44,72,88,2,'#e9e4c9');p.rect(x-51,105,102,6,'#b6a37d');p.glow(x,101,90,'#fff0b827');}
  p.rect(40,124,880,9,'#73664f');p.rect(40,124,880,2,'#e2c991');
  for(let row=0,y=133;y<598;y+=22,row++)for(let x=40-(row%2)*48;x<920;x+=96){const shades=['#b8ad8d','#b5aa89','#c2b393','#afaa8c'];p.rect(Math.max(40,x),y,Math.min(96,920-Math.max(40,x)),22,shades[(row+Math.floor(x/96)+8)%4]);p.rect(Math.max(40,x),y,1,22,'#8c8a752f');p.rect(Math.max(40,x),y+21,96,1,'#777b6727');for(let j=0;j<4;j++)p.rect(x+8+j*19,y+4+j%3,10+j*2,1,'#e2d4b32b');}
  p.round(362,402,236,147,5,'#697e7c');p.round(368,408,224,135,3,'#84998e');p.line([[377,418],[582,418],[582,533],[377,533],[377,418]],'#c2c6a4',2);
  p.rect(40,596,880,16,'#615d4d');p.rect(40,596,880,3,'#ddc696');p.rect(440,596,80,16,'#45616b');p.poly([[471,602],[489,602],[480,611]],'#e8d2a2');
  for(const x of [70,890])p.plant(x,556,1.2);
 });scene.add.image(0,0,'library-room-floor').setOrigin(0).setDisplaySize(960,640).setDepth(-10);
 for(const [index,s] of libraryShelves.entries()){
  const key=`library-shelf-${index}`;texture(key,s.w+16,s.h+60,p=>{p.shadow(4,38,s.w+4,21);p.round(4,5,s.w+8,s.h+36,3,'#5b594a');p.gradient(7,8,s.w+2,s.h+30,'#ac9571','#817759');p.rect(11,11,s.w-6,s.h+21,'#4c5c55');for(let row=0;row<3;row++){const y=14+row*24;for(let col=0;col<Math.floor((s.w-10)/8);col++){const h=12+(index+col)%4*2,x=13+col*8;p.rect(x,y+19-h,6,h,['#8da49a','#ac8069','#b7a270','#738e9a','#a9989f'][(index+col+row)%5]);p.rect(x+1,y+21-h,1,h-4,'#e3d4b66f');p.rect(x+1,y+13,4,1,'#f1dfbb66');}p.rect(9,y+20,s.w-2,4,'#c2ac80');p.rect(9,y+23,s.w-2,2,'#73664e');}p.rect(4,s.h+37,s.w+8,5,'#685e49');});
  scene.add.image(s.x-8,s.y-42,key).setOrigin(0).setDisplaySize(s.w+16,s.h+60).setDepth(s.y+s.h);
 }
 for(const [i,t] of libraryTables.entries()){
  const key=`library-table-${i}`;texture(key,t.w+20,t.h+56,p=>{p.shadow(5,37,t.w+9,t.h);for(const x of [17,t.w-7]){p.rect(x,50,8,48,'#6b6850');p.rect(x+2,51,2,45,'#b7a17a');}p.round(5,17,t.w+10,t.h+12,5,'#74684f');p.gradient(7,17,t.w+6,t.h+5,'#ceb78e','#ad9b78');for(let j=0;j<5;j++)p.line([[14,25+j*9],[t.w+4,25+j*9]],'#ead5ad33',1);book(p,33,36,35);book(p,t.w-63,36,32);p.rect(t.w/2+3,26,4,34,'#657e7b');p.ellipse(t.w/2+5,25,13,5,'#d2c29a');p.glow(t.w/2+5,31,28,'#ffefa939');});scene.add.image(t.x-10,t.y-32,key).setOrigin(0).setDisplaySize(t.w+20,t.h+56).setDepth(t.y+t.h);
 }
 const d=libraryReadingDesk;texture('library-lectern',100,92,p=>{p.shadow(10,47,80,30);p.rect(21,43,7,41,'#73684f');p.rect(72,43,7,41,'#73684f');p.gradient(7,12,86,46,'#c0ab80','#8f8160');p.line([[9,58],[92,58]],'#e0c693',3);book(p,27,18,47);});scene.add.image(d.x-10,d.y-36,'library-lectern').setOrigin(0).setDisplaySize(100,92).setDepth(d.y+d.h);
}
