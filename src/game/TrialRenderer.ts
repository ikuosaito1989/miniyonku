import {isMasterCourse} from '../data/masterCourses';
import {buildStartMarshal} from './StartMarshal';
import {withMobRivals} from './mobRace';
import {VenueAnimation} from './VenueAnimation';
import {raceCourseDetails} from './RaceCourseDetails';
import {courseRailColorAt,pavedCourseColors} from './coursePalette';
import {courseRenderSamples} from './courseRenderSamples';
import {isPracticeCourse} from '../data/practiceCourses';
import {physicalRenderer,modelLighting} from './sceneLighting';
import {RaceShadows} from './RaceShadows';
import {disposeSceneResources} from './modelFinish';
import {withOnlineRivals} from './onlineRace';
import type {OnlineRecord} from './onlineRecords';
import {raceVenueScenery,setVenueOverviewDetail} from './RaceVenueScenery';
import {animateRunningGear,handlingProfile,handlingPose} from './raceMotion';
import { studioEnvironment } from './studioEnvironment';
import { lappedPose, lappedPresentationSeconds } from './lappedPresentation';
import { raceIntroDuration, raceIntroTiming, raceIntroAt, stepRaceIntro, type RaceIntro } from './raceIntro';
import * as THREE from 'three';
import { buildRaceMachineModel } from './MachineModel';
import { batchRaceWheelSpokes } from './raceMachineBatch';
import { freshCondition, type MachineCondition } from './condition';
import { compactDevice, raceRenderSize } from '../data/display';
import { getCircuitTrack, type CircuitId, type CircuitTrack } from '../data/circuit';
import type { Equipment } from '../data/machine';
import { FIXED_STEP } from './driving';
import { canViewRaceResults, completeRaceAfterPlayerFinish, createRaceState, launchPlayer, startRace, stepRace, type RaceState, type RaceChallenge } from './race';
import {overviewFrame,overviewViewportFrame,overviewCarScale,raceCameraFar} from './overviewCamera';
import { defaultRaceZoom, raceCamera, raceZoomSteps } from '../data/raceCamera';
import { createFinishPresentation, finishTrackDistance, finishSequence, shouldUseFinishCamera, stepFinishPresentation, type FinishPresentation } from './finishPresentation';
import { RaceAudio } from './RaceAudio';

export type { TrialCamera } from '../data/raceCamera';

