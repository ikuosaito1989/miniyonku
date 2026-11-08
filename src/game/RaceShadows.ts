import * as THREE from 'three';
import {contactShadowTexture,createContactShadow} from './contactShadow';
import {configureShadow} from './sceneLighting';

type Surface={x:number;y:number;z:number;sideX:number;sideY:number;sideZ:number;upX:number;upY:number;upZ:number;forwardX:number;forwardY:number;forwardZ:number};
export class RaceShadows{
 private texture=contactShadowTexture();
 private contacts=new Map<string,THREE.Group>();
 private basis=new THREE.Matrix4();
 private side=new THREE.Vector3();private up=new THREE.Vector3();private forward=new THREE.Vector3();
 constructor(private scene:THREE.Scene,private key:THREE.DirectionalLight,compact:boolean){configureShadow(key,2.1,compact?512:1024);}
 setQuality(quality:'low'|'medium'|'high'){const size=quality==='high'?1024:512;this.key.shadow.map?.dispose();this.key.shadow.map=null;configureShadow(this.key,2.1,size);}
 add(id:string,car:THREE.Group){
  // Tiny screws and spokes need no separate shadow draws during a race.
  car.traverse(o=>{if(o instanceof THREE.Mesh){o.receiveShadow=o.userData.isAeroPaint!==true&&o.userData.noShadow!==true;o.castShadow=/^(body-shell|cabin-glass|chassis)$|^tire-/.test(o.name);}});
  const root=new THREE.Group();root.name=`contact-${id}`;root.add(createContactShadow(this.texture));this.contacts.set(id,root);this.scene.add(root);
 }
 update(id:string,p:Surface,flightY:number|undefined,visible:boolean,scale:number){
  const root=this.contacts.get(id)!;
  const height=flightY===undefined?0:Math.max(0,flightY-p.y);
  root.visible=visible&&height<1.2;if(!root.visible)return;
  this.side.set(p.sideX,p.sideY,p.sideZ);this.up.set(p.upX,p.upY,p.upZ);this.forward.set(p.forwardX,p.forwardY,p.forwardZ);
  root.position.set(p.x,p.y,p.z).addScaledVector(this.up,.004);
  root.quaternion.setFromRotationMatrix(this.basis.makeBasis(this.side,this.up,this.forward));
  root.scale.setScalar(Math.min(2,scale)*(1+height*.45));
  const shadow=root.children[0] as THREE.Mesh<THREE.PlaneGeometry,THREE.MeshBasicMaterial>;shadow.material.opacity=.48*(1-height/1.2);
 }
 follow(position:THREE.Vector3,overview:boolean){
  this.key.position.copy(position).add(new THREE.Vector3(-3,6,4));this.key.target.position.copy(position);
  // Contact shading remains available in overview; detailed shadow draws stay nearby.
  for(const object of this.scene.children)if(object instanceof THREE.Group&&!object.name.startsWith('contact-')&&object.userData.rotatingWheels){
   const near=!overview&&object.position.distanceToSquared(position)<16;
   object.traverse(o=>{if(o instanceof THREE.Mesh&&/^(body-shell|cabin-glass|chassis)$|^tire-/.test(o.name))o.castShadow=near;});
  }
 }
}
