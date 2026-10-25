import type Phaser from 'phaser';

/** 家具の座標を動かさず、素材・生活感・採光だけを追加する。 */
export function drawShopDetails(scene:Phaser.Scene,mirrored=false){
  const g=scene.add.graphics().setDepth(-90);
  const r=(x:number,y:number,w:number,h:number,c:number,a=1)=>g.fillStyle(c,a).fillRect(mirrored?960-x-w:x,y,w,h);
  // 淡い琥珀色の室内光と、窓から落ちる斜めの日差し。
  r(40,35,880,565,0xe9c998,.09);
  for(let i=0;i<3;i++){
    const x=104+i*262;g.fillStyle(0xffe6af,.055).fillPoints((mirrored?[[960-x,120],[960-x-30,120],[960-x-210,570],[960-x-125,570]]:[[x,120],[x+30,120],[x+210,570],[x+125,570]]).map(([x,y])=>({x,y})),true);
  }
  // 木製の幅木、釘穴、擦れた床の細かなハイライト。
  for(const y of [108,599]){r(40,y,880,3,0x806b64);r(40,y,880,1,0xd4bb91);for(let x=48;x<915;x+=31){r(x,y+1,1,1,0x534c57);r(x+8,y+2,13,1,0xa28d75);}}
  for(let i=0;i<85;i++){const x=58+(i*137)%844,y=130+(i*79)%424;r(x,y,3+i%4,1,i%3?0xffecc6:0x658e88,.16);}
  const wall=scene.add.graphics().setDepth(105),wr=(x:number,y:number,w:number,h:number,c:number)=>wall.fillStyle(c).fillRect(mirrored?960-x-w:x,y,w,h);
  // 小さな走行会ポスター。文字は実テキストで読める状態を保つ。
  wr(866,49,37,48,0x665967);wr(868,51,33,44,0xe6cf9f);wr(871,55,27,8,0xb77869);wr(872,68,25,1,0xa98b77);wr(872,82,25,1,0xa98b77);
  scene.add.text(mirrored?59:871,55,'走行会',{fontFamily:'sans-serif',fontSize:'7px',color:'#fff0c6',resolution:2}).setDepth(106);
  scene.add.text(mirrored?59:872,70,'日曜日\n参加歓迎',{fontFamily:'sans-serif',fontSize:'6px',color:'#65596a',lineSpacing:3,resolution:2}).setDepth(106);
  // 入口の木の敷居と、編み目のある落ち着いたマット。
  const mat=scene.add.graphics().setDepth(0);mat.fillStyle(0x4e5665).fillRect(411,572,138,25);
  for(let y=574;y<595;y+=3)for(let x=414;x<546;x+=5)mat.fillStyle((x+y)%2?0x7b8b87:0x667b7a).fillRect(x,y,3,1);
}

export function drawVenueDetails(scene:Phaser.Scene){
  const g=scene.add.graphics().setDepth(0);
  // 競技会場の床目地と、木製パネルの壁。走行台の前景より後ろへ。
  for(let y=120;y<558;y+=28)for(let x=46;x<916;x+=28){g.fillStyle(0xe0dcc1,.3).fillRect(x+2,y+1,23,1);g.fillStyle(0x718a85,.22).fillRect(x+24,y+2,1,23);}
  for(const x of [48,889]){g.fillStyle(0x5e626b).fillRect(x,117,23,440);g.fillStyle(0xb0a58b).fillRect(x+3,117,17,440);for(let y=120;y<554;y+=11){g.fillStyle(0x8e8b7d).fillRect(x+4,y,15,1);g.fillStyle(0xd5c6a5).fillRect(x+5,y+1,1,8);}}
  for(const x of [107,844]){
    const b=scene.add.graphics().setDepth(140);b.fillStyle(0x595366).fillRect(x,110,9,34);b.fillStyle(0xb1a992).fillRect(x+2,112,5,28);b.fillStyle(0x343e50).fillRect(x-9,111,27,24);
    for(const yy of [117,127]){b.fillStyle(0x73848b).fillCircle(x+4,yy,5);b.fillStyle(0x434e61).fillCircle(x+4,yy,3);b.fillStyle(0xa8b8ac).fillRect(x+2,yy-2,2,1);}
  }
}
