import {getCircuitTrack,type CircuitId} from '../data/circuit';
export const raceIntroTiming={overview:4,tour:11,grid:5};
export const raceIntroDuration=raceIntroTiming.overview+raceIntroTiming.tour+raceIntroTiming.grid;
export interface RaceIntro {age:number;stage:'overview'|'tour'|'grid'|'done'}
export function raceIntroAt(age:number):RaceIntro{
 const safe=Math.min(raceIntroDuration,Math.max(0,Number.isFinite(age)?age:0));
 return {age:safe,stage:safe>=raceIntroDuration?'done':safe>=raceIntroTiming.overview+raceIntroTiming.tour?'grid':safe>=raceIntroTiming.overview?'tour':'overview'};
}
export function stepRaceIntro(intro:RaceIntro,seconds:number,visible=true){
 return visible?raceIntroAt(intro.age+Math.max(0,Number.isFinite(seconds)?seconds:0)):intro;
}
export function courseIntroduction(id:CircuitId){
 const {circuit,circuitLength}=getCircuitTrack(id);
 const details={
  leaf:{feature:'大きなカーブとレーンチェンジの入門コース。',advice:'加速と安定性を整え、まずは5周の完走を目指そう。'},
  wind:{feature:'切り返しが続く連続コーナー。',advice:'低重心とグリップで姿勢を保ち、立ち上がりの加速を確保しよう。'},
  sun:{feature:'砂利・荒れたダート・砂地を巡るロングコース。',advice:'高トルクモーター、悪路用タイヤ、ダンパーで接地を保とう。'},
  sprint:{feature:'長い直線をつないだ長距離の高速舗装コース。',advice:'高速ギアと舗装用タイヤ、長持ちする電池で速度を伸ばそう。'},
 }[id];
 return {...details,name:circuit.name,surface:circuit.surface.name,lapLength:Math.round(circuitLength),distance:Math.round(circuitLength*circuit.laps),laps:circuit.laps,lanes:circuit.lanes};
}
