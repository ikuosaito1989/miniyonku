import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { initializeSave, playWithoutSave } from './game/persistence';
import './style.css';
import './mobile.css';
const root=createRoot(document.getElementById('root')!);
function renderGame(){root.render(<React.StrictMode><App /></React.StrictMode>);}
async function start(){
  root.render(<main className="save-startup"><p role="status">セーブを読み込み中…</p></main>);
  try{await initializeSave();renderGame();}
  catch(error){
    root.render(<main className="save-startup"><section role="alert"><h1>セーブを読み込めませんでした</h1><p>{error instanceof Error?error.message:'保存領域へアクセスできません。'}</p><p>既存データは上書きしません。再試行するか、保存なしで一時的に遊べます。</p><button onClick={()=>{void start();}}>読み込みを再試行</button><button onClick={()=>{playWithoutSave();renderGame();}}>保存なしで遊ぶ</button></section></main>);
  }
}
void start();
