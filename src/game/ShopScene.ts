import {outdoorAdvisors,outdoorAdvice} from '../data/outdoorAdvisors';
import {drawTownCrowd} from './TownCrowdArt';
import {townCrowdObstacles} from '../data/townCrowd';
import {drawRecordBoard} from './RecordBoardArt';
import {isPracticeCourse} from '../data/practiceCourses';
import {drawLibraryRoom} from './LibraryRoomArt';
import {libraryShelves,libraryObstacles,librarySpawn,libraryExit,libraryReadingDesk} from '../data/libraryRoom';
import type {Category} from '../data/parts';
import {towaEscortLocation,towaEscortSpawn} from './towaEscort';
import {koyaEscortActive,koyaEscortLocation,koyaEscortSpawn,koyaVenueSpot,escortWalk,townEscortWalks} from './koyaEscort';
import {hiddenMechanicSpot,mechanicManName} from '../data/hiddenMechanic';
import {mechanicManDrawing} from './MechanicManArt';
import {townPeople,townPersonAdvice} from '../data/townPeople';
import {tutorialActive} from './tutorial';
import {openingIndex,openingSpawn,openingIsWalk,openingLocation,createOpeningWalk,stepOpeningWalk,type OpeningWalk} from './opening';
import {sceneryImage,sceneryKey} from '../data/scenery';
import {npcAppearanceId} from '../data/npcAppearance';
import {npcDrawing} from './NpcPeopleArt';
import {walkingSpeed} from '../data/shopThemes';
import {legendPersonDrawing} from './LegendPeopleArt';
import {timeBoardPlacement,timeBoardObstacle,officialTimeBoards,outdoorTimeBoardPlacement} from '../data/timeBoard';
import type {TimeHistory} from './timeRecords';
import {shopTrackLayout} from './shopTrackLayout';
import {drawShopTrack} from './ShopTrackArt';
import { officialVenue, officialFixturesFor, officialVenueFor, officialVenuePeople, officialPeopleFor } from '../data/officialVenue';
import { drawOfficialVenue } from './OfficialVenueArt';
import { doctor, doctorSpot, doctorAdvice } from '../data/doctor';
import {startAdviceConversation} from './adviceConversation';
import Phaser from 'phaser';
import { room, roomView, type Fixture } from '../data/shop';
import { createShopGesture } from './shopGesture';
import { useGame } from './store';
import { createPeopleTextures, drawShopFixture, drawShopRoom, type Facing, type PersonKind } from './ShopArt';
import { personDrawing } from './PeopleArt';
import { createArrival,stepArrivalActor,type ArrivalActor,type ArrivalKind } from './arrival';
import { EventAudio,type EventSound } from './EventAudio';
import { useAudioSettings } from './audioSettings';
import { personSpriteSize } from './PeopleArt';
import { story } from '../data/story';
import { nextShopRace } from '../data/shopHints';
import { equippedCondition } from './condition';
import { shopAdvice } from './shopAdvice';
import { touchInput } from './touchInput';
import { compactDevice, shopWorldZoom, townWorldZoom } from '../data/display';
import { findWalkingPath, walkBounds, type Point } from './navigation';
import { isSalesShop, currentShop, isVenueOpen, shopExit, townSpawn, townVenues, venueMessage, townSize, townWalkBounds, townBlocks } from '../data/world';
import { shopCast } from '../data/shopCast';
import { mirroredShop, shopLayout } from '../data/shopLayout';
import { challenger, challengerSpot } from '../data/challenger';
import { challengerDrawing, doctorDrawing } from './PeopleArt';
import { createPersonTexture } from './PersonTexture';
import { drawTown } from './TownArt';
import { drawShopDetails } from './WorldDetailArt';
import { getCircuitTrack,type CircuitId } from '../data/circuit';

interface ShopTarget {circuitId?:CircuitId;x:number;y:number;w:number;h:number;label:string;speaker:string;shopAfter:boolean;text:string;libraryCategory?:Category|'all';kind?:Fixture['kind']|'library-shelf'|'library-catalogue'|'mechanic-man'|'town-person'|'time-records'|'exit'|'venue'|'challenger'|'legend-challenger'|'official-speed'|'official-dirt'|'official-reception'|'official-technical'|'official-final'|'official-zenith';venueId?:string}
export class ShopScene extends Phaser.Scene {
  private gesture=createShopGesture();
  private screenPoint(pointer:Phaser.Input.Pointer){return {x:pointer.x*this.scale.displaySize.width/this.scale.width,y:pointer.y*this.scale.displaySize.height/this.scale.height};}
  private pendingTarget:ShopTarget|null=null;
  private player!: Phaser.GameObjects.Container;
  private keys!: Record<string, Phaser.Input.Keyboard.Key>;
  private solids:Phaser.Geom.Rectangle[]=[];
  private facing:Facing='down';
  private playerSprite!:Phaser.GameObjects.Image;
  private walkTime=0;
  private escortPhase=-1;
  private escortGuide:Phaser.GameObjects.Container|null=null;
  private escortArrival:ArrivalActor|null=null;
  private escortPlayerWalk:OpeningWalk|null=null;
  private escortGuideWalk:OpeningWalk|null=null;
  private openingPhase=-1;
  private openingWalk:OpeningWalk|null=null;
  private mapTime=0;
  private interactionPending=false;
  private route:Point[]=[];
  private destination!:Phaser.GameObjects.Graphics;
  private inputVersion=0;