export class TrialRenderer {
  private renderer: THREE.WebGLRenderer;
  private environment:THREE.WebGLRenderTarget|null=null;
  private shadows!:RaceShadows;
  private venueAnimation!:VenueAnimation;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-2,2,1,-1,0.01,1000);
  private cars = new Map<string,THREE.Group>();
  private state: RaceState;
  private playerMarker = new THREE.Mesh(new THREE.ConeGeometry(0.035,0.07,3),new THREE.MeshBasicMaterial({color:0xffe66b}));
  private observer: ResizeObserver|null=null;
  private disposed=false;
  private initialized=false;
  private readonly preparationTimings={environment:0,venue:0,course:0,cars:0,firstRender:0};
  private firstRenderPending=true;
  readonly ready:Promise<void>;
  private frame = 0;
  private lastTime = 0;
  private accumulator = 0;
  private lastReport = -1;
  private lappedAges=new Map<string,number>();
  private crashAges=new Map<string,number>();
  private introFrame:ReturnType<typeof overviewFrame>|null=null;
  private overviewFrame:ReturnType<typeof overviewFrame>|null=null;
  private overviewMarkers=new Map<string,THREE.Sprite>();
  private scratchProjection=new THREE.Vector3();
  private scratchSide=new THREE.Vector3();
  private scratchUp=new THREE.Vector3();
  private scratchForward=new THREE.Vector3();
  private scratchBasis=new THREE.Matrix4();
  private scratchRight=new THREE.Vector3();
  private venue!:THREE.Group;
  private cameraZoom=defaultRaceZoom;
  private displayedCameraZoom=defaultRaceZoom;
  private activeCamera:THREE.Camera=this.camera;
  private textures: THREE.Texture[] = [];
  private aspect = 1;
  private startShotBlend = 1;
  private finishPresentation = createFinishPresentation();
  private audio:RaceAudio;
  private track:CircuitTrack;
  private intro=raceIntroAt(0);
  private introLastTime=0;
  private resetIntroClock=()=>{this.introLastTime=0;};
  private reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  constructor(private host: HTMLElement, private equipment: Equipment, private report: (state: RaceState) => void, private reportFinish:(state:FinishPresentation)=>void, private condition:MachineCondition=freshCondition, private seed=0x5eed,private challenge:RaceChallenge=false,private circuitId:CircuitId='leaf',private reportIntro:(intro:RaceIntro)=>void=()=>{},private bodyPaint:number|null=null,onlineRecords:OnlineRecord[]|null=null,mobRace=false,private playerName?:string) {
    this.track=getCircuitTrack(circuitId);
    this.state=createRaceState(equipment,seed,condition,challenge,circuitId,this.bodyPaint,this.playerName);
    if(onlineRecords)this.state=withOnlineRivals(this.state,onlineRecords);
    else if(mobRace)this.state=withMobRivals(this.state);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor((challenge==='official'||challenge==='time-attack')?0x344d5b:0x315b2a);
    physicalRenderer(this.renderer);
    this.renderer.domElement.style.width='100%';
    this.renderer.domElement.style.height='100%';
    host.append(this.renderer.domElement);
    this.playerMarker.rotation.z=Math.PI;this.scene.add(this.playerMarker);
    this.audio=new RaceAudio();
    this.ready=this.initialize();
  }

  private async yieldPreparation(){
    await new Promise<void>(resolve=>setTimeout(resolve,0));
    return !this.disposed;
  }

  private async initialize(){
    if(!await this.yieldPreparation())return;
    let started=performance.now();
    this.environment=studioEnvironment(this.renderer);this.scene.environment=this.environment.texture;
    this.preparationTimings.environment=performance.now()-started;
    if(!await this.yieldPreparation())return;
    started=performance.now();
    const sun=modelLighting(this.scene);this.shadows=new RaceShadows(this.scene,sun,true);this.textures.push(this.shadows.texture);
    const grass=this.grassTexture();
    const groundSize=Math.max(this.track.open?600:100,this.track.circuit.radiusX*2+40,this.track.circuit.radiusZ*2+40);
    grass.repeat.set(groundSize/1.5,groundSize/1.5);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(groundSize,groundSize),new THREE.MeshStandardMaterial((this.challenge==='official'||this.challenge==='time-attack')?{color:0x7c928f,roughness:.86,envMapIntensity:.35}:{map:grass,roughness:1,envMapIntensity:.25}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.025;ground.receiveShadow=true;this.scene.add(ground);
    const venue=this.venue=raceVenueScenery(this.track,(this.challenge==='official'||this.challenge==='time-attack'),isPracticeCourse(this.circuitId));this.scene.add(venue);this.venueAnimation=new VenueAnimation(venue);
    this.preparationTimings.venue=performance.now()-started;
    if(!await this.yieldPreparation())return;
    started=performance.now();
    this.buildTrack();this.scene.add(raceCourseDetails(this.track));this.buildObstacles();this.buildStart();this.venueAnimation.attachMarshal(this.scene);
    this.preparationTimings.course=performance.now()-started;
    for(const racer of this.state.racers){
      if(!await this.yieldPreparation())return;
      started=performance.now();
      const car=buildRaceMachineModel(racer);batchRaceWheelSpokes(car);car.userData.handling=handlingProfile(racer.equipment,racer.performance);this.cars.set(racer.id,car);this.scene.add(car);this.shadows.add(racer.id,car);
      const canvas=document.createElement('canvas');canvas.width=144;canvas.height=54;
      const ctx=canvas.getContext('2d')!;ctx.fillStyle=racer.id==='player'?'#ffe16d':'#18293e';ctx.strokeStyle=racer.id==='player'?'#fff5d7':`#${racer.color.toString(16).padStart(6,'0')}`;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(3,3,138,48,12);ctx.fill();ctx.stroke();
      ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=racer.id==='player'?'#18293e':'#fff4db';ctx.fillText(racer.id==='player'?'▼ 自分':racer.name.split(/[ 　]/).at(-1)!,72,28);
      const texture=new THREE.CanvasTexture(canvas);this.textures.push(texture);
      const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,transparent:true}));marker.renderOrder=100;marker.visible=false;marker.name=`overview-marker-${racer.id}`;this.overviewMarkers.set(racer.id,marker);this.scene.add(marker);
      this.preparationTimings.cars+=performance.now()-started;
    }
    if(!await this.yieldPreparation())return;
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(this.host);this.resize();
    document.addEventListener('visibilitychange',this.resetIntroClock);
    this.initialized=true;
    this.report({...this.state});this.reportFinish(this.finishPresentation);this.reportIntro(this.intro);this.frame=requestAnimationFrame(this.animate);
    // Keep the loading screen until the first scheduled draw has completed.
    await new Promise<void>(resolve=>requestAnimationFrame(()=>resolve()));
  }

  skipIntro(){
    if(this.intro.stage==='done')return;
    this.intro=raceIntroAt(raceIntroDuration);this.lastTime=0;this.accumulator=0;this.reportIntro(this.intro);
  }
  replayIntro(){
    this.intro=raceIntroAt(0);this.introLastTime=0;this.lastTime=0;this.accumulator=0;this.introFrame=null;this.reportIntro(this.intro);
  }
  start(){
    if(!this.initialized||this.disposed)return;
    if(this.intro.stage!=='done'){this.skipIntro();return;}
    this.audio.unlock();
    const previous=this.state;
    this.state=previous.phase==='ready'?startRace(previous):launchPlayer(previous);
    if(this.state===previous)return;
    if(previous.phase==='ready'){this.accumulator=0;this.lastTime=0;}
    this.audio.update(this.state);
    this.report({...this.state});
  }
  setCameraZoom(level:number){this.cameraZoom=THREE.MathUtils.clamp(Math.round(level),0,raceZoomSteps-1);}
  showResults(skipRetirementAnimation=false){
    const player=this.state.racers.find(r=>r.id==='player');
    if(!skipRetirementAnimation&&player?.driving.stopReason==='lapped'&&(this.lappedAges.get('player')??0)<lappedPresentationSeconds)return;
    if(this.finishPresentation.stage==='results'||!canViewRaceResults(this.state))return;
    this.state=completeRaceAfterPlayerFinish(this.state);
    this.finishPresentation={...stepFinishPresentation(this.finishPresentation,this.state,0),stage:'results',finalAge:finishSequence.holdSeconds+finishSequence.tallySeconds};
    this.audio.update(this.state);
    this.report({...this.state});this.reportFinish(this.finishPresentation);
  }
  skipRace(){
    if(!this.initialized||this.disposed)return;
    if(this.state.phase==='finished')return;
    const finishDistance=this.track.circuitLength*(this.track.open?1:this.track.circuit.laps);
    const skippedWinner=this.challenge===true?this.state.racers.findIndex(racer=>racer.id.startsWith('legend-')):0;
    const racers=this.state.racers.map((racer,index)=>({
      ...racer,
      driving:{...racer.driving,status:'finished' as const,time:1+((index-skippedWinner+this.state.racers.length)%this.state.racers.length)*.25,distance:finishDistance,speed:0,stopReason:undefined},
    }));
    this.state={...this.state,phase:'finished',time:racers.at(-1)?.driving.time??1,playerStartOffset:0,falseStartPenalty:0,racers};
    const arrivals=[...racers].sort((a,b)=>a.driving.time-b.driving.time).map(racer=>({id:racer.id,age:0,crossingTime:racer.driving.time}));
    this.finishPresentation={stage:'results',arrivals,finalAge:3.8};
    this.audio.update(this.state);
    this.report({...this.state});this.reportFinish(this.finishPresentation);
  }
  setSound(enabled:boolean,volume=0.35){this.audio.setVolume(volume);this.audio.setEnabled(enabled);}
  restart(){
    this.lappedAges.clear();
    for(const car of this.cars.values())delete car.userData.motionDistance;
    this.state=createRaceState(this.equipment,this.seed,this.condition,this.challenge,this.circuitId,this.bodyPaint,this.playerName);this.accumulator=0;this.lastTime=0;this.lastReport=-1;this.cameraZoom=defaultRaceZoom;this.displayedCameraZoom=defaultRaceZoom;this.startShotBlend=1;
    this.intro=raceIntroAt(0);this.introLastTime=0;this.reportIntro(this.intro);
    this.finishPresentation=createFinishPresentation();this.reportFinish(this.finishPresentation);
    this.report({...this.state});
  }
  private resize(){
    const width=Math.max(1,this.host.clientWidth),height=Math.max(1,this.host.clientHeight);
    this.aspect=width/height;this.overviewFrame=null;this.introFrame=null;
    const compact=compactDevice();
    const resolution=raceRenderSize(compact,width,height,window.devicePixelRatio);
    this.host.dataset.renderStyle='smooth';
    this.renderer.domElement.style.imageRendering='auto';
    this.renderer.setSize(resolution.width,resolution.height,false);
  }
  private grassTexture(){
    const canvas=document.createElement('canvas');canvas.width=64;canvas.height=64;
    const context=canvas.getContext('2d')!;
    context.fillStyle='#738064';context.fillRect(0,0,64,64);
    for(let y=0;y<64;y++)for(let x=0;x<64;x++){
      const n=(Math.imul(x+73,374761393)^Math.imul(y+41,668265263))>>>0;
      context.fillStyle=['#768468','#6b7b5e','#7c886b','#718061','#6f7c60'][n%5];context.fillRect(x,y,1,1);
      if(n%37===0){context.fillStyle='#8e9677';context.fillRect(x,y,1,2);}
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(80,80);
    this.textures.push(texture);return texture;
  }
  private mesh(geometry:THREE.BufferGeometry,color:number){
    return new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color,roughness:.5,metalness:.04,envMapIntensity:.55}));
  }
  private buildTrack(){
    const {circuit,circuitLength,sampleLanePath}=this.track;
    const wallTint=new THREE.Color(),surfaceTint=new THREE.Color(),samples=courseRenderSamples(this.track);
    for(let lane=0;lane<circuit.lanes;lane++){
      const vertices:number[]=[],indices:number[]=[],colors:number[]=[];
      for(let row=0;row<samples.length;row++){
        const i=samples[row];
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        const surface=this.track.surfaceAt(i/circuit.samples*circuitLength);
        surfaceTint.setHex(surface.roughness===0?pavedCourseColors.white:surface.roughness>.8?0xd2b47a:0xad8d61).multiplyScalar(.88+.12*Math.sin(i*13.7+lane*4.1)**2);
        for(const fraction of [-1,-.8,0,.8,1]){
          const offset=fraction*circuit.laneWidth/2,height=.0025*Math.abs(fraction)**2;
          vertices.push(p.x+p.sideX*offset+p.upX*height,p.y+p.sideY*offset+p.upY*height,p.z+p.sideZ*offset+p.upZ*height);
          colors.push(surfaceTint.r,surfaceTint.g,surfaceTint.b);
        }
        if(row<samples.length-1&&!this.track.isJumpGap((i+samples[row+1])/2/circuit.samples*circuitLength)){for(let col=0;col<4;col++){const a=row*5+col;indices.push(a,a+1,a+5,a+1,a+6,a+5);}}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      if(circuit.surface.roughness>0)geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
      const mesh=this.mesh(geometry,circuit.surface.roughness>0?0xffffff:pavedCourseColors.white);mesh.name=`course-running-surface-${lane}`;mesh.material.vertexColors=circuit.surface.roughness>0;mesh.material.side=THREE.DoubleSide;mesh.material.roughness=circuit.surface.roughness>0?.77:.36;mesh.material.metalness=0;mesh.material.envMapIntensity=.8;mesh.receiveShadow=true;this.scene.add(mesh);
      for(const side of [-1,1]){
      const offset=side*circuit.laneWidth/2;
      const vertices:number[]=[],indices:number[]=[],colors:number[]=[];
      for(let row=0;row<samples.length;row++){
        const i=samples[row];
        const distance=i/circuit.samples*circuitLength,p=sampleLanePath(distance,lane);wallTint.setHex(courseRailColorAt(this.track,distance,this.track.startDistance)??pavedCourseColors.white);
        for(let vertex=0;vertex<7;vertex++)colors.push(wallTint.r,wallTint.g,wallTint.b);
        // Six-sided rounded cap, extruded along the unchanged lane geometry.
        for(const [delta,height] of [[-.008,0],[-.008,.048],[-.0057,.0537],[0,.056],[.0057,.0537],[.008,.048],[.008,0]])vertices.push(p.x+p.sideX*(offset+delta)+p.upX*height,p.y+p.sideY*(offset+delta)+p.upY*height,p.z+p.sideZ*(offset+delta)+p.upZ*height);
        if(row<samples.length-1&&!this.track.isJumpGap((i+samples[row+1])/2/circuit.samples*circuitLength)){for(let face=0;face<6;face++){const a=row*7+face;indices.push(a,a+7,a+1,a+1,a+7,a+8);}}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const rail=this.mesh(geometry,0xffffff);rail.name=`course-rounded-rail-${lane}-${side}`;rail.material.vertexColors=true;rail.material.side=THREE.DoubleSide;rail.material.roughness=.32;rail.material.metalness=0;rail.material.envMapIntensity=.8;rail.receiveShadow=true;this.scene.add(rail);
      }
    }
  }
  private buildObstacles(){
    const {obstacles,circuit,circuitLength,sampleLanePath}=this.track;if(!obstacles&&!this.track.hasHills)return;
    for(const jump of this.track.jumps){
    for(let lane=0;lane<5;lane++)for(let i=0;i<4;i++){
      const p=sampleLanePath(jump.takeoff-.3-i*.42,lane),mark=this.mesh(new THREE.BoxGeometry(circuit.laneWidth*.65,.018,.09),i%2?0xf3a34e:0xffe8a1);
      mark.position.set(p.x,p.y+.012,p.z);mark.rotation.order='YXZ';mark.rotation.set(-p.pitch,Math.atan2(p.tangentX,p.tangentZ),0);mark.name='jump-ramp-chevron';this.scene.add(mark);
    }
    }
  }
  private buildStart(){
    const {circuit,sampleCircuit,startDistance,sampleLanePath,startRampHeight}=this.track;
    const start=sampleCircuit(startDistance);
    const group=new THREE.Group();group.position.set(start.x,startRampHeight(0),start.z);group.rotation.y=Math.atan2(start.tangentX,start.tangentZ);
    const colors=this.track.circuit.surface.roughness>0?[0x5685ce,0xcf5263,0xd4b749,0x50a889,0xb17bcb]:Array.from({length:circuit.lanes},()=>pavedCourseColors.white);
    // 色付きの発進台とラインも路面の高さに合わせ、浮いた平板にしない。
    const strip=(lane:number,from:number,to:number,left:number,right:number,color:number)=>{
      const vertices:number[]=[],indices:number[]=[],steps=Math.max(2,Math.ceil((to-from)*32));
      for(let i=0;i<=steps;i++){
        const p=sampleLanePath(from+(to-from)*i/steps,lane);
        for(const offset of [left,right])vertices.push(p.x+p.tangentZ*offset,p.y+(to-from<.1?.015:.01),p.z-p.tangentX*offset);
        if(i<steps){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const mesh=this.mesh(geometry,color);mesh.material.side=THREE.DoubleSide;mesh.receiveShadow=true;this.scene.add(mesh);
    };
    for(let lane=0;lane<circuit.lanes;lane++){
      const half=circuit.laneWidth/2-.01;
      strip(lane,-1.2,1.55,-half,half,colors[lane]);
      for(let row=0;row<2;row++)for(let i=0;i<4;i++){
        strip(lane,(row-1)*.04,row*.04+.001,-half+i*half/2,-half+(i+1)*half/2,(i+row)%2?0x26354b:0xf5f1da);
      }
    }
    for(const lane of [0,circuit.lanes-1])for(const distance of [-1.2,-.5,.5]){
      const p=sampleLanePath(distance,lane),side=lane===0?-1:1,offset=side*(circuit.laneWidth/2-.02);
      const support=this.mesh(new THREE.BoxGeometry(.035,p.y,.05),0x526477);
      support.name='start-ramp-support';support.position.set(p.x+p.tangentZ*offset,p.y/2,p.z-p.tangentX*offset);this.scene.add(support);
    }
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=32;
    const context=canvas.getContext('2d')!;context.font='bold 28px monospace';context.textAlign='center';
    context.fillStyle='#463e23';context.fillText(this.track.open?'START':'G O A L',82,27);context.fillStyle='#f8dc65';context.fillText(this.track.open?'START':'G O A L',80,25);
    const texture=new THREE.CanvasTexture(canvas);texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.anisotropy=Math.min(4,this.renderer.capabilities.getMaxAnisotropy());texture.colorSpace=THREE.SRGBColorSpace;this.textures.push(texture);
    const goalLabel=new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.17),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
    goalLabel.rotation.x=-Math.PI/2-sampleLanePath(.4,2).pitch;goalLabel.position.set(0,startRampHeight(.4)-startRampHeight(0)+.02,.4);group.add(goalLabel);
    if(this.track.open){
      const finish=this.track.sampleLanePath(this.track.circuitLength,2),gate=new THREE.Group();
      gate.name='oneway-finish-gate';gate.position.set(finish.x,finish.y,finish.z);gate.rotation.y=Math.atan2(finish.tangentX,finish.tangentZ);
      for(const side of [-1,1]){const post=this.mesh(new THREE.BoxGeometry(.05,.65,.05),0xe0d7ac);post.position.set(side*.68,.325,0);gate.add(post);}
      const beam=this.mesh(new THREE.BoxGeometry(1.4,.16,.05),0x9b7a44);beam.position.y=.65;gate.add(beam);
      const labelCanvas=document.createElement('canvas');labelCanvas.width=256;labelCanvas.height=48;const ctx=labelCanvas.getContext('2d')!;
      ctx.fillStyle='#f8e5ad';ctx.font='bold 38px monospace';ctx.textAlign='center';ctx.fillText('G O A L',128,38);
      const labelTexture=new THREE.CanvasTexture(labelCanvas);this.textures.push(labelTexture);
      const label=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.15),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,side:THREE.DoubleSide}));label.position.set(0,.65,.028);gate.add(label);this.scene.add(gate);
      for(let lane=0;lane<circuit.lanes;lane++)for(let row=0;row<2;row++)for(let i=0;i<4;i++)strip(lane,this.track.circuitLength-.12+row*.04,this.track.circuitLength-.08+row*.04,-circuit.laneWidth/2+i*circuit.laneWidth/4,-circuit.laneWidth/2+(i+1)*circuit.laneWidth/4,(i+row)%2?0x26354b:0xf5f1da);
    }
    const attendant=buildStartMarshal();attendant.position.set(-circuit.laneWidth*circuit.lanes/2-0.23,0,-0.15);
    const podium=this.mesh(new THREE.BoxGeometry(.3,startRampHeight(0),.4),0x526477);podium.position.set(attendant.position.x,-startRampHeight(0)/2,attendant.position.z);group.add(podium);
    group.add(attendant);this.scene.add(group);
  }
  private updateCamera(elapsed:number){
    const {circuit,sampleLanePath}=this.track;
    const frame=this.overviewFrame??(this.overviewFrame=overviewViewportFrame(this.track,this.host.clientWidth,this.host.clientHeight));
    if(this.intro.stage!=='done'){
      this.activeCamera=this.camera;
      this.camera.up.set(0,1,0);
      const frame=this.introFrame??(this.introFrame=overviewFrame(this.track,this.aspect,false));
      const age=this.intro.age,start=sampleLanePath(0,(circuit.lanes-1)/2);
      const wide=frame.height*1.12+Math.max(4,5/this.aspect);
      const tourHeight=Math.max(3.2,4.5/this.aspect),gridHeight=Math.max(raceCamera.start.height,raceCamera.start.minWidth/this.aspect);
      const smooth=(v:number)=>{const t=THREE.MathUtils.clamp(v,0,1);return t*t*(3-2*t);};
      let target=new THREE.Vector3(frame.target.x,frame.target.y,frame.target.z),height=wide;
      if(this.intro.stage==='tour'&&!this.reducedMotion){
        const progress=(age-raceIntroTiming.overview)/raceIntroTiming.tour;
        const landmarks=[55,135,this.track.circuitLength*.34,this.track.jumps[0]?.takeoff??0,this.track.circuitLength*.65,this.track.jumps[1]?.takeoff??0];
        const distance=this.circuitId==='forge'||this.circuitId==='zenith'||isMasterCourse(this.circuitId)?landmarks[Math.min(5,Math.floor(progress*6))]:progress*this.track.circuitLength;
        const p=sampleLanePath(distance,(circuit.lanes-1)/2),zoom=smooth((age-raceIntroTiming.overview)/1.6);
        target.lerp(new THREE.Vector3(p.x,p.y,p.z),zoom);height=THREE.MathUtils.lerp(wide,tourHeight,zoom);
      }else if(this.intro.stage==='grid'&&!this.reducedMotion){
        const zoom=smooth((age-raceIntroTiming.overview-raceIntroTiming.tour)/raceIntroTiming.grid);target=new THREE.Vector3(start.x-start.tangentX*raceCamera.start.lookBehind*zoom,start.y,start.z-start.tangentZ*raceCamera.start.lookBehind*zoom);height=THREE.MathUtils.lerp(tourHeight,gridHeight,zoom);
      }
      this.camera.left=-height*this.aspect/2;this.camera.right=height*this.aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.far=raceCameraFar(height,this.aspect);this.camera.updateProjectionMatrix();
      this.camera.position.copy(target).add(new THREE.Vector3(...raceCamera.start.offset).multiplyScalar(Math.max(1,height/6)));this.camera.lookAt(target);return;
    }
    this.activeCamera=this.camera;
    const goalShot=shouldUseFinishCamera(this.state,this.finishPresentation);
    const blend=this.startShotBlend*this.startShotBlend*(3-2*this.startShotBlend);
    const closeHeight=Math.max(.34,.34/this.aspect);
    const zoomRate=1-Math.exp(-(this.reducedMotion?24:8)*Math.max(0,Math.min(elapsed,.1)));
    this.displayedCameraZoom=THREE.MathUtils.lerp(this.displayedCameraZoom,this.cameraZoom,zoomRate);
    if(Math.abs(this.displayedCameraZoom-this.cameraZoom)<.005)this.displayedCameraZoom=this.cameraZoom;
    const zoomProgress=THREE.MathUtils.clamp(this.displayedCameraZoom/(raceZoomSteps-1),0,1);
    const zoomBlend=zoomProgress*zoomProgress*(3-2*zoomProgress);
    const viewHeight=frame.height*Math.pow(closeHeight/frame.height,zoomBlend);
    const worldUp=new THREE.Vector3(0,1,0),overviewUp=new THREE.Vector3(frame.up.x,frame.up.y,frame.up.z);
    this.camera.up.copy(overviewUp.lerp(worldUp,zoomBlend).normalize());
    this.camera.left=-viewHeight*this.aspect/2;this.camera.right=viewHeight*this.aspect/2;
    this.camera.top=viewHeight/2;this.camera.bottom=-viewHeight/2;this.camera.far=raceCameraFar(frame.height,this.aspect);this.camera.updateProjectionMatrix();
    // 拡大の最初の1段階でマシンへ寄せ切る。画角と同じ割合で注視点を
    // 補間すると、広いコースでは拡大中もコース中央を映してしまう。
    const focusProgress=THREE.MathUtils.clamp(this.displayedCameraZoom,0,1);
    const focusBlend=focusProgress*focusProgress*(3-2*focusProgress);
    // 路面位置ではなく描画済みの車体を追い、飛行・コースアウト・ゴール後にも追従する。
    const closeTarget=this.cars.get('player')!.position.clone().add(new THREE.Vector3(0,.025,0));
    const overviewTarget=new THREE.Vector3(frame.target.x,frame.target.y,frame.target.z);
    const overviewOffset=new THREE.Vector3(...raceCamera.start.offset).multiplyScalar(Math.max(1,frame.height/6));
    const closeOffset=new THREE.Vector3(...(goalShot?raceCamera.finish.offset:raceCamera.running.offset));
    if(!goalShot)closeOffset.lerp(new THREE.Vector3(...raceCamera.start.offset),blend);
    const target=overviewTarget.clone().lerp(closeTarget,focusBlend);
    const cameraPosition=target.clone().add(overviewOffset.lerp(closeOffset,zoomBlend));
    this.camera.position.copy(cameraPosition);this.camera.lookAt(target);
  }
  private animate=(now:number)=>{
    const {sampleLanePath}=this.track;
    const elapsed=this.lastTime?Math.min((now-this.lastTime)/1000,0.1):0;this.lastTime=now;
    const introElapsed=this.introLastTime?Math.max(0,(now-this.introLastTime)/1000):0;this.introLastTime=now;
    this.intro=stepRaceIntro(this.intro,introElapsed,!document.hidden);
    if(this.intro.stage==='done'&&(this.state.phase==='running'||this.state.phase==='countdown')){
      this.accumulator+=elapsed;
      while(this.accumulator>=FIXED_STEP){this.state=stepRace(this.state);this.accumulator-=FIXED_STEP;}
    }
    for(const racer of this.state.racers){
      if(racer.driving.status==='out'&&racer.driving.stopReason==='lapped')this.lappedAges.set(racer.id,(this.lappedAges.get(racer.id)??0)+(document.hidden?0:elapsed));
      if(racer.driving.status==='out'&&['overspeed','blocked','climb','jump','loop'].includes(racer.driving.stopReason??''))this.crashAges.set(racer.id,(this.crashAges.get(racer.id)??0)+(document.hidden?0:elapsed));
    }
    const player=this.state.racers.find(r=>r.id==='player');
    if(player?.driving.status==='out'&&player.driving.stopReason==='lapped')this.showResults();
    // CPUだけが発進してもスタート画角を維持し、自分の発進後に切り替える。
    if(this.state.playerStartOffset!==null)this.startShotBlend=Math.max(0,this.startShotBlend-elapsed/raceCamera.transitionSeconds);
    this.finishPresentation=stepFinishPresentation(this.finishPresentation,this.state,elapsed);
    const overview=this.cameraZoom===0&&this.intro.stage==='done';
    const frame=this.overviewFrame??(this.overviewFrame=overviewViewportFrame(this.track,this.host.clientWidth,this.host.clientHeight));
    const pixelsPerUnit=this.host.clientHeight/frame.height;
    setVenueOverviewDetail(this.venue,overview,pixelsPerUnit);
    const carScale=overview?overviewCarScale(this.host.clientHeight,frame.height,(this.circuitId==='forge'||this.circuitId==='zenith'||isMasterCourse(this.circuitId))?64:8):1;
    const labelBoxes:Array<{x:number;y:number}>=[];
    for(const racer of this.state.racers){
      const p=sampleLanePath(finishTrackDistance(racer,this.finishPresentation),racer.lane);
      const car=this.cars.get(racer.id)!;
      car.scale.setScalar(.85*carScale);
      const turn=this.track.sampleCircuit(this.track.startDistance+racer.driving.distance+.1),sign=p.tangentX*turn.tangentZ-p.tangentZ*turn.tangentX;
      const slideTarget=racer.driving.status==='running'?Math.min(.006,p.curvature*racer.driving.speed**2*.0006)*(sign<0?-1:1):0;
      for(const slide of (car.userData.rearSlideCarriages??[]) as THREE.Group[])slide.position.x=THREE.MathUtils.lerp(slide.position.x,slideTarget,1-Math.exp(-elapsed*10));
      const marker=this.overviewMarkers.get(racer.id)!;marker.visible=overview;
      const labelHeight=18/Math.max(.01,pixelsPerUnit);marker.scale.set(labelHeight*144/54,labelHeight,1);
      this.scratchUp.set(frame.up.x,frame.up.y,frame.up.z);
      marker.position.set(p.x,(racer.driving.flightY??p.y)+.06*carScale,p.z).addScaledVector(this.scratchUp,labelHeight);
      if(overview){
        const projected=this.scratchProjection.copy(marker.position).project(this.camera),direction=projected.y>.6?-1:1;
        for(let attempt=0;attempt<5;attempt++){
          const q=this.scratchProjection.copy(marker.position).project(this.camera);
          if(!labelBoxes.some(box=>Math.abs(box.x-q.x)<labelHeight*144/54*2/(frame.height*this.aspect)&&Math.abs(box.y-q.y)<labelHeight*2.4/frame.height))break;
          marker.position.addScaledVector(this.scratchUp,labelHeight*1.2*direction);
        }
        const q=this.scratchProjection.copy(marker.position).project(this.camera);labelBoxes.push({x:q.x,y:q.y});
      }
      const reason=racer.driving.stopReason;
      const crashed=racer.driving.status==='out'&&['jump','loop','overspeed'].includes(reason??'');
      const stopped=reason==='blocked'||reason==='climb'||reason==='loop';
      const sideSign=racer.lane<this.track.circuit.lanes/2?-1:1;
      const blowOut=reason==='overspeed'||reason==='jump';
      const presentationAge=this.crashAges.get(racer.id)??0;
      const blowSide=blowOut?sideSign*Math.min(1,presentationAge/.7)*(reason==='overspeed'?.75:.45):0;
      const backDistance=reason==='climb'||reason==='loop'?Math.min(.8,presentationAge*1.15):0;
      car.position.set(p.x+p.upX*.015+p.sideX*blowSide-p.tangentX*backDistance,(racer.driving.flightY??p.y)+(crashed?0.14+Math.sin(Math.min(1,presentationAge/.7)*Math.PI)*.55:p.upY*.015),p.z+p.upZ*.015+p.sideZ*blowSide-p.tangentZ*backDistance);
      car.rotation.order='YXZ';car.rotation.set(racer.driving.flightY!==undefined?-Math.atan2(racer.driving.flightVelocity??0,Math.max(.1,racer.driving.speed)):-p.pitch,Math.atan2(p.tangentX,p.tangentZ)+(blowOut?sideSign*Math.min(1,presentationAge/.7)*.7:reason==='climb'||reason==='loop'?-Math.min(.22,presentationAge*.25):0),crashed?0.9:stopped?-.16:0);
      this.scratchSide.set(p.sideX,p.sideY,p.sideZ);this.scratchUp.set(p.upX,p.upY,p.upZ);this.scratchForward.set(p.forwardX,p.forwardY,p.forwardZ);
      if((this.circuitId==='forge'||this.circuitId==='zenith'||isMasterCourse(this.circuitId))&&racer.driving.flightY===undefined&&!crashed)car.quaternion.setFromRotationMatrix(this.scratchBasis.makeBasis(this.scratchSide,this.scratchUp,this.scratchForward));
      const direction=sign<0?-1:1;
      const grounded=racer.driving.flightY===undefined&&!crashed&&!stopped&&racer.driving.status!=='out';
      animateRunningGear(car,finishTrackDistance(racer,this.finishPresentation),elapsed,direction,p.curvature,grounded);
      if(grounded&&racer.driving.speed>.01){
        const motion=handlingPose(car.userData.handling,racer.driving.speed,p.curvature*this.track.cornerLoad,this.track.surfaceAt(racer.driving.distance).roughness,racer.driving.time,racer.driving.distance,direction);
        // レーン面のローカル軸で揺らすので、バンクやスパイラルでも路面から外れない。
        const lateral=this.reducedMotion?0:motion.lateral;
        car.position.addScaledVector(this.scratchSide,lateral);
        car.position.addScaledVector(this.scratchUp,this.reducedMotion?0:motion.heave);
        if(!this.reducedMotion){car.rotateY(motion.yaw);car.rotateZ(motion.roll);}
      }
      if(racer.driving.stopReason==='lapped'){
        const pose=lappedPose(this.lappedAges.get(racer.id)??0);
        const side=racer.lane<this.track.circuit.lanes/2?-1:1;
        car.position.x+=p.tangentZ*pose.outward*side+p.tangentX*pose.forward;
        car.position.z+=-p.tangentX*pose.outward*side+p.tangentZ*pose.forward;
        car.position.y+=pose.height;
        car.rotation.x+=pose.pitch;car.rotation.z=pose.roll*side;
        marker.position.x+=car.position.x-p.x;marker.position.z+=car.position.z-p.z;
        marker.position.y+=pose.height;
      }
      this.shadows.update(racer.id,p,racer.driving.flightY,!crashed&&racer.driving.status!=='out'&&!this.track.isJumpGap(finishTrackDistance(racer,this.finishPresentation)),carScale);
      if(racer.id==='player'){
        this.shadows.follow(car.position,overview);
        this.playerMarker.position.copy(car.position);if(overview)this.playerMarker.position.addScaledVector(this.scratchUp.set(frame.up.x,frame.up.y,frame.up.z),.16*carScale);else this.playerMarker.position.y+=.24;
        if(overview)this.playerMarker.quaternion.setFromUnitVectors(this.scratchSide.set(0,1,0),this.scratchUp.set(-frame.up.x,-frame.up.y,-frame.up.z));else this.playerMarker.rotation.set(0,0,Math.PI);
      }
    }
    this.playerMarker.scale.setScalar(overview?carScale:1);
    this.playerMarker.visible=this.intro.stage==='done'&&!overview;
    this.venueAnimation.update(now/1000,this.state.phase,this.reducedMotion);
    this.updateCamera(elapsed);const focus=this.cars.get('player')!.position,right=this.scratchRight.set(1,0,0).applyQuaternion(this.activeCamera.quaternion);
    this.audio.update(this.state,{track:this.track,listener:focus,right});
    const renderStarted=this.firstRenderPending?performance.now():0;this.renderer.render(this.scene,this.activeCamera);
    if(this.firstRenderPending){this.firstRenderPending=false;this.preparationTimings.firstRender=performance.now()-renderStarted;if(new URLSearchParams(window.location.search).has('renderstats'))console.info('[seiran-race-preparation]',this.circuitId,JSON.stringify(this.preparationTimings));}
    if(now-this.lastReport>100){this.report({...this.state});this.reportFinish(this.finishPresentation);this.reportIntro(this.intro);this.lastReport=now;}
    this.frame=requestAnimationFrame(this.animate);
  };
  dispose(){
    if(this.disposed)return;this.disposed=true;
    document.removeEventListener('visibilitychange',this.resetIntroClock);
    this.audio.dispose();
    if(this.initialized)this.report({...this.state});
    cancelAnimationFrame(this.frame);this.observer?.disconnect();
    disposeSceneResources(this.scene,this.textures);
    this.environment?.dispose();
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }
}
