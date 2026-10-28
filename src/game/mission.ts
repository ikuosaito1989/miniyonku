import type {GameState} from './store';
import {nextShopRace} from '../data/shopHints';
import type {WorldLocation} from '../data/world';
export interface Mission {id:string;title:string;destination:Exclude<WorldLocation,'town'>|null;place:string;steps:string[];hint:string;complete?:boolean}
type Progress=Pick<GameState,'location'|'gameOver'|'unlockedRaces'|'legendRaceCompleted'|'doctorGiftReceived'|'aozoraWon'|'villainDefeated'|'officialQualified'|'wakabaUnlocked'|'thirdOfficialQualified'|'wakabaCup'|'technicalCup'|'yuunagiUnlocked'|'finalQualified'|'yuunagiBestTime'>;
/** セーブされた進行から現在の一件を導く。表示のために進行を変更しない。 */
export function currentMission(s:Progress):Mission{
 if(s.gameOver)return {id:'game-over',title:'ゲームオーバー',destination:null,place:'公式大会',steps:['大会の総合順位を確認する。'],hint:'公式大会は一度限りです。再出場はできません。'};
 if(s.finalQualified)return {id:'complete',title:'緑川グランプリの出場権を獲得！',destination:null,place:'ゆうなぎ模型店',steps:['夕凪の規定タイム43秒をクリアしました。','第4公式大会・緑川グランプリの出場権はセーブ済みです。'],hint:'第4公式大会は開催準備中です。ゆうなぎのタイムアタックや、模型店での改造を楽しめます。',complete:true};
 if(s.yuunagiUnlocked)return {id:'yuunagi',title:'ゆうなぎの一本道を43秒以内で完走',destination:'yuunagi',place:'ゆうなぎ模型店',steps:['街のゆうなぎ模型店へ向かう。','店内コースで、スタートから別のゴールまで一度だけ走る。','高架スパイラルとジャンプ台を越え、公式タイム43秒以内で完走する。'],hint:`規定タイムをクリアすると第4公式大会の出場権を獲得。何度でも再挑戦できます。タイムにはGO後の反応時間・早出の加算も含まれます。${s.yuunagiBestTime!==null?' 自己ベスト：'+s.yuunagiBestTime.toFixed(2)+'秒。':''}店主の新作スライドダンパーとローラーで旋回・着地を整えよう。その他欄にスライド、リヤ欄にローラーを装着できます。`};
 if(s.thirdOfficialQualified)return {id:'technical',title:'星空テクニカル杯で3位以内に入る',destination:'stadium-9',place:'星空レース場',steps:['街の星空レース場へ入る。','ピットで連続コーナー向けの装備に組み直す。','中央のテクニカルコースを調べ、公式戦に出場する。'],hint:'約2分の長距離戦。4:1ギア・スポンジタイヤ・低重心シャーシ・ローラー・ウェイトなど、過去のパーツを組み合わせよう。出場は一度限り、4位以下はゲームオーバー。'};
 if(s.wakabaUnlocked)return {id:'wakaba',title:'わかば模型店で優勝する',destination:'wakaba',place:'わかば模型店',steps:['街のわかば模型店へ入る。','作業台で坂・スパイラル・ジャンプ向けに加速と旋回、着地の制振を整える。','店内コースの通常レースで1位を取る。'],hint:'優勝すると第3公式大会の出場権を獲得。ライバルも上位装備で走ります。K4シャーシ・ハイグリップタイヤ・新作ワンウェイで旋回を強化し、ジャンプの着地にはダンパーも検討しよう。4:1ギアや駆動サポートも組み合わせよう。'};
 if(s.officialQualified){
  const second=s.wakabaCup.results.length===1;
  return {id:second?'wakaba-dirt':'wakaba-speed',title:second?'若葉杯・第2戦のダートを走る':'若葉杯・第1戦の高速コースを走る',destination:'stadium-5',place:'若葉レース場',steps:second?['若葉レース場のピットでオフロード用に装備を変更する。','場内の右側のダートコースを調べ、第2戦に出場する。','2戦の総合3位以内を目指す。']:['街の若葉レース場へ入る。','ピットで高速舗装向けの装備と電池を確認する。','場内の左側の高速コースを調べ、第1戦に出場する。'],hint:second?'第1戦の順位は記録済み。悪路用タイヤ・モーター・ダンパーを検討しよう。総合3位以内で次の店、総合優勝で第3大会の出場権。':'高速戦とダート戦の2戦制。戦間に装備を変更できます。大会は一度限り、総合4位以下でゲームオーバー。途中退出・再読み込みはそのレースの棄権になります。'};
 }
 if(s.villainDefeated)return {id:'hinata',title:'ひなた模型店のダートで優勝する',destination:'hinata',place:'ひなた模型店',steps:['街のひなた模型店へ入る。','悪路用のパーツを購入し、作業台で装着する。','店内のダートコースで1位を取る。'],hint:'ブロックタイヤ、悪路用モーター、ダンパーやポール式ローラーが役立ちます。優勝すると若葉公式杯の出場権を獲得。'};
 if(s.aozoraWon)return {id:'kuroiwa',title:'黒岩 豪に話しかけて勝負する',destination:'aozora',place:'あおぞら模型店',steps:['あおぞら模型店にいる黒岩 豪に話しかける。','セッティングを選んだ後も、もう一度話しかければ出場できます。','黒岩との挑戦レースで1位を取る。'],hint:'勝つとひなた模型店の紹介状を獲得。負けたら佐伯 匠に相談して、足りないパーツや慣らしを確認しよう。'};
 if(s.legendRaceCompleted&&!s.doctorGiftReceived)return {id:'doctor',title:'青葉博士からセイランを受け取る',destination:'komorebi',place:'こもれび模型店',steps:['こもれび模型店で博士の来店イベントを進める。','博士の話を聞き、セイランボディを受け取る。'],hint:'その後は店の下側の出口から街へ出て、あおぞら模型店へ向かおう。'};
 if(s.legendRaceCompleted)return {id:'aozora',title:'あおぞら模型店で優勝する',destination:'aozora',place:'あおぞら模型店',steps:['店の下側の出口から街へ出る。','街の地図であおぞら模型店を選んで向かう。','店内の連続コーナーコースで1位を取る。'],hint:'加速と旋回の安定を両立させよう。優勝すると黒岩 豪が訪ねてきます。'};
 if(s.unlockedRaces.includes(nextShopRace.id))return {id:'brothers',title:'最強兄弟に話しかけて特別レースへ',destination:'komorebi',place:'こもれび模型店',steps:['店内の風見 怜・火野 岳に話しかける。','「セッティングしてから」を選んだ場合は、もう一度兄弟に話しかける。','兄弟との特別レースを最後まで体験する。'],hint:'このイベントは勝利する必要がありません。周回遅れでの敗北でも進みます。途中で店へ戻った場合は、もう一度話しかけよう。'};
 return {id:'komorebi',title:'こもれび模型店で初優勝する',destination:'komorebi',place:'こもれび模型店',steps:['こもれび模型店に入り、店内コースを調べる。','通常レースで完走して賞金を貯める。','店主からパーツを買い、作業台で装着して1位を目指す。'],hint:'最初は負けても大丈夫。完走すれば賞金がもらえます。星霧模型工房も最初から入れますが、高額パーツはやり込み向けです。勝てないときは店内の佐伯 匠に話しかけると、今のマシンに合った具体的なアドバイスが聞けます。'};
}
export function missionNextAction(s:Progress,mission=currentMission(s)){
 if(!mission.destination)return mission.steps[0];
 if(s.location==='town')return `${mission.place}へ向かおう。街の地図で目的地を選べます。`;
 if(s.location!==mission.destination)return `下側の出口から街へ出て、${mission.place}へ向かおう。`;
 return mission.steps.find(step=>!step.includes('街の')&&!step.includes('店へ入る')&&!step.includes('出口から'))??mission.steps[0];
}
