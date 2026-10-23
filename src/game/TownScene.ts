import Phaser from 'phaser';
import { townShops,townObstacles,townDoor,townReturnPosition,shopAtEntrance,type ShopId } from '../data/town';
import { roomView } from '../data/shop';
import { compactDevice } from '../data/display';
import { createPeopleTextures,type Facing } from './ShopArt';
import { personSpriteSize } from './PeopleArt';
import { canTravel,findWalkingPath,type Point } from './navigation';
import { createShopGesture } from './shopGesture';

export class TownScene extends Phaser.Scene{
  private player!:Phaser.GameObjects.Container;
  private sprite!:Phaser.GameObjects.Image;
  private keys!:Record<string,Phaser.Input.Keyboard.Key>;
  private route:Point[]=[];
  private gesture=createShopGesture();
  private facing:Facing='down';
  private walkTime=0;
  private entering=false;
  constructor(private from:ShopId,private onEnter:(id:ShopId)=>void){super('town');}
  create(){
    createPeopleTextures(this);
    const g=this.add.graphics();
    g.fillStyle(0xcee4ca).fillRect(0,0,960,640);
    g.fillStyle(0xd8d3bb).fillRect(40,330,880,270);
    g.fillStyle(0x819795).fillRect(40,445,880,110);
    for(let x=70;x<910;x+=80)g.fillStyle(0xe8e5c6).fillRect(x,497,40,4);
    const label=(x:number,y:number,value:string,size=16)=>this.add.text(x,y,value,{fontFamily:'sans-serif',fontSize:`${size}px`,color:'#fff5d8',resolution:2}).setOrigin(.5);
    label(480,85,'緑川町 · 模型店めぐり',24).setColor('#345b51');
    label(480,116,'入口まで歩くと入店できます',13).setColor('#345b51');
    for(const shop of townShops){
      g.fillStyle(0x5d7167,.2).fillRect(shop.x+8,shop.y+10,shop.width,shop.height);
      g.fillStyle(0xf1e3bb).fillRect(shop.x,shop.y,shop.width,shop.height);
      g.fillStyle(shop.color).fillRect(shop.x-8,shop.y,shop.width+16,55);
      label(shop.x+shop.width/2,shop.y+27,shop.name,20);
      g.fillStyle(0xa5c6c4).fillRect(shop.x+15,shop.y+75,65,78).fillRect(shop.x+170,shop.y+75,65,78);
      for(const offset of [20,175])for(let row=0;row<3;row++){
        g.fillStyle([0xca825d,0x647ba9,0xb8a366][row]).fillRect(shop.x+offset,shop.y+85+row*22,55,16);
      }
      g.fillStyle(shop.color).fillRect(shop.x+95,shop.y+70,60,110);
      g.fillStyle(0xc3d7c3).fillRect(shop.x+103,shop.y+80,44,65);
      g.fillStyle(0xf2d58e).fillRect(shop.x+140,shop.y+145,4,10);
      g.fillStyle(shop.color).fillRect(shop.x+92,340,66,30);
      label(shop.x+125,354,'▲ 入口',12);
    }
    const start=townReturnPosition(this.from);
    const shadow=this.add.ellipse(0,5,30,9,0x344c45,.25);
    this.sprite=this.add.image(0,12,'person-player-down-0').setOrigin(.5,1).setDisplaySize(personSpriteSize.displayWidth,personSpriteSize.displayHeight);
    this.player=this.add.container(start.x,start.y,[shadow,this.sprite]).setDepth(1000);
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT') as Record<string,Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.addCapture(['UP','DOWN','LEFT','RIGHT']);
    this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{this.route=[];this.gesture.down(p.id,p.x,p.y,p.downTime);});
    this.input.on('pointermove',(p:Phaser.Input.Pointer)=>this.gesture.move(p.id,p.x,p.y));
    this.input.on('pointerup',(p:Phaser.Input.Pointer)=>{
      const action=this.gesture.up(p.id,p.x,p.y,p.upTime,false);
      if(action!=='tap')return;
      const target=this.cameras.main.getWorldPoint(p.x,p.y);
      const shop=townShops.find(shop=>target.x>=shop.x&&target.x<=shop.x+shop.width&&target.y>=shop.y&&target.y<=375);
      this.route=findWalkingPath(this.player,shop?townDoor(shop.id):target,townObstacles);
    });
    const reset=()=>{this.gesture.reset();this.route=[];this.input.keyboard?.resetKeys();};
    this.input.on('pointerupoutside',reset);this.input.on('gameout',reset);
    this.game.canvas.addEventListener('touchcancel',reset);
    this.game.events.on(Phaser.Core.Events.BLUR,reset);
    this.scale.on(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{
      this.game.canvas.removeEventListener('touchcancel',reset);
      this.game.events.off(Phaser.Core.Events.BLUR,reset);
      this.scale.off(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    });
    this.fitCamera();
  }
  private fitCamera(){
    this.gesture.reset();this.route=[];this.input.keyboard?.resetKeys();
    const camera=this.cameras.main,{width,height}=this.scale;
    if(compactDevice()){
      camera.setZoom(Math.max(width/560,height/roomView.height));
      camera.setBounds(roomView.x,roomView.y,roomView.width,roomView.height);
      camera.startFollow(this.player,false,.15,.15);
    }else{
      camera.stopFollow();camera.removeBounds();camera.setZoom(width/roomView.width,height/roomView.height);
      camera.centerOn(480,324.5);
    }
  }
  update(_time:number,delta:number){
    if(!this.player||this.entering)return;
    let dx=0,dy=0;
    if(this.keys.LEFT.isDown||this.keys.A.isDown)dx=-1;
    else if(this.keys.RIGHT.isDown||this.keys.D.isDown)dx=1;
    else if(this.keys.UP.isDown||this.keys.W.isDown)dy=-1;
    else if(this.keys.DOWN.isDown||this.keys.S.isDown)dy=1;
    if(!dx&&!dy){const finger=this.gesture.direction();dx=finger.x;dy=finger.y;}
    const manual=dx!==0||dy!==0;if(manual)this.route=[];
    const waypoint=this.route[0];let step=155*Math.min(delta,40)/1000;
    if(!manual&&waypoint){
      if(Math.abs(waypoint.x-this.player.x)>.01){dx=Math.sign(waypoint.x-this.player.x);step=Math.min(step,Math.abs(waypoint.x-this.player.x));}
      else {dy=Math.sign(waypoint.y-this.player.y);step=Math.min(step,Math.abs(waypoint.y-this.player.y));}
    }
    if(dx)this.facing=dx<0?'left':'right';else if(dy)this.facing=dy<0?'up':'down';
    const next={x:this.player.x+dx*step,y:this.player.y+dy*step};
    const moving=!!(dx||dy)&&canTravel(this.player,next,townObstacles);
    if(moving){this.player.setPosition(next.x,next.y);this.walkTime+=delta;}
    else {this.walkTime=0;if(dx||dy)this.route=[];}
    if(waypoint&&Math.hypot(this.player.x-waypoint.x,this.player.y-waypoint.y)<.1)this.route.shift();
    this.sprite.setTexture(`person-player-${this.facing}-${moving?Math.floor(this.walkTime/130)%4:0}`);
    const shop=shopAtEntrance(this.player);
    if(shop){this.entering=true;this.gesture.reset();this.input.keyboard?.resetKeys();this.onEnter(shop);}
  }
}
