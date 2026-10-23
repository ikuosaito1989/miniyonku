import Phaser from 'phaser';
import { room, roomView, type Fixture } from '../data/shop';
import { createShopGesture } from './shopGesture';
import { useGame } from './store';
import { createPeopleTextures, drawShopFixture, drawShopRoom, type Facing, type PersonKind } from './ShopArt';
import { personSpriteSize } from './PeopleArt';
import { story } from '../data/story';
import { nextShopRace } from '../data/shopHints';
import { equippedCondition } from './condition';
import { shopAdvice } from './shopAdvice';
import { touchInput } from './touchInput';
import { compactDevice } from '../data/display';
import { findWalkingPath, type Point } from './navigation';
import { proficiencyStandings } from '../data/proficiency';
import shopIllustration from '../assets/shop/interior-v1.webp';
import { shopIllustrationKey } from '../data/shopIllustration';
import { currentShop, isVenueOpen, shopExit, townSpawn, townVenues, venueMessage } from '../data/world';
import { shopCast } from '../data/shopCast';
import { mirroredShop, shopLayout } from '../data/shopLayout';
import { challenger, challengerSpot } from '../data/challenger';
import { challengerDrawing } from './PeopleArt';
import { paintPixels } from './pixelDrawing';
import { drawTown } from './TownArt';
import { getCircuitTrack } from '../data/circuit';