  private timeBoardContainer?:Phaser.GameObjects.Container;
  private timeBoardHistory?:TimeHistory;
  private arrivalKind:ArrivalKind|null=null;
  private arriving:{state:ArrivalActor;container:Phaser.GameObjects.Container;kind:string;solid:Phaser.Geom.Rectangle|null}[]=[];
  private eventAudio=new EventAudio();
  private isTown=false;
  private updateTownCrowd:((time:number)=>void)|null=null;
  private approach(target:ShopTarget){
    if(this.isTown)return {x:target.x+target.w/2,y:target.y+target.h+(target.kind==='town-person'||target.kind==='mechanic-man'?20:28)};
    return {x:target.x+target.w/2,y:target.y+target.h/2};
  }
  private get bounds(){return this.isTown?townWalkBounds:walkBounds;}
  private get isLibrary(){return useGame.getState().location==='library';}
  private isOfficial=false;
  private transitionArmed=true;
  private doctorPerson:Phaser.GameObjects.Container|null=null;
  private doctorSolid:Phaser.Geom.Rectangle|null=null;
  private challengerPerson:Phaser.GameObjects.Container|null=null;
  private challengerSolid:Phaser.Geom.Rectangle|null=null;
  private get cast(){return shopCast(currentShop(useGame.getState().location).id);}
  constructor(){ super('shop'); }
  preload(){const id=useGame.getState().location,image=sceneryImage(id);if(image)this.load.image(sceneryKey(id),image);if(id==='town')for(const [key,path] of [['civic-arena-occlusion','/assets/civic-arena-occlusion.webp'],['civic-arena-teal','/assets/civic-arena-teal.webp'],['civic-arena-violet','/assets/civic-arena-violet.webp'],['civic-arena-amber','/assets/civic-arena-amber.webp'],['civic-library','/assets/civic-library.webp'],['civic-shop-occlusion','/assets/civic-shop-occlusion.webp'],['civic-shop-amber','/assets/civic-shop-amber.webp'],['civic-shop-green','/assets/civic-shop-green.webp'],['civic-shop-violet','/assets/civic-shop-violet.webp'],['civic-shop-red','/assets/civic-shop-red.webp'],['civic-shop-teal','/assets/civic-shop-teal.webp'],['town-course-arena','/assets/town-course-arena.webp']] as const)if(!this.textures.exists(key))this.load.image(key,path);}
  create(){
    this.eventAudio=new EventAudio();
    const unlockAudio=()=>{if(useAudioSettings.getState().enabled)this.eventAudio.unlock();};
    window.addEventListener('pointerdown',unlockAudio,true);window.addEventListener('keydown',unlockAudio,true);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>{window.removeEventListener('pointerdown',unlockAudio,true);window.removeEventListener('keydown',unlockAudio,true);this.eventAudio.dispose();});
    this.isTown=useGame.getState().location==='town';this.isOfficial=['stadium-5','stadium-9','stadium-10','stadium-7'].includes(useGame.getState().location);
    this.fitCamera();
    this.scale.on(Phaser.Scale.Events.RESIZE,this.fitCamera,this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.scale.off(Phaser.Scale.Events.RESIZE,this.fitCamera,this));
    this.solids=[];this.updateTownCrowd=null;
    createPeopleTextures(this);
    if(this.isTown){
      drawTown(this,useGame.getState());
      this.updateTownCrowd=drawTownCrowd(this,(person,id)=>{if(outdoorAdvisors.some(p=>p.id===id))this.addConversationMarker(person);});
      this.solids=[...townVenues,...townBlocks].map(v=>new Phaser.Geom.Rectangle(v.x,v.y,v.w,v.h));
      this.solids.push(...townCrowdObstacles.map(v=>new Phaser.Geom.Rectangle(v.x,v.y,v.width,v.height)));
      const hidden=this.person(hiddenMechanicSpot.x,hiddenMechanicSpot.y,'owner');
      this.addConversationMarker(hidden);
      const hiddenKey='mechanic-man-down';if(!this.textures.exists(hiddenKey))createPersonTexture(this,hiddenKey,mechanicManDrawing());
      (hidden.list[1] as Phaser.GameObjects.Image).setTexture(hiddenKey);
      this.solids.push(new Phaser.Geom.Rectangle(hiddenMechanicSpot.x-12,hiddenMechanicSpot.y-9,24,21));
      for(const npc of townPeople){
        this.addConversationMarker(this.person(npc.x,npc.y,'rival',npc.name));
        this.solids.push(new Phaser.Geom.Rectangle(npc.x-12,npc.y-9,24,21));
      }
    }else if(this.isLibrary){
      drawLibraryRoom(this);this.solids=libraryObstacles.map(r=>new Phaser.Geom.Rectangle(r.x,r.y,r.width,r.height));
    }else if(this.isOfficial){
      drawOfficialVenue(this,useGame.getState().location);
      this.solids=officialFixturesFor(useGame.getState().location).map(f=>new Phaser.Geom.Rectangle(f.x,f.y,f.w,f.h));
      for(const npc of officialPeopleFor(useGame.getState().location)){
        const person=this.person(npc.x,npc.y,npc.kind,npc.name);
        this.addConversationMarker(person);
        if(npc.id==='rei'||npc.id==='gaku'){(person.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(npc.id,'down',0));}
        if(npc.id==='jin'&&useGame.getState().location==='stadium-10')this.escortGuide=person;
        if(npc.id==='go'||npc.id==='riku'||npc.id==='jin'||npc.id==='koya'){
          const key=`venue-${npc.id}-down`;
          if(!this.textures.exists(key)){
            createPersonTexture(this,key,npc.id==='koya'?legendPersonDrawing('koya','down'):npc.id==='jin'?legendPersonDrawing('towa','down'):npc.id==='go'?challengerDrawing('down'):npcDrawing('offroader','down'));
          }
          (person.list[1] as Phaser.GameObjects.Image).setTexture(key);
        }
        this.solids.push(new Phaser.Geom.Rectangle(npc.x-12,npc.y-9,24,21));
      }
    }else{
    const shopId=currentShop(useGame.getState().location).id,layout=shopLayout(shopId),mirrored=mirroredShop(shopId);
    const fixtures=layout.map(f=>f.target);
    drawShopRoom(this,mirrored,isSalesShop(shopId),shopId);
    drawShopDetails(this,mirrored,shopId);
    for(const {source,target:fixture} of layout){
      drawShopFixture(this,fixture,source,mirrored,shopId);
      this.solids.push(new Phaser.Geom.Rectangle(fixture.x,fixture.y,fixture.w,fixture.h));
    }
    const cast=this.cast;
    const ownerPerson=this.person(cast.owner.x,cast.owner.y,'owner',cast.owner.name);
    this.addConversationMarker(ownerPerson);
    const rivalPerson=this.person(cast.rival.x,cast.rival.y,useGame.getState().location==='hinata'?'mechanic':'rival',cast.rival.name);
    this.addConversationMarker(rivalPerson);
    if((shopId==='akatsuki'||shopId==='hoshikuzu')){const key='akatsuki-towa';if(!this.textures.exists(key))createPersonTexture(this,key,legendPersonDrawing('towa','down'));(rivalPerson.list[1] as Phaser.GameObjects.Image).setTexture(key);}
    for(const visitor of cast.visitors){
      const npc=this.person(visitor.x,visitor.y,visitor.kind,visitor.name);
      this.addConversationMarker(npc);
      if((shopId==='akatsuki'||shopId==='hoshikuzu')){if(visitor.name==='風見 怜'||visitor.name==='火野 岳')(npc.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(visitor.name==='風見 怜'?'rei':'gaku','down',0));if(visitor.name==='山城 昊也'){const key='akatsuki-koya';if(!this.textures.exists(key))createPersonTexture(this,key,legendPersonDrawing('koya','down'));(npc.list[1] as Phaser.GameObjects.Image).setTexture(key);}}
      this.solids.push(new Phaser.Geom.Rectangle(visitor.x-12,visitor.y-9,24,21));
    }
    this.solids.push(new Phaser.Geom.Rectangle(cast.rival.x-12,cast.rival.y-9,24,21));
    const shop=currentShop(useGame.getState().location);
    // 通路は共有し、店別の原画と正確な展示コースを重ねる。
    {
      const f=fixtures.find(f=>f.kind==='track')!,g=this.add.graphics().setDepth(f.y+f.h+1);

      if(isSalesShop(shop.id)&&(!this.textures.exists(sceneryKey(shop.id))||shop.id!=='atelier')){
        g.fillStyle(shop.id==='torque'?0x594234:shop.id==='velocity'?0x304b61:shop.id==='terrain'?0x435337:0x302f4b).fillRect(f.x+3,f.y+3,f.w-6,f.h-6);g.lineStyle(3,0xd5b779).strokeRect(f.x+8,f.y+8,f.w-16,f.h-16);
        for(const i of [0,1]){
          const x=f.x+25+i*130;g.fillStyle(0x54456f).fillRect(x,f.y+30,105,75);g.lineStyle(2,0xe4c981).strokeRect(x,f.y+30,105,75);
          if(i===0){
            g.fillStyle(0xd8bd78).fillRect(x+23,f.y+52,55,27);g.fillStyle(0x8c72b1).fillRect(x+26,f.y+54,49,23);
            g.fillStyle(0xf1d88e).fillEllipse(x+25,f.y+65,15,27).fillEllipse(x+78,f.y+65,15,27);
            g.fillStyle(0x454158).fillEllipse(x+80,f.y+65,7,17);g.fillStyle(0xdce3df).fillRect(x+80,f.y+63,16,4);
            for(let vent=0;vent<7;vent++)g.fillStyle(0x352d49).fillRect(x+31+vent*6,f.y+57,3,8);
            g.fillStyle(0xe5b873).fillRect(x+14,f.y+59,6,4).fillRect(x+14,f.y+69,6,4);g.fillStyle(0xb9a1d1).fillRect(x+31,f.y+72,42,2);
          }else{
            g.fillStyle(0xe1c882).fillPoints([{x:x+12,y:f.y+70},{x:x+45,y:f.y+44},{x:x+93,y:f.y+57},{x:x+59,y:f.y+88}],true);
            g.fillStyle(0x354055).fillPoints([{x:x+17,y:f.y+69},{x:x+45,y:f.y+49},{x:x+86,y:f.y+58},{x:x+57,y:f.y+82}],true);
            g.lineStyle(3,0xc9b078).lineBetween(x+24,f.y+70,x+46,f.y+54).lineBetween(x+60,f.y+77,x+80,f.y+60);
            g.fillStyle(0x7e62a3).fillRect(x+43,f.y+58,16,12);g.fillStyle(0xf5dfa1).fillRect(x+45,f.y+59,12,2);
          }
        }
      }else if(!isSalesShop(shop.id)){
      drawShopTrack(this,f,getCircuitTrack(shop.circuitId),f.y+f.h+1,this.textures.exists(sceneryKey(shop.id)));
      if(shop.id==='akatsuki'||shop.id==='hoshikuzu'){const layout=shopTrackLayout(getCircuitTrack('forge'),f.w,f.h).centerline,cars=[0x477de0,0xe5b839,0x15191f,0x612b3e].map(c=>this.add.rectangle(0,0,4,2,c).setDepth(f.y+f.h+3));this.time.addEvent({delay:90,loop:true,callback:()=>cars.forEach((car,i)=>{const j=(Math.floor(this.time.now/65)+i*280)%1200,p=layout[j],q=layout[(j+1)%1200];car.setPosition(f.x+p.x,f.y+p.y).setRotation(Math.atan2(q.y-p.y,q.x-p.x));})});}
      }
    }
    }
    if(this.isOfficial){for(const p of officialTimeBoards(useGame.getState().location))this.solids.push(new Phaser.Geom.Rectangle(p.x+8,p.y+p.h-10,p.w-16,10));this.drawTimeBoard();}
    if(!this.isTown&&!this.isLibrary&&!this.isOfficial&&!isSalesShop(useGame.getState().location)){
      const shop=currentShop(useGame.getState().location),obstacle=timeBoardObstacle(shop.id);
      this.solids.push(new Phaser.Geom.Rectangle(obstacle.x,obstacle.y,obstacle.width,obstacle.height));this.drawTimeBoard();
    }
    const spawn=this.isLibrary?librarySpawn:koyaEscortActive(useGame.getState().towaEscortStep)?towaEscortSpawn(useGame.getState().towaEscortStep):koyaEscortActive(useGame.getState().koyaEscortStep)?koyaEscortSpawn(useGame.getState().koyaEscortStep):useGame.getState().openingActive?openingSpawn(openingIndex(useGame.getState())):this.isTown?townSpawn(useGame.getState().townReturnVenue??useGame.getState().lastShop):this.isOfficial?officialVenue.spawn:room.spawn;
    this.player=this.person(spawn.x,spawn.y,'player');
    if(useGame.getState().location==='stadium-9'){
      this.escortGuide=this.person(koyaVenueSpot.x,koyaVenueSpot.y,'rival');
      this.addConversationMarker(this.escortGuide);
      (this.escortGuide.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture('koya','down',0));
      this.solids.push(new Phaser.Geom.Rectangle(koyaVenueSpot.x-12,koyaVenueSpot.y-9,24,21));
    }
    if(this.isTown)window.dispatchEvent(new CustomEvent('town-position',{detail:spawn}));
    this.destination=this.add.graphics().setDepth(9999).setVisible(false);
    this.destination.lineStyle(2,0xffdf87).strokeCircle(0,0,8).lineBetween(-12,0,-5,0).lineBetween(5,0,12,0).lineBetween(0,-12,0,-5).lineBetween(0,5,0,12);
    if(this.isTown){
      const navigate=(event:Event)=>{
        if(useGame.getState().overlay)return;
        const id=(event as CustomEvent<string>).detail,target=this.getTargets().find(t=>t.venueId===id);
        if(!target)return;
        this.inputVersion=touchInput.version();
        this.pendingTarget=target;
        this.route=findWalkingPath({x:this.player.x,y:this.player.y},this.approach(target),this.solids,this.bounds);
      };
      window.addEventListener('town-navigate',navigate);
      this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>window.removeEventListener('town-navigate',navigate));
    }

    this.inputVersion=touchInput.version();
    let tap:{x:number;y:number;time:number;id:number}|null=null;
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      const screen=this.screenPoint(pointer);
      if(useGame.getState().overlay)return;
      if(compactDevice()){this.cancelRoute();this.pendingTarget=null;this.gesture.down(pointer.id,screen.x,screen.y,pointer.downTime);return;}
      tap={x:screen.x,y:screen.y,time:pointer.downTime,id:pointer.id};
    });
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{if(compactDevice())this.gesture.move(pointer.id,this.screenPoint(pointer).x,this.screenPoint(pointer).y);});
    this.input.on('pointerup',(pointer:Phaser.Input.Pointer)=>{
      const screen=this.screenPoint(pointer);
      if(compactDevice()){
        if(useGame.getState().overlay){this.gesture.reset();return;}
        const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
        const targets=this.getTargets();
        const ownerPosition=this.cast.owner;
        const owner=!this.isTown&&!this.isLibrary&&Math.abs(point.x-ownerPosition.x)<24&&point.y>ownerPosition.y-44&&point.y<ownerPosition.y+16;
        const target=owner?targets.find(t=>t.kind==='counter'):targets.find(t=>point.x>=t.x-5&&point.x<=t.x+t.w+5&&point.y>=t.y-5&&point.y<=t.y+t.h+5);
        const emptyFloor=!target&&point.x>=this.bounds.left&&point.x<=this.bounds.right&&point.y>=this.bounds.top&&point.y<=this.bounds.bottom&&!this.solids.some(r=>r.contains(point.x,point.y));
        const action=this.gesture.up(pointer.id,screen.x,screen.y,pointer.upTime,emptyFloor);
        if(action==='setting'){this.cancelRoute();this.pendingTarget=null;if(this.isLibrary)useGame.getState().openLibrary();else useGame.getState().openSetting();}
        else if(action==='tap'&&target){
          this.pendingTarget=target;
          this.route=findWalkingPath({x:this.player.x,y:this.player.y},this.approach(target),this.solids,this.bounds);
        }
        return;
      }
      const start=tap;tap=null;
      if(!start||start.id!==pointer.id||useGame.getState().overlay||Math.hypot(screen.x-start.x,screen.y-start.y)>12||pointer.upTime-start.time>700)return;
      const target=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      const board=this.getTargets().find(t=>(t.kind==='time-records'||this.isLibrary)&&target.x>=t.x&&target.x<=t.x+t.w&&target.y>=t.y&&target.y<=t.y+t.h);
      this.pendingTarget=board??null;
      this.route=findWalkingPath({x:this.player.x,y:this.player.y},board?this.approach(board):target,this.solids,this.bounds);
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
    if(new URLSearchParams(window.location.search).has('renderstats')){
      const textures=Object.values(this.textures.list) as Phaser.Textures.Texture[],sources=textures.flatMap(texture=>texture.source),uniqueImages=new Set(sources.map(source=>source.image));
      const estimatedGpuBytes=sources.reduce((sum,source)=>sum+source.width*source.height*4,0);
      const stats={location:useGame.getState().location,renderer:this.game.renderer.type,textureCount:textures.length,sourceCount:sources.length,uniqueImages:uniqueImages.size,estimatedGpuMiB:Number((estimatedGpuBytes/1048576).toFixed(1)),canvasWidth:this.game.canvas.width,canvasHeight:this.game.canvas.height};
      console.info(`[seiran-renderstats] ${JSON.stringify(stats)} (RGBA estimate; driver overhead and CPU canvas buffers excluded)`);
      window.dispatchEvent(new CustomEvent('seiran:renderstats',{detail:stats}));
    }
    window.dispatchEvent(new CustomEvent('miniyonku:world-ready',{detail:{location:useGame.getState().location}}));
  }
  private cancelRoute(){this.route=[];this.destination?.setVisible(false);}
  private resetKeys(){this.input.keyboard?.resetKeys();touchInput.reset();this.cancelRoute();this.gesture.reset();this.pendingTarget=null;}
  private fitCamera(){
    this.gesture.reset();this.pendingTarget=null;this.cancelRoute();
    const {width,height}=this.scale;
    const compact=compactDevice(),zoom=this.isTown?townWorldZoom(width,height,compact):shopWorldZoom(width,height,compact);
    if(this.isTown){
      const camera=this.cameras.main;
      camera.setZoom(zoom.x,zoom.y);
      camera.setBounds(0,0,townSize.width,townSize.height);
      if(this.player){
        camera.startFollow(this.player,false,.18,.18);
        // Keep the venue roof in view while the avatar stands at its entrance.
        camera.setFollowOffset(0,height*.18/zoom.y);
      }
      return;
    }
    if(compact){
      const camera=this.cameras.main;
      camera.setZoom(zoom.x,zoom.y);camera.setBounds(roomView.x,roomView.y,roomView.width,roomView.height);
      if(this.player)camera.startFollow(this.player,false,.15,.15);
      return;
    }
    this.cameras.main.stopFollow();this.cameras.main.removeBounds();
    this.cameras.main.setZoom(zoom.x,zoom.y);
    this.cameras.main.centerOn(roomView.x+roomView.width/2,roomView.y+roomView.height/2);
  }
  // 会話対象の人物に、文字を使わない吹き出しを表示する。
  private addConversationMarker(person:Phaser.GameObjects.Container){
    if(person.getData('conversationMarker'))return;
    person.setData('conversationMarker',true);
    const marker=this.add.graphics();
    marker.fillStyle(0x273e48,.45).fillRoundedRect(-13,-78,26,18,6);
    marker.fillStyle(0xfff8de,1).fillRoundedRect(-12,-80,24,17,6);
    marker.lineStyle(2,0x35535a,1).strokeRoundedRect(-12,-80,24,17,6);
    marker.fillStyle(0xfff8de,1).fillTriangle(-4,-64,1,-58,3,-65);
    marker.lineStyle(2,0x35535a,1).lineBetween(-4,-64,1,-58).lineBetween(1,-58,3,-64);
    marker.fillStyle(0x547e7d,1).fillCircle(-6,-72,1.5).fillCircle(0,-72,1.5).fillCircle(6,-72,1.5);
    person.add(marker);
  }
  private person(x:number,y:number,kind:PersonKind,name?:string){
    const shadow=this.add.graphics();shadow.fillStyle(0x344d48,.10).fillEllipse(1,9,35,11);shadow.fillStyle(0x263f40,.20).fillEllipse(0,8,23,6);
    const appearance=name?npcAppearanceId(name):null;
    const key=appearance?`npc-${appearance}-down-0`:`person-${kind}-down-0`;
    if(appearance&&!this.textures.exists(key))createPersonTexture(this,key,npcDrawing(appearance,'down'));
    const sprite=this.add.image(0,12,key).setOrigin(.5,1).setDisplaySize(personSpriteSize.displayWidth,personSpriteSize.displayHeight);
    if(kind==='player')this.playerSprite=sprite;
    return this.add.container(x,y,[shadow,sprite]).setDepth(y);
  }
  private syncChallenger(){
    const state=useGame.getState(),visible=state.location==='aozora'&&state.aozoraWon;
    if(visible&&!this.challengerPerson){
      const key='person-challenger-down';
      if(!this.textures.exists(key)){
        createPersonTexture(this,key,challengerDrawing('down'));
      }
      this.challengerPerson=this.person(challengerSpot.x,challengerSpot.y,'rival');
      this.addConversationMarker(this.challengerPerson);
      (this.challengerPerson.list[1] as Phaser.GameObjects.Image).setTexture(key);
      this.challengerSolid=new Phaser.Geom.Rectangle(challengerSpot.x-12,challengerSpot.y-9,24,21);this.solids.push(this.challengerSolid);
    }else if(!visible&&this.challengerPerson){
      this.challengerPerson.destroy();this.challengerPerson=null;this.solids=this.solids.filter(s=>s!==this.challengerSolid);this.challengerSolid=null;
    }
  }
  private syncDoctor(){
    const visible=useGame.getState().location==='komorebi'&&useGame.getState().doctorGiftReceived;
    if(visible&&!this.doctorPerson){
      const actor=this.arriving.find(actor=>actor.kind==='doctor'&&actor.state.arrived);
      if(actor){
        this.doctorPerson=actor.container;this.doctorSolid=actor.solid;
        this.arriving=this.arriving.filter(other=>other!==actor);
      }else{
        this.doctorPerson=this.person(doctorSpot.x,doctorSpot.y,'owner');
        (this.doctorPerson.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture('doctor','down',0));
        this.doctorSolid=new Phaser.Geom.Rectangle(doctorSpot.x-12,doctorSpot.y-9,24,21);this.solids.push(this.doctorSolid);
      }
      this.addConversationMarker(this.doctorPerson);
    }else if(!visible&&this.doctorPerson){
      this.doctorPerson.destroy();this.doctorPerson=null;
      this.solids=this.solids.filter(s=>s!==this.doctorSolid);this.doctorSolid=null;
    }
  }
  private playEventSound(cue:EventSound){
    const {enabled,volume}=useAudioSettings.getState();if(enabled)this.eventAudio.play(cue,volume);
  }
  private arrivalTexture(kind:string,facing:Facing,frame:number){
    const key=`arrival-${kind}-${facing}-${frame}`;
    if(!this.textures.exists(key)){
      const drawing=kind==='doctor'?doctorDrawing(facing,frame):kind==='villain'?challengerDrawing(facing,frame):legendPersonDrawing(kind==='towa'?'towa':kind==='koya'?'koya':kind==='gaku'?'gaku':'rei',facing,frame);
      createPersonTexture(this,key,drawing);
    }
    return key;
  }
  private clearArrival(){
    for(const actor of this.arriving){
      if(actor.kind!=='villain')actor.container.destroy();
      if(actor.solid)this.solids=this.solids.filter(s=>s!==actor.solid);
    }
    this.arriving=[];this.arrivalKind=null;
  }
  private updateArrival(delta:number){
    const kind=useGame.getState().arrivalEvent;if(!kind)return;
    if(this.arrivalKind!==kind){
      this.clearArrival();this.resetKeys();this.arrivalKind=kind;
      const obstacles=this.solids.filter(s=>s!==this.challengerSolid);
      const actors=createArrival({x:this.player.x,y:this.player.y},obstacles,kind==='legend'?2:1);
      this.arriving=actors.map((state,index)=>{
        const actorKind=kind==='doctor'?'doctor':kind==='villain'?'villain':index?'gaku':'rei';
        const container=actorKind==='villain'&&this.challengerPerson?this.challengerPerson:this.person(state.position.x,state.position.y,'rival');
        container.setPosition(state.position.x,state.position.y);
        return {state,container,kind:actorKind,solid:null};
      });
      this.playEventSound('arrival');
    }
    for(const actor of this.arriving){
      const before=actor.state.distance;actor.state=stepArrivalActor(actor.state,this.player,delta);
      actor.container.setPosition(actor.state.position.x,actor.state.position.y).setDepth(actor.state.position.y);
      const frame=actor.state.arrived?0:Math.floor(actor.state.walkTime/130)%4;
      (actor.container.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(actor.kind,actor.state.facing,frame));
      if(actor.state.arrived&&(actor.kind==='rei'||actor.kind==='gaku'))this.addConversationMarker(actor.container);
      if(Math.floor(actor.state.distance/18)>Math.floor(before/18))this.playEventSound('step');
      if(actor.kind==='villain')this.challengerSolid?.setPosition(actor.container.x-12,actor.container.y-9);
    }
    if(this.arriving.length&&this.arriving.every(actor=>actor.state.arrived)){
      this.resetKeys();this.facing='down';
      for(const actor of this.arriving){
        if(actor.kind!=='villain'){
          actor.solid=new Phaser.Geom.Rectangle(actor.container.x-12,actor.container.y-9,24,21);this.solids.push(actor.solid);
        }
      }
      this.playEventSound('contact');useGame.getState().completeArrival();
    }
  }
  private updateKoyaEscort(delta:number){
    const state=useGame.getState(),towa=state.overlay==='towa-escort',step=towa?state.towaEscortStep:state.koyaEscortStep,kind=towa?'towa':'koya',advance=towa?state.advanceTowaEscort:state.advanceKoyaEscort;
    if((towa?towaEscortLocation(step):koyaEscortLocation(step))!==state.location)return;
    if(this.escortPhase!==step){
      this.escortPhase=step;this.resetKeys();this.cancelRoute();this.gesture.reset();this.pendingTarget=null;
      this.escortArrival=null;this.escortPlayerWalk=null;this.escortGuideWalk=null;
      if(!this.escortGuide){this.escortGuide=this.person(480,550,'rival');this.addConversationMarker(this.escortGuide);}
      if(step===1){this.escortArrival=createArrival({x:this.player.x,y:this.player.y},this.solids,1)[0];this.playEventSound('arrival');}
      if(step===2){const actor=createArrival({x:this.player.x,y:this.player.y},this.solids,1)[0];const end=actor.route.at(-1)??actor.position;this.escortGuide.setPosition(end.x,end.y).setDepth(end.y);}
      if(step===3){
        this.escortGuideWalk=escortWalk({x:this.escortGuide.x,y:this.escortGuide.y},{x:480,y:581},this.solids);
        this.escortPlayerWalk=escortWalk({x:this.player.x,y:this.player.y},{x:480,y:557},this.solids);
      }
      if(step===4){const walks=townEscortWalks(this.solids,towa?'yuunagi':'wakaba',towa?'stadium-10':'stadium-9');this.escortPlayerWalk=walks.player;this.escortGuideWalk=walks.guide;}
      if(step===5){this.player.setPosition(480,535).setDepth(535);if(!towa)this.escortGuide.setPosition(koyaVenueSpot.x,koyaVenueSpot.y).setDepth(koyaVenueSpot.y);}
      (this.escortGuide.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(kind,'down',0));
      this.playerSprite.setTexture('person-player-up-0');
    }
    if(document.hidden)return;
    if(this.escortArrival){
      const before=this.escortArrival;this.escortArrival=stepArrivalActor(before,{x:this.player.x,y:this.player.y},delta);
      const actor=this.escortArrival;this.escortGuide!.setPosition(actor.position.x,actor.position.y).setDepth(actor.position.y);
      (this.escortGuide!.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(kind,actor.facing,actor.arrived?0:Math.floor(actor.walkTime/150)%4));
      if(Math.floor(before.distance/18)<Math.floor(actor.distance/18))this.playEventSound('step');
      if(actor.arrived){this.escortArrival=null;advance(step);}return;
    }
    if(this.escortPlayerWalk&&this.escortGuideWalk){
      const beat=Math.floor(this.escortPlayerWalk.walkTime/260),speed=step===4?walkingSpeed.town:walkingSpeed.interior;
      this.escortPlayerWalk=stepOpeningWalk(this.escortPlayerWalk,delta,speed);this.escortGuideWalk=stepOpeningWalk(this.escortGuideWalk,delta,speed);
      const hero=this.escortPlayerWalk,guide=this.escortGuideWalk;
      if(Math.floor(hero.walkTime/260)>beat)this.playEventSound('step');
      this.player.setPosition(hero.position.x,hero.position.y).setDepth(hero.position.y);
      this.playerSprite.setTexture(`person-player-${hero.facing}-${hero.done?0:Math.floor(hero.walkTime/150)%4}`);
      this.escortGuide!.setPosition(guide.position.x,guide.position.y).setDepth(guide.position.y);
      (this.escortGuide!.list[1] as Phaser.GameObjects.Image).setTexture(this.arrivalTexture(kind,guide.facing,guide.done?0:Math.floor(guide.walkTime/150)%4));
      if(hero.done&&guide.done)advance(step);
    }
  }
  private updateOpening(delta:number){
    const state=useGame.getState(),step=openingIndex(state);
    if(openingLocation(step)!==state.location)return;
    if(this.openingPhase!==step){
      this.openingPhase=step;this.cancelRoute();this.gesture.reset();this.pendingTarget=null;this.input.keyboard?.resetKeys();
      const spawn=openingSpawn(step);this.player.setPosition(spawn.x,spawn.y);this.player.setDepth(spawn.y);
      this.playerSprite.setTexture(`person-player-${step<2?'down':'up'}-0`);
      this.openingWalk=openingIsWalk(step)?createOpeningWalk(step,spawn,this.solids):null;
      if(step===3)this.playEventSound('arrival');
    }
    if(!this.openingWalk||document.hidden)return;
    const previousBeat=Math.floor(this.openingWalk.walkTime/260);
    this.openingWalk=stepOpeningWalk(this.openingWalk,delta);
    if(Math.floor(this.openingWalk.walkTime/260)>previousBeat)this.playEventSound('step');
    const walk=this.openingWalk;
    this.player.setPosition(walk.position.x,walk.position.y).setDepth(walk.position.y);
    this.playerSprite.setTexture(`person-player-${walk.facing}-${walk.done?0:Math.floor(walk.walkTime/150)%4}`);
    if(walk.done){this.openingWalk=null;state.completeOpeningWalk(step);}
  }
  update(_time:number,delta:number){
    if(!this.player)return;
    this.updateTownCrowd?.(_time);
    if(useGame.getState().openingActive){this.updateOpening(delta);return;}
    this.openingPhase=-1;this.openingWalk=null;
    if(!useGame.getState().overlay&&koyaEscortActive(useGame.getState().koyaEscortStep))useGame.getState().resumeKoyaEscort();
    if(!useGame.getState().overlay&&koyaEscortActive(useGame.getState().towaEscortStep))useGame.getState().resumeTowaEscort();
    if(useGame.getState().overlay==='escort'||useGame.getState().overlay==='towa-escort'){this.updateKoyaEscort(delta);return;}
    this.syncChallenger();this.syncDoctor();
    const state=useGame.getState();
    if(this.timeBoardContainer&&this.timeBoardHistory!==state.timeHistory)this.drawTimeBoard();
    if(state.overlay==='race'&&this.arriving.length)this.clearArrival();
    if(!state.overlay&&!tutorialActive(state.tutorialStage)){
      if(state.location==='komorebi'&&state.legendRaceCompleted&&!state.doctorGiftReceived)state.beginArrival('doctor');
      else if(state.location==='komorebi'&&state.legendEventPending&&!state.legendRaceCompleted)state.beginArrival('legend');
      else if(state.location==='aozora'&&state.villainArrivalPending&&!state.villainDefeated)state.beginArrival('villain');
    }
    if(useGame.getState().overlay==='arrival'){this.updateArrival(delta);return;}
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
    const step=(this.isTown?walkingSpeed.town:walkingSpeed.interior)*Math.min(delta,40)/1000;
    const waypoint=this.route[0];let travel=step;
    if(!manual&&waypoint){
      const xDistance=waypoint.x-this.player.x,yDistance=waypoint.y-this.player.y;
      if(Math.abs(xDistance)>.01){dx=Math.sign(xDistance);travel=Math.min(step,Math.abs(xDistance));this.facing=dx<0?'left':'right';}
      else if(Math.abs(yDistance)>.01){dy=Math.sign(yDistance);travel=Math.min(step,Math.abs(yDistance));this.facing=dy<0?'up':'down';}
    }
    const x=Phaser.Math.Clamp(this.player.x+dx*travel,this.bounds.left,this.bounds.right), y=Phaser.Math.Clamp(this.player.y+dy*travel,this.bounds.top,this.bounds.bottom);
    const feet=new Phaser.Geom.Rectangle(x-11,y-3,22,17);
    const moving=(dx!==0||dy!==0)&&!this.solids.some(r=>Phaser.Geom.Intersects.RectangleToRectangle(feet,r))&&(x!==this.player.x||y!==this.player.y);
    if(moving){this.player.setPosition(x,y);this.walkTime+=delta;}else this.walkTime=0;
    if(waypoint&&Math.hypot(this.player.x-waypoint.x,this.player.y-waypoint.y)<.1)this.route.shift();
    if(waypoint&&(dx!==0||dy!==0)&&!moving)this.cancelRoute();
    if(!this.route.length)this.destination.setVisible(false);
    this.playerSprite.setTexture(`person-player-${this.facing}-${moving?Math.floor(this.walkTime/130)%4:0}`);
    this.player.setDepth(this.player.y);
    if(this.isTown&&(this.time.now-this.mapTime>350)){this.mapTime=this.time.now;window.dispatchEvent(new CustomEvent('town-position',{detail:{x:this.player.x,y:this.player.y}}));}
    const atExit=!this.isTown&&this.player.y>=567&&Math.abs(this.player.x-480)<32;
    if(!atExit)this.transitionArmed=true;
    else if(this.transitionArmed){this.transitionArmed=false;this.cancelRoute();useGame.getState().leaveShop();return;}
    const targets=this.getTargets();
    const distance=(t:ShopTarget)=>Math.hypot(this.player.x-Phaser.Math.Clamp(this.player.x,t.x,t.x+t.w),this.player.y-Phaser.Math.Clamp(this.player.y,t.y,t.y+t.h));
    const nearest=targets.map(t=>({t,d:distance(t)})).sort((a,b)=>a.d-b.d)[0];
    const target=nearest?.d<62?nearest.t:null;
    const nearby=target?.label??'';
    if(useGame.getState().nearby!==nearby)useGame.setState({nearby});
    if(this.pendingTarget&&(this.isTown?Math.hypot(this.player.x-this.approach(this.pendingTarget).x,this.player.y-this.approach(this.pendingTarget).y)<22:distance(this.pendingTarget)<62)){const selected=this.pendingTarget;this.pendingTarget=null;this.cancelRoute();this.interactWith(selected);}
    else if(this.pendingTarget&&!this.route.length)this.pendingTarget=null;
    if(action&&target)this.interactWith(target);
  }
  private getTargets():ShopTarget[]{
    if(this.isLibrary)return [...libraryShelves.map(s=>({...s,y:s.y-42,h:s.h+60,kind:'library-shelf' as const,libraryCategory:s.category,speaker:s.label,shopAfter:false,text:'本棚の資料を読む。'})),{...libraryReadingDesk,x:libraryReadingDesk.x-10,y:libraryReadingDesk.y-36,w:100,h:92,kind:'library-catalogue' as const,libraryCategory:'all' as const,speaker:'閲覧台',shopAfter:false,text:'全パーツの資料を読む。'},{...libraryExit,h:40,kind:'exit' as const,label:'図書館の出口',speaker:'図書館',shopAfter:false,text:'街へ戻る。'}];
    if(this.isTown)return [
      {x:hiddenMechanicSpot.x-16,y:hiddenMechanicSpot.y-80,w:32,h:92,label:mechanicManName,speaker:mechanicManName,shopAfter:false,text:'……よく見つけたな。',kind:'mechanic-man'},
      ...townVenues.filter(v=>v.kind==='outdoor').map(v=>({...outdoorTimeBoardPlacement(v),label:'歴代ベストタイム TOP 5',speaker:v.name,shopAfter:false,text:'タイムを見る。',kind:'time-records' as const,circuitId:v.id as import('../data/practiceCourses').PracticeCourseId})),
      ...townVenues.map(v=>({x:v.x,y:v.y,w:v.w,h:v.h,label:v.name,speaker:v.name,shopAfter:false,text:venueMessage(v),kind:'venue' as const,venueId:v.id})),
      ...outdoorAdvisors.map(p=>({x:p.x-16,y:p.y-80,w:32,h:92,label:`${p.name}（パーツ相談）`,speaker:p.name,shopAfter:false,text:outdoorAdvice(p.courseId),kind:'town-person' as const})),
      ...townPeople.map(p=>({x:p.x-16,y:p.y-80,w:32,h:92,label:p.name,speaker:p.name,shopAfter:false,text:townPersonAdvice(p,useGame.getState()),kind:'town-person' as const})),
    ];
    if(this.isOfficial)return [
      ...officialTimeBoards(useGame.getState().location).map(p=>({...p,kind:'time-records' as const,label:`${getCircuitTrack(p.circuitId).circuit.name}・歴代タイム`,speaker:'コース記録の看板',shopAfter:false,text:'歴代タイムを見る。'})),
      ...(useGame.getState().location==='stadium-9'&&this.escortGuide?[{x:koyaVenueSpot.x-16,y:koyaVenueSpot.y-42,w:32,h:54,label:'山城 昊也',speaker:'山城 昊也',shopAfter:false,text:useGame.getState().yuunagiUnlocked?'入賞おめでとう！ 次はゆうなぎ模型店の一本道コースだ。君ならもっと速くなれるよ。':'長距離の連続コーナーでは、ローラーと電池が大切だよ。ピットで準備してからコースに向かおう。コースでは僕もライバルだ。いいレースにしよう。'}]:[]),
      ...officialFixturesFor(useGame.getState().location).filter(f=>f.kind!=='decoration').map(f=>({...f,speaker:f.label,shopAfter:false,text:f.kind==='bench'?'ここでマシンを組み直そう。':'コースに出場する。',kind:f.kind as ShopTarget['kind']})),
      ...officialPeopleFor(useGame.getState().location).map(p=>({x:p.x-16,y:p.y-42,w:32,h:54,label:p.name,speaker:p.name,shopAfter:false,text:(useGame.getState().location==='stadium-10'&&useGame.getState().grandprixCleared||useGame.getState().zenithCleared)&&p.id==='rei'?'おめでとう、湊くん！ 決勝で2位以内に入った君の走り、しっかり見届けたよ。セイランと一緒に、ここまで来たんだね。':(useGame.getState().location==='stadium-10'&&useGame.getState().grandprixCleared||useGame.getState().zenithCleared)&&p.id==='gaku'?'よくやった！ 最後まで走り切ったな。今日は君が主役だ。これからも自分だけのセッティングで、速さを追いかけようぜ！':p.text})),
      {...officialVenue.exit,label:'緑川町への出口',speaker:officialVenue.name,shopAfter:false,text:'町へ戻る。',kind:'exit' as const},
    ];
    const cast=this.cast;
    const targets:ShopTarget[]=[...shopLayout(currentShop(useGame.getState().location).id).map(({target:f})=>({...f,speaker:f.label,shopAfter:f.kind==='counter'})),{x:cast.rival.x-16,y:cast.rival.y-42,w:32,h:54,label:`ライバル ${cast.rival.name}`,speaker:cast.rival.name,shopAfter:false,text:'湊くん、速いモーターだけじゃなく、ギアやタイヤの組み合わせも大事だよ。'}];
    const state=useGame.getState(),condition=equippedCondition(state.equipment,state.units,state.selectedUnits);
    const shop=currentShop(state.location);
    if(!isSalesShop(shop.id))targets.push({...timeBoardPlacement(shop.id),kind:'time-records',label:'歴代ベストタイム TOP 5',speaker:'ベストタイムの看板',shopAfter:false,text:'コースのベストタイムを見る。'});
    const counter=targets.find(t=>t.kind==='counter')!;counter.label=`店主 ${shop.owner}`;counter.speaker=shop.owner;counter.text=shop.welcome;if(isPracticeCourse(shop.id)){counter.shopAfter=false;counter.label='受付係';}
    const track=targets.find(t=>t.kind==='track')!;track.label=isSalesShop(shop.id)?'パーツ展示':getCircuitTrack(shop.circuitId).circuit.name;
    targets.push({...shopExit,label:'緑川町への出口',speaker:shop.name,shopAfter:false,text:'外の町へ出よう。',kind:'exit'});
    if(shop.id==='komorebi'&&!state.legendRaceCompleted){
      for(const actor of this.arriving.filter(actor=>actor.state.arrived&&(actor.kind==='rei'||actor.kind==='gaku'))){
        targets.push({x:actor.container.x-16,y:actor.container.y-42,w:32,h:54,label:actor.kind==='rei'?'風見 怜（特別レース）':'火野 岳（特別レース）',speaker:actor.kind==='rei'?'風見 怜':'火野 岳',shopAfter:false,text:'特別レースに挑む。',kind:'legend-challenger'});
      }
    }
    if(shop.id==='komorebi'&&state.doctorGiftReceived&&this.doctorPerson){
      targets.push({x:this.doctorPerson.x-16,y:this.doctorPerson.y-42,w:32,h:54,label:doctor.name,speaker:doctor.name,shopAfter:false,text:doctorAdvice(state.equipment.body)});
    }
    const visitors=cast.visitors.map(v=>({x:v.x-16,y:v.y-42,w:32,h:54,label:v.name,speaker:v.name,shopAfter:false,text:v.kind==='rival'?'ここで本気の試走を続けているよ。':shopAdvice(v.kind,{money:state.money,inventory:state.inventory,equipment:state.equipment,motorSeconds:condition.motorSeconds,qualified:state.unlockedRaces.includes(nextShopRace.id)})}));
    if(shop.id==='aozora'){
      for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?(state.villainDefeated?'黒岩くんに勝ったんだね！町へ出て、街の地図でひなた模型店を探してみよう。':state.aozoraWon?'黒岩くんが店の中央で待っているよ。挑戦レースで1位になると、ひなた模型店への紹介状がもらえるんだって。':'ここは優勝1,200円、5位完走でも350円！まずは優勝しよう。町の黒岩くんが、速いレーサーを探しているみたい。'):'黒岩くんに勝つなら、記念ボディにブリーズモーターを約60秒ブレークインして、4:1ギア・スパークセル・スポンジタイヤを試そう。低重心シャーシと軽量化も比べてね。';
      if(state.aozoraWon)targets.push({x:(this.challengerPerson?.x??challengerSpot.x)-16,y:(this.challengerPerson?.y??challengerSpot.y)-42,w:32,h:54,label:challenger.name,speaker:challenger.name,shopAfter:false,text:'挑戦を受ける。',kind:'challenger'});
    }else if(shop.id==='hinata')for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?'ひなた模型店へようこそ！ここは砂利と砂地が続くロングダート。ここで優勝すると若葉公式ダート杯への出場権がもらえるよ。街の若葉レース場で森野くんや黒岩くんと勝負しよう。':'トレイルトルクモーター・ブロックタイヤ・ダンパーで接地と駆動力を確保しよう。ポール式ダブルローラーは前中後に装着できるよ。4:1ギアから試そう。';
    if(shop.id==='akatsuki'){const rival=targets.find(t=>t.speaker==='橘 斗和');if(rival)rival.text='俺は橘 斗和。黒岩の先輩で、4人のレジェンドの一人だ。ここからは怜・岳・俺・昊也が相手になる。銀嵐フェンサーの走りを、コースで見せよう。';}
    if(shop.id==='akatsuki')for(const visitor of visitors)visitor.text=visitor.speaker==='佐伯 匠'?'縦ループはモーターとギア、砂地は追従と抵抗、ジャンプは制振だ。別の種類を組み合わせて試そう。':`ここでは怜・岳・斗和・昊也のレジェンド4人と本気の試走だ。現在${state.akatsukiRaceCount}/5回。途中退出せず結果まで5回走れば、天頂決戦の出場権がもらえる。`;
    if(shop.id==='hoshikuzu'){const rival=targets.find(t=>t.speaker==='橘 斗和');if(rival)rival.text='ここからは、自分の記録との勝負だ。舗装・砂・坂、それぞれに合わせた装備を試せ。俺たち4人のボディも、この店で手に入る。';for(const visitor of visitors)visitor.text=visitor.speaker==='佐伯 匠'?'コースごとに装備を変えて、タイムを比べよう。星皇を外せば、看板に装備ごと記録されるよ。':'クリアおめでとう！ これからは各公式会場でタイムアタックだ。自分だけのセッティングを見つけよう。';}
    if(shop.id==='yuunagi')for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?'ここは一台ずつ、別のゴールまで走る一本道のタイムアタック。40秒以内で完走すれば第4公式大会・緑川グランプリの出場権だよ。何度でも挑戦できるよ！':'新作のスライドダンパーはその他欄、そこに付けるローラーはリヤ欄で選べるよ。前中はセラミック、リヤは二段にして、スパイラルと着地を両立させよう。';
    if(shop.id==='wakaba')for(const visitor of visitors)visitor.text=visitor.speaker==='三浦 結衣'?'長い連続コーナーの店へようこそ！ 公式杯の入賞者だけが来られるんだ。ここで優勝すると第3公式大会・星空テクニカル杯の出場権がもらえるよ。':'4:1ギア、スポンジタイヤ、低重心シャーシ、ゴムローラーとウェイト。昔のパーツも大切だよ。最高速だけ伸ばすと切り返しでコースアウトしやすいんだ。';
    for(const visitor of visitors){
      if(visitor.speaker==='佐伯 匠'){visitor.label='佐伯 匠（レース相談）';visitor.text='装備と前回のレースを見て、勝つための相談に乗るよ。';}
      else visitor.text+=' 負けた理由や、どのパーツを替えるとよいかは、整備役の佐伯 匠に相談してね。';
    }
    if(isPracticeCourse(shop.id)||isSalesShop(shop.id)&&shop.id!=='atelier'){for(const visitor of visitors)visitor.text=shop.welcome;for(const target of targets)if(target.speaker===cast.rival.name)target.text=shop.welcome;}
    if(isPracticeCourse(shop.id)){for(let i=targets.length-1;i>=0;i--)if(targets[i].kind==='legends'||targets[i].kind==='bookshelf')targets.splice(i,1);}
    if(shop.id==='atelier'){for(const visitor of visitors)visitor.text='星皇シリーズは全種類そろっているよ。各25万円、13品で325万円。砂地では悪路タイヤや追従するシャーシを混ぜると、もっと速くできるんだ。レースはほかの模型店で挑戦してね。';for(const target of targets)if(target.speaker===cast.rival.name)target.text='ここは最初から入れる特別な工房。星皇は全種類にある最上位シリーズ。硬いスリックと悪路タイヤ、ギア比の違いなど、得意な路面は組み合わせで変わるよ。';}
    return [...targets,...visitors];
  }
  private drawTimeBoard(){
    this.timeBoardContainer?.destroy(true);
    const state=useGame.getState(),shop=currentShop(state.location),boards=this.isOfficial?officialTimeBoards(state.location):[{...timeBoardPlacement(shop.id),circuitId:shop.circuitId}];
    this.timeBoardHistory=state.timeHistory;
    const root=this.add.container(0,0).setDepth(Math.max(...boards.map(p=>p.y+p.h)));this.timeBoardContainer=root;
    for(const p of boards){const records=state.timeHistory[p.circuitId]??[];
    const image=drawRecordBoard(this,p,p.y+p.h,records.length>0);root.add(image);
    }
  }

  private interactWith(target:ShopTarget){
      this.gesture.reset();
      if(target.kind==='library-shelf'||target.kind==='library-catalogue')useGame.getState().openLibrary(target.libraryCategory);
      else if(target.kind==='mechanic-man')useGame.getState().talkMechanicMan();
      else if(target.kind==='town-person')useGame.getState().talk(target.speaker,target.text);
      else if(target.kind==='official-speed'||target.kind==='official-dirt'||target.kind==='official-technical'||target.kind==='official-final'||target.kind==='official-zenith')useGame.getState().openOfficialRace(target.kind==='official-zenith'?'zenith':target.kind==='official-final'?'final':target.kind==='official-technical'?'technical':target.kind==='official-speed'?'speed':'dirt');
      else if(target.kind==='official-reception'||this.isOfficial&&target.speaker==='大会受付係')useGame.getState().openOfficialRace();
      else if(target.speaker==='森野 陸'){if(this.isOfficial)useGame.getState().talk(target.speaker,target.text);else useGame.getState().openOfficialRace();}
      else if(isSalesShop(useGame.getState().location)&&target.kind==='track'){const shop=currentShop(useGame.getState().location);useGame.getState().talk(shop.name,shop.welcome);}
      else if(target.speaker==='佐伯 匠'&&useGame.getState().location==='hoshikuzu')useGame.getState().talk('佐伯 匠','ここからはタイムを詰める楽しみだね。舗装は軽量シャーシと低摩擦ローラー、砂は追従するタイヤ、立体はトルク・反発・ブレーキを比べよう。FMはジャンプが低くなる前寄り重心だから、飛距離も見て選ぼう。ギア比だけ変えて同じコースを走ると違いが分かりやすいよ。星皇を外した記録は、コース端の看板でセッティングごとに見られるよ。');
      else if(target.speaker==='佐伯 匠'){
        const state=useGame.getState();
        startAdviceConversation({shopId:currentShop(state.location).id,equipment:state.equipment,inventory:state.inventory,money:state.money,...equippedCondition(state.equipment,state.units,state.selectedUnits),review:state.lastRaceReview,motorAges:Object.fromEntries(Object.entries(state.units).map(([id,list])=>[id,list[0]?.seconds??0])),batteryAges:Object.fromEntries(Object.entries(state.units).map(([id,list])=>[id,list[0]?.seconds??0]))});
      }
      else if(target.kind==='legend-challenger')useGame.getState().openLegendChallenge();
      else if(target.kind==='exit')useGame.getState().leaveShop();
      else if(target.kind==='challenger')useGame.getState().openVillainChallenge();
      else if(target.kind==='venue'){
        const venue=townVenues.find(v=>v.id===target.venueId)!;
        if(isPracticeCourse(venue.id)){if(isVenueOpen(venue,useGame.getState()))useGame.getState().openRaceChoice(venue.id);else useGame.getState().talk(venue.name,venueMessage(venue));}
        else if(venue.kind==='library')useGame.getState().enterLibrary();
        else if(venue.id==='stadium-5'||venue.id==='stadium-9'||venue.id==='stadium-10'||venue.id==='stadium-7'){if(venue.id==='stadium-7'?useGame.getState().zenithQualified:venue.id==='stadium-10'?useGame.getState().finalQualified:venue.id==='stadium-9'?useGame.getState().thirdOfficialQualified:useGame.getState().officialQualified)useGame.getState().enterOfficialVenue(venue.id);else useGame.getState().talk(venue.name,venueMessage(venue));}
        else if(venue.shopId&&isVenueOpen(venue,useGame.getState()))useGame.getState().enterShop(venue.shopId);
        else useGame.getState().talk(venue.name,venueMessage(venue));
      }
      else if(target.kind==='time-records')useGame.getState().openTimeBoard(target.circuitId);
      else if(target.kind==='track'){const s=useGame.getState();if(s.zenithCleared)s.openRaceChoice(currentShop(s.location).circuitId);else s.startTrial();}
      else if(target.kind==='board')useGame.getState().openProficiency();
      else if(target.kind==='legends')useGame.getState().openLegends();
      else if(target.kind==='bookshelf')useGame.getState().readHintBook();
      else if(target.kind==='bench')useGame.getState().openSetting();
      else useGame.getState().talk(target.speaker,target.text,target.shopAfter);
  }
}
