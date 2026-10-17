import Phaser from 'phaser';
import { fixtures, room, roomView } from '../data/shop';
import { useGame } from './store';
import { circuit } from '../data/circuit';

export class ShopScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Container;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private solids:Phaser.Geom.Rectangle[]=[];
  private facing='down';
  private interactionPending=false;
  constructor(){ super('shop'); }
  create(){
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.scale.off(Phaser.Scale.Events.RESIZE,this.fitCamera,this));
    const g=this.add.graphics();
    g.fillStyle(0x172b31).fillRect(0,0,960,640);
    g.fillStyle(0xa4b8a4).fillRect(40,35,880,85);
    g.fillStyle(0x758f80).fillRect(40,105,880,15);
    for(let y=120;y<600;y+=32)for(let x=40;x<920;x+=40){g.fillStyle((x/40+y/32)%2<1?0xc9b28b:0xc3aa82).fillRect(x,y,39,31);}
    g.fillStyle(0x6c5548).fillRect(40,600,880,14);
    for(const x of [420,540]){g.fillStyle(0xede8c9).fillRect(x,48,88,52);g.fillStyle(0x90c3bd).fillRect(x+5,53,78,42);g.fillStyle(0xede8c9).fillRect(x+40,53,5,42);}
    this.add.text(88,57,'KOMOREBI MODEL',{fontFamily:'monospace',fontSize:'18px',color:'#273b3b'});
    this.add.text(710,65,'小さな走り、大きな夢。',{fontFamily:'sans-serif',fontSize:'12px',color:'#354d45'});
    for(const f of fixtures){
      const {x,y,w,h}=f;
      this.solids.push(new Phaser.Geom.Rectangle(x,y,w,h));
      g.fillStyle(0x273d3b,0.2).fillRect(x+6,y+8,w,h);
      if(f.kind==='track'){
        g.fillStyle(0x58756b).fillRoundedRect(x,y,w,h,10);
        for(let i=0;i<=circuit.lanes;i++){g.lineStyle(3,0xdcd7bc).strokeRoundedRect(x+18+i*9,y+18+i*9,w-36-i*18,h-36-i*18,40-i*5);}
        g.fillStyle(0xe5ab61).fillRect(x+100,y+17,6,31);
        this.add.text(x+65,y+h+13,'TEST CIRCUIT',{fontSize:'13px',color:'#534e40',fontFamily:'monospace'});
      }else if(f.kind==='plant'){
        g.fillStyle(0x9e6146).fillRect(x+10,y+25,25,20); g.fillStyle(0x457d56).fillRect(x,y+8,40,20).fillRect(x+12,y,17,35);
      }else{
        g.fillStyle(0x785b49).fillRect(x,y,w,h);g.fillStyle(0xb18c62).fillRect(x+4,y+4,w-8,h-13);g.fillStyle(0x5f5144).fillRect(x+5,y+h-9,w-10,6);
        if(f.kind==='shelf')for(let row=0;row<3;row++){g.fillStyle(0x715747).fillRect(x+5,y+29+row*30,w-10,4);for(let col=0;col<4;col++){g.fillStyle([0x637e8a,0xc46650,0xe5c16e,0x7f9672][(col+row)%4]).fillRect(x+10+col*21,y+8+row*30,16,20);g.fillStyle(0xeee4c7).fillRect(x+13+col*21,y+12+row*30,10,4);}}
        if(f.kind==='bench'){g.fillStyle(0x5f827b).fillRect(x+30,y+15,90,45);g.fillStyle(0xe3b65f).fillRect(x+54,y+25,38,18);g.fillStyle(0x364548).fillRect(x+48,y+21,10,9).fillRect(x+87,y+21,10,9).fillRect(x+48,y+42,10,9).fillRect(x+87,y+42,10,9);g.fillStyle(0xd5d1ba).fillRect(x+142,y+14,6,38);}
      }
    }
    this.person(214,139,0xc9a563,false);
    this.person(475,287,0x839b8b,false);
    this.solids.push(new Phaser.Geom.Rectangle(463,278,24,21));
    this.player=this.person(room.spawn.x,room.spawn.y,0xd6754d,true);
    this.add.text(442,593,'E N T R A N C E',{fontFamily:'monospace',fontSize:'10px',color:'#e5dcc2'});
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,Z,ENTER') as Record<string,Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown',(event:KeyboardEvent)=>{
      if(!event.repeat&&!event.defaultPrevented&&!useGame.getState().overlay&&(event.code==='KeyZ'||event.code==='Enter'))this.interactionPending=true;
    });
    this.input.keyboard!.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);
    this.input.on('blur',()=>this.input.keyboard?.resetKeys());
    this.game.events.on(Phaser.Core.Events.BLUR, this.resetKeys, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.game.events.off(Phaser.Core.Events.BLUR,this.resetKeys,this));
  }
  private resetKeys(){this.input.keyboard?.resetKeys();}
  private fitCamera(){
    const {width,height}=this.scale;
    this.cameras.main.setZoom(width/roomView.width,height/roomView.height);
    this.cameras.main.centerOn(roomView.x+roomView.width/2,roomView.y+roomView.height/2);
  }
  private person(x:number,y:number,color:number,player:boolean){
    const g=this.add.graphics();
    g.fillStyle(0x243a35,0.22).fillEllipse(0,9,30,12);
    g.fillStyle(0x344751).fillRect(-9,4,7,10).fillRect(3,4,7,10);
    g.fillStyle(color).fillRect(-11,-13,22,21);
    g.fillStyle(0xedc49a).fillRect(-8,-28,16,17).fillRect(-14,-10,4,12).fillRect(10,-10,4,12);
    g.fillStyle(0x493d36).fillRect(-9,-30,18,7).fillRect(-10,-26,4,10);
    g.fillStyle(0x344342).fillRect(-3,-20,3,3).fillRect(5,-20,3,3);
    if(player){g.fillStyle(0xe5b64d).fillRect(-11,-31,23,6).fillRect(7,-27,8,4);g.fillStyle(0xf0d7a7).fillRect(-5,-7,10,4);}
    return this.add.container(x,y,[g]).setDepth(y);
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    const action=this.interactionPending;
    this.interactionPending=false;
    if(useGame.getState().overlay)return;
    let dx=0,dy=0;
    if(this.keys.LEFT.isDown||this.keys.A.isDown){dx=-1;this.facing='left';}
    else if(this.keys.RIGHT.isDown||this.keys.D.isDown){dx=1;this.facing='right';}
    else if(this.keys.UP.isDown||this.keys.W.isDown){dy=-1;this.facing='up';}
    else if(this.keys.DOWN.isDown||this.keys.S.isDown){dy=1;this.facing='down';}
    const step=155*Math.min(delta,40)/1000;
    const x=Phaser.Math.Clamp(this.player.x+dx*step,56,904), y=Phaser.Math.Clamp(this.player.y+dy*step,136,582);
    const feet=new Phaser.Geom.Rectangle(x-11,y-3,22,17);
    if(!this.solids.some(r=>Phaser.Geom.Intersects.RectangleToRectangle(feet,r)))this.player.setPosition(x,y);
    this.player.setDepth(this.player.y);this.player.setScale(this.facing==='left'?-1:1,1);
    const targets=[...fixtures.map(f=>({...f,speaker:f.label,shopAfter:f.kind==='counter'})),{x:463,y:268,w:24,h:32,label:'ライバル ナギ',speaker:'ナギ',shopAfter:false,text:'ぼくはナギ！速いモーターだけじゃなく、ギアやタイヤの組み合わせも大事なんだ。きみのマシン、楽しみにしてる。'}];
    const nearest=targets.map(t=>({t,d:Math.hypot(this.player.x-Phaser.Math.Clamp(this.player.x,t.x,t.x+t.w),this.player.y-Phaser.Math.Clamp(this.player.y,t.y,t.y+t.h))})).sort((a,b)=>a.d-b.d)[0];
    const target=nearest?.d<62?nearest.t:null;
    const nearby=target?.label??'';
    if(useGame.getState().nearby!==nearby)useGame.setState({nearby});
    if(action&&target){
      if('kind' in target&&target.kind==='track')useGame.getState().startTrial();
      else useGame.getState().talk(target.speaker,target.text,target.shopAfter);
    }
  }
}
