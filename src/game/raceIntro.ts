import {prizesForCircuit,OFFICIAL_PRIZES} from '../data/economy';
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
export function courseIntroduction(id:CircuitId,official=false){
 const {circuit,circuitLength}=getCircuitTrack(id);
 const details={
  forge:{feature:'最強兄弟・黒岩・黒瀬と走る最上位の混合ロングコース。縦ループ・横スパイラル・砂地・坂・ジャンプをすべて備える。',advice:'新作の高トルクモーター・接地シャーシ・制振を組み合わせよう。結果まで5回走ると天頂決戦の出場権を獲得。勝利数は条件ではない。'},
  zenith:{feature:'最後の舞台、天頂決戦・ゼニス・クラウン。すべての要素に加え終盤に連続S字を追加した史上最長の一本道。',advice:'最強兄弟・黒岩・黒瀬との最終決戦。縦ループの駆動力、砂地の追従、旋回と着地を両立し、2位以内をつかもう。'},
  grandprix:{feature:'全4大会の決勝。夕凪を発展させた高架スパイラル・ジャンプ・連続S字を5台で駆け抜ける一本道。',advice:'黒瀬 迅、黒岩 豪、石川 蒼、高橋 蓮と勝負。2位以内の完走でゲームクリア、3位以下はゲームオーバー。一度限りの決勝だ。'},
  trail:{feature:'スタートと別のゴールへ進む一本道。1周半の高架スパイラル、ジャンプ台、終盤のロングストレートを越え、規定40秒以内の完走で第4公式大会出場権を獲得。',advice:'一台ずつ走るタイムアタック。4:1ギアとK4に、新作サージ・スライド・ローラーを組み合わせ、直線の伸びと旋回・着地を両立させよう。失敗しても再挑戦できる。'},
  grove:{feature:'1周半の高架スパイラル、坂、ジャンプ台を巡る約500mの立体コース。',advice:'ライバルも上位装備。K4・高グリップタイヤ・新作ホイールを軸に、4:1ギアと着地の制振を整えよう。'},
  comet:{feature:'全4大会の第3大会。約2分にわたり連続コーナーを走り抜く。',advice:'最高速だけでは勝てない。過去のパーツで旋回の安定と立ち上がりを整えよう。'},
  leaf:{feature:'大きなカーブとレーンチェンジの入門コース。',advice:'加速と安定性を整え、まずは5周の完走を目指そう。'},
  wind:{feature:'切り返しが続く連続コーナー。',advice:'低重心とグリップで姿勢を保ち、立ち上がりの加速を確保しよう。'},
  sun:{feature:'砂利・荒れたダート・砂地を巡るロングコース。',advice:'高トルクモーター、悪路用タイヤ、ダンパーで接地を保とう。'},
  sprint:{feature:'長い直線をつないだ長距離の高速舗装コース。',advice:'高速ギアと舗装用タイヤ、長持ちする電池で速度を伸ばそう。'},
 }[id];
 return {...details,winnerPrize:(official&&id!=='comet'&&id!=='grandprix'&&id!=='zenith'?OFFICIAL_PRIZES:prizesForCircuit(id))[0],name:circuit.name,surface:circuit.surface.name,lapLength:Math.round(circuitLength),distance:Math.round(circuitLength*circuit.laps),laps:circuit.laps,lanes:circuit.lanes};
}
