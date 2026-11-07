import * as THREE from 'three';

export function physicalRenderer(renderer:THREE.WebGLRenderer){
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
}
/** One warm key, a cool fill and neutral reflected light keep dark parts readable. */
export function modelLighting(scene:THREE.Scene,preview=false){
 scene.environmentIntensity=preview?1:.8;
 scene.environmentRotation.y=.35;
 scene.add(new THREE.HemisphereLight(0xdceafa,0x777368,preview?1.2:1.15));
 const key=new THREE.DirectionalLight(0xffefd9,preview?3:2.5);key.position.set(-3,6,4);key.castShadow=true;scene.add(key,key.target);
 const fill=new THREE.DirectionalLight(0xb5d9ff,preview?1.15:.8);fill.position.set(3,2,-4);scene.add(fill);
 return key;
}
/** A small moving shadow frustum preserves detail without shadowing the whole course. */
export function configureShadow(key:THREE.DirectionalLight,extent:number,size:number){
 key.shadow.mapSize.set(size,size);
 Object.assign(key.shadow.camera,{left:-extent,right:extent,top:extent,bottom:-extent,near:.1,far:20});
 key.shadow.camera.updateProjectionMatrix();key.shadow.bias=-.00008;key.shadow.normalBias=.00045;
}
