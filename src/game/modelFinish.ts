import * as THREE from 'three';

type Surface='paint'|'glass'|'carbon'|'metal'|'plastic';
/** Apply the same physical finish to every car, retaining each part's actual colour. */
export function finishMachineMaterials(model:THREE.Group){
 const cache=new Map<THREE.Material,Map<Surface,THREE.Material>>(),originals=new Set<THREE.Material>(),used=new Set<THREE.Material>();
 model.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  const name=object.name;
  const finish=(source:THREE.Material)=>{
   if(!(source instanceof THREE.MeshPhongMaterial||source instanceof THREE.MeshStandardMaterial))return source;
   originals.add(source);
   const standard=source instanceof THREE.MeshStandardMaterial;
   const roughness=standard?source.roughness:THREE.MathUtils.clamp(Math.pow(2/(source.shininess+2),.25)*.9,.26,.64);
   const metalness=standard?source.metalness:0;
   const surface:Surface=/glass|canopy|windscreen/.test(name)?'glass':/carbon|frp/.test(name)?'carbon':metalness>.55||/shaft|axle|terminal|hex-nut|bearing|screw|washer/.test(name)?'metal':/body-shell|cowl|fender|nose|wing|pinstripe|paint/.test(name)||(standard&&metalness<.3&&roughness<.39)?'paint':'plastic';
   let variants=cache.get(source);if(!variants){variants=new Map();cache.set(source,variants);}const cached=variants.get(surface);if(cached)return cached;
   // Existing rubber and mechanical materials already have useful physical parameters.
   if(standard&&(surface==='plastic'||surface==='metal')){variants.set(surface,source);used.add(source);return source;}
   const m=surface==='paint'||surface==='glass'?new THREE.MeshPhysicalMaterial():new THREE.MeshStandardMaterial();
   m.color.copy(source.color);m.side=source.side;m.transparent=source.transparent;m.opacity=source.opacity;m.alphaTest=source.alphaTest;m.depthWrite=source.depthWrite;
   m.polygonOffset=source.polygonOffset;m.polygonOffsetFactor=source.polygonOffsetFactor;m.polygonOffsetUnits=source.polygonOffsetUnits;
   m.map=source.map;m.normalMap=source.normalMap;m.normalScale.copy(source.normalScale);m.emissive.copy(source.emissive);m.emissiveIntensity=source.emissiveIntensity;
   m.vertexColors=source.vertexColors;m.flatShading=source.flatShading;
   m.roughness=surface==='glass'?.13:surface==='carbon'?.52:surface==='metal'?.28:Math.max(surface==='paint'?.27:.42,roughness);
   m.metalness=surface==='glass'?.06:surface==='carbon'?.18:surface==='metal'?Math.max(.72,metalness):Math.min(.18,metalness);
   m.envMapIntensity=surface==='metal'?1.05:surface==='glass'?1.1:.85;
   if(m instanceof THREE.MeshPhysicalMaterial){m.clearcoat=surface==='glass'?1:roughness>.5?.25:.85;m.clearcoatRoughness=surface==='glass'?.07:.19;m.ior=1.48;}
   m.name=`machine-${surface}`;m.userData.surface=surface;variants.set(surface,m);used.add(m);return m;
  };
  object.material=Array.isArray(object.material)?object.material.map(finish):finish(object.material);
 });
 for(const source of originals)if(!used.has(source))source.dispose();
}

/** Geometry, materials and texture maps are owned by a renderer, never shared globally. */
export function disposeSceneResources(root:THREE.Object3D,extraTextures:Iterable<THREE.Texture>=[]){
 const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>(),textures=new Set<THREE.Texture>(extraTextures);
 root.traverse(object=>{
  if(object instanceof THREE.Mesh)geometries.add(object.geometry);
  if(object instanceof THREE.Mesh||object instanceof THREE.Sprite)for(const material of Array.isArray(object.material)?object.material:[object.material]){
   materials.add(material);for(const value of Object.values(material))if(value instanceof THREE.Texture)textures.add(value);
  }
  if(object instanceof THREE.DirectionalLight)object.shadow.map?.dispose();
 });
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());
}
