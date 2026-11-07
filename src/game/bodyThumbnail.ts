import {physicalRenderer,modelLighting} from './sceneLighting';
import {disposeSceneResources} from './modelFinish';
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
    renderer.setClearColor(0x000000,0);physicalRenderer(renderer);
    environment=studioEnvironment(renderer);
  }
  const scene=new THREE.Scene();scene.environment=environment!.texture;
  const light=modelLighting(scene,true);light.castShadow=false;
  const camera=new THREE.OrthographicCamera(-.25,.25,.15625,-.15625,.01,10);
  camera.position.set(-.45,.42,.55);camera.lookAt(0,.035,0);
  const model=buildMachineModel(Number.parseInt(color.slice(1),16),{...starterEquipment,body:id});scene.add(model);
  try{
    renderer.render(scene,camera);
    const url=renderer.domElement.toDataURL('image/png');cache.set(key,url);return url;
  }finally{
    disposeSceneResources(model);
  }
}
