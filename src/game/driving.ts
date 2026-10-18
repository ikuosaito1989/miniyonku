import { parts } from '../data/parts';
import { equipmentSlots, type Equipment } from '../data/machine';
import { circuit, circuitLength, sampleCircuit, sampleLanePath, startDistance } from '../data/circuit';
import { freshCondition, motorFactor, remainingCharge, type MachineCondition } from './condition';
import type { TrackSurface } from '../data/surfaces';

export const FIXED_STEP = 1/120;
export interface DrivingState { time: number; distance: number; speed: number; stress: number; status: 'ready'|'running'|'finished'|'out'; stopReason?:'battery'; }
export function machinePerformance(equipment: Equipment, condition:MachineCondition=freshCondition) {
  const get = (category: keyof Equipment) => {
    const part = parts.find(p => p.id === equipment[category] && p.category === equipmentSlots[category].category);
    if (!part) throw new Error(`装備が不正です: ${category}`);
    return part.specs;
  };
  const motor=get('motor'),gear=get('gear'),tire=get('tire'),terminal=get('terminal'),body=get('body'),chassis=get('chassis'),battery=get('battery'),wheel=get('wheel'),accessory=get('accessory');
  const front=get('rollerFront'),side=get('rollerSide'),rear=get('rollerRear');
  const friction=front.friction*.45+side.friction*.35+rear.friction*.2;
  const rollerWeight=front.weight*.45+side.weight*.35+rear.weight*.2;
  const mass = (1 + Object.keys(equipment).reduce((sum,key) => sum + get(key as keyof Equipment).weight,0))/1000;
  const radius=tire.diameter/2000;
  return {
    freeSpeed: motor.rpm * terminal.efficiency * battery.power / 60 / gear.ratio * 2 * Math.PI * radius,
    stallForce: motor.torque/1000 * gear.ratio * terminal.efficiency * battery.power * chassis.efficiency * accessory.efficiency * 0.8 / radius,
    mass, drag: (0.012 * body.drag + friction * 0.025), cornerDrag:wheel.cornerDrag,
    batteryEndurance:battery.endurance,
    batteryConsumption:battery.consumption??1,
    motorSeconds:condition.motorSeconds,batterySeconds:condition.batterySeconds,
    lateralLimit: (9.81 * (1.2 + tire.grip) + rollerWeight * 0.2)*body.stability*chassis.stability*accessory.stability,
    roughGrip:body.roughGrip,
    roughResistance:body.roughResistance,
    // 柔らかいスポンジは凹凸に追従し、ハードは舗装向け。
    tireCompliance:equipment.tire==='tire-1'?1.2:equipment.tire==='tire-2'?.7:1,
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
  const contact=1-roughness+roughness*Math.min(1,performance.roughGrip*performance.tireCompliance);
  return {
    traction:Math.min(1,Math.max(0,surface.grip)*contact),
    resistance:performance.mass*9.81*roughness*.18*performance.roughResistance/performance.tireCompliance,
    lateralLimit:performance.lateralLimit*Math.max(0,surface.grip)*contact,
  };
}
export function stepDriving(state: DrivingState, performance: Performance, laneOffset=0, initialLane?:number, surface:TrackSurface=circuit.surface): DrivingState {
  if(state.status!=='running')return state;
  const remaining=remainingCharge(performance.batterySeconds+state.time,performance.batteryEndurance*4,performance.batteryConsumption);
  if(remaining<=0)return {...state,speed:0,status:'out',stopReason:'battery'};
  const charge=.55+.45*Math.sqrt(remaining);
  const motor=motorFactor(performance.motorSeconds+state.time);
  const road=surfacePerformance(performance,surface);
  const force=performance.stallForce*charge*motor*Math.max(0,1-state.speed/(performance.freeSpeed*charge*motor))*road.traction;
  const resistance=performance.mass*9.81*0.025+performance.drag*state.speed**2+road.resistance;
  const wheelResistance=state.speed**2*sampleCircuit(startDistance+state.distance).curvature*.002*performance.cornerDrag;
  const speed=Math.max(0,state.speed+(force-resistance-wheelResistance)/performance.mass*FIXED_STEP);
  const path=initialLane===undefined?undefined:sampleLanePath(state.distance,initialLane);
  const centerCurvature=sampleCircuit(startDistance+state.distance).curvature;
  // 外側レーンは同じコーナーを通過するのに長い距離を走る。
  // distanceは全車共通の中心線上の進捗、speedは実際の走行速度。
  const laneScale=path?.pathScale??1+laneOffset*centerCurvature;
  const distance=state.distance+speed*FIXED_STEP/laneScale;
  const lateral=speed**2*(path?.curvature??centerCurvature/laneScale);
  const stress=Math.max(0,state.stress+(lateral>road.lateralLimit?(lateral/Math.max(.001,road.lateralLimit)-1):-2)*FIXED_STEP);
  const finish=circuitLength*circuit.laps;
  const finished=distance>=finish;
  const fraction=finished?(finish-state.distance)/(distance-state.distance):1;
  return {time:state.time+FIXED_STEP*fraction,distance:Math.min(distance,finish),speed,stress,status:stress>0.18?'out':finished?'finished':'running'};
}
