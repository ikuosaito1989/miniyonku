import {RaceCameraDirector} from './RaceCameraDirector';
import {buildStartMarshal} from './StartMarshal';
import {withMobRivals} from './mobRace';
import {VenueAnimation} from './VenueAnimation';
import {raceCourseDetails} from './RaceCourseDetails';
import {isPracticeCourse} from '../data/practiceCourses';
import {physicalRenderer,modelLighting} from './sceneLighting';
import {RaceShadows} from './RaceShadows';
import {disposeSceneResources} from './modelFinish';
import {withOnlineRivals} from './onlineRace';
import type {OnlineRecord} from './onlineRecords';
import {raceVenueScenery} from './RaceVenueScenery';
import {animateRunningGear,handlingProfile,handlingPose} from './raceMotion';
import { studioEnvironment } from './studioEnvironment';
import { lappedPose, lappedPresentationSeconds } from './lappedPresentation';
import { raceIntroDuration, raceIntroTiming, raceIntroAt, stepRaceIntro, type RaceIntro } from './raceIntro';
import * as THREE from 'three';
import { buildRaceMachineModel } from './MachineModel';
import { freshCondition, type MachineCondition } from './condition';
import { compactDevice, raceRenderSize } from '../data/display';
import { getCircuitTrack, type CircuitId, type CircuitTrack } from '../data/circuit';
import type { Equipment } from '../data/machine';
import { FIXED_STEP } from './driving';
import { canViewRaceResults, completeRaceAfterPlayerFinish, createRaceState, launchPlayer, startRace, stepRace, type RaceState, type RaceChallenge } from './race';
import {overviewFrame,overviewViewportFrame,overviewCarScale} from './overviewCamera';
import { raceCamera, type TrialCamera } from '../data/raceCamera';
import { createFinishPresentation, finishTrackDistance, finishSequence, shouldUseFinishCamera, stepFinishPresentation, type FinishPresentation } from './finishPresentation';
import { RaceAudio } from './RaceAudio';

export type { TrialCamera } from '../data/raceCamera';

