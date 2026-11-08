import type * as THREE from 'three';
import {parts} from '../data/parts';
import type {Equipment} from '../data/machine';
import type {Performance} from './driving';

export function handlingProfile(equipment:Equipment,performance:Performance){
  const guides=['rollerFront','rollerSide','rollerRear'].map(slot=>parts.find(p=>p.id===equipment[slot as keyof Equipment]&&p.category==='roller')?.specs);
  const support=guides.reduce((n,p)=>n+(p?((p.stability??1)+(p.damping??0)*2)/3:0),0);
  return {damping:performance.damping,lateralLimit:performance.lateralLimit,support};
}
export function handlingPose(profile:ReturnType<typeof handlingProfile>,speed:number,curvature:number,roughness:number,time:number,distance:number,turn:number){
  const moving=Math.min(1,Math.max(0,speed)/.6),load=Math.min(1.5,speed*speed*Math.abs(curvature)/Math.max(1,profile.lateralLimit));
  const corner=Math.min(1,Math.abs(curvature)*14)*moving;
  const loose=1/(.35+profile.support),damping=1-profile.damping;
  const chatter=corner*(.18+load)*loose*damping;
  const road=roughness*moving*damping;
  const pulse=Math.sin(time*39+distance*8)*.65+Math.sin(time*67+distance*13)*.35;
  return {
    lateral:Math.max(-.006,Math.min(.006,pulse*chatter*.003)),
    yaw:pulse*chatter*.035,
    roll:-turn*load*.025+Math.sin(time*43)*chatter*.025+Math.sin(time*51)*road*.025,
    heave:Math.abs(Math.sin(time*47+distance*11))*(chatter*.0009+road*.0025),
  };
}
// 高速域だけ表示上の回転数を抑え、フレーム間の逆回転・静止の錯視を避ける。
// 低速は移動量と実際のモデル半径から回転を計算。レース物理には影響しない。
export function visibleSpin(distance:number,radius:number,elapsed:number){return Math.min(Math.max(0,distance)/radius,Math.max(0,elapsed)*36);}
export function animateRunningGear(car:THREE.Group,distance:number,elapsed:number,turn:number,curvature:number,grounded:boolean){
  const previous=car.userData.motionDistance as number|undefined;
  const delta=previous===undefined||distance<previous?0:distance-previous;
  car.userData.motionDistance=distance;
  for(const wheel of (car.userData.rotatingWheels??[]) as THREE.Group[]){
    wheel.rotation.x=(wheel.rotation.x+visibleSpin(delta,wheel.userData.radius,elapsed))%(Math.PI*2);
  }
  for(const roller of (car.userData.rotatingRollers??[]) as THREE.Group[]){
    // コーナー外壁に触れる側のみ回す。直線・空中では壁に接触しない。
    const contact=grounded&&Math.abs(curvature)>.006&&roller.userData.side===turn;
    const target=contact?delta/Math.max(elapsed,.001):0;
    const blend=1-Math.exp(-elapsed*(contact?24:6));
    const speed=(roller.userData.spinSpeed??0)+(target-(roller.userData.spinSpeed??0))*blend;
    roller.userData.spinSpeed=speed;
    roller.rotation.y=(roller.rotation.y+roller.userData.side*visibleSpin(speed*elapsed,.014,elapsed))%(Math.PI*2);
  }
}
