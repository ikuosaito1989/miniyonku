import Phaser from 'phaser';
import { fixtures, room, roomView, shopExit, type Fixture } from '../data/shop';
import { createShopGesture } from './shopGesture';
import { useGame } from './store';
import { createPeopleTextures, drawShopFixture, drawShopRoom, type Facing, type PersonKind } from './ShopArt';
import { personSpriteSize } from './PeopleArt';
import { shopPeople, shopVisitors, story } from '../data/story';
import { nextShopRace } from '../data/shopHints';
import { equippedCondition } from './condition';
import { shopAdvice } from './shopAdvice';
import { touchInput } from './touchInput';
import { compactDevice } from '../data/display';
import { findWalkingPath, isAtShopExit, type Point } from './navigation';
import { proficiencyStandings } from '../data/proficiency';
import shopIllustration from '../assets/shop/interior-v1.webp';
import { shopIllustrationKey } from '../data/shopIllustration';

interface ShopTarget {x:number;y:number;w:number;h:number;label:string;speaker:string;shopAfter:boolean;text:string;kind?:Fixture['kind']}
export class ShopScene extends Phaser.Scene {
  private gesture=createShopGesture();
  private pendingTarget:ShopTarget|null=null;
  private player!: Phaser.GameObjects.Container;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private solids:Phaser.Geom.Rectangle[]=[];
  private facing:Facing='down';
  private playerSprite!:Phaser.GameObjects.Image;
  private walkTime=0;
  private interactionPending=false;
  private route:Point[]=[];
  private destination!:Phaser.GameObjects.Graphics;
  private inputVersion=0;
  private boardLines:Phaser.GameObjects.Text[]=[];
  private boardPoints=-1;
  constructor(private readonly onExit:()=>void=()=>{}){ super('shop'); }
  private leaving=false;
  preload(){this.load.image(shopIllustrationKey,shopIllustration);}
  create(){
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.scale.off(Phaser.Scale.Events.RESIZE,this.fitCamera,this));
    this.solids=[];
    createPeopleTextures(this);drawShopRoom(this);
    this.add.rectangle(shopExit.x+shopExit.width/2,578,shopExit.width,24,0x315d56,.85).setDepth(1);
    this.add.text(shopExit.x+shopExit.width/2,575,'▼ 出口', {fontFamily:'sans-serif',fontSize:'12px',color:'#fff1c9',resolution:2}).setOrigin(.5).setDepth(2);
    for(const fixture of fixtures){
      drawShopFixture(this,fixture);
      this.solids.push(new Phaser.Geom.Rectangle(fixture.x,fixture.y,fixture.w,fixture.h));
    }
    const board=fixtures.find(f=>f.kind==='board')!;
    this.boardLines=Array.from({length:5},(_,i)=>this.add.text(board.x+5,board.y+23+i*15,'',{fontFamily:'"Noto Sans JP",monospace',fontSize:'5px',color:'#e6dfbc',resolution:2}).setDepth(board.y+board.h+2));
    this.person(shopPeople.owner.x,shopPeople.owner.y,'owner');
    this.person(shopPeople.rival.x,shopPeople.rival.y,'rival');
    for(const visitor of shopVisitors){
      this.person(visitor.x,visitor.y,visitor.kind);
      this.solids.push(new Phaser.Geom.Rectangle(visitor.x-12,visitor.y-9,24,21));
    }
    this.solids.push(new Phaser.Geom.Rectangle(shopPeople.rival.x-12,shopPeople.rival.y-9,24,21));
    this.player=this.person(room.spawn.x,room.spawn.y,'player');
    this.destination=this.add.graphics().setDepth(9999).setVisible(false);
    this.destination.lineStyle(2,0xffdf87).strokeCircle(0,0,8).lineBetween(-12,0,-5,0).lineBetween(5,0,12,0).lineBetween(0,-12,0,-5).lineBetween(0,5,0,12);
    this.inputVersion=touchInput.version();
    let tap:{x:number;y:number;time:number;id:number}|null=null;
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      if(useGame.getState().overlay)return;
      if(compactDevice()){this.cancelRoute();this.pendingTarget=null;this.gesture.down(pointer.id,pointer.x,pointer.y,pointer.downTime);return;}
      tap={x:pointer.x,y:pointer.y,time:pointer.downTime,id:pointer.id};
    });
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{if(compactDevice())this.gesture.move(pointer.id,pointer.x,pointer.y);});
    this.input.on('pointerup',(pointer:Phaser.Input.Pointer)=>{
      if(compactDevice()){
        if(useGame.getState().overlay){this.gesture.reset();return;}
        const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
        const targets=this.getTargets();
        const owner=Math.abs(point.x-shopPeople.owner.x)<24&&point.y>shopPeople.owner.y-44&&point.y<shopPeople.owner.y+16;
        const target=owner?targets.find(t=>t.kind==='counter'):targets.find(t=>point.x>=t.x-5&&point.x<=t.x+t.w+5&&point.y>=t.y-5&&point.y<=t.y+t.h+5);
        const emptyFloor=!target&&point.x>=56&&point.x<=904&&point.y>=136&&point.y<=582&&!this.solids.some(r=>r.contains(point.x,point.y));
        const action=this.gesture.up(pointer.id,pointer.x,pointer.y,pointer.upTime,emptyFloor);
        if(action==='setting'){this.cancelRoute();this.pendingTarget=null;useGame.getState().openSetting();}
        else if(action==='tap'&&point.x>=shopExit.x&&point.x<=shopExit.x+shopExit.width&&point.y>=560){
          this.pendingTarget=null;
          this.route=findWalkingPath({x:this.player.x,y:this.player.y},{x:point.x,y:578},this.solids);
        }
        else if(action==='tap'&&target){
          this.pendingTarget=target;
          this.route=findWalkingPath({x:this.player.x,y:this.player.y},{x:target.x+target.w/2,y:target.y+target.h/2},this.solids);
        }
        return;
      }
      const start=tap;tap=null;
      if(!start||start.id!==pointer.id||useGame.getState().overlay||Math.hypot(pointer.x-start.x,pointer.y-start.y)>12||pointer.upTime-start.time>700)return;
      const target=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      this.route=findWalkingPath({x:this.player.x,y:this.player.y},target,this.solids);
      const end=this.route.at(-1);
      this.destination.setVisible(!!end);if(end)this.destination.setPosition(end.x,end.y);
    });
    this.input.on('pointerupoutside',()=>this.resetKeys());
    this.input.on('gameout',()=>this.resetKeys());
    const cancel=()=>this.resetKeys();this.game.canvas.addEventListener('touchcancel',cancel);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.game.canvas.removeEventListener('touchcancel',cancel));
    this.fitCamera();
    this.keys=this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,Z,ENTER') as Record<string,Phaser.Input.Keyboard.Key>;
    this.input.keyboard!.on('keydown',(event:KeyboardEvent)=>{
      if(!event.repeat&&!event.defaultPrevented&&!useGame.getState().overlay&&(event.code==='KeyZ'||event.code==='Enter'))this.interactionPending=true;
    });
    this.input.keyboard!.addCapture(['UP','DOWN','LEFT','RIGHT','SPACE']);
    this.input.on('blur',()=>this.input.keyboard?.resetKeys());
    this.game.events.on(Phaser.Core.Events.BLUR, this.resetKeys, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.game.events.off(Phaser.Core.Events.BLUR,this.resetKeys,this));
  }
  private cancelRoute(){this.route=[];this.destination?.setVisible(false);}
  private resetKeys(){this.input.keyboard?.resetKeys();touchInput.reset();this.cancelRoute();this.gesture.reset();this.pendingTarget=null;}
  private fitCamera(){
    this.gesture.reset();this.pendingTarget=null;this.cancelRoute();
    const {width,height}=this.scale;
    if(compactDevice()){
      const camera=this.cameras.main;
      camera.setZoom(Math.max(width/560,height/roomView.height));camera.setBounds(roomView.x,roomView.y,roomView.width,roomView.height);
      if(this.player)camera.startFollow(this.player,false,.15,.15);
      return;
    }
    this.cameras.main.stopFollow();this.cameras.main.removeBounds();
    this.cameras.main.setZoom(width/roomView.width,height/roomView.height);
    this.cameras.main.centerOn(roomView.x+roomView.width/2,roomView.y+roomView.height/2);
  }
  private person(x:number,y:number,kind:PersonKind){
    const shadow=this.add.graphics();shadow.fillStyle(0x343847,.22).fillEllipse(0,8,29,9);
    const sprite=this.add.image(0,12,`person-${kind}-down-0`).setOrigin(.5,1).setDisplaySize(personSpriteSize.displayWidth,personSpriteSize.displayHeight);
    if(kind==='player')this.playerSprite=sprite;
    return this.add.container(x,y,[shadow,sprite]).setDepth(y);
  }
  update(_time:number,delta:number){
    if(!this.player||this.leaving)return;
    const points=useGame.getState().proficiencyPoints;
    if(this.boardPoints!==points){this.boardPoints=points;proficiencyStandings(points).forEach((p,i)=>this.boardLines[i]?.setText(`${i+1} ${p.name.split(' ').at(-1)}\n    ${p.points}pt`).setColor(p.id==='player'?'#ffe18c':'#e6dfbc'));}
    const touchAction=touchInput.consume();
    const action=this.interactionPending||touchAction;
    this.interactionPending=false;
    if(this.inputVersion!==touchInput.version()){this.inputVersion=touchInput.version();this.cancelRoute();this.gesture.reset();this.pendingTarget=null;}
    if(useGame.getState().overlay){this.cancelRoute();this.gesture.reset();this.pendingTarget=null;return;}
    let dx=0,dy=0;
    if(this.keys.LEFT.isDown||this.keys.A.isDown){dx=-1;this.facing='left';}
    else if(this.keys.RIGHT.isDown||this.keys.D.isDown){dx=1;this.facing='right';}
    else if(this.keys.UP.isDown||this.keys.W.isDown){dy=-1;this.facing='up';}
    else if(this.keys.DOWN.isDown||this.keys.S.isDown){dy=1;this.facing='down';}
    const finger=this.gesture.direction();
    if(dx===0&&dy===0){dx=finger.x;dy=finger.y;}
    if(dx)this.facing=dx<0?'left':'right';else if(dy)this.facing=dy<0?'up':'down';
    const manual=dx!==0||dy!==0;
    if(manual||action){this.cancelRoute();this.pendingTarget=null;}
    const step=155*Math.min(delta,40)/1000;
    const waypoint=this.route[0];let travel=step;
    if(!manual&&waypoint){
      const xDistance=waypoint.x-this.player.x,yDistance=waypoint.y-this.player.y;
      if(Math.abs(xDistance)>.01){dx=Math.sign(xDistance);travel=Math.min(step,Math.abs(xDistance));this.facing=dx<0?'left':'right';}
      else if(Math.abs(yDistance)>.01){dy=Math.sign(yDistance);travel=Math.min(step,Math.abs(yDistance));this.facing=dy<0?'up':'down';}
    }
    const x=Phaser.Math.Clamp(this.player.x+dx*travel,56,904), y=Phaser.Math.Clamp(this.player.y+dy*travel,136,582);
    const feet=new Phaser.Geom.Rectangle(x-11,y-3,22,17);
    const moving=(dx!==0||dy!==0)&&!this.solids.some(r=>Phaser.Geom.Intersects.RectangleToRectangle(feet,r))&&(x!==this.player.x||y!==this.player.y);
    if(moving){this.player.setPosition(x,y);this.walkTime+=delta;}else this.walkTime=0;
    if(waypoint&&Math.hypot(this.player.x-waypoint.x,this.player.y-waypoint.y)<.1)this.route.shift();
    if(waypoint&&(dx!==0||dy!==0)&&!moving)this.cancelRoute();
    if(!this.route.length)this.destination.setVisible(false);
    this.playerSprite.setTexture(`person-player-${this.facing}-${moving?Math.floor(this.walkTime/130)%4:0}`);
    this.player.setDepth(this.player.y);
    if(isAtShopExit(this.player)){
      this.leaving=true;this.resetKeys();useGame.setState({nearby:''});this.onExit();return;
    }
    const targets=this.getTargets();
    const distance=(t:ShopTarget)=>Math.hypot(this.player.x-Phaser.Math.Clamp(this.player.x,t.x,t.x+t.w),this.player.y-Phaser.Math.Clamp(this.player.y,t.y,t.y+t.h));
    const nearest=targets.map(t=>({t,d:distance(t)})).sort((a,b)=>a.d-b.d)[0];
    const target=nearest?.d<62?nearest.t:null;
    const nearby=target?.label??'';
    if(useGame.getState().nearby!==nearby)useGame.setState({nearby});
    if(this.pendingTarget&&distance(this.pendingTarget)<62){const selected=this.pendingTarget;this.pendingTarget=null;this.cancelRoute();this.interactWith(selected);}
    else if(this.pendingTarget&&!this.route.length)this.pendingTarget=null;
    if(action&&target)this.interactWith(target);
  }
  private getTargets():ShopTarget[]{
    const targets:ShopTarget[]=[...fixtures.map(f=>({...f,speaker:f.label,shopAfter:f.kind==='counter'})),{x:shopPeople.rival.x-16,y:shopPeople.rival.y-42,w:32,h:54,label:`ライバル ${story.rival}`,speaker:story.rival,shopAfter:false,text:'ぼくは早瀬凪。この町でミニレーサーを走らせているんだ。湊くん、速いモーターだけじゃなく、ギアやタイヤの組み合わせも大事だよ。'}];
    const state=useGame.getState(),condition=equippedCondition(state.equipment,state.units,state.selectedUnits);
    const visitors=shopVisitors.map(v=>({x:v.x-16,y:v.y-42,w:32,h:54,label:v.name,speaker:v.name,shopAfter:false,text:shopAdvice(v.kind,{money:state.money,inventory:state.inventory,equipment:state.equipment,motorSeconds:condition.motorSeconds,qualified:state.unlockedRaces.includes(nextShopRace.id)})}));
    return [...targets,...visitors];
  }
  private interactWith(target:ShopTarget){
      this.gesture.reset();
      if(target.kind==='track')useGame.getState().startTrial();
      else if(target.kind==='board')useGame.getState().openProficiency();
      else if(target.kind==='legends')useGame.getState().openLegends();
      else if(target.kind==='bookshelf')useGame.getState().readHintBook();
      else if(target.kind==='bench')useGame.getState().openSetting();
      else useGame.getState().talk(target.speaker,target.text,target.shopAfter);
  }
}
