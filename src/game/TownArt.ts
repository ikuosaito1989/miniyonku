import Phaser from 'phaser';
import { isVenueOpen, townVenues, type WorldProgress } from '../data/world';

/** 固定シードの手描き風ピクセル風景。入口と建物の当たり判定は既存マップと共通。 */
export function drawTown(scene:Phaser.Scene,progress:WorldProgress){
  const g=scene.add.graphics();
  const rect=(x:number,y:number,w:number,h:number,c:number,a=1)=>g.fillStyle(c,a).fillRect(Math.round(x),Math.round(y),w,h);
  const noise=(x:number,y:number)=>(Math.imul(x+19,374761393)^Math.imul(y+7,668265263))>>>0;
  const text=(x:number,y:number,value:string,size=11,color='#fff1cf',depth=0)=>scene.add.text(x,y,value,{fontFamily:'"Noto Sans JP",sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,resolution:2}).setDepth(depth);
  rect(0,0,960,640,0x494654);rect(26,22,908,596,0x778269);rect(34,29,892,580,0xb0bd83);
  // 低い石積みと、日向・木陰のある草地。
  for(let y=30;y<610;y+=4)for(let x=34;x<927;x+=4){const n=noise(x,y);if(n%11<2)rect(x,y,2+n%3,1,[0xa2b57e,0xbcc88c,0x92a573,0xc8ce95][n%4]);}
  for(const y of [26,610])for(let x=28;x<930;x+=20){rect(x,y,19,8,0x62616b);rect(x+1,y,17,3,0xa7a290);rect(x+3,y+4,12,2,0x7e7b7b);}
  for(const x of [27,925])for(let y=34;y<610;y+=16){rect(x,y,8,15,0x686771);rect(x,y,6,3,0xa5a38f);}
  // 舗道は一枚色にせず、敷石ごとの欠け・目地・草の侵入を描く。
  rect(40,256,880,190,0x8d8b82);
  for(let y=256,row=0;y<446;y+=14,row++)for(let x=40;x<920;x+=22){const n=noise(x,y),ox=row%2?10:0;rect(x+ox,y,20,12,[0xc5bea3,0xbab69c,0xd0c7a8,0xb4b29b][n%4]);rect(x+ox+2,y+1,15,1,0xddd2b2,.5);}
  rect(40,290,880,124,0x696c77);
  for(let y=292;y<413;y+=4)for(let x=42;x<917;x+=5){const n=noise(x,y);if(n%5===0)rect(x,y,2,1,n%2?0x7d7c84:0x5c626e);}
  for(const y of [284,415]){rect(40,y,880,5,0x525863);rect(40,y,880,2,0xe4d7b4);for(let x=40;x<920;x+=24)rect(x,y,1,5,0x9d998f);}
  for(let x=48;x<910;x+=44)rect(x,349,23,3,0xe2d3a8);
  for(let y=297;y<410;y+=18){rect(340,y,44,8,0xd7cfb3);rect(342,y+1,40,1,0xeae1c0);}
  for(const x of [72,395,728]){rect(x,276,20,5,0x4f5661);for(let i=0;i<6;i++)rect(x+2+i*3,277,1,3,0xa5a69e);}
  for(const v of townVenues){const dy=v.entrance==='south'?v.y+v.h:v.y-28;rect(v.x+43,dy,46,30,0xafa791);for(let y=dy+2;y<dy+30;y+=7){rect(v.x+45,y,42,1,0xd8ccb0);rect(v.x+65,y,1,6,0x8e8c80);}}
  // 木製の町案内板。
  rect(72,62,5,66,0x67574e);rect(423,62,5,66,0x67574e);rect(67,62,366,58,0x53505e);rect(70,64,360,51,0xb49a72);rect(74,68,352,43,0x4d7066);rect(77,71,346,1,0x92a48a);
  text(90,76,'緑 川 町',23);text(255,86,'模型と走りのまち',12,'#e0dcb7');
  text(480,85,progress.thirdOfficialQualified?'星空レース場で第3公式大会へ。':progress.wakabaUnlocked?'わかば模型店でコーナリングを磨こう。':progress.officialQualified?'若葉レース場で一度限りの公式杯に挑もう。':progress.villainDefeated?'ひなた模型店へ、紹介状を持って。':'こもれびから始まる、小さなマシンの冒険。',11,'#4d5e53');
  // 店ごとに瓦色・壁材・日除けを変え、共通の街並みに個性を持たせる。
  for(const [index,v] of townVenues.entries()){
    const {x,y,w,h}=v,open=isVenueOpen(v,progress),b=scene.add.graphics().setDepth(y+h);
    const r=(xx:number,yy:number,ww:number,hh:number,c:number,a=1)=>b.fillStyle(c,a).fillRect(Math.round(xx),Math.round(yy),ww,hh);
    const roof=[0x626a80,0x5e7890,0xa07b65,0x657e70,0x82728b][index%5],roofLight=[0x8a8da0,0x87a0b0,0xc39b7c,0x94a487,0xad96ac][index%5];
    r(x+9,y+12,w+3,h+2,0x494a60,.26);r(x+5,y+h,w+5,5,0x535560,.16);
    r(x,y,w,h,0x575163);r(x+3,y+2,w-6,h-4,index%2?0xd8c5a0:0xe5d2ad);
    for(let yy=y+30;yy<y+h-6;yy+=8)for(let xx=x+5;xx<x+w-5;xx+=12){if(noise(xx,yy)%4===0)r(xx,yy,7,2,0xbaaa91);}
    r(x+3,y+h-12,w-6,10,0x9b8b80);for(let xx=x+5;xx<x+w-5;xx+=15){r(xx,y+h-11,13,1,0xc1b09a);r(xx,y+h-8,1,5,0x79717a);}
    // 階段状の寄棟屋根と瓦の影。外形は敷地内に収める。
    r(x-5,y-11,w+10,27,0x4c485b);r(x-2,y-15,w+4,26,roof);r(x+4,y-19,w-8,5,roofLight);
    for(let row=0;row<4;row++)for(let xx=x-1+(row%2)*6;xx<x+w;xx+=12){r(xx,y-12+row*6,11,2,roofLight);r(xx+9,y-10+row*6,2,4,0x4f5368);}
    // 瓦屋根にも店の性格を出す。青空は天窓、ひなたは換気塔、公式場は大きな紋章。
    if(index===1){r(x+22,y-8,29,16,0x454a61);r(x+25,y-7,23,11,0x9cbab5);r(x+27,y-6,4,9,0xd7d9bb);r(x+36,y-7,2,12,0x686d7c);}
    if(index===2){r(x+23,y-27,24,21,0x7b6c6a);r(x+26,y-25,18,14,0xb7a18a);for(let yy=y-23;yy<y-12;yy+=3)r(x+28,yy,14,1,0x6f636a);r(x+20,y-29,30,4,0xc0ad8f);}
    if(index===3){for(let i=0;i<6;i++){r(x+9+i*6,y+3-i%2*4,5,12,0x61785d);r(x+10+i*6,y+2-i%2*4,3,4,0xa5b17d);}}
    if(v.kind==='stadium'){r(x+w/2-13,y-15,26,27,0x4d5064);r(x+w/2-10,y-12,20,21,0xc2ab7c);r(x+w/2-7,y-9,14,14,0xeee0b4);r(x+w/2-4,y-7,8,8,v.color);r(x+w/2-1,y-4,2,12,0x8a7b6b);r(x+w/2-5,y+5,10,2,0x8a7b6b);}
    r(x-5,y+12,w+10,4,0x423f51);r(x-3,y+16,w+6,3,0x998775);
    if(v.kind==='shop'){r(x+w-25,y-29,13,19,0x6c6271);r(x+w-27,y-30,17,4,0xa19b96);r(x+w-22,y-24,4,3,0xb4a79b);}
    // 看板・木枠・反射のあるショーウィンドウ。
    r(x+5,y+20,w-10,18,0x6b5d60);r(x+7,y+21,w-14,14,0xf0ddae);r(x+9,y+23,w-18,1,0xffecc5);
    text(x+w/2,y+23,v.name,10,'#544c56',y+h+1).setOrigin(.5,0);
    const dx=x+w/2-12;r(dx-2,y+41,28,h-43,0x8b7968);r(dx,y+42,24,h-44,0x4c6268);r(dx+3,y+44,18,25,open?0x99bdb8:0x879696);r(dx+4,y+45,3,22,0xc5d4c1,.7);r(dx+17,y+70,3,3,0xead29a);r(dx+3,y+75,18,3,0x718b86);
    for(const wx of [x+10,x+w-39]){r(wx-2,y+42,33,31,0x7b6a65);r(wx,y+43,29,27,0x4b6572);r(wx+2,y+45,25,22,open?0x98bbb4:0x7d9696);r(wx+3,y+46,4,19,0xd4e0c8,.6);r(wx+13,y+44,2,25,0xe5d3aa);r(wx,y+56,29,2,0xe5d3aa);r(wx-3,y+71,35,3,0xd4bd97);
      for(let i=0;i<3;i++){r(wx+3+i*8,y+62,6,6,[0xbd7473,0xdbbc75,0x728eaa][(i+index)%3]);r(wx+4+i*8,y+63,4,2,0xf2dfbb);}}
    // 布の縞・垂れ・支持金具。
    r(x+7,y+38,w-14,5,0x645965);for(let i=0;i<10;i++){const xx=x+7+i*(w-14)/10;r(xx,y+37,(w-14)/10,5,i%2?0xe5d2a9:v.color);r(xx,y+42,(w-14)/10-1,4,i%2?0xcdbb9a:roof);}
    // 雨樋、壁灯、板の継ぎ目。輪郭の片側へ落ちる影も共通化。
    r(x+w-6,y+18,3,h-22,0x77717b);r(x+w-5,y+20,1,h-25,0xbcb9a4);r(x+w-9,y+h-8,6,3,0x77717b);
    r(x+3,y+44,4,12,0x565261);r(x+2,y+46,6,7,open?0xe9cf90:0xa9ab9b);r(x+3,y+46,2,6,open?0xffeab4:0xc5c6b3);r(x+1,y+44,8,2,0x655b62);
    if(index===0||index===2){r(x+8,y+77,23,7,0x8d7564);for(let i=0;i<4;i++){r(x+9+i*5,y+78,4,3,[0xb67772,0xc5ad75,0x768da3,0x91a68b][i]);r(x+10+i*5,y+78,2,1,0xf2dcb8);}}
    // フラワーボックスと店先の箱。歩ける範囲には置かない。
    for(const px of [x+7,x+w-24]){r(px,y+h-14,17,11,0x8b6559);r(px-1,y+h-15,19,3,0xba8d6e);for(let i=0;i<5;i++){r(px+i*3,y+h-20-i%2*3,4,7,0x607c61);r(px+i*3,y+h-21-i%2*3,3,2,index%2?0xe3bb87:0xc68e9c);}}
    if(!open){r(x+33,y+76,w-66,10,0x565e6b);text(x+w/2,y+77,v.id==='wakaba'?'公式杯の入賞で開放':v.id==='stadium-9'?'出場権が必要':v.id==='stadium-5'?'ひなた優勝で出場':v.shopId==='hinata'?'紹介状が必要':'準備中',7,'#eee0be',y+h+1).setOrigin(.5,0);}
    if(v.kind==='stadium')text(x+w/2,y-41,v.id==='stadium-9'?(open?'第3公式大会・受付中':'出場権が必要'):v.id==='stadium-5'?(open?'第1公式大会・一度限り':'ひなた優勝で出場権獲得'):`熟練度 ${v.stage}段階〜・準備中`,9,'#495366',y+h+1).setOrigin(.5,0);
    if(open)text(x+w/2,v.entrance==='south'?y+h+12:y-15,v.id==='stadium-5'?'▼ 公式戦受付':'▼ 入る',10,'#445951',y+h+2).setOrigin(.5,0);
  }
  // 葉を丸ではなく重なる房と段差で描き、幹にも反射光を入れる。
  for(const [x,y] of [[55,239],[225,239],[393,239],[561,239],[729,239],[900,238],[55,467],[225,587],[393,587],[561,587],[729,587],[901,587]]){
    const t=scene.add.graphics().setDepth(y+9),r=(xx:number,yy:number,w:number,h:number,c:number,a=1)=>t.fillStyle(c,a).fillRect(xx,yy,w,h);
    t.fillStyle(0x4d5260,.2).fillEllipse(x+6,y+5,37,13);r(x-4,y-23,9,31,0x675362);r(x-2,y-22,3,28,0xa17c6c);r(x+3,y-17,2,21,0x4d4958);
    // 房ごとにサイズと色を変えた、階段状の丸い広葉樹。
    for(let i=0;i<9;i++){
      const xx=x-26+(i*13)%32,yy=y-53+(i*17)%29,ww=19+(i%3)*4;
      const shade=[0x4c6860,0x577560,0x647e63][i%3];
      r(xx+5,yy,ww-9,3,shade);r(xx+2,yy+3,ww-3,4,shade);r(xx,yy+7,ww,11,shade);r(xx+3,yy+18,ww-5,3,0x435e59);
      r(xx+5,yy+2,ww-10,3,0x94a576);r(xx+3,yy+5,ww-7,7,0x80976b);r(xx+2,yy+9,7,4,0x91a574);
      for(let j=0;j<5;j++){const lx=xx+5+j*3,ly=yy+6+j%3*4;r(lx,ly,3,2,j%2?0xa8b780:0x6b8965);}
    }
  }
  // 花、落ち葉、縁の草。通路の読みやすさを保つ。
  for(let i=0;i<180;i++){const x=42+noise(i,1)%874,y=42+noise(i,2)%560;if(y<125||(y>125&&y<255)||(y>282&&y<560))continue;rect(x,y,1,4,0x748d67);rect(x-2,y+1,2,1,0x92a778);if(i%4===0){rect(x-1,y-1,3,2,i%2?0xe8cf98:0xc7a5af);}}
  text(85,591,'人物・入口をタップ / PC：Z・Enterで調べる',10,'#4b5d55');
}
