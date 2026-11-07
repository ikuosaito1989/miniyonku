import { studioEnvironment } from './studioEnvironment';
import * as THREE from 'three';
import { starterEquipment } from '../data/machine';
import { buildMachineModel } from './MachineModel';

let renderer:THREE.WebGLRenderer|undefined;
let environment:THREE.WebGLRenderTarget|undefined;
const cache=new Map<string,string>();
export function bodyThumbnail(id:string,color:string){
  const key=`${id}:${color}`,cached=cache.get(key);
  if(cached)return cached;
  if(!renderer){
    renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
    renderer.setSize(400,250,false);renderer.setPixelRatio(1);
    renderer.setClearColor(0x000000,0);renderer.outputColorSpace=THREE.SRGBColorSpace;
    environment=studioEnvironment(renderer);
  }
  const scene=new THREE.Scene();scene.environment=environment!.texture;
  scene.add(new THREE.HemisphereLight(0xe9f5ff,0x536477,2));
  const keyLight=new THREE.DirectionalLight(0xffffff,2.3);keyLight.position.set(-1,2,1);scene.add(keyLight);
  const rim=new THREE.DirectionalLight(0x86c8ff,1.2);rim.position.set(1,1,-1);scene.add(rim);
  const camera=new THREE.OrthographicCamera(-.25,.25,.15625,-.15625,.01,10);
  camera.position.set(-.45,.42,.55);camera.lookAt(0,.035,0);
  const model=buildMachineModel(Number.parseInt(color.slice(1),16),{...starterEquipment,body:id});scene.add(model);
  try{
    renderer.render(scene,camera);
    const url=renderer.domElement.toDataURL('image/png');cache.set(key,url);return url;
  }finally{
    const materials=new Set<THREE.Material>();
    model.traverse(object=>{if(object instanceof THREE.Mesh){object.geometry.dispose();for(const material of Array.isArray(object.material)?object.material:[object.material])materials.add(material);}});
    materials.forEach(material=>material.dispose());
  }
}
