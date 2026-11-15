import {AudioControls} from './GameAudio';
import {MissionGuide} from './MissionGuide';
import {useGame} from './game/store';
import {tutorialActive} from './game/tutorial';
import './world-toolbar.css';

export function WorldToolbar(){
 const {location,nearby,tutorialStage,openSettings,openLibrary}=useGame();
 return <div className="world-toolbar world-toolbar-collapsible">
  <details className="world-menu">
   <summary aria-label="設定・ミッション・音のメニュー">☰ <span>メニュー</span></summary>
   <div className="world-menu-panel">
    <button className="game-settings-open" onClick={openSettings}>設定</button>
    {location==='library'?<div className="library-room-guide"><div><strong>緑川町立図書館</strong><span>{nearby||'本棚をタップして近づくと読めます'}</span></div><button onClick={()=>openLibrary()}>全蔵書</button></div>:!tutorialActive(tutorialStage)&&<MissionGuide/>}
    <AudioControls floating/>
   </div>
  </details>
 </div>;
}
