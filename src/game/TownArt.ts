import Phaser from 'phaser';
import { isVenueOpen, townVenues, type WorldProgress } from '../data/world';

/** オリジナルの緑川町。屋根・窓・植栽・歩道をPhaserで描く。 */
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
  const g=scene.add.graphics();
  const rect=(x:number,y:number,w:number,h:number,color:number)=>g.fillStyle(color).fillRect(x,y,w,h);
  const text=(x:number,y:number,value:string,size=11,color='#f6f0d8',depth=0)=>scene.add.text(x,y,value,{fontFamily:'"Noto Sans JP",sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,resolution:2}).setDepth(depth);
  rect(0,0,960,640,0x354f50);rect(40,35,880,579,0x91ad78);
  for(let y=40;y<610;y+=6)for(let x=44;x<917;x+=7)rect(x,y,2,2,(x*7+y*13)%17<7?0xa7bf8a:0x82a16b);
  rect(40,256,880,190,0xa9a699);rect(40,287,880,129,0x667581);
  rect(40,282,880,5,0xe0d9bd);rect(40,416,880,5,0xded8bd);
  for(let x=48;x<910;x+=44)rect(x,349,23,3,0xe7ddba);
  // 歩道の継ぎ目・排水溝・横断歩道。
  for(let x=40;x<920;x+=22){rect(x,260,1,22,0x8f9489);rect(x,422,1,23,0x8f9489);}
  for(let y=296;y<410;y+=18)rect(340,y,44,9,0xe1dfc7);
  for(const x of [72,395,728]){rect(x,275,20,4,0x4f6369);for(let i=0;i<6;i++)rect(x+2+i*3,275,1,4,0xa5afad);}
  // 舗装された建物前の通路。
  for(const v of townVenues){
    const doorY=v.entrance==='south'?v.y+v.h:v.y-28;
    rect(v.x+43,doorY,46,30,0xc3bda4);
    for(let y=doorY+4;y<doorY+30;y+=8)rect(v.x+46,y,40,1,0xa39f89);
  }
  rect(70,65,363,57,0x3e5e59);rect(73,68,357,51,0xe8e5cc);rect(77,72,349,43,0x416860);
  text(92,78,'緑 川 町',23);text(257,86,'模型と走りのまち',12,'#d9e6cc');
  text(480,85,progress.officialQualified?'若葉レース場で公式ダート杯に出場しよう！':progress.villainDefeated?'ひなた模型店へ、紹介状を持って。':'あおぞら模型店へ、新しい走りを探しに。',12,'#2e4c47');
  for(const v of townVenues){
    const {x,y,w,h}=v,open=isVenueOpen(v,progress);
    const building=scene.add.graphics().setDepth(y+h);
    building.fillStyle(0x203c3c,.23).fillRect(x+6,y+8,w,h);
    building.fillStyle(0x52666c).fillRect(x,y,w,h);
    building.fillStyle(open?0xe1deca:0xb9bcb3).fillRect(x+3,y+8,w-6,h-11);
    building.fillStyle(v.color).fillRect(x-3,y-6,w+6,23);
    building.lineStyle(2,0xe0ded1,.5).lineBetween(x,y-3,x+w,y-3);
    for(let rx=x+8;rx<x+w;rx+=14)building.lineStyle(1,0x233e49,.25).lineBetween(rx,y-3,rx+2,y+14);
    const doorX=x+w/2-12;
    building.fillStyle(0x3c5965).fillRect(doorX,y+41,24,h-44);
    building.fillStyle(open?0x98cbd1:0x788b94).fillRect(doorX+3,y+44,18,25);
    building.fillStyle(0xe7d99a).fillRect(doorX+18,y+72,3,3);
    for(const wx of [x+10,x+w-39]){
      building.fillStyle(0x4c707d).fillRect(wx,y+42,29,29);
      building.fillStyle(open?0xafe0df:0x92a7b2).fillRect(wx+2,y+44,25,25);
      building.lineStyle(2,0xe9e7d5).lineBetween(wx+14,y+43,wx+14,y+70).lineBetween(wx,y+55,wx+28,y+55);
      if(v.kind==='shop'){
        for(let i=0;i<3;i++)building.fillStyle([0xba5d63,0xe0c66c,0x6a8db1][i]).fillRect(wx+4+i*7,y+62,5,5);
      }else{
        building.lineStyle(2,0xffe4a1).strokeRoundedRect(wx+4,y+48,20,13,5);
      }
    }
    building.fillStyle(0xf5eacb).fillRect(x+5,y+19,w-10,19);
    text(x+w/2,y+22,v.name,10,'#324e59',y+h+1).setOrigin(.5,0);
    if(!open){
      building.fillStyle(0x657582).fillRect(x+37,y+75,w-74,11);
      text(x+w/2,y+76,v.id==='stadium-5'?'ひなた優勝で出場':v.shopId==='hinata'?'紹介状が必要':'準備中',7,'#ede4c9',y+h+1).setOrigin(.5,0);
    }
    if(v.kind==='stadium')text(x+w/2,y-20,v.id==='stadium-5'?(open?'公式ダート杯・受付中':'ひなた優勝で出場権獲得'):`熟練度 ${v.stage}段階〜・準備中`,9,'#294a4c',y+h+1).setOrigin(.5,0);
    // 入場できる店の入口を地面にも表示。北側入口は通路の案内矢印。
    const entranceY=v.entrance==='south'?y+h+12:y-15;
    if(open)text(x+w/2,entranceY,v.id==='stadium-5'?'▼ 公式戦受付':'▼ 入る',10,'#314f4b',y+h+2).setOrigin(.5,0);
  }
  for(const [x,y] of [[61,243],[229,243],[397,243],[565,243],[733,243],[61,458],[397,458],[733,458],[901,445]]){
    const tree=scene.add.graphics().setDepth(y+10);
    tree.fillStyle(0x344a42,.25).fillEllipse(x+3,y+7,24,9);
    tree.fillStyle(0x806c4d).fillRect(x-3,y-13,6,21);
    tree.fillStyle(0x416c52).fillCircle(x,y-20,14);
    tree.fillStyle(0x61936a).fillCircle(x-4,y-24,10);
    tree.fillStyle(0x87ad73).fillCircle(x-7,y-29,5);
  }
  text(85,584,'人物・入口をタップ / PC：Z・Enterで調べる',10,'#294e48');
}
