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
  grove:{feature:'1周半の高架スパイラル、坂、ジャンプ台を巡る約500mの立体コース。',advice:'ライバルも上位装備。K4・高グリップタイヤ・新作ホイールを軸に、4:1ギアと着地の制振を整えよう。'},
  comet:{feature:'全4大会の第3大会。約2分にわたり連続コーナーを走り抜く。',advice:'最高速だけでは勝てない。過去のパーツで旋回の安定と立ち上がりを整えよう。'},
  leaf:{feature:'大きなカーブとレーンチェンジの入門コース。',advice:'加速と安定性を整え、まずは5周の完走を目指そう。'},
  wind:{feature:'切り返しが続く連続コーナー。',advice:'低重心とグリップで姿勢を保ち、立ち上がりの加速を確保しよう。'},
  sun:{feature:'砂利・荒れたダート・砂地を巡るロングコース。',advice:'高トルクモーター、悪路用タイヤ、ダンパーで接地を保とう。'},
  sprint:{feature:'長い直線をつないだ長距離の高速舗装コース。',advice:'高速ギアと舗装用タイヤ、長持ちする電池で速度を伸ばそう。'},
 }[id];
 return {...details,name:circuit.name,surface:circuit.surface.name,lapLength:Math.round(circuitLength),distance:Math.round(circuitLength*circuit.laps),laps:circuit.laps,lanes:circuit.lanes};
}
