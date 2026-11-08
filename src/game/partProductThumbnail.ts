import * as THREE from 'three';
import type {Part} from '../data/parts';
import {buildPartProduct} from './PartProductModel';
import {studioEnvironment} from './studioEnvironment';
let renderer:THREE.WebGLRenderer|undefined,environment:THREE.WebGLRenderTarget|undefined;
/** 撮影用レンダラーは書き出し時だけ使用。ゲームでは書き出したWebPを配信する。 */
export function partProductThumbnail(part:Part){
 if(!renderer){renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true});renderer.setSize(640,440,false);renderer.setPixelRatio(1);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.35;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;environment=studioEnvironment(renderer);}
 const scene=new THREE.Scene();scene.environment=environment!.texture;
 const model=buildPartProduct(part),bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3());
 model.position.set(-center.x,-bounds.min.y+.035,-center.z);model.traverse(o=>{if(o instanceof THREE.Mesh){o.castShadow=true;o.receiveShadow=true;}});scene.add(model);
 const floor=new THREE.Mesh(new THREE.PlaneGeometry(20,20),new THREE.ShadowMaterial({opacity:.3}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;scene.add(floor);
 scene.add(new THREE.HemisphereLight(0xedf6ff,0x26374a,2));const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-3,6,4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:20});key.shadow.bias=-.0003;scene.add(key);const rim=new THREE.DirectionalLight(0xa1d7ff,1.8);rim.position.set(3,2,-3);scene.add(rim);
 const aspect=640/440,camera=new THREE.OrthographicCamera(-aspect,aspect,1,-1,.1,50);camera.position.set(part.category==='motor'?5:4,4.3,6);camera.lookAt(0,size.y*.43,0);camera.updateMatrixWorld();model.updateMatrixWorld(true);
 const fitted=new THREE.Box3().setFromObject(model),points:THREE.Vector3[]=[];
 for(const x of [fitted.min.x,fitted.max.x])for(const y of [fitted.min.y,fitted.max.y])for(const z of [fitted.min.z,fitted.max.z])points.push(new THREE.Vector3(x,y,z).applyMatrix4(camera.matrixWorldInverse));
 const minX=Math.min(...points.map(p=>p.x)),maxX=Math.max(...points.map(p=>p.x)),minY=Math.min(...points.map(p=>p.y)),maxY=Math.max(...points.map(p=>p.y)),height=Math.max(maxY-minY,(maxX-minX)/aspect)*1.18,cx=(minX+maxX)/2,cy=(minY+maxY)/2;
 camera.left=cx-height*aspect/2;camera.right=cx+height*aspect/2;camera.top=cy+height/2;camera.bottom=cy-height/2;camera.updateProjectionMatrix();
 try{renderer.setClearColor(0,0);renderer.render(scene,camera);return renderer.domElement.toDataURL('image/webp',.94);}finally{
  const materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>();scene.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);const map=(m as THREE.MeshStandardMaterial).map;if(map)textures.add(map);}}if(o instanceof THREE.DirectionalLight)o.shadow.map?.dispose();});materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
 }
}
