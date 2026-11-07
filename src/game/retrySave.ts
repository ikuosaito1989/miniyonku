import type {SavedGame} from './saveData';
import {cupComplete,cupProgression} from './cup';
/** 更新前のセーブには復帰用コピーがないため、敗退した最終戦だけを未出走に戻す。 */
export function legacyRetrySnapshot(saved:SavedGame):SavedGame{
 const game=structuredClone(saved);
 const key=game.zenithCup.pending||cupComplete(game.zenithCup,'zenith')?'zenithCup':game.finalCup.pending||cupComplete(game.finalCup,'final')?'finalCup':game.technicalCup.pending||cupComplete(game.technicalCup,'technical')?'technicalCup':'wakabaCup';
 const cup=game[key];
 game[key]={entered:cup.entered,pending:null,results:cup.pending?cup.results:cup.results.slice(0,-1)};
 return {...game,...cupProgression(game.wakabaCup,game.technicalCup,game.thirdOfficialQualified,game.finalCup,game.zenithCup)};
}
