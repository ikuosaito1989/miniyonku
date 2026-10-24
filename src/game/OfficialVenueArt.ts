import Phaser from 'phaser';
import {officialVenue,officialVenueFixtures} from '../data/officialVenue';
import {getCircuitTrack} from '../data/circuit';
export function drawOfficialVenue(scene:Phaser.Scene){
 const g=scene.add.graphics();const rect=(x:number,y:number,w:number,h:number,c:number)=>g.fillStyle(c).fillRect(x,y,w,h);
 const text=(x:number,y:number,s:string,size=13,color='#f8edcb',depth=1)=>scene.add.text(x,y,s,{fontFamily:'sans-serif',fontSize:`${size}px`,fontStyle:'bold',color,resolution:2}).setDepth(depth);
 rect(0,0,960,640,0x172b3c);rect(40,35,880,570,0xabc1b7);rect(40,35,880,80,0x244c56);
 for(let y=120;y<600;y+=28)for(let x=45;x<915;x+=28){rect(x,y,26,26,(x+y)%3?0xb5c5bd:0xa9bcb7);}
 rect(130,43,700,58,0x173847);text(480,49,officialVenue.name,25).setOrigin(.5,0);text(480,82,'WAKABA OFFICIAL CUP  /  高速舗装 ＆ オフロード',11,'#a5d9ce').setOrigin(.5,0);
 for(const f of officialVenueFixtures){
  const {x,y,w,h}=f;
  rect(x+5,y+6,w,h,0x748c88);rect(x,y,w,h,0x344e5e);rect(x+4,y+4,w-8,h-8,0x547477);
  text(x+w/2,y+10,f.label,f.id.startsWith('stand')?12:13,'#fff2bd',y+h+2).setOrigin(.5,0);
  if(f.id==='speed'||f.id==='dirt'){
   rect(x+8,y+35,w-16,h-65,f.id==='speed'?0x2e6d65:0x6c784d);
   const track=getCircuitTrack(f.id==='speed'?'sprint':'sun'),sx=(w-38)/(2*(track.circuit.radiusX+2)),sy=(h-85)/(2*(track.circuit.radiusZ+2));
   for(let lane=0;lane<5;lane++){
    const scale=1-lane*.05;g.lineStyle(2,f.id==='speed'?0xc5cbd7:lane%2?0xc8ad7c:0xab8c5d);g.beginPath();
    for(let i=0;i<=240;i++){const p=track.sampleCircuit(i/240*track.circuitLength);const px=x+w/2+p.x*sx*scale,py=y+h/2+p.z*sy*scale;if(i===0)g.moveTo(px,py);else g.lineTo(px,py);}g.strokePath();
   }
   rect(x+45,y+h-22,w-90,16,0x193d4f);text(x+w/2,y+h-21,'▼ ここでレースに出場',10,'#fff1a0',y+h+2).setOrigin(.5,0);
  }else if(f.id==='pit'){
   rect(x+10,y+37,w-20,60,0xc1c7c0);for(let i=0;i<3;i++){rect(x+17+i*31,y+49,24,10,0x3f647c);rect(x+24+i*31,y+68,7,18,0x937954);}text(x+w/2,y+h-21,'整備・電池交換',10,'#f7edb9',y+h+2).setOrigin(.5,0);
  }else if(f.id==='reception'){
   rect(x+12,y+37,w-24,25,0xb9cebd);text(x+w/2,y+41,'出場権・進行案内',10,'#254b4a',y+h+2).setOrigin(.5,0);
  }else for(let row=0;row<2;row++)for(let i=0;i<7;i++)rect(x+10+i*25,y+30+row*14,18,8,[0xcd9d66,0x859eb3,0xbdb57a][i%3]);
 }
 for(const x of [55,900])for(let y=210;y<565;y+=30)rect(x,y,5,15,0xdce4c9);
 rect(438,563,84,28,0x315b59);text(480,569,'▼ 緑川町へ',11,'#fff0bc',600).setOrigin(.5,0);
 text(480,466,'第1戦で1位 → ピットで装備変更 → 第2戦で1位',12,'#294c4b',1).setOrigin(.5,0);
}
