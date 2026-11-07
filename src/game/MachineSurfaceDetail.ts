import * as THREE from 'three';

/** Small renderer-owned maps: no image downloads and no changes to part colours. */
export function machineSurfaceDetails(model:THREE.Group){
 const maps=new Map<string,THREE.DataTexture>();
 const texture=(kind:string)=>{
  const cached=maps.get(kind);if(cached)return cached;
  const size=64,data=new Uint8Array(size*size*4);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
   const i=(y*size+x)*4,n=((Math.imul(x+13,374761393)^Math.imul(y+7,668265263))>>>0)%23;
   let value=255;
   if(kind==='carbon-colour')value=((Math.floor(x/8)+Math.floor(y/8))%2===0?234:249)+n%5;
   else if(kind==='carbon-roughness')value=210+((Math.floor(x/8)+Math.floor(y/8))%2)*28+n%7;
   else if(kind==='rubber-roughness')value=232+n;
   else if(kind==='metal-roughness')value=220+(y%5)*5+n%9;
   else if(kind==='paint-roughness')value=242+n%13;
   if(kind.endsWith('normal')){
    const carbon=kind.startsWith('carbon'),a=carbon?Math.sin(x*Math.PI/4)*12:(n-11)*1.3,b=carbon?Math.sin(y*Math.PI/4)*12:(((x*7+y*3)%19)-9)*1.3;
    data[i]=128+a;data[i+1]=128+b;data[i+2]=254;
   }else data[i]=data[i+1]=data[i+2]=value;
   data[i+3]=255;
  }
  const t=new THREE.DataTexture(data,size,size);t.name=`machine-${kind}`;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.anisotropy=2;t.needsUpdate=true;
  if(kind==='carbon-colour')t.colorSpace=THREE.SRGBColorSpace;
  maps.set(kind,t);return t;
 };
 model.traverse(object=>{
  if(!(object instanceof THREE.Mesh))return;
  const materials=Array.isArray(object.material)?object.material:[object.material];
  for(const m of materials){
   if(!(m instanceof THREE.MeshStandardMaterial))continue;
   const carbon=/carbon|frp/.test(object.name)||m.name==='machine-carbon',rubber=/^tire-|dark-rubber/.test(object.name)&&m.roughness>.6&&m.metalness<.1;
   if(!object.geometry.getAttribute('uv')){
    const p=object.geometry.getAttribute('position'),normal=object.geometry.getAttribute('normal'),uv:number[]=[];
    for(let i=0;i<p.count;i++){const nx=Math.abs(normal?.getX(i)??0),ny=Math.abs(normal?.getY(i)??1),nz=Math.abs(normal?.getZ(i)??0);uv.push((ny>=nx&&ny>=nz?p.getX(i):p.getZ(i))/.02,(ny>=nx&&ny>=nz?p.getZ(i):p.getY(i))/.02);}
    object.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
   }
   if(carbon){
    // Extruded panels use model-space UVs, so fine weave does not stretch across a stay.
    const p=object.geometry.getAttribute('position'),n=object.geometry.getAttribute('normal'),uv:number[]=[];
    for(let i=0;i<p.count;i++)uv.push(p.getX(i)/.018,(Math.abs(n.getY(i))>.6?p.getZ(i):p.getY(i))/.018);
    object.geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
    m.map??=texture('carbon-colour');m.roughnessMap=texture('carbon-roughness');m.normalMap=texture('carbon-normal');m.normalScale.set(.22,.22);
   }else if(rubber){m.roughnessMap=texture('rubber-roughness');m.normalMap=texture('rubber-normal');m.normalScale.set(.12,.12);}
   else if(m.metalness>.55)m.roughnessMap=texture('metal-roughness');
   else if(m.name==='machine-paint')m.roughnessMap=texture('paint-roughness');
   m.needsUpdate=true;
  }
 });
}
