import type { Equipment } from '../data/machine';
import { nextShopRace } from '../data/shopHints';
export interface AdviceContext { money:number; inventory:Record<string,number>; equipment:Equipment; motorSeconds:number; qualified:boolean }
export function shopAdvice(role:'guide'|'mechanic',state:AdviceContext){
  if(role==='guide')return state.qualified
    ?`${nextShopRace.shopName}のレース参加資格、獲得おめでとう！全国で活躍する最強兄弟とのレースで決着がついたら、下の出口から街へ出られるよ。この特別レースは周回遅れの敗北でも大丈夫。途中でやめた場合も出口で再挑戦できるよ。優勝賞金800円は何度でももらえるよ。`
    :'まずはこの店の1位を目指そう！初優勝で次の模型店の参加資格がもらえるよ。最下位でも完走賞250円。左下のセッティング本棚を順番に読むと、改造の進め方がわかるよ。';
  if(state.equipment.gear==='gear-5')return state.inventory['gear-4']
    ?'4:1ギアをもう持っているね！買ったパーツは自動では付かないよ。右上の作業台でギアを4:1に交換して、もう一度走ってみよう。'
    :`最初の改造は4:1ギア（350円）がおすすめ。${state.money>=350?'今なら店主から買えるね。':'まず完走賞を貯めよう。'}高トルクモーターと組むと加速の不足を補いやすいよ。`;
  if(state.motorSeconds<60)return 'ギアを替えたね。次はモーターの慣らし。作業台で約60秒までならしてみよう。充電電池を使えば残量は減らないよ。勝負には新品の電池を選び直そう。';
  if(state.motorSeconds>180)return 'モーターが摩耗し始めているよ。慣らし続けても速くはならない。新品のモーターを購入して交換しよう。';
  return 'モーターは好調だね！足回りの軽量化と新品プラスセルで記録を比べよう。本棚の「凪への挑戦」に参考構成があるよ。発進が遅れた時間も公式記録に入るからGOを見逃さずに。';
}
