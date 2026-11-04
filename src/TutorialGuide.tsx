import {useGame} from './game/store';
import {tutorialActive,TUTORIAL_PART} from './game/tutorial';
import {parts} from './data/parts';
import type {EquipmentSlot} from './data/machine';
import {NpcPortrait} from './NpcPortrait';
import './tutorial.css';
export function TutorialGuide({context,onSelectSlot}:{context:'world'|'setting'|'shop';onSelectSlot?:(slot:EquipmentSlot)=>void}){
 const game=useGame(),stage=game.tutorialStage,part=parts.find(p=>p.id===TUTORIAL_PART)!;
 if(!tutorialActive(stage)||game.openingActive||context==='world'&&game.overlay!==null)return null;
 const displayStage=stage==='racing'?'start':stage;
 const data={
  motor:{step:1,title:'モーターと速さを見てみよう',text:'ここがセッティング画面。モーターは最高速と加速に関係するよ。部位を選ぶと、その説明と持っているパーツを確認できるんだ。まずは「モーター」を選んでみよう。'},
  tire:{step:1,title:'次はタイヤの説明を確認',text:'タイヤはグリップや重さが違うよ。速いモーターだけでなく、タイヤやローラーとの組み合わせも大切。「タイヤ」を選んで、今の装備を見てみよう。'},
  shop:{step:2,title:'買い物もやってみよう',text:`部位を選ぶ → 所持パーツを選ぶ、で交換できるよ。今度は店主さんのカウンターで「${part.name}」を買って、自分で装着してみよう。価格は${part.price}円だよ。`},
  purchase:{step:2,title:'ギアを選んで購入しよう',text:`「ギア」の売り場で「${part.name}」の購入ボタンを押そう。確認画面で価格と残りの所持金を見て、購入を確定してね。キャンセルならお金は減らないよ。`},
  equip:{step:3,title:'買ったギアを自分で装着',text:`買うだけでは装備は変わらないよ。「ギア」の所持パーツから「${part.name}」のカードをタップしてみよう。「装着中」の表示と赤いランプが目印だよ。`},
  start:{step:4,title:'準備完了、初レースへ！',text:'装着できたね！ 右のコースがレースの入口だよ。参加費は無料。レースでは「カウント開始」を押して、GOが出たら「発進」を押そう。まずは順位を気にせず体験してみよう！'},
  result:{step:5,title:'初レース、おつかれさま！',text:`レース結果まで確認できたね。${game.lastPrize>0?`賞金${game.lastPrize}円も受け取れたよ。`:''}完走すれば賞金がもらえて、次の改造につながるんだ。あとは買い物・セッティング・レースを自由に楽しもう。困ったら、また僕に聞いてね！`},
 }[displayStage as 'motor'|'tire'|'shop'|'purchase'|'equip'|'start'|'result'];
 if(!data)return null;
 const select=(slot:EquipmentSlot)=>{if(!onSelectSlot){game.resumeTutorial();return;}onSelectSlot(slot);game.inspectTutorial(slot);};
 const focusPart=()=>{document.querySelector(`[data-part-id="${TUTORIAL_PART}"]`)?.scrollIntoView({behavior:'smooth',block:'center'});};
 let label='',action:()=>void=game.resumeTutorial;
 if(game.location!=='komorebi'){label='こもれび模型店へ戻る';}
 else if(context==='world'&&displayStage!=='start'&&displayStage!=='result'){label=displayStage==='purchase'?'ギア売り場へ':'セッティングを開く';}
 else if(displayStage==='motor'){label='モーターを見てみる';action=()=>select('motor');}
 else if(displayStage==='tire'){label='タイヤを見てみる';action=()=>select('tire');}
 else if(displayStage==='shop'){label='パーツを買いに行く';action=game.openTutorialShop;}
 else if(displayStage==='purchase'){if((game.inventory[TUTORIAL_PART]??0)>0){label='購入済みのギアを装着する';action=game.openTutorialShop;}else{label='購入するギアを見る';action=focusPart;}}
 else if(displayStage==='equip'){label='購入したギアを表示';action=()=>{onSelectSlot?.('gear');requestAnimationFrame(focusPart);};}
 else if(displayStage==='start'){label=context==='setting'?'お店のコースへ':'初レースに出る';action=context==='setting'?game.close:game.startTrial;}
 else {label=game.tutorialReturn?'練習を終えて元に戻る':'チュートリアル完了';action=game.finishTutorial;}
 return <section className={`tutorial-guide tutorial-guide-${context}`} role="region" aria-label="匠の操作チュートリアル" data-stage={stage}>
  <div className="tutorial-portrait"><NpcPortrait id="mechanic"/></div><div className="tutorial-copy"><small>匠のチュートリアル {data.step} / 5{game.tutorialReturn?' ・練習モード':''}</small><h2>{data.title}</h2><p>{data.text}</p><nav><button onClick={action}>{label}</button>{displayStage!=='result'&&<button className="tutorial-skip" onClick={game.finishTutorial}>{game.tutorialReturn?'練習を終了':'チュートリアルを省略'}</button>}</nav></div>
 </section>;
}
