import {useState} from 'react';
import {useGame} from './game/store';
import {cupPlayerPlace,cupComplete} from './game/cup';
import {resetSave} from './game/persistence';
export function GameOver(){
 const {wakabaCup,technicalCup}=useGame();const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const technical=cupComplete(technicalCup,'technical'),place=cupPlayerPlace(technical?technicalCup:wakabaCup);
 return <section className="cup-game-over" role="dialog" aria-modal="true" aria-labelledby="game-over-title"><h1 id="game-over-title">GAME OVER</h1><p>{technical?'星空テクニカル杯':'若葉公式杯'} 総合{place}位</p><p>公式大会で3位以内に入れませんでした。<br/>一度限りの大会のため、再出場はできません。</p><button disabled={busy} onClick={async()=>{if(!window.confirm('今のセーブを初期化して、最初から新しいゲームを始めますか？'))return;setBusy(true);try{await resetSave();}catch{setError('初期化できませんでした。もう一度お試しください。');}finally{setBusy(false);}}}>{busy?'準備中…':'新しいゲームを始める'}</button><p role="status">{error}</p></section>;
}
