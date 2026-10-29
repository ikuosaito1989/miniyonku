import {drawShopTrack} from './ShopTrackArt';
import Phaser from 'phaser';
import {officialVenueFor,officialFixturesFor} from '../data/officialVenue';
import {getCircuitTrack} from '../data/circuit';
/** 入場した瞬間に公式大会と分かる、大理石・金縁・観客席のアリーナ。 */
export function drawOfficialVenue(scene:Phaser.Scene,id='stadium-5'){
 const venue=officialVenueFor(id),fixtures=officialFixturesFor(id),technical=id==='stadium-9',final=id==='stadium-10',zenith=id==='stadium-7';
 let g=scene.add.graphics().setDepth(-20);
 const r=(x:number,y:number,w:number,h:number,c:number,a=1)=>g.fillStyle(c,a).fillRect(x,y,w,h);
 const text=(x:number,y:number,s:string,size=13,color='#f8edcb',depth=1)=>scene.add.text(x,y,s,{fontFamily:'"Noto Sans JP",sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,resolution:3}).setDepth(depth);
 r(0,0,960,640,0x192237);r(40,35,880,570,0xc5c4b5);
 for(let y=115,row=0;y<605;y+=28,row++)for(let x=40,col=0;x<920;x+=28,col++){
  r(x,y,27,27,(row+col)%2?0xc7cbbf:0xb2bdb9);r(x+1,y+1,25,1,0xe9e4ca);r(x+25,y+2,1,24,0x91a5a4);
  if((row+col)%5===0){r(x+4,y+6,10,1,0x9badab,.6);r(x+13,y+7,8,1,0x9badab,.6);}
 }
 // 正面の巨大看板。中央にトロフィー、両側に大会旗。
 r(40,35,880,80,0x334459);r(40,109,880,6,0xcfb779);r(40,110,880,1,0xffe5a0);
 r(132,40,696,65,0x17283e);r(136,43,688,59,0xd4bd85);r(139,46,682,53,technical?0x3d4d70:0x305a60);r(143,49,674,2,0x839e9e);
 text(480,48,venue.name,24,'#ffedb6').setOrigin(.5,0);text(480,83,zenith?'最終公式大会 / ゼニス・クラウン':final?'第4公式大会 / 緑川グランプリ決勝':technical?'第3公式大会 / 星空テクニカル杯':'第1公式大会 / 若葉公式ダート杯',10,'#c6d8ce').setOrigin(.5,0);
 for(const x of [64,858]){
  r(x,40,39,68,0x1d2d46);r(x+3,43,33,59,0xb5505d);r(x+6,44,27,3,0xe1c786);r(x+16,52,7,22,0xe3c87d);r(x+10,50,19,10,0xf6dfa1);r(x+11,81,17,3,0xd1b378);r(x+18,69,3,12,0xd1b378);
  for(let i=0;i<3;i++)r(x+4+i*10,103,9,4-i%2*2,0xd5b981);
 }
 // ピットへ続く濃紺のカーペットと金の縁取り。
 r(412,444,136,155,0x34465f);r(416,444,128,155,0x516079);for(const x of [418,538])r(x,446,3,150,0xc6af79);
 for(let y=449;y<596;y+=9)r(424,y,108,1,0x60718a,.45);
 for(const x of [47,891]){
  r(x,118,22,441,0x5b6779);r(x+3,120,16,435,0xc2c9c0);r(x+4,122,4,430,0xf0e6cb);r(x+15,122,3,430,0x879b9d);
  for(const y of [121,555]){r(x-3,y,28,8,0x607285);r(x-2,y,26,2,0xdac48d);}
 }
 for(const f of fixtures){
  const {x,y,w,h}=f;g=scene.add.graphics().setDepth(y+h);
  r(x+7,y+9,w,h,0x3d4b61,.3);r(x,y,w,h,0x293e56);r(x+2,y+2,w-4,h-4,0xa4b0b3);r(x+4,y+4,w-8,h-8,0x426477);r(x+5,y+5,w-10,2,0xe6d6a8);
  text(x+w/2,y+10,f.label,f.id.startsWith('stand')?11:12,'#fff0ba',y+h+2).setOrigin(.5,0);
  if(f.id==='speed'||f.id==='dirt'||f.id==='technical'||f.id==='final'||f.id==='zenith'){
   // 銀のレールと木縁を備えた公式コース台。
   r(x+8,y+32,w-16,h-63,0xc1a479);r(x+11,y+35,w-22,h-69,0x283d51);r(x+14,y+38,w-28,h-75,f.id!=='dirt'?0x557b6b:0x9a855d);
   if(f.id==='final'||f.id==='zenith')drawShopTrack(scene,{x:x+14,y:y+38,w:w-28,h:h-75,kind:'track',label:f.label,text:''},getCircuitTrack(f.id==='zenith'?'zenith':'grandprix'),y+h+1);
   else {
   const track=getCircuitTrack(f.id==='technical'?'comet':f.id!=='dirt'?'sprint':'sun'),sx=(w-44)/(2*(track.circuit.radiusX+2)),sy=(h-90)/(2*(track.circuit.radiusZ+2));
   for(let lane=0;lane<6;lane++){
    const scale=1-lane*.05;g.lineStyle(1.5,0xd8dfcf);g.beginPath();
    for(let i=0;i<=240;i++){const p=track.sampleCircuit(i/240*track.circuitLength),px=x+w/2+p.x*sx*scale,py=y+h/2+p.z*sy*scale;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.strokePath();
   }
   }
   for(let i=0;i<6;i++)for(let j=0;j<2;j++)r(x+w/2+i*4,y+41+j*4,4,4,(i+j)%2?0xe4e2ca:0x2d3c52);
   r(x+24,y+h-22,w-48,17,0x253c56);text(x+w/2,y+h-21,'▼ コース前で出場登録',10,'#ffdfa0',y+h+2).setOrigin(.5,0);
   for(const px of [x+8,x+w-17]){r(px,y+h-8,9,10,0x617b88);r(px+2,y+h-7,2,8,0xcdd1bc);}
  }else if(f.id==='pit'){
   r(x+8,y+35,w-16,65,0x967b62);r(x+11,y+38,w-22,57,0x385e64);
   for(let i=0;i<3;i++){r(x+16+i*31,y+49,24,13,0xa3b7bc);r(x+20+i*31,y+47,15,5,0xb96d6d);r(x+22+i*31,y+65,3,18,0xd4ccb3);r(x+18+i*31,y+82,11,4,0x9b7e65);}
   text(x+w/2,y+h-21,'整備・電池交換',10,'#f5e7b9',y+h+2).setOrigin(.5,0);
  }else if(f.id==='reception'){
   r(x+9,y+34,w-18,30,0x8e745e);r(x+11,y+36,w-22,4,0xe1c394);r(x+15,y+43,w-30,17,0xb5a57f);r(x+22,y+42,15,12,0x365568);r(x+24,y+43,11,6,0xb3c9bf);
   text(x+w/2,y+45,'REGISTRATION',7,'#ece3be',y+h+2).setOrigin(.5,0);
  }else{
   // 立体の観客席と観客の顔。髪・肌・服を描き分ける。
   for(let row=0;row<2;row++)for(let i=0;i<9;i++){
    const px=x+10+i*19,py=y+28+row*17;r(px,py+5,14,8,0x294459);r(px+1,py+4,12,6,[0xa77b71,0x6e9597,0xbcab6c,0x7e86a6][(i+row)%4]);r(px+4,py-1,6,6,0xdfb493);r(px+3,py-3,8,3,0x525065);r(px+5,py+1,1,1,0x3c3b4d);r(px+8,py+1,1,1,0x3c3b4d);r(px-1,py+13,17,2,0xc5c2aa);
   }
  }
 }
 g=scene.add.graphics().setDepth(0);
 for(const x of [104,838])for(const y of [216,468]){
  r(x,y,17,24,0x7e6c5e);r(x-2,y-2,21,5,0xc7a879);for(let i=0;i<5;i++){r(x-4+i*5,y-15-i%2*4,6,15,0x3e6e5b);r(x-2+i*5,y-17-i%2*4,4,5,0x86a777);}
 }
 r(437,564,86,29,0x263e54);r(440,566,80,1,0xc6b881);text(480,572,'▼ 緑川町へ',11,'#fff0bc',600).setOrigin(.5,0);
 text(480,459,zenith?'最後の決戦 / 2位以内の完走でゲームクリア':final?'2位以内であかつき模型店を開放':technical?'旋回と立ち上がりが勝敗を決める':'総合3位以内で次のステージへ',10,'#e7dfbf',1).setOrigin(.5,0);
}
