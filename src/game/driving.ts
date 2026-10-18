import { parts } from '../data/parts';
import type { Equipment } from '../data/machine';
import { circuit, circuitLength, sampleCircuit, sampleLanePath, startDistance } from '../data/circuit';

export const FIXED_STEP = 1/120;
export interface DrivingState { time: number; distance: number; speed: number; stress: number; status: 'ready'|'running'|'finished'|'out'; }
export function machinePerformance(equipment: Equipment) {
  const get = (category: keyof Equipment) => {
    const part = parts.find(p => p.id === equipment[category] && p.category === category);
    if (!part) throw new Error(`装備が不正です: ${category}`);
    return part.specs;
  };
  const motor=get('motor'), gear=get('gear'), tire=get('tire'), roller=get('roller'), terminal=get('terminal');
  const mass = (80 + Object.keys(equipment).reduce((sum,key) => sum + get(key as keyof Equipment).weight,0))/1000;
  const radius=tire.diameter/2000;
  return {
    freeSpeed: motor.rpm * terminal.efficiency / 60 / gear.ratio * 2 * Math.PI * radius,
    stallForce: motor.torque/1000 * gear.ratio * terminal.efficiency * 0.8 / radius,
    mass, drag: 0.012 + roller.friction * 0.025,
    lateralLimit: 9.81 * (1.2 + tire.grip) + roller.weight * 0.2,
  };
}
export type Performance = ReturnType<typeof machinePerformance>;
export function createDrivingState(): DrivingState { return {time:0,distance:0,speed:0,stress:0,status:'ready'}; }
export function startDriving(state: DrivingState): DrivingState {
  return state.status==='ready'?{...state,status:'running'}:state;
}
// 入力なしの試走は乱数を使用せず、同じ装備なら同一結果になる。
export function stepDriving(state: DrivingState, performance: Performance, laneOffset=0, initialLane?:number): DrivingState {
  if(state.status!=='running')return state;
  const force=performance.stallForce*Math.max(0,1-state.speed/performance.freeSpeed);
  const resistance=performance.mass*9.81*0.025+performance.drag*state.speed**2;
  const speed=Math.max(0,state.speed+(force-resistance)/performance.mass*FIXED_STEP);
  const path=initialLane===undefined?undefined:sampleLanePath(state.distance,initialLane);
  const centerCurvature=sampleCircuit(startDistance+state.distance).curvature;
  // 外側レーンは同じコーナーを通過するのに長い距離を走る。
  // distanceは全車共通の中心線上の進捗、speedは実際の走行速度。
  const laneScale=path?.pathScale??1+laneOffset*centerCurvature;
  const distance=state.distance+speed*FIXED_STEP/laneScale;
  const lateral=speed**2*(path?.curvature??centerCurvature/laneScale);
  const stress=Math.max(0,state.stress+(lateral>performance.lateralLimit?(lateral/performance.lateralLimit-1):-2)*FIXED_STEP);
  const finish=circuitLength*circuit.laps;
  const finished=distance>=finish;
  const fraction=finished?(finish-state.distance)/(distance-state.distance):1;
  return {time:state.time+FIXED_STEP*fraction,distance:Math.min(distance,finish),speed,stress,status:stress>0.18?'out':finished?'finished':'running'};
}
