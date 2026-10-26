import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

/** 柔らかい面光源の反射で、黒い樹脂と切削金属の質感を描き分ける。 */
export function studioEnvironment(renderer:THREE.WebGLRenderer){
  const room=new RoomEnvironment();
  const generator=new THREE.PMREMGenerator(renderer);
  const target=generator.fromScene(room,.04,.1,10);
  room.dispose();generator.dispose();return target;
}
