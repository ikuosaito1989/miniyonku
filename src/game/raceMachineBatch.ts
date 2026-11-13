import * as THREE from 'three';

/** Each wheel rotates as a unit, so its identical spokes can share one draw. */
export function batchRaceWheelSpokes(car:THREE.Group){
 for(const wheel of (car.userData.rotatingWheels??[]) as THREE.Group[]){
  const spokes=wheel.children.filter((o):o is THREE.Mesh=>o instanceof THREE.Mesh&&o.name.startsWith('wheel-spoke-'));
  if(spokes.length<2||spokes.some(s=>s.material!==spokes[0].material))continue;
  const first=spokes[0],batch=new THREE.InstancedMesh(first.geometry,first.material,spokes.length);
  batch.name=first.name;batch.frustumCulled=false;
  for(let i=0;i<spokes.length;i++){
   const spoke=spokes[i];spoke.updateMatrix();batch.setMatrixAt(i,spoke.matrix);
   wheel.remove(spoke);if(i>0)spoke.geometry.dispose();
  }
  batch.instanceMatrix.needsUpdate=true;wheel.add(batch);
 }
}
