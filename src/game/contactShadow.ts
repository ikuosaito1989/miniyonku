import * as THREE from 'three';

/** Baked two-lobe occlusion: one small texture/draw, no framebuffer or blur passes. */
export function contactShadowTexture(){
 const size=64,data=new Uint8Array(size*size*4);
 for(let y=0;y<size;y++)for(let x=0;x<size;x++){
  const u=(x/(size-1)-.5)*2,v=(y/(size-1)-.5)*2,r=u*u+v*v;
  const broad=Math.max(0,1-r)**2,core=Math.exp(-(u*u*5+v*v*2.4))*Math.max(0,1-r);
  const i=(y*size+x)*4;data[i]=15;data[i+1]=22;data[i+2]=28;data[i+3]=Math.round(Math.min(1,broad*.36+core*.64)*255);
 }
 const texture=new THREE.DataTexture(data,size,size);texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearFilter;texture.needsUpdate=true;texture.name='soft-contact-occlusion';return texture;
}
export function createContactShadow(texture:THREE.Texture,opacity=.48){
 const material=new THREE.MeshBasicMaterial({map:texture,transparent:true,opacity,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.245,.36),material);mesh.rotation.x=-Math.PI/2;mesh.name='machine-contact-shadow';mesh.renderOrder=2;return mesh;
}
