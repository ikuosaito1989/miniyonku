import Phaser from 'phaser';
import {SceneryPen} from './SceneryCanvas';
import {drawRoomFinish} from './WorldDetailArt';
import {libraryShelves,libraryTables,libraryReadingDesk} from '../data/libraryRoom';

function book(p:SceneryPen,x:number,y:number,w=28){
 p.poly([[x-1,y+3],[x+w/2,y+7],[x+w+1,y+3],[x+w+1,y+22],[x+w/2,y+26],[x-1,y+22]],'#657267');
 p.poly([[x,y+2],[x+w/2,y+6],[x+w,y+2],[x+w,y+20],[x+w/2,y+24],[x,y+20]],'#b19a70');
 p.poly([[x+1,y+1],[x+w/2,y+5],[x+w-1,y+1],[x+w-1,y+18],[x+w/2,y+22],[x+1,y+18]],'#e9dbb4');
 p.poly([[x+2,y+2],[x+w/2-1,y+6],[x+w/2-1,y+20],[x+2,y+17]],'#f8ecd0');
 p.line([[x+w/2,y+6],[x+w/2,y+22]],'#9e8963',1);for(let i=0;i<4;i++){p.line([[x+4,y+6+i*3],[x+w/2-3,y+9+i*3]],'#b9a680',.5);p.line([[x+w/2+3,y+9+i*3],[x+w-4,y+6+i*3]],'#b9a680',.5);}
 p.rect(x+w*.65,y+3,1,15,'#aa7260');p.poly([[x+w*.65,y+18],[x+w*.65+2,y+18],[x+w*.65+2,y+24],[x+w*.65+1,y+22],[x+w*.65,y+24]],'#a65f5b');
}
function volume(p:SceneryPen,x:number,y:number,h:number,index:number){
 const colors=['#718e89','#a77d66','#b49c68','#607f91','#97818d','#677d62'],color=colors[index%colors.length];
 p.rect(x,y,6,h,'#374f51');p.gradient(x+1,y,5,h,color,'#53686a');p.rect(x+1,y+1,.5,h-2,'#e7d5b37a');p.rect(x+5,y+1,.5,h-2,'#30475070');
 for(const yy of [y+2,y+h-4]){p.rect(x+1,yy,4,.5,'#e4cfa2aa');p.rect(x+1,yy+1,4,.5,'#384c4d44');}
 p.rect(x+2,y+h*.42,2,3,'#d8c9a28c');p.rect(x+2.5,y+h*.42+.5,1,2,'#526a6755');
 if(index%4===0){p.rect(x+2,y+5,1,h-11,'#e2d1a855');p.rect(x+3,y+6,.5,h-13,'#304c4a33');}
}
export function drawLibraryRoom(scene:Phaser.Scene){
 const texture=(key:string,w:number,h:number,paint:(p:SceneryPen)=>void)=>{if(!scene.textures.exists(key)){const t=scene.textures.createCanvas(key,w,h)!;paint(new SceneryPen(t.context));t.refresh();t.setFilter(Phaser.Textures.FilterMode.NEAREST);}};
 texture('library-room-floor-16',960,640,p=>{
  p.rect(0,0,960,640,'#263b42');p.gradient(40,26,880,104,'#78918b','#b7c4aa');
  for(let x=50;x<920;x+=16){p.rect(x,28,1,98,'#d1d5bd33');p.rect(x+8,28,1,98,'#324b4d16');}p.material(40,28,880,100,'wood',9);
  for(const x of [126,354,582,810]){p.round(x-48,43,96,62,3,'#354f5b');p.rect(x-47,43,94,1,'#b6bda2');p.gradient(x-44,47,88,54,'#c6e3d3','#729e9f');p.poly([[x-43,48],[x-23,48],[x-37,98],[x-43,98]],'#f8efd533');p.rect(x-1,47,2,54,'#e9e4c9');p.rect(x-44,72,88,2,'#e9e4c9');p.rect(x-51,105,102,6,'#b6a37d');p.rect(x-50,105,100,1,'#e3cf9e');p.rect(x-48,111,97,3,'#3d575848');p.material(x-49,106,98,4,'wood');}
  p.rect(40,124,880,9,'#73664f');p.rect(40,124,880,2,'#e2c991');
  for(let row=0,y=133;y<598;y+=22,row++)for(let x=40-(row%2)*48;x<920;x+=96){const xx=Math.max(40,x),w=Math.min(96,920-xx);p.gradient(xx,y,w,22,['#b8ad8d','#b5aa89','#c2b393','#afaa8c'][(row+Math.floor(x/96)+8)%4],'#a49e80');p.rect(xx,y,1,22,'#7b7d6733');p.rect(xx+1,y+1,w-2,.5,'#eeddb344');p.rect(xx,y+21,w,1,'#676e5a40');p.material(xx+2,y+2,w-4,18,'wood',row+Math.floor(x/96));for(const bx of [xx+4,xx+w-5])p.rect(bx,y+4,.5,.5,'#485b5260');}
  p.round(362,402,236,147,4,'#455f62');p.round(366,406,228,139,2,'#82998c');p.line([[375,415],[585,415],[585,535],[375,535],[375,415]],'#c4b888',2);p.line([[379,419],[581,419],[581,531],[379,531],[379,419]],'#455e6133',1);p.material(379,419,202,112,'cloth',3);for(const x of [372,582])for(let y=416;y<537;y+=6)p.rect(x,y,2,2,'#acb59c');
  p.rect(40,596,880,16,'#615d4d');p.rect(40,596,880,3,'#ddc696');p.rect(440,596,80,16,'#45616b');p.poly([[471,602],[489,602],[480,611]],'#e8d2a2');for(const x of [70,890])p.plant(x,556,1.2);
 });scene.add.image(0,0,'library-room-floor-16').setOrigin(0).setDisplaySize(960,640).setDepth(-10);
 drawRoomFinish(scene,'library',[...libraryShelves.map(s=>({...s,y:s.y-42,h:s.h+60})),...libraryTables,libraryReadingDesk]);
 for(const [index,s] of libraryShelves.entries()){
  const key=`library-shelf-16-${index}`;texture(key,s.w+16,s.h+60,p=>{
   p.shadow(4,38,s.w+4,21);p.round(4,5,s.w+8,s.h+36,2,'#3d4d46');p.gradient(7,8,s.w+2,s.h+30,'#b29a73','#817759');p.material(7,8,s.w+2,s.h+30,'wood',index);p.rect(11,11,s.w-6,s.h+21,'#3f554e');p.rect(8,9,s.w,.5,'#ecd5a0');
   for(let row=0;row<3;row++){const y=14+row*24;p.rect(11,y,s.w-6,4,'#253c3b3a');for(let col=0;col<Math.floor((s.w-10)/8);col++){const h=12+(index+col)%4*2,x=13+col*8;volume(p,x,y+19-h,h,index+col+row);if(col%8===4){p.rect(x+6,y+5,1,14,'#b8b194');p.rect(x+5,y+18,3,1,'#d4c6a1');}}
    p.gradient(9,y+20,s.w-2,4,'#dcc393','#ab9168');p.rect(9,y+23,s.w-2,2,'#645c46');p.rect(11,y+25,s.w-6,1,'#233b3a30');p.material(10,y+20,s.w-4,3,'wood',row+index);
   }
   for(const x of [6,s.w+7]){p.rect(x,8,2,s.h+31,'#d3bb8850');for(const y of [10,s.h+34]){p.rect(x,y,1.5,1.5,'#e6d1a2');p.rect(x+.5,y+.5,.5,.5,'#4e5f51');}}p.rect(4,s.h+37,s.w+8,5,'#685e49');p.rect(6,s.h+37,s.w+4,1,'#c3ac80');
  });scene.add.image(s.x-8,s.y-42,key).setOrigin(0).setDisplaySize(s.w+16,s.h+60).setDepth(s.y+s.h);
 }
 for(const [i,t] of libraryTables.entries()){
  const key=`library-table-16-${i}`;texture(key,t.w+20,t.h+56,p=>{p.shadow(5,37,t.w+9,t.h);for(const x of [17,t.w-7]){p.gradient(x,50,8,48,'#8c7d58','#5c6552');p.rect(x+2,51,1,45,'#b7a17a');p.material(x,51,8,42,'wood');}p.round(5,17,t.w+10,t.h+12,3,'#655f49');p.gradient(7,17,t.w+6,t.h+5,'#d5bb8e','#ad9b78');p.material(8,18,t.w+4,t.h+3,'wood',i);p.rect(8,18,t.w+4,.5,'#f1deb3');p.rect(8,t.h+19,t.w+4,1,'#786b50');book(p,33,36,35);book(p,t.w-63,36,32);p.rect(t.w/2+3,26,4,34,'#526c6b');p.rect(t.w/2+4,27,1,30,'#b2bd9c');p.ellipse(t.w/2+5,25,13,5,'#d2c29a');p.ellipse(t.w/2+5,24,10,3,'#ece0b9');p.rect(t.w/2-2,59,15,2,'#455b5b');});scene.add.image(t.x-10,t.y-32,key).setOrigin(0).setDisplaySize(t.w+20,t.h+56).setDepth(t.y+t.h);
 }
 const d=libraryReadingDesk;texture('library-lectern-16',100,92,p=>{p.shadow(10,47,80,30);for(const x of [21,72]){p.gradient(x,43,7,41,'#a28f65','#625f4b');p.rect(x+1,44,1,38,'#c9b382');}p.rect(7,14,86,47,'#4b5749');p.gradient(7,12,86,46,'#cdb98d','#9c8b66');p.material(8,13,84,43,'wood',31);p.line([[9,58],[92,58]],'#e0c693',2);p.rect(9,13,82,.5,'#eddeb4');book(p,27,18,47);for(const x of [12,85])p.rect(x,16,1,1,'#f1dfb6');});scene.add.image(d.x-10,d.y-36,'library-lectern-16').setOrigin(0).setDisplaySize(100,92).setDepth(d.y+d.h);
}
