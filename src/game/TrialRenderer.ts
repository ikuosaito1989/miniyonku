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
import { raceCamera } from '../data/raceCamera';
import { createFinishPresentation, finishTrackDistance, finishSequence, shouldUseFinishCamera, stepFinishPresentation, type FinishPresentation } from './finishPresentation';
import { RaceAudio } from './RaceAudio';

export type TrialCamera = 'broadcast' | 'overview';

export class TrialRenderer {
  private renderer: THREE.WebGLRenderer;
  private environment:THREE.WebGLRenderTarget;
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
  private cameraMode: TrialCamera = 'broadcast';
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

  constructor(private host: HTMLElement, private equipment: Equipment, private report: (state: RaceState) => void, private reportFinish:(state:FinishPresentation)=>void, private condition:MachineCondition=freshCondition, private seed=0x5eed,private challenge:RaceChallenge=false,private circuitId:CircuitId='leaf',private reportIntro:(intro:RaceIntro)=>void=()=>{}) {
    this.track=getCircuitTrack(circuitId);
    this.state=createRaceState(equipment,seed,condition,challenge,circuitId);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(challenge==='official'?0x344d5b:0x315b2a);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.environment=studioEnvironment(this.renderer);this.scene.environment=this.environment.texture;
    this.renderer.domElement.style.width='100%';
    this.renderer.domElement.style.height='100%';
    host.append(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xe4efff,0x45653b,2));
    const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-3,8,4);this.scene.add(sun);
    const grass=this.grassTexture();
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(this.track.open?600:100,this.track.open?600:100),new THREE.MeshLambertMaterial(challenge==='official'?{color:0x7c928f}:{map:grass}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.025;this.scene.add(ground);
    if(challenge==='official')this.buildOfficialArena();
    this.buildTrack();this.buildObstacles();this.buildStart();
    for(const racer of this.state.racers){
      const car=buildRaceMachineModel(racer);this.cars.set(racer.id,car);this.scene.add(car);
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
  setCamera(mode:TrialCamera){if(this.intro.stage==='done')this.cameraMode=mode;}
  showResults(){
    const player=this.state.racers.find(r=>r.id==='player');
    if(player?.driving.stopReason==='lapped'&&(this.lappedAges.get('player')??0)<lappedPresentationSeconds)return;
    if(this.finishPresentation.stage==='results'||!canViewRaceResults(this.state))return;
    this.state=completeRaceAfterPlayerFinish(this.state);
    this.finishPresentation={...stepFinishPresentation(this.finishPresentation,this.state,0),stage:'results',finalAge:finishSequence.holdSeconds+finishSequence.tallySeconds};
    this.audio.update(this.state);
    this.report({...this.state});this.reportFinish(this.finishPresentation);
  }
  setSound(enabled:boolean,volume=0.35){this.audio.setVolume(volume);this.audio.setEnabled(enabled);}
  restart(){
    this.lappedAges.clear();
    this.state=createRaceState(this.equipment,this.seed,this.condition,this.challenge,this.circuitId);this.accumulator=0;this.lastTime=0;this.lastReport=-1;this.cameraMode='broadcast';this.startShotBlend=1;
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
    context.fillStyle='#38772c';context.fillRect(0,0,64,64);
    for(let y=0;y<64;y+=2)for(let x=0;x<64;x+=2){
      const shade=(x*13+y*7)%19;
      context.fillStyle=shade<5?'#3f802f':shade>14?'#316c27':'#39762b';context.fillRect(x,y,2,2);
    }
    const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
    texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;
    texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(80,80);
    this.textures.push(texture);return texture;
  }
  private mesh(geometry:THREE.BufferGeometry,color:number){
    return new THREE.Mesh(geometry,new THREE.MeshLambertMaterial({color,flatShading:true}));
  }
  private buildOfficialArena(){
    const {circuit}=this.track;
    const points=this.track.open?Array.from({length:1201},(_,i)=>this.track.sampleCircuit(i/1200*this.track.circuitLength)):[];
    const xs=points.map(p=>p.x),zs=points.map(p=>p.z),cx=points.length?(Math.min(...xs)+Math.max(...xs))/2:0,cz=points.length?(Math.min(...zs)+Math.max(...zs))/2:0;
    const rx=points.length?(Math.max(...xs)-Math.min(...xs))/2+1:circuit.radiusX,rz=points.length?(Math.max(...zs)-Math.min(...zs))/2+1:circuit.radiusZ;
    // 公式戦は模型店の芝生会場と分け、観客席と照明を持つ競技フロアにする。
    for(const side of [-1,1])for(let row=0;row<3;row++){
      const stand=this.mesh(new THREE.BoxGeometry(rx*1.8,.22,.35),row%2?0x8aa8bc:0x466b82);
      stand.position.set(cx,.12+row*.15,cz+side*(rz+1.7+row*.4));this.scene.add(stand);
      for(let i=-5;i<=5;i++){
        const seat=this.mesh(new THREE.BoxGeometry(.22,.12,.16),[0xb2d3c4,0xd0b16c,0x87acb9][(i+5)%3]);
        seat.position.set(cx+i*rx*.13,.32+row*.15,stand.position.z);this.scene.add(seat);
      }
    }
    for(const x of [-1,1])for(const z of [-1,1]){
      const pole=this.mesh(new THREE.CylinderGeometry(.035,.05,2.8,8),0x355263);pole.position.set(cx+x*(rx+1.3),1.4,cz+z*(rz+1));this.scene.add(pole);
      const lamp=this.mesh(new THREE.BoxGeometry(.38,.14,.12),0xf3ecc3);lamp.position.set(pole.position.x,2.8,pole.position.z);this.scene.add(lamp);
    }
  }
  private buildTrack(){
    const {circuit,circuitLength,sampleLanePath}=this.track;
    for(let lane=0;lane<circuit.lanes;lane++){
      const vertices:number[]=[],indices:number[]=[],colors:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        for(const offset of [-circuit.laneWidth/2,circuit.laneWidth/2]){
          vertices.push(p.x+p.sideX*offset,p.y+p.sideY*offset,p.z+p.sideZ*offset);
          const surface=this.track.surfaceAt(i/circuit.samples*circuitLength);
          const color=new THREE.Color(surface.roughness===0?(lane%2?0x8d91bb:0xaaaed0):surface.roughness>.8?0xd2b47a:0xad8d61);
          color.multiplyScalar(.88+.12*Math.sin(i*13.7+lane*4.1)**2);colors.push(color.r,color.g,color.b);
        }
        if(i<circuit.samples&&!this.track.isJumpGap((i+.5)/circuit.samples*circuitLength)){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      if(circuit.surface.roughness>0)geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
      const mesh=this.mesh(geometry,circuit.surface.roughness>0?0xffffff:lane%2?0x8d91bb:0xaaaed0);mesh.material.vertexColors=circuit.surface.roughness>0;mesh.material.side=THREE.DoubleSide;this.scene.add(mesh);
      for(const side of [-1,1]){
      const offset=side*circuit.laneWidth/2;
      const vertices:number[]=[],indices:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        for(const [delta,height] of [[-0.008,0],[0.008,0],[-0.008,0.055],[0.008,0.055]])vertices.push(p.x+p.sideX*(offset+delta)+p.upX*height,p.y+p.sideY*(offset+delta)+p.upY*height,p.z+p.sideZ*(offset+delta)+p.upZ*height);
        if(i<circuit.samples&&!this.track.isJumpGap((i+.5)/circuit.samples*circuitLength)){const a=i*4;indices.push(a,a+4,a+2,a+2,a+4,a+6,a+1,a+3,a+5,a+3,a+7,a+5,a+2,a+6,a+3,a+3,a+6,a+7);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const rail=this.mesh(geometry,0xd7e5ed);rail.material.side=THREE.DoubleSide;this.scene.add(rail);
      }
    }
  }
  private buildObstacles(){
    const {obstacles,circuit,circuitLength,sampleLanePath}=this.track;if(!obstacles)return;
    for(let d=0;d<circuitLength;d+=(this.circuitId==='forge'||this.circuitId==='zenith'?6:2.2))for(const lane of [0,4]){
      if(this.track.isJumpGap(d))continue;
      const p=sampleLanePath(d,lane);if(p.y<.18)continue;
      const support=this.mesh(new THREE.BoxGeometry(.07,p.y,.07),0x5b7380);
      support.position.set(p.x+p.tangentZ*(lane===0?-.15:.15),p.y/2,p.z-p.tangentX*(lane===0?-.15:.15));support.name='elevated-course-support';this.scene.add(support);
    }
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
      const mesh=this.mesh(geometry,color);mesh.material.side=THREE.DoubleSide;this.scene.add(mesh);
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
    const texture=new THREE.CanvasTexture(canvas);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;this.textures.push(texture);
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
    // 自作のスタート係。既存作品のキャラクターを使わない。
    const attendant=new THREE.Group();attendant.position.set(-circuit.laneWidth*circuit.lanes/2-0.23,0,-0.15);
    const block=(w:number,h:number,d:number,x:number,y:number,z:number,color:number)=>{
      const mesh=this.mesh(new THREE.BoxGeometry(w,h,d),color);mesh.position.set(x,y,z);attendant.add(mesh);
    };
    block(0.11,0.15,0.08,0,0.16,0,0xe0a34c);block(0.09,0.09,0.08,0,0.28,0,0xefc09a);
    block(0.12,0.03,0.11,0,0.34,0,0x304461);block(0.04,0.1,0.06,-0.03,0.04,0,0x25364b);block(0.04,0.1,0.06,0.03,0.04,0,0x25364b);
    block(0.025,0.15,0.025,-0.11,0.25,0,0xefc09a);block(0.12,0.08,0.008,-0.17,0.35,0,0xf8df79);
    const podium=this.mesh(new THREE.BoxGeometry(.3,startRampHeight(0),.4),0x526477);podium.position.set(attendant.position.x,-startRampHeight(0)/2,attendant.position.z);group.add(podium);
    group.add(attendant);this.scene.add(group);
  }
  private updateCamera(){
    const {circuit,sampleLanePath}=this.track;
    const frame=this.overviewFrame??(this.overviewFrame=overviewViewportFrame(this.track,this.host.clientWidth,this.host.clientHeight));
    const player=this.state.racers.find(r=>r.id==='player')!;
    const p=sampleLanePath(player.driving.distance,player.lane);
    if(this.intro.stage!=='done'){
      this.camera.up.set(0,1,0);
      const frame=this.introFrame??(this.introFrame=overviewFrame(this.track,this.aspect,false));
      const age=this.intro.age,start=sampleLanePath(0,(circuit.lanes-1)/2);
      const wide=frame.height*1.12;
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
    const overview=this.cameraMode==='overview';
    if(overview)this.camera.up.set(frame.up.x,frame.up.y,frame.up.z);else this.camera.up.set(0,1,0);
    const goalShot=!overview&&shouldUseFinishCamera(this.state,this.finishPresentation);
    const blend=this.startShotBlend*this.startShotBlend*(3-2*this.startShotBlend);
    const startHeight=Math.max(raceCamera.start.height,raceCamera.start.minWidth/this.aspect);
    const runningHeight=Math.max(raceCamera.running.height,raceCamera.running.minWidth/this.aspect);
    const viewHeight=overview?frame.height:goalShot?Math.max(raceCamera.finish.height,raceCamera.finish.minWidth/this.aspect):THREE.MathUtils.lerp(runningHeight,startHeight,blend);
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
      if(racer.id==='player'){
        this.playerMarker.position.copy(car.position).add(overview?new THREE.Vector3(frame.up.x,frame.up.y,frame.up.z).multiplyScalar(.16*carScale):new THREE.Vector3(0,.24,0));
        if(overview)this.playerMarker.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),new THREE.Vector3(-frame.up.x,-frame.up.y,-frame.up.z));else this.playerMarker.rotation.set(0,0,Math.PI);
      }
    }
    this.playerMarker.scale.setScalar(overview?carScale:1);
    this.playerMarker.visible=this.intro.stage==='done';
    this.audio.update(this.state);
    this.updateCamera();this.renderer.render(this.scene,this.camera);
    if(now-this.lastReport>100){this.report({...this.state});this.reportFinish(this.finishPresentation);this.reportIntro(this.intro);this.lastReport=now;}
    this.frame=requestAnimationFrame(this.animate);
  };
  dispose(){
    document.removeEventListener('visibilitychange',this.resetIntroClock);
    this.audio.dispose();
    this.report({...this.state});
    cancelAnimationFrame(this.frame);this.observer.disconnect();
    this.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});
    for(const texture of this.textures)texture.dispose();
    this.environment.dispose();
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }
}
