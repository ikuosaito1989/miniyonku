import * as THREE from 'three';

/** 曲面を細分化して追従する塗装。抜き穴やベースの車体形状は変更しない。 */
export function addAeroPaint(group:THREE.Group,points:number[][],material:THREE.Material,name:string,shellNames:string[]=[]){
 const projected=shellNames.length>0,contour=points.map(([x,,z])=>new THREE.Vector2(x,z));
 const triangles=THREE.ShapeUtils.triangulateShape(contour,[]),vertices:number[]=[],normals:number[]=[];
 group.updateMatrixWorld(true);
 const shells=group.children.filter(mesh=>shellNames.includes(mesh.name)),ray=new THREE.Raycaster();
 const cache=new Map<string,{height:number;normal:number[]}>();
 const vertex=([x,y,z]:number[])=>{
  if(!projected){vertices.push(x,y,z);return;}
  const key=`${x.toFixed(9)},${z.toFixed(9)}`,cached=cache.get(key);
  if(cached){vertices.push(x,cached.height,z);normals.push(...cached.normal);return;}
  ray.set(new THREE.Vector3(x,1,z),new THREE.Vector3(0,-1,0));
  const hit=ray.intersectObjects(shells,false)[0],height=hit?hit.point.y+.00055:y;
  const normal=hit?.normal?.clone().transformDirection(hit.object.matrixWorld)??new THREE.Vector3(0,1,0);
  vertices.push(x,height,z);normals.push(normal.x,normal.y,normal.z);
  if(hit)cache.set(key,{height,normal:normal.toArray()});
 };
 const midpoint=(a:number[],b:number[])=>a.map((v,i)=>(v+b[i])/2);
 const subdivide=(a:number[],b:number[],c:number[],depth:number)=>{
  if(!depth){vertex(a);vertex(b);vertex(c);return;}
  const ab=midpoint(a,b),bc=midpoint(b,c),ca=midpoint(c,a);
  subdivide(a,ab,ca,depth-1);subdivide(ab,b,bc,depth-1);subdivide(ca,bc,c,depth-1);subdivide(ab,bc,ca,depth-1);
 };
 for(const [a,b,c] of triangles)subdivide(points[a],points[b],points[c],projected?3:0);
 // Match winding to projected normals. Double-sided PBR otherwise flips the light
 // to the underside of a decal whose contour was triangulated in the XZ plane.
 if(projected)for(let i=0;i<vertices.length;i+=9){
  const a=new THREE.Vector3().fromArray(vertices,i),b=new THREE.Vector3().fromArray(vertices,i+3),c=new THREE.Vector3().fromArray(vertices,i+6);
  const geometric=b.sub(a).cross(c.sub(a)),normal=new THREE.Vector3().fromArray(normals,i);
  if(geometric.dot(normal)<0)for(let k=0;k<3;k++){
   [vertices[i+3+k],vertices[i+6+k]]=[vertices[i+6+k],vertices[i+3+k]];
   [normals[i+3+k],normals[i+6+k]]=[normals[i+6+k],normals[i+3+k]];
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.computeVertexNormals();
 if(projected)geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 const mesh=new THREE.Mesh(geometry,material);mesh.name=name;mesh.userData.isAeroPaint=true;group.add(mesh);return mesh;
}