interface ShopTarget {x:number;y:number;w:number;h:number;label:string;speaker:string;shopAfter:boolean;text:string;kind?:Fixture['kind']|'exit'|'venue'|'challenger';venueId?:string}
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
  private isTown=false;
  private transitionArmed=true;
  private challengerPerson:Phaser.GameObjects.Container|null=null;
  private challengerSolid:Phaser.Geom.Rectangle|null=null;
  private get cast(){return shopCast(currentShop(useGame.getState().location).id);}
  constructor(){ super('shop'); }
  preload(){this.load.image(shopIllustrationKey,shopIllustration);}
  create(){
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.scale.off(Phaser.Scale.Events.RESIZE,this.fitCamera,this));
    this.solids=[];
    this.isTown=useGame.getState().location==='town';
    createPeopleTextures(this);
    if(this.isTown){
      drawTown(this,useGame.getState());
      this.solids=townVenues.map(v=>new Phaser.Geom.Rectangle(v.x,v.y,v.w,v.h));
    }else{
    const shopId=currentShop(useGame.getState().location).id,layout=shopLayout(shopId),mirrored=mirroredShop(shopId);
    const fixtures=layout.map(f=>f.target);
    drawShopRoom(this,mirrored);
    for(const {source,target:fixture} of layout){
      drawShopFixture(this,fixture,source,mirrored);
      this.solids.push(new Phaser.Geom.Rectangle(fixture.x,fixture.y,fixture.w,fixture.h));
    }
    const board=fixtures.find(f=>f.kind==='board')!;
    this.boardLines=Array.from({length:5},(_,i)=>this.add.text(board.x+5,board.y+23+i*15,'',{fontFamily:'"Noto Sans JP",monospace',fontSize:'5px',color:'#e6dfbc',resolution:2}).setDepth(board.y+board.h+2));
    const cast=this.cast;
    this.person(cast.owner.x,cast.owner.y,'owner');
    this.person(cast.rival.x,cast.rival.y,'rival');
    for(const visitor of cast.visitors){
      this.person(visitor.x,visitor.y,visitor.kind);
      this.solids.push(new Phaser.Geom.Rectangle(visitor.x-12,visitor.y-9,24,21));
    }
    this.solids.push(new Phaser.Geom.Rectangle(cast.rival.x-12,cast.rival.y-9,24,21));
    const shop=currentShop(useGame.getState().location);
    // 店内の基本レイアウトは共有し、店名・色・展示コースを切り替える。
    if(shop.id!=='komorebi'){
      const signX=mirrored?748:204;
      this.add.rectangle(480,320,880,570,shop.color,.09).setDepth(1);
      this.add.rectangle(signX,70,260,64,shop.id==='aozora'?0x284b6b:0x6a5234).setDepth(110);
      this.add.text(signX,49,shop.name,{fontFamily:'sans-serif',fontSize:'21px',fontStyle:'bold',color:'#f8edcc',resolution:2}).setOrigin(.5,0).setDepth(111);
      this.add.text(signX,80,shop.id==='aozora'?'連続コーナーで磨く、次の走り':'高速コーナーをつなぐ、持久力の勝負',{fontFamily:'sans-serif',fontSize:'8px',color:'#c7e6e6',resolution:2}).setOrigin(.5,0).setDepth(111);
      const f=fixtures.find(f=>f.kind==='track')!,{circuit,circuitLength,sampleCircuit}=getCircuitTrack(shop.circuitId),g=this.add.graphics().setDepth(f.y+f.h+1);
      const plotX=(f.w-28)/(2*(circuit.radiusX+Math.abs(circuit.asymmetry))),plotY=(f.h-38)/(2*(circuit.radiusZ+Math.abs(circuit.chicane)));
      g.fillStyle(0x476d75).fillRoundedRect(f.x+3,f.y+3,f.w-6,f.h-6,9);
      for(let lane=0;lane<6;lane++){
        g.lineStyle(2,0xe5e2c8);g.beginPath();
        for(let i=0;i<=160;i++){const p=sampleCircuit(i/160*circuitLength),scale=1-lane*.065,x=f.x+f.w/2+p.x*plotX*scale,y=f.y+f.h/2+p.z*plotY*scale;if(i===0)g.moveTo(x,y);else g.lineTo(x,y);}
        g.strokePath();
      }
      this.add.text(f.x+f.w/2,f.y+f.h-20,getCircuitTrack(shop.circuitId).circuit.name,{fontFamily:'sans-serif',fontSize:'9px',color:'#fff1bc',resolution:2}).setOrigin(.5,0).setDepth(f.y+f.h+2);
    }
    this.add.rectangle(480,580,84,15,0x34564e).setDepth(590);
    this.add.text(480,575,'▼ 緑川町へ',{fontFamily:'sans-serif',fontSize:'10px',color:'#fff1bd',resolution:2}).setOrigin(.5,0).setDepth(591);
    }
    const spawn=this.isTown?townSpawn(useGame.getState().lastShop):room.spawn;
    this.player=this.person(spawn.x,spawn.y,'player');
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
        const ownerPosition=this.cast.owner;
        const owner=!this.isTown&&Math.abs(point.x-ownerPosition.x)<24&&point.y>ownerPosition.y-44&&point.y<ownerPosition.y+16;
        const target=owner?targets.find(t=>t.kind==='counter'):targets.find(t=>point.x>=t.x-5&&point.x<=t.x+t.w+5&&point.y>=t.y-5&&point.y<=t.y+t.h+5);
        const emptyFloor=!target&&point.x>=56&&point.x<=904&&point.y>=136&&point.y<=582&&!this.solids.some(r=>r.contains(point.x,point.y));
        const action=this.gesture.up(pointer.id,pointer.x,pointer.y,pointer.upTime,emptyFloor);
        if(action==='setting'){this.cancelRoute();this.pendingTarget=null;useGame.getState().openSetting();}
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
  private syncChallenger(){
    const state=useGame.getState(),visible=state.location==='aozora'&&state.aozoraWon;
    if(visible&&!this.challengerPerson){
      const key='person-challenger-down';
      if(!this.textures.exists(key)){
        const texture=this.textures.createCanvas(key,personSpriteSize.width,personSpriteSize.height)!;
        paintPixels(texture.context,challengerDrawing('down'));texture.refresh();texture.setFilter(Phaser.Textures.FilterMode.LINEAR);
      }
      this.challengerPerson=this.person(challengerSpot.x,challengerSpot.y,'rival');
      (this.challengerPerson.list[1] as Phaser.GameObjects.Image).setTexture(key);
      this.challengerPerson.add(this.add.text(0,-51,'黒岩 豪',{fontFamily:'sans-serif',fontSize:'9px',color:'#f2def4',backgroundColor:'#35273e',padding:{x:4,y:2},resolution:2}).setOrigin(.5,1));
      this.challengerSolid=new Phaser.Geom.Rectangle(challengerSpot.x-12,challengerSpot.y-9,24,21);this.solids.push(this.challengerSolid);
    }else if(!visible&&this.challengerPerson){
      this.challengerPerson.destroy();this.challengerPerson=null;this.solids=this.solids.filter(s=>s!==this.challengerSolid);this.challengerSolid=null;
    }
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    this.syncChallenger();
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
    const atExit=!this.isTown&&this.player.y>=567&&Math.abs(this.player.x-480)<32;
    if(!atExit)this.transitionArmed=true;
    else if(this.transitionArmed){this.transitionArmed=false;this.cancelRoute();useGame.getState().leaveShop();return;}
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
    if(this.isTown)return townVenues.map(v=>({x:v.x,y:v.y,w:v.w,h:v.h,label:v.name,speaker:v.name,shopAfter:false,text:venueMessage(v),kind:'venue',venueId:v.id}));
    const cast=this.cast;
    const targets:ShopTarget[]=[...shopLayout(currentShop(useGame.getState().location).id).map(({target:f})=>({...f,speaker:f.label,shopAfter:f.kind==='counter'})),{x:cast.rival.x-16,y:cast.rival.y-42,w:32,h:54,label:`ライバル ${story.rival}`,speaker:story.rival,shopAfter:false,text:'湊くん、速いモーターだけじゃなく、ギアやタイヤの組み合わせも大事だよ。'}];
    const state=useGame.getState(),condition=equippedCondition(state.equipment,state.units,state.selectedUnits);
    const shop=currentShop(state.location);
    const counter=targets.find(t=>t.kind==='counter')!;counter.label=`店主 ${shop.owner}`;counter.speaker=shop.owner;counter.text=shop.welcome;
    const track=targets.find(t=>t.kind==='track')!;track.label=getCircuitTrack(shop.circuitId).circuit.name;
    targets.push({...shopExit,label:'緑川町への出口',speaker:shop.name,shopAfter:false,text:'外の町へ出よう。',kind:'exit'});
    const visitors=cast.visitors.map(v=>({x:v.x-16,y:v.y-42,w:32,h:54,label:v.name,speaker:v.name,shopAfter:false,text:shopAdvice(v.kind,{money:state.money,inventory:state.inventory,equipment:state.equipment,motorSeconds:condition.motorSeconds,qualified:state.unlockedRaces.includes(nextShopRace.id)})}));
    if(shop.id==='aozora'){
      for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?(state.villainDefeated?'黒岩くんに勝ったんだね！町へ出て、この店の右隣のひなた模型店へ行けるよ。':state.aozoraWon?'黒岩くんが店の中央で待っているよ。挑戦レースで1位になると、ひなた模型店への紹介状がもらえるんだって。':'ここは優勝1,000円、5位完走でも250円！まずは優勝しよう。町の黒岩くんが、速いレーサーを探しているみたい。'):'黒岩くんに勝つなら、記念ボディにブリーズモーターを約60秒ならして、4:1ギア・スパークセル・スポンジタイヤを試そう。低重心シャーシと軽量化も比べてね。';
      if(state.aozoraWon)targets.push({x:challengerSpot.x-16,y:challengerSpot.y-42,w:32,h:54,label:challenger.name,speaker:challenger.name,shopAfter:false,text:'挑戦を受ける。',kind:'challenger'});
    }else if(shop.id==='hinata')for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?'ひなた模型店へようこそ！ここは長い高速コーナー。ほかの4店と大会会場は、まだ準備中だよ。':'3.5:1ギアは最高速が伸びる反面、駆動力は下がるよ。ゴールドターミナルとロングランセル、スポンジタイヤで安定した5周を目指してみよう。';
    return [...targets,...visitors];
  }
  private interactWith(target:ShopTarget){
      this.gesture.reset();
      if(target.kind==='exit')useGame.getState().leaveShop();
      else if(target.kind==='challenger')useGame.getState().openVillainChallenge();
      else if(target.kind==='venue'){
        const venue=townVenues.find(v=>v.id===target.venueId)!;
        if(venue.shopId&&isVenueOpen(venue,useGame.getState()))useGame.getState().enterShop(venue.shopId);
        else useGame.getState().talk(venue.name,venueMessage(venue));
      }
      else if(target.kind==='track')useGame.getState().startTrial();
      else if(target.kind==='board')useGame.getState().openProficiency();
      else if(target.kind==='legends')useGame.getState().openLegends();
      else if(target.kind==='bookshelf')useGame.getState().readHintBook();
      else if(target.kind==='bench')useGame.getState().openSetting();
      else useGame.getState().talk(target.speaker,target.text,target.shopAfter);
  }
}
