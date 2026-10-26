import { studioEnvironment } from './studioEnvironment';
import * as THREE from 'three';
import type { Equipment } from '../data/machine';
import { buildMachineModel } from './MachineModel';
import { bodyDesign } from '../data/bodies';

function disposeModel(model:THREE.Group){
  const materials=new Set<THREE.Material>();
  model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}});
  materials.forEach(material=>material.dispose());
}

// レースと同じモデルを使用。描画は装備・角度・サイズ変更時だけ行う。
export class MachinePreviewRenderer {
  private renderer:THREE.WebGLRenderer;
  private scene=new THREE.Scene();
  private camera=new THREE.OrthographicCamera(-.25,.25,.16,-.16,.01,10);
  private environment:THREE.WebGLRenderTarget;
  private model:THREE.Group|null=null;
  private observer:ResizeObserver;
  private yaw=0;
  private pointer:{id:number;x:number}|null=null;
  constructor(private host:HTMLElement){
    this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});
    this.renderer.setClearColor(0x020507);this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
    this.renderer.outputColorSpace=THREE.SRGBColorSpace;
    this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
    this.environment=studioEnvironment(this.renderer);this.scene.environment=this.environment.texture;
    const stage=new THREE.Mesh(new THREE.CylinderGeometry(.18,.19,.006,64),new THREE.MeshStandardMaterial({color:0x252b32,roughness:.82}));stage.position.y=-.006;this.scene.add(stage);
    this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;stage.receiveShadow=true;
    const canvas=this.renderer.domElement;
    canvas.setAttribute('role','img');canvas.setAttribute('aria-label','装着中のマシンの3Dプレビュー');
    canvas.addEventListener('pointerdown',this.pointerDown);canvas.addEventListener('pointermove',this.pointerMove);
    canvas.addEventListener('pointerup',this.pointerUp);canvas.addEventListener('pointercancel',this.pointerUp);
    host.append(canvas);
    this.scene.add(new THREE.HemisphereLight(0xe9f5ff,0x536477,2));
    const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(-1,2,1);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-.3,right:.3,top:.3,bottom:-.3,near:.1,far:4});key.shadow.bias=-.00015;key.shadow.normalBias=.0003;this.scene.add(key);
    const rim=new THREE.DirectionalLight(0x86c8ff,1.2);rim.position.set(1,1,-1);this.scene.add(rim);
    this.camera.position.set(-.45,.42,.55);this.camera.lookAt(0,.05,0);
    this.observer=new ResizeObserver(this.resize);this.observer.observe(host);this.resize();
  }
  setEquipment(equipment:Equipment){
    if(this.model){this.scene.remove(this.model);disposeModel(this.model);}
    this.model=buildMachineModel(Number.parseInt(bodyDesign(equipment.body).color.slice(1),16),equipment);this.model.rotation.y=this.yaw;
    this.model.traverse(object=>{if(object instanceof THREE.Mesh){object.castShadow=true;object.receiveShadow=true;}});
    this.scene.add(this.model);this.render();
  }
  rotate(amount:number){this.yaw+=amount;if(this.model)this.model.rotation.y=this.yaw;this.render();}
  reset(){this.rotate(-this.yaw);}
  private render(){this.renderer.render(this.scene,this.camera);}
  private resize=()=>{
    const width=Math.max(1,this.host.clientWidth),height=Math.max(1,this.host.clientHeight),aspect=width/height;
    const viewHeight=Math.max(.24,.32/aspect);
    this.camera.left=-viewHeight*aspect/2;this.camera.right=viewHeight*aspect/2;this.camera.top=viewHeight/2;this.camera.bottom=-viewHeight/2;
    this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);this.render();
  };
  private pointerDown=(event:PointerEvent)=>{
    if(event.button!==0)return;
    this.pointer={id:event.pointerId,x:event.clientX};this.renderer.domElement.setPointerCapture(event.pointerId);
  };
  private pointerMove=(event:PointerEvent)=>{
    if(this.pointer?.id!==event.pointerId)return;
    this.rotate((event.clientX-this.pointer.x)*.012);this.pointer.x=event.clientX;
  };
  private pointerUp=(event:PointerEvent)=>{if(this.pointer?.id===event.pointerId)this.pointer=null;};
  dispose(){
    this.observer.disconnect();
    const canvas=this.renderer.domElement;
    canvas.removeEventListener('pointerdown',this.pointerDown);canvas.removeEventListener('pointermove',this.pointerMove);
    canvas.removeEventListener('pointerup',this.pointerUp);canvas.removeEventListener('pointercancel',this.pointerUp);
    if(this.model)disposeModel(this.model);
    this.scene.traverse(object=>{if(object instanceof THREE.Mesh&&object.parent===this.scene){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])material.dispose();}});
    this.scene.traverse(object=>{if(object instanceof THREE.DirectionalLight)object.shadow.map?.dispose();});
    this.environment.dispose();
    this.renderer.dispose();this.renderer.forceContextLoss();canvas.remove();
  }
}
