import * as THREE from 'three';
import { buildMachineModel } from './MachineModel';
import { freshCondition, type MachineCondition } from './condition';
import { compactDevice, raceRenderSize } from '../data/display';
import { circuit, circuitLength, laneOffset, sampleCircuit, sampleLanePath, startDistance } from '../data/circuit';
import type { Equipment } from '../data/machine';
import { FIXED_STEP } from './driving';
import { createRaceState, launchPlayer, startRace, stepRace, type RaceState } from './race';
import { raceCamera } from '../data/raceCamera';
import { createFinishPresentation, finishCoastDistance, shouldUseFinishCamera, stepFinishPresentation, type FinishPresentation } from './finishPresentation';

export type TrialCamera = 'broadcast' | 'overview';

export class TrialRenderer {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-2,2,1,-1,0.01,100);
  private cars = new Map<string,THREE.Group>();
  private state: RaceState;
  private playerMarker = new THREE.Mesh(new THREE.ConeGeometry(0.035,0.07,3),new THREE.MeshBasicMaterial({color:0xffe66b}));
  private observer: ResizeObserver;
  private frame = 0;
  private lastTime = 0;
  private accumulator = 0;
  private lastReport = -1;
  private cameraMode: TrialCamera = 'broadcast';
  private textures: THREE.Texture[] = [];
  private aspect = 1;
  private startShotBlend = 1;
  private finishPresentation = createFinishPresentation();

  constructor(private host: HTMLElement, private equipment: Equipment, private report: (state: RaceState) => void, private reportFinish:(state:FinishPresentation)=>void, private condition:MachineCondition=freshCondition, private seed=0x5eed) {
    this.state=createRaceState(equipment,seed,condition);
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setPixelRatio(1);
    this.renderer.setClearColor(0x315b2a);
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.domElement.style.width='100%';
    this.renderer.domElement.style.height='100%';
    host.append(this.renderer.domElement);
    this.scene.add(new THREE.HemisphereLight(0xe4efff,0x45653b,2));
    const sun=new THREE.DirectionalLight(0xffffff,1.3);sun.position.set(-3,8,4);this.scene.add(sun);
    const grass=this.grassTexture();
    const ground=new THREE.Mesh(new THREE.PlaneGeometry(100,100),new THREE.MeshLambertMaterial({map:grass}));
    ground.rotation.x=-Math.PI/2;ground.position.y=-0.025;this.scene.add(ground);
    this.buildTrack();this.buildStart();
    for(const racer of this.state.racers){const car=buildMachineModel(racer.color,racer.equipment);this.cars.set(racer.id,car);this.scene.add(car);}
    this.playerMarker.rotation.z=Math.PI;this.scene.add(this.playerMarker);
    this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
    this.report({...this.state});this.reportFinish(this.finishPresentation);this.frame=requestAnimationFrame(this.animate);
  }

  start(){
    const previous=this.state;
    this.state=previous.phase==='ready'?startRace(previous):launchPlayer(previous);
    if(this.state===previous)return;
    if(previous.phase==='ready'){this.accumulator=0;this.lastTime=0;}
    this.report({...this.state});
  }
  setCamera(mode:TrialCamera){this.cameraMode=mode;}
  restart(){
    this.state=createRaceState(this.equipment,this.seed,this.condition);this.accumulator=0;this.lastTime=0;this.lastReport=-1;this.cameraMode='broadcast';this.startShotBlend=1;
    this.finishPresentation=createFinishPresentation();this.reportFinish(this.finishPresentation);
    this.report({...this.state});
  }
  private resize(){
    const width=Math.max(1,this.host.clientWidth),height=Math.max(1,this.host.clientHeight);
    this.aspect=width/height;
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
  private buildTrack(){
    for(let lane=0;lane<circuit.lanes;lane++){
      const vertices:number[]=[],indices:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        for(const offset of [-circuit.laneWidth/2,circuit.laneWidth/2])vertices.push(p.x+p.tangentZ*offset,p.y,p.z-p.tangentX*offset);
        if(i<circuit.samples){const a=i*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const mesh=this.mesh(geometry,lane%2?0x8d91bb:0xaaaed0);mesh.material.side=THREE.DoubleSide;this.scene.add(mesh);
      for(const side of [-1,1]){
      const offset=side*circuit.laneWidth/2;
      const vertices:number[]=[],indices:number[]=[];
      for(let i=0;i<=circuit.samples;i++){
        const p=sampleLanePath(i/circuit.samples*circuitLength,lane);
        for(const [delta,height] of [[-0.008,0],[0.008,0],[-0.008,0.055],[0.008,0.055]])vertices.push(p.x+p.tangentZ*(offset+delta),p.y+height,p.z-p.tangentX*(offset+delta));
        if(i<circuit.samples){const a=i*4;indices.push(a,a+4,a+2,a+2,a+4,a+6,a+1,a+3,a+5,a+3,a+7,a+5,a+2,a+6,a+3,a+3,a+6,a+7);}
      }
      const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
      const rail=this.mesh(geometry,0xd7e5ed);rail.material.side=THREE.DoubleSide;this.scene.add(rail);
      }
    }
  }
  private buildStart(){
    const start=sampleCircuit(startDistance);
    const group=new THREE.Group();group.position.set(start.x,0,start.z);group.rotation.y=Math.atan2(start.tangentX,start.tangentZ);
    const colors=[0x5685ce,0xcf5263,0xd4b749,0x50a889,0xb17bcb];
    for(let lane=0;lane<circuit.lanes;lane++){
      const x=laneOffset(lane);
      const pad=this.mesh(new THREE.BoxGeometry(circuit.laneWidth-0.018,0.008,1.35),colors[lane]);pad.position.set(x,0.009,-0.425);group.add(pad);
      for(let row=0;row<2;row++)for(let i=0;i<4;i++){
        const marker=this.mesh(new THREE.BoxGeometry((circuit.laneWidth-0.02)/4,0.005,0.035),(i+row)%2?0x26354b:0xf5f1da);
        marker.position.set(x+(i-1.5)*(circuit.laneWidth-0.02)/4,0.016,(row-0.5)*0.035);group.add(marker);
      }
    }
    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=32;
    const context=canvas.getContext('2d')!;context.font='bold 28px monospace';context.textAlign='center';
    context.fillStyle='#463e23';context.fillText('G O A L',82,27);context.fillStyle='#f8dc65';context.fillText('G O A L',80,25);
    const texture=new THREE.CanvasTexture(canvas);texture.magFilter=THREE.NearestFilter;texture.minFilter=THREE.NearestFilter;texture.colorSpace=THREE.SRGBColorSpace;this.textures.push(texture);
    const goalLabel=new THREE.Mesh(new THREE.PlaneGeometry(0.85,0.17),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));
    goalLabel.rotation.x=-Math.PI/2;goalLabel.position.set(0,0.02,0.4);group.add(goalLabel);
    // 自作のスタート係。既存作品のキャラクターを使わない。
    const attendant=new THREE.Group();attendant.position.set(-circuit.laneWidth*circuit.lanes/2-0.23,0,-0.15);
    const block=(w:number,h:number,d:number,x:number,y:number,z:number,color:number)=>{
      const mesh=this.mesh(new THREE.BoxGeometry(w,h,d),color);mesh.position.set(x,y,z);attendant.add(mesh);
    };
    block(0.11,0.15,0.08,0,0.16,0,0xe0a34c);block(0.09,0.09,0.08,0,0.28,0,0xefc09a);
    block(0.12,0.03,0.11,0,0.34,0,0x304461);block(0.04,0.1,0.06,-0.03,0.04,0,0x25364b);block(0.04,0.1,0.06,0.03,0.04,0,0x25364b);
    block(0.025,0.15,0.025,-0.11,0.25,0,0xefc09a);block(0.12,0.08,0.008,-0.17,0.35,0,0xf8df79);
    group.add(attendant);this.scene.add(group);
  }
  private updateCamera(){
    const player=this.state.racers.find(r=>r.id==='player')!;
    const p=sampleLanePath(player.driving.distance,player.lane);
    const overview=this.cameraMode==='overview';
    const goalShot=!overview&&shouldUseFinishCamera(this.state,this.finishPresentation);
    const blend=this.startShotBlend*this.startShotBlend*(3-2*this.startShotBlend);
    const startHeight=Math.max(raceCamera.start.height,raceCamera.start.minWidth/this.aspect);
    const runningHeight=Math.max(raceCamera.running.height,raceCamera.running.minWidth/this.aspect);
    const viewHeight=overview?Math.max(8,12/this.aspect):goalShot?Math.max(raceCamera.finish.height,raceCamera.finish.minWidth/this.aspect):THREE.MathUtils.lerp(runningHeight,startHeight,blend);
    this.camera.left=-viewHeight*this.aspect/2;this.camera.right=viewHeight*this.aspect/2;
    this.camera.top=viewHeight/2;this.camera.bottom=-viewHeight/2;this.camera.updateProjectionMatrix();
    const start=sampleLanePath(0,(circuit.lanes-1)/2);
    const target=overview?new THREE.Vector3(0,0,0):goalShot?new THREE.Vector3(start.x-start.tangentX*raceCamera.finish.lookBehind,0,start.z-start.tangentZ*raceCamera.finish.lookBehind):new THREE.Vector3(p.x+p.tangentX*raceCamera.running.lookAhead,p.y,p.z+p.tangentZ*raceCamera.running.lookAhead)
      .lerp(new THREE.Vector3(start.x-start.tangentX*raceCamera.start.lookBehind,0,start.z-start.tangentZ*raceCamera.start.lookBehind),blend);
    const offset=new THREE.Vector3(...(goalShot?raceCamera.finish.offset:raceCamera.running.offset));
    if(!overview&&!goalShot)offset.lerp(new THREE.Vector3(...raceCamera.start.offset),blend);
    this.camera.position.copy(target).add(offset);this.camera.lookAt(target);
  }
  private animate=(now:number)=>{
    const elapsed=this.lastTime?Math.min((now-this.lastTime)/1000,0.1):0;this.lastTime=now;
    if(this.state.phase==='running'||this.state.phase==='countdown'){
      this.accumulator+=elapsed;
      while(this.accumulator>=FIXED_STEP){this.state=stepRace(this.state);this.accumulator-=FIXED_STEP;}
    }
    // CPUだけが発進してもスタート画角を維持し、自分の発進後に切り替える。
    if(this.state.playerStartOffset!==null)this.startShotBlend=Math.max(0,this.startShotBlend-elapsed/raceCamera.transitionSeconds);
    this.finishPresentation=stepFinishPresentation(this.finishPresentation,this.state,elapsed);
    for(const racer of this.state.racers){
      const p=sampleLanePath(racer.driving.distance+finishCoastDistance(racer,this.finishPresentation),racer.lane);
      const car=this.cars.get(racer.id)!;
      car.position.set(p.x,p.y+(racer.driving.status==='out'?0.14:0.015),p.z);
      car.rotation.order='YXZ';car.rotation.set(-p.pitch,Math.atan2(p.tangentX,p.tangentZ),racer.driving.status==='out'?0.9:0);
      if(racer.id==='player')this.playerMarker.position.copy(car.position).add(new THREE.Vector3(0,0.24,0));
    }
    this.updateCamera();this.renderer.render(this.scene,this.camera);
    if(now-this.lastReport>100){this.report({...this.state});this.reportFinish(this.finishPresentation);this.lastReport=now;}
    this.frame=requestAnimationFrame(this.animate);
  };
  dispose(){
    this.report({...this.state});
    cancelAnimationFrame(this.frame);this.observer.disconnect();
    this.scene.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});
    for(const texture of this.textures)texture.dispose();
    this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();
  }
}