export class TrialRenderer {
  private renderer: THREE.WebGLRenderer;
  private environment:THREE.WebGLRenderTarget;
  private shadows:RaceShadows;
  private venueAnimation:VenueAnimation;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-2,2,1,-1,0.01,1000);
  private cars = new Map<string,THREE.Group>();
  private state: RaceState;
  private playerMarker = new THREE.Mesh(new THREE.ConeGeometry(0.035,0.07,3),new THREE.MeshBasicMaterial({color:0xffe66b}));
  private observer: ResizeObserver;
  private frame = 0;
  private lastTime = 0;
  private accumulator = 0;
  private lastReport = -1;
  private lappedAges=new Map<string,number>();
  private introFrame:ReturnType<typeof overviewFrame>|null=null;
  private overviewFrame:ReturnType<typeof overviewFrame>|null=null;
  private overviewMarkers=new Map<string,THREE.Sprite>();
  private cameraMode: TrialCamera = 'auto';
  private graphicsQuality:'low'|'medium'|'high'=compactDevice()?'medium':'high';
  private director=new RaceCameraDirector();
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

  constructor(private host: HTMLElement, private equipment: Equipment, private report: (state: RaceState) => void, private reportFinish:(state:FinishPresentation)=>void, private condition:MachineCondition=freshCondition, private seed=0x5eed,private challenge:RaceChallenge=false,private circuitId:CircuitId='leaf',private reportIntro:(intro:RaceIntro)=>void=()=>{},private bodyPaint:number|null=null,onlineRecords:OnlineRecord[]|null=null,mobRace=false) {
    this.track=getCircuitTrack(circuitId);
    this.state=createRaceState(equipment,seed,condition,challenge,circuitId,this.bodyPaint);
    if(onlineRecords)this.state=withOnlineRivals(this.state,onlineRecords);
    else if(mobRace)this.state=withMobRivals(this.state);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor((challenge==='official'||challenge==='time-attack')?0x344d5b:0x315b2a);
    physicalRenderer(this.renderer);
    this.environment=studioEnvironment(this.renderer);this.scene.environment=this.environment.texture;
    this.renderer.domElement.style.width='100%';
    this.renderer.domElement.style.height='100%';
    host.append(this.renderer.domElement);
    const sun=modelLighting(this.scene);this.shadows=new RaceShadows(this.scene,sun,compactDevice());
    const grass=this.grassTexture();
    const groundSize=this.track.open?600:Math.max(100,this.track.circuit.radiusX*2+40,this.track.circuit.radiusZ*2+40);
    grass.repeat.set(groundSize/1.5,groundSize/1.5);
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(groundSize,groundSize),new THREE.MeshStandardMaterial((challenge==='official'||challenge==='time-attack')?{color:0x7c928f,roughness:.86,envMapIntensity:.35}:{map:grass,roughness:1,envMapIntensity:.25}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.025;ground.receiveShadow=true;this.scene.add(ground);
    const venue=raceVenueScenery(this.track,(challenge==='official'||challenge==='time-attack'),isPracticeCourse(circuitId));this.scene.add(venue);this.venueAnimation=new VenueAnimation(venue);
    this.buildTrack();this.scene.add(raceCourseDetails(this.track));this.buildObstacles();this.buildStart();this.venueAnimation.attachMarshal(this.scene);
    for(const racer of this.state.racers){
      const car=buildRaceMachineModel(racer);car.userData.handling=handlingProfile(racer.equipment,racer.performance);this.cars.set(racer.id,car);this.scene.add(car);this.shadows.add(racer.id,car);
      const canvas=document.createElement('canvas');canvas.width=144;canvas.height=54;
      const ctx=canvas.getContext('2d')!;ctx.fillStyle=racer.id==='player'?'#ffe16d':'#18293e';ctx.strokeStyle=racer.id==='player'?'#fff5d7':`#${racer.color.toString(16).padStart(6,'0')}`;ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(3,3,138,48,12);ctx.fill();ctx.stroke();
      ctx.font='bold 30px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle=racer.id==='player'?'#18293e':'#fff4db';ctx.fillText(racer.id==='player'?'▼ 自分':racer.name.split(/[ 　]/).at(-1)!,72,28);
      const texture=new THREE.CanvasTexture(canvas);this.textures.push(texture);
      const marker=new THREE.Sprite(new THREE.SpriteMaterial({map:texture,depthTest:false,depthWrite:false,transparent:true}));marker.renderOrder=100;marker.visible=false;marker.name=`overview-marker-${racer.id}`;this.overviewMarkers.set(racer.id,marker);this.scene.add(marker);
    }
    this.playerMarker.rotation.z=Math.PI;this.scene.add(this.playerMarker);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
    this.audio=new RaceAudio();
    document.addEventListener('visibilitychange',this.resetIntroClock);
    this.report({...this.state});this.reportFinish(this.finishPresentation);this.reportIntro(this.intro);this.frame=requestAnimationFrame(this.animate);
  }

  skipIntro(){
    if(this.intro.stage==='done')return;
    this.intro=raceIntroAt(raceIntroDuration);this.lastTime=0;this.accumulator=0;this.reportIntro(this.intro);
  }
  start(){
    if(this.intro.stage!=='done'){this.skipIntro();return;}
    this.audio.unlock();
    const previous=this.state;
    this.state=previous.phase==='ready'?startRace(previous):launchPlayer(previous);
    if(this.state===previous)return;
    if(previous.phase==='ready'){this.accumulator=0;this.lastTime=0;}
    this.audio.update(this.state);
    this.report({...this.state});
  }
  setGraphicsQuality(quality:'low'|'medium'|'high'){this.graphicsQuality=quality;this.renderer.shadowMap.enabled=quality!=='low';this.shadows.setQuality(quality);this.resize();}
  setCamera(mode:TrialCamera){if(this.intro.stage==='done'){this.cameraMode=mode;}}
  showResults(skipRetirementAnimation=false){
    const player=this.state.racers.find(r=>r.id==='player');
    if(!skipRetirementAnimation&&player?.driving.stopReason==='lapped'&&(this.lappedAges.get('player')??0)<lappedPresentationSeconds)return;
    if(this.finishPresentation.stage==='results'||!canViewRaceResults(this.state))return;
    this.state=completeRaceAfterPlayerFinish(this.state);
    this.finishPresentation={...stepFinishPresentation(this.finishPresentation,this.state,0),stage:'results',finalAge:finishSequence.holdSeconds+finishSequence.tallySeconds};
    this.audio.update(this.state);
    this.report({...this.state});this.reportFinish(this.finishPresentation);
  }
  setSound(enabled:boolean,volume=0.35){this.audio.setVolume(volume);this.audio.setEnabled(enabled);}
  restart(){
    this.lappedAges.clear();
    for(const car of this.cars.values())delete car.userData.motionDistance;
    this.state=createRaceState(this.equipment,this.seed,this.condition,this.challenge,this.circuitId,this.bodyPaint);this.accumulator=0;this.lastTime=0;this.lastReport=-1;this.cameraMode='auto';this.director.reset();this.startShotBlend=1;
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
    const scale=this.graphicsQuality==='low'?.7:1;
    this.renderer.setSize(Math.max(1,Math.round(resolution.width*scale)),Math.max(1,Math.round(resolution.height*scale)),false);
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
    for(let lane=0;lane<circuit.lanes;lane++){
      const vertices:number[]=[],indices:number[]=[],colors:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        for(const fraction of [-1,-.8,0,.8,1]){
          const offset=fraction*circuit.laneWidth/2,height=.0025*Math.abs(fraction)**2;
          vertices.push(p.x+p.sideX*offset+p.upX*height,p.y+p.sideY*offset+p.upY*height,p.z+p.sideZ*offset+p.upZ*height);
          const surface=this.track.surfaceAt(i/circuit.samples*circuitLength);
          const color=new THREE.Color(surface.roughness===0?(lane%2?0x8d91bb:0xaaaed0):surface.roughness>.8?0xd2b47a:0xad8d61);
          color.multiplyScalar(.88+.12*Math.sin(i*13.7+lane*4.1)**2);colors.push(color.r,color.g,color.b);
        }
        if(i<circuit.samples&&!this.track.isJumpGap((i+.5)/circuit.samples*circuitLength)){for(let col=0;col<4;col++){const a=i*5+col;indices.push(a,a+1,a+5,a+1,a+6,a+5);}}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      if(circuit.surface.roughness>0)geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
      const mesh=this.mesh(geometry,circuit.surface.roughness>0?0xffffff:lane%2?0x8d91bb:0xaaaed0);mesh.name=`course-running-surface-${lane}`;mesh.material.vertexColors=circuit.surface.roughness>0;mesh.material.side=THREE.DoubleSide;mesh.material.roughness=circuit.surface.roughness>0?.77:.36;mesh.material.metalness=0;mesh.material.envMapIntensity=.8;mesh.receiveShadow=true;this.scene.add(mesh);
      for(const side of [-1,1]){
      const offset=side*circuit.laneWidth/2;
      const vertices:number[]=[],indices:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        // Six-sided rounded cap, extruded along the unchanged lane geometry.
        for(const [delta,height] of [[-.008,0],[-.008,.048],[-.0057,.0537],[0,.056],[.0057,.0537],[.008,.048],[.008,0]])vertices.push(p.x+p.sideX*(offset+delta)+p.upX*height,p.y+p.sideY*(offset+delta)+p.upY*height,p.z+p.sideZ*(offset+delta)+p.upZ*height);
        if(i<circuit.samples&&!this.track.isJumpGap((i+.5)/circuit.samples*circuitLength)){for(let face=0;face<6;face++){const a=i*7+face;indices.push(a,a+7,a+1,a+1,a+7,a+8);}}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const rail=this.mesh(geometry,0xd7e5ed);rail.name=`course-rounded-rail-${lane}-${side}`;rail.material.side=THREE.DoubleSide;rail.material.roughness=.32;rail.material.metalness=0;rail.material.envMapIntensity=.8;rail.receiveShadow=true;this.scene.add(rail);
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
    const colors=[0x5685ce,0xcf5263,0xd4b749,0x50a889,0xb17bcb];
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
    const player=this.state.racers.find(r=>r.id==='player')!;
    const p=sampleLanePath(player.driving.distance,player.lane);
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
        const distance=this.circuitId==='forge'||this.circuitId==='zenith'?landmarks[Math.min(5,Math.floor(progress*6))]:progress*this.track.circuitLength;
        const p=sampleLanePath(distance,(circuit.lanes-1)/2),zoom=smooth((age-raceIntroTiming.overview)/1.6);
        target.lerp(new THREE.Vector3(p.x,p.y,p.z),zoom);height=THREE.MathUtils.lerp(wide,tourHeight,zoom);
      }else if(this.intro.stage==='grid'&&!this.reducedMotion){
        const zoom=smooth((age-raceIntroTiming.overview-raceIntroTiming.tour)/raceIntroTiming.grid);target=new THREE.Vector3(start.x-start.tangentX*raceCamera.start.lookBehind*zoom,start.y,start.z-start.tangentZ*raceCamera.start.lookBehind*zoom);height=THREE.MathUtils.lerp(tourHeight,gridHeight,zoom);
      }
      this.camera.left=-height*this.aspect/2;this.camera.right=height*this.aspect/2;this.camera.top=height/2;this.camera.bottom=-height/2;this.camera.updateProjectionMatrix();
      this.camera.position.copy(target).add(new THREE.Vector3(...raceCamera.start.offset).multiplyScalar(Math.max(1,height/6)));this.camera.lookAt(target);return;
    }
    if(this.cameraMode==='auto'||this.cameraMode==='follow'||this.cameraMode==='low'){
      this.activeCamera=this.director.update(this.track,this.state,this.finishPresentation,this.cameraMode,this.aspect,elapsed,this.reducedMotion);
      return;
    }
    this.activeCamera=this.camera;
    const overview=this.cameraMode==='overview',zoom=this.cameraMode==='zoom';
    if(overview)this.camera.up.set(frame.up.x,frame.up.y,frame.up.z);else this.camera.up.set(0,1,0);
    const goalShot=!overview&&!zoom&&shouldUseFinishCamera(this.state,this.finishPresentation);
    const blend=zoom?0:this.startShotBlend*this.startShotBlend*(3-2*this.startShotBlend);
    const startHeight=Math.max(raceCamera.start.height,raceCamera.start.minWidth/this.aspect);
    const runningHeight=zoom?Math.max(.55,.72/this.aspect):Math.max(raceCamera.running.height,raceCamera.running.minWidth/this.aspect);
    const viewHeight=(overview?frame.height:goalShot?Math.max(raceCamera.finish.height,raceCamera.finish.minWidth/this.aspect):THREE.MathUtils.lerp(runningHeight,startHeight,blend))*(this.cameraMode==='broadcast'?raceCamera.machineViewScale:1);
    this.camera.left=-viewHeight*this.aspect/2;this.camera.right=viewHeight*this.aspect/2;
    this.camera.top=viewHeight/2;this.camera.bottom=-viewHeight/2;this.camera.updateProjectionMatrix();
    const start=sampleLanePath(this.track.open&&goalShot?this.track.circuitLength:0,(circuit.lanes-1)/2);
    const target=overview?new THREE.Vector3(frame.target.x,frame.target.y,frame.target.z):goalShot?new THREE.Vector3(start.x-start.tangentX*raceCamera.finish.lookBehind,start.y,start.z-start.tangentZ*raceCamera.finish.lookBehind):new THREE.Vector3(p.x+p.tangentX*raceCamera.running.lookAhead,p.y,p.z+p.tangentZ*raceCamera.running.lookAhead)
      .lerp(new THREE.Vector3(start.x-start.tangentX*raceCamera.start.lookBehind,start.y,start.z-start.tangentZ*raceCamera.start.lookBehind),blend);
    const offset=new THREE.Vector3(...(goalShot?raceCamera.finish.offset:raceCamera.running.offset));
    if(!overview&&!goalShot)offset.lerp(new THREE.Vector3(...raceCamera.start.offset),blend);
    if(overview)offset.multiplyScalar(Math.max(1,viewHeight/6));
    this.camera.position.copy(target).add(offset);this.camera.lookAt(target);
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
    }
    const player=this.state.racers.find(r=>r.id==='player');
    if(player?.driving.status==='out'&&player.driving.stopReason==='lapped')this.showResults();
    // CPUだけが発進してもスタート画角を維持し、自分の発進後に切り替える。
    if(this.state.playerStartOffset!==null)this.startShotBlend=Math.max(0,this.startShotBlend-elapsed/raceCamera.transitionSeconds);
    this.finishPresentation=stepFinishPresentation(this.finishPresentation,this.state,elapsed);
    const overview=this.cameraMode==='overview'&&this.intro.stage==='done';
    const frame=this.overviewFrame??(this.overviewFrame=overviewViewportFrame(this.track,this.host.clientWidth,this.host.clientHeight));
    const pixelsPerUnit=this.host.clientHeight/frame.height;
    const carScale=overview?overviewCarScale(this.host.clientHeight,frame.height,(this.circuitId==='forge'||this.circuitId==='zenith')?64:8):1;
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
      marker.position.set(p.x,(racer.driving.flightY??p.y)+.06*carScale,p.z).add(new THREE.Vector3(frame.up.x,frame.up.y,frame.up.z).multiplyScalar(labelHeight));
      if(overview){
        const projected=marker.position.clone().project(this.camera),direction=projected.y>.6?-1:1;
        for(let attempt=0;attempt<5;attempt++){
          const q=marker.position.clone().project(this.camera);
          if(!labelBoxes.some(box=>Math.abs(box.x-q.x)<labelHeight*144/54*2/(frame.height*this.aspect)&&Math.abs(box.y-q.y)<labelHeight*2.4/frame.height))break;
          marker.position.add(new THREE.Vector3(frame.up.x,frame.up.y,frame.up.z).multiplyScalar(labelHeight*1.2*direction));
        }
        const q=marker.position.clone().project(this.camera);labelBoxes.push({x:q.x,y:q.y});
      }
      const crashed=racer.driving.status==='out'&&(!racer.driving.stopReason||racer.driving.stopReason==='jump'||racer.driving.stopReason==='loop');
      car.position.set(p.x+p.upX*.015,(racer.driving.flightY??p.y)+(crashed?0.14:p.upY*.015),p.z+p.upZ*.015);
      car.rotation.order='YXZ';car.rotation.set(racer.driving.flightY!==undefined?-Math.atan2(racer.driving.flightVelocity??0,Math.max(.1,racer.driving.speed)):-p.pitch,Math.atan2(p.tangentX,p.tangentZ),crashed?0.9:0);
      if((this.circuitId==='forge'||this.circuitId==='zenith')&&racer.driving.flightY===undefined&&!crashed)car.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(new THREE.Vector3(p.sideX,p.sideY,p.sideZ),new THREE.Vector3(p.upX,p.upY,p.upZ),new THREE.Vector3(p.forwardX,p.forwardY,p.forwardZ)));
      const direction=sign<0?-1:1;
      const grounded=racer.driving.flightY===undefined&&!crashed&&racer.driving.status!=='out';
      animateRunningGear(car,finishTrackDistance(racer,this.finishPresentation),elapsed,direction,p.curvature,grounded);
      if(grounded&&racer.driving.speed>.01){
        const motion=handlingPose(car.userData.handling,racer.driving.speed,p.curvature*this.track.cornerLoad,this.track.surfaceAt(racer.driving.distance).roughness,racer.driving.time,racer.driving.distance,direction);
        // レーン面のローカル軸で揺らすので、バンクやスパイラルでも路面から外れない。
        const lateral=this.reducedMotion?0:motion.lateral;
        car.position.addScaledVector(new THREE.Vector3(p.sideX,p.sideY,p.sideZ),lateral);
        car.position.addScaledVector(new THREE.Vector3(p.upX,p.upY,p.upZ),this.reducedMotion?0:motion.heave);
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
        this.playerMarker.position.copy(car.position).add(overview?new THREE.Vector3(frame.up.x,frame.up.y,frame.up.z).multiplyScalar(.16*carScale):new THREE.Vector3(0,.24,0));
        if(overview)this.playerMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-frame.up.x,-frame.up.y,-frame.up.z));else this.playerMarker.rotation.set(0,0,Math.PI);
      }
    }
    this.playerMarker.scale.setScalar(overview?carScale:1);
    this.playerMarker.visible=this.intro.stage==='done'&&!['auto','follow','low'].includes(this.cameraMode);
    this.venueAnimation.update(now/1000,this.state.phase,this.reducedMotion);
    this.updateCamera(elapsed);const focus=this.cars.get('player')!.position,right=new THREE.Vector3(1,0,0).applyQuaternion(this.activeCamera.quaternion);
    this.audio.update(this.state,{track:this.track,listener:focus,right});this.renderer.render(this.scene,this.activeCamera);
    if(now-this.lastReport>100){this.report({...this.state});this.reportFinish(this.finishPresentation);this.reportIntro(this.intro);this.lastReport=now;}
    this.frame=requestAnimationFrame(this.animate);
  };
  dispose(){
    document.removeEventListener('visibilitychange',this.resetIntroClock);
    this.audio.dispose();
    this.report({...this.state});
    cancelAnimationFrame(this.frame);this.observer.disconnect();
    disposeSceneResources(this.scene,this.textures);
    this.environment.dispose();
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }
}
