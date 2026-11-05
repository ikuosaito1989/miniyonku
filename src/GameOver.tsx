import {useState} from 'react';
import {useGame} from './game/store';
import {cupPlayerPlace,cupComplete} from './game/cup';
import {saveNow} from './game/persistence';
export function GameOver(){
 const {wakabaCup,technicalCup,finalCup,zenithCup}=useGame();const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const zenith=cupComplete(zenithCup,'zenith');
 const final=cupComplete(finalCup,'final');
 const technical=cupComplete(technicalCup,'technical'),place=cupPlayerPlace(zenith?zenithCup:final?finalCup:technical?technicalCup:wakabaCup);
 return <section className="cup-game-over" role="dialog" aria-modal="true" aria-labelledby="game-over-title"><h1 id="game-over-title">GAME OVER</h1><p>{zenith?'天頂決戦・ゼニス・クラウン':final?'緑川グランプリ':technical?'星空テクニカル杯':'若葉公式杯'} 総合{place}位</p><p>{zenith||final?'決勝で2位以内に完走できませんでした。':'公式大会で3位以内に入れませんでした。'}<br/>前のセーブ地点から再開できます。</p><button disabled={busy} onClick={async()=>{setBusy(true);try{useGame.getState().retryFromSave();await saveNow();}catch{setError('再開後の保存に失敗しました。設定から保存を再試行してください。');}finally{setBusy(false);}}}>{busy?'準備中…':'前のセーブから再開'}</button><p role="status">{error}</p></section>;
}
