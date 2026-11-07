import { parts } from '../data/parts';
import { accessorySlots, equipmentSlots, type Equipment } from '../data/machine';
import { circuit, getCircuitTrack, type CircuitTrack } from '../data/circuit';
import { batteryCapacityMultiplier, freshCondition, motorFactor, remainingCharge, type MachineCondition } from './condition';
import type { TrackSurface } from '../data/surfaces';

export const FIXED_STEP = 1/120;
export const DIRT_CRAWL_SPEED=.12;
export interface DrivingState { time: number; distance: number; speed: number; stress: number; status: 'ready'|'running'|'finished'|'out'; stopReason?:'retired'|'battery'|'lapped'|'jump'|'loop'; flightY?:number;flightVelocity?:number;flightLandingEnd?:number;landings?:number; }
export function machinePerformance(equipment: Equipment, condition:MachineCondition=freshCondition) {
  const get = (category: keyof Equipment) => {
    const part = parts.find(p => p.id === equipment[category] && p.category === equipmentSlots[category].category);
    if (!part) throw new Error(`装備が不正です: ${category}`);
    return part.specs;
  };
  const motor=get('motor'),gear=get('gear'),tire=get('tire'),terminal=get('terminal'),body=get('body'),chassis=get('chassis'),battery=get('battery'),wheel=get('wheel');
  const accessories=accessorySlots.map(get);
  const accessory={efficiency:accessories.reduce((n,p)=>n*p.efficiency,1),stability:accessories.reduce((n,p)=>n*p.stability,1),damping:accessories.reduce((n,p)=>n+(p.damping??0),0),cornerDrag:accessories.reduce((n,p)=>n*(p.cornerDrag??1),1)};
  const front=get('rollerFront'),side=get('rollerSide'),rear=get('rollerRear');
  const friction=front.friction*.45+side.friction*.35+rear.friction*.2;
  const rollerStability=(front.stability??1)*.45+(side.stability??1)*.35+(rear.stability??1)*.2;
  const rollerWeight=front.weight*.45+side.weight*.35+rear.weight*.2;
  const mass = (1 + Object.keys(equipment).reduce((sum,key) => sum + get(key as keyof Equipment).weight,0))/1000;
  const radius=tire.diameter/2000;
  return {
    freeSpeed: motor.rpm * terminal.efficiency * battery.power / 60 / gear.ratio * 2 * Math.PI * radius,
    stallForce: motor.torque/1000 * gear.ratio * terminal.efficiency * battery.power * chassis.efficiency * accessory.efficiency * 0.8 / radius,
    treadDrag:tire.pavedDrag??0,
    mass, drag:0.012*body.drag, rollerFriction:friction, tireScrub:tire.grip, cornerDrag:wheel.cornerDrag*accessory.cornerDrag,
    rebound:tire.rebound??.45, frontBias:chassis.frontMotor===1?.1:0, brake:accessories.reduce((n,p)=>n+(p.brake??0),0),
    batteryEndurance:battery.endurance,
    batteryConsumption:battery.consumption??1,
    motorSeconds:condition.motorSeconds,batterySeconds:condition.batterySeconds,motorWearRate:motor.wear??1,
    lateralLimit: (9.81 * (1.2 + tire.grip) + rollerWeight * 0.2)*body.stability*chassis.stability*accessory.stability*rollerStability,
    roughGrip:body.roughGrip*(chassis.roughGrip??1),
    roughResistance:body.roughResistance*(tire.roughResistance??1)*(chassis.roughResistance??1),
    damping:Math.min(.9,(tire.damping??0)+(accessory.damping??0)+(chassis.damping??0)+(front.damping??0)*.45+(side.damping??0)*.35+(rear.damping??0)*.2),
    // 柔らかいスポンジは凹凸に追従し、ハードは舗装向け。
    tireCompliance:1/(.75/(tire.compliance??(equipment.tire==='tire-1'?1.2:equipment.tire==='tire-2'?.7:1))+.25/(chassis.compliance??1)),
  };
}
export type Performance = ReturnType<typeof machinePerformance>;
export function createDrivingState(): DrivingState { return {time:0,distance:0,speed:0,stress:0,status:'ready'}; }
export function startDriving(state: DrivingState): DrivingState {
  return state.status==='ready'?{...state,status:'running'}:state;
}
// 入力なしの試走は乱数を使用せず、同じ装備なら同一結果になる。
export function surfacePerformance(performance:Performance,surface:TrackSurface){
  const roughness=Math.max(0,Math.min(1,surface.roughness));
  const vibration=roughness*(1-performance.damping);
  // シャーシが良くてもタイヤの追従不足は残る。弱い側を残す合成で万能化を防ぐ。
  const tireContact=.25+.75*Math.min(1,performance.tireCompliance/2.1);
  const contact=(1-roughness+roughness*Math.min(1,performance.roughGrip)*tireContact)*(1-vibration*.4);
  return {
    rollingDrag:performance.treadDrag*(1-roughness)**3,
    traction:Math.min(1,Math.max(0,surface.grip)*contact),
    resistance:performance.mass*9.81*roughness*(.18+.6*vibration)*performance.roughResistance/performance.tireCompliance,
    lateralLimit:performance.lateralLimit*Math.max(0,surface.grip)*contact,
  };
}
export function stepDriving(state: DrivingState, performance: Performance, laneOffset=0, initialLane?:number, surface:TrackSurface=circuit.surface, track:CircuitTrack=getCircuitTrack()): DrivingState {
  if(state.status!=='running')return state;
  const {circuit,circuitLength,sampleCircuit,sampleLanePath,startDistance}=track;
  if(track.fairLanes&&initialLane!==undefined)initialLane=2;
  const remaining=remainingCharge(performance.batterySeconds+state.time,performance.batteryEndurance*batteryCapacityMultiplier,performance.batteryConsumption);
  if(remaining<=0)return {...state,speed:0,status:'out',stopReason:'battery'};
  const charge=.55+.45*Math.sqrt(remaining);
  const motor=performance.motorWearRate===0?1:motorFactor(performance.motorSeconds+state.time);
  const road=surfacePerformance(performance,track.circuit.surface.roughness>0?track.surfaceAt(state.distance):surface);
  const path=initialLane===undefined?undefined:track.sampleLanePath(state.distance,initialLane);
  const airborne=state.flightY!==undefined;
  const force=(airborne?0:1)*performance.stallForce*charge*motor*Math.max(0,1-state.speed/(performance.freeSpeed*charge*motor))*road.traction;
  const curvature=path?.curvature??sampleCircuit(startDistance+state.distance).curvature;
  // 壁への押し付け荷重でローラー抵抗、タイヤの横擦れで旋回損失が生じる。直線には加えない。
  const cornerResistance=performance.mass*state.speed**2*curvature*(performance.rollerFriction*.5+performance.tireScrub*.018);
  const brakeResistance=path&&!path.loopRadius?performance.mass*9.81*performance.brake*Math.max(0,Math.min(1,(path.pitch-.035)/.16)):0;
  const resistance=performance.mass*9.81*0.025+(performance.drag+road.rollingDrag)*state.speed**2+road.resistance+cornerResistance+brakeResistance;
  const wheelResistance=state.speed**2*sampleCircuit(startDistance+state.distance).curvature*.002*performance.cornerDrag;
  const slope=(track.obstacles||track.hasHills)&&!airborne&&path?performance.mass*9.81*Math.sin(path.pitch):0;
  let speed=Math.max(0,state.speed+(force-(airborne?performance.drag*state.speed**2*.25:resistance+wheelResistance)-slope)/performance.mass*FIXED_STEP);
  // 平坦なダートは、駆動力が残っていれば空転しながら超低速で前進する。
  // 舗装・ジャンプ・縦ループには適用せず、電池切れは上で停止する。
  if(track.circuit.surface.roughness>0&&!track.obstacles&&!track.hasHills&&!airborne&&force>0&&road.traction>0){
    const crawlSpeed=DIRT_CRAWL_SPEED*charge*motor;
    speed=Math.max(speed,Math.min(crawlSpeed,state.speed+.25*charge*FIXED_STEP));
  }
  const centerCurvature=sampleCircuit(startDistance+state.distance).curvature;
  // 外側レーンは同じコーナーを通過するのに長い距離を走る。
  // distanceは全車共通の中心線上の進捗、speedは実際の走行速度。
  const laneScale=path?(airborne?path.pathScale*Math.cos(path.pitch):path.pathScale):1+laneOffset*centerCurvature;
  const distance=state.distance+speed*FIXED_STEP/laneScale;
  const lateral=(airborne?0:1)*track.cornerLoad*speed**2*(path?.curvature??centerCurvature/laneScale);
  let stress=Math.max(0,state.stress+(lateral>road.lateralLimit?(lateral/Math.max(.001,road.lateralLimit)-1):-2)*FIXED_STEP);
  let flightY=state.flightY,flightVelocity=state.flightVelocity,flightLandingEnd=state.flightLandingEnd,landings=state.landings;
  if(track.obstacles&&initialLane!==undefined){
    const from=track.courseProgress(state.distance),to=track.courseProgress(distance),jump=track.jumps.find(j=>from<j.takeoff&&to>=j.takeoff)??track.obstacles.jump;
    if(!airborne&&from<jump.takeoff&&to>=jump.takeoff&&to>=from){
      flightY=sampleLanePath(Math.floor(state.distance/circuitLength)*circuitLength+jump.takeoff-.001,initialLane).y;
      flightVelocity=speed*jump.height/jump.rise*(1-performance.frontBias);
      flightLandingEnd=Math.floor(state.distance/circuitLength)*circuitLength+jump.takeoff+jump.gap+jump.landingLength;
    }
    if(flightY!==undefined){
      const velocity=(flightVelocity??0)-9.81*FIXED_STEP;
      flightY+=((flightVelocity??0)+velocity)*.5*FIXED_STEP;flightVelocity=velocity;
      const floor=track.isJumpGap(distance)?track.sampleCircuit(track.startDistance+distance).elevation:sampleLanePath(distance,initialLane).y;
      if(flightY<=floor&&velocity<0){
        if(track.isJumpGap(distance))return {...state,time:state.time+FIXED_STEP,distance,speed:0,status:'out',stopReason:'jump',flightY:undefined,flightVelocity:undefined};
        const impact=Math.abs(velocity)*(1-performance.damping)*(0.6+performance.rebound)*(1-performance.frontBias);
        const overrun=flightLandingEnd===undefined?0:Math.max(0,distance-flightLandingEnd);
        speed*=Math.max(.55,1-impact*.025-overrun*(1-performance.damping)*.05);
        stress+=impact*.008+overrun*(1-performance.damping)*.15;landings=(landings??0)+1;
        flightY=undefined;flightVelocity=undefined;flightLandingEnd=undefined;
      }
    }
  }
  if(path?.loopRadius&&path.loopAngle>.3&&speed<.5)return {...state,time:state.time+FIXED_STEP,distance,speed:0,status:'out',stopReason:'loop'};
  if(path?.loopRadius&&Math.cos(path.loopAngle)<-.25&&speed**2/path.loopRadius<9.81*.92)stress+=FIXED_STEP*2;
  if(path&&!path.loopRadius&&Math.cos(path.bank)<-.5&&speed<2.5)stress+=FIXED_STEP*2;
  const finish=circuitLength*circuit.laps;
  const finished=distance>=finish;
  const fraction=finished?(finish-state.distance)/(distance-state.distance):1;
  return {...(track.obstacles?{flightY,flightVelocity,flightLandingEnd,landings}:{}),time:state.time+FIXED_STEP*fraction,distance:Math.min(distance,finish),speed,stress,status:stress>0.18?'out':finished?'finished':'running'};
}
