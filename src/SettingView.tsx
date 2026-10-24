import { lazy, Suspense, useState } from 'react';
import { parts } from './data/parts';
import { equipPart } from './game/equipment';
import { equipmentSlots, type EquipmentSlot } from './data/machine';
import { machinePerformance, surfacePerformance } from './game/driving';
import { dirtSurface } from './data/surfaces';
import { useGame } from './game/store';
import './setting.css';
import { PartDescription } from './PartDescription';
import { PartArtwork } from './PartArtwork';
import { SaveControls } from './SaveControls';
import { equippedCondition, batteryCharge, batteryConsumption, batteryLabel, motorFactor, motorLabel, motorWear } from './game/condition';

const MachinePreview=lazy(()=>import('./MachinePreview'));

export function SettingView(){
  const {equipment,inventory,equip,close,units,selectedUnits,exchangeReusable,breakIn,notice,officialQualified,officialSpeedWon,officialDirtWon,location,startOfficialRace}=useGame();
  const [slot,setSlot]=useState<EquipmentSlot>('motor');
  const category=equipmentSlots[slot].category;
  const [cursor,setCursor]=useState<string|null>(null);
  const current=parts.find(p=>p.id===equipment[slot])!;
  const selected=parts.find(p=>p.id===cursor&&p.category===category)??current;
  const condition=equippedCondition(equipment,units,selectedUnits);
  const performance=machinePerformance(equipment,condition);
  const previewEquipment=equipPart(equipment,inventory,selected.id,slot);
  const preview=machinePerformance(previewEquipment,equippedCondition(previewEquipment,units,selectedUnits));
  const dirt=surfacePerformance(performance,dirtSurface),previewDirt=surfacePerformance(preview,dirtSurface);
  const owned=parts.filter(p=>p.category===category&&inventory[p.id]>0);
  return <section className="setting-screen" role="dialog" aria-modal="true" aria-labelledby="setting-title" onKeyDown={e=>{
    if(e.key!=='Tab')return;
    const controls=e.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)');
    const first=controls[0],last=controls[controls.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}
  }}>
    <header><div><small>{location==='stadium-5'?'WAKABA / RACE PIT':'MACHINE LAB'}</small><h1 id="setting-title">マシン セッティング</h1></div>{officialQualified&&location==='stadium-5'&&<button onClick={startOfficialRace}>{officialSpeedWon&&!officialDirtWon?'第2戦・オフロードへ':'第1戦・高速レースへ'}</button>}<button autoFocus onClick={close}>{location==='stadium-5'?'会場に戻る':'店に戻る'} <kbd>Esc</kbd></button></header>
    {officialQualified&&location==='stadium-5'&&<p className="notice">{officialSpeedWon&&!officialDirtWon?'次は第2戦・オフロード。高速戦1位は保存済み。悪路用タイヤ・高トルクモーター・ダンパー・2段ローラーを準備しよう。':'次は第1戦・長距離高速舗装。軽い舗装用タイヤと高速ギア、長持ちする電池を準備しよう。ブロックタイヤは舗装で抵抗が増えます。'}</p>}
    <div className="setting-layout"><section className="setting-panel machine-specs"><dl><dt>WEIGHT</dt><dd>{(performance.mass*1000).toFixed(1)} <small>g</small></dd><dt>DRIVE FORCE</dt><dd>{performance.stallForce.toFixed(2)} <small>N</small></dd><dt>FREE SPEED</dt><dd>{(performance.freeSpeed*3.6).toFixed(1)} <small>km/h</small></dd></dl><p>装備中</p></section><nav className="setting-panel" aria-label="装備する部位">{(Object.keys(equipmentSlots) as EquipmentSlot[]).map(c=><button key={c} aria-pressed={c===slot} onClick={()=>{setSlot(c);setCursor(null);}}><span>{equipmentSlots[c].label}</span><strong>{parts.find(p=>p.id===equipment[c])?.name}</strong></button>)}</nav>
      <section className="machine-monitor setting-panel"><div className="monitor-heading">WEIGHT = {(preview.mass*1000).toFixed(1)} g <small>{selected.id===current.id?'装着中':'交換プレビュー'}</small></div><Suspense fallback={<div className="preview-loading">マシンを読み込み中…</div>}><MachinePreview equipment={previewEquipment}/></Suspense><div className="monitor-caption">{equipmentSlots[slot].label}：{selected.name}</div></section>
      <section className="setting-panel setting-explanation" aria-live="polite"><h2>{selected.name} の説明</h2><PartDescription part={selected}/></section>
      <section className="setting-panel setting-options"><h2>{equipmentSlots[slot].label} / 所持パーツ</h2><div className="part-cards">{owned.map(p=><button key={p.id} disabled={p.id!==equipment[slot]&&equipPart(equipment,inventory,p.id,slot)===equipment} className={selected.id===p.id?'focused':''} onFocus={()=>setCursor(p.id)} onMouseEnter={()=>setCursor(p.id)} onClick={()=>{equip(p.id,slot);setCursor(p.id);}}><span className="card-lamps"><i/><i/></span><PartArtwork part={p}/><span>{p.name}</span><span className="part-card-description">{p.description}</span><small>{equipment[slot]===p.id?'◆ 装着中':equipPart(equipment,inventory,p.id,slot)===equipment?'他の枠で使用中':'交換する'} · 所持セット {inventory[p.id]}</small></button>)}{Array.from({length:Math.max(0,5-owned.length)},(_,i)=><div className="empty-card" key={i}><span className="card-lamps"><i/><i/></span><strong>NO PART</strong><small>未所持</small></div>)}</div><p>その他①〜③に最大3個を同時装着できます。外すときは「補助パーツなし」を選択。重量と効果はすべて加算・合成されます。クリック・Enterで交換。ローラーは1セット所持していれば、前・中・後へ個別に装着できます。同じ種類を3か所に使うこともできます。</p></section>
      <section className="setting-panel setting-details" aria-live="polite"><h2>交換前後の比較</h2><dl><div><dt>総重量</dt><dd>{(performance.mass*1000).toFixed(1)} → {(preview.mass*1000).toFixed(1)} g</dd></div><div><dt>理論無負荷速度</dt><dd>{(performance.freeSpeed*3.6).toFixed(1)} → {(preview.freeSpeed*3.6).toFixed(1)} km/h</dd></div><div><dt>停止時駆動力</dt><dd>{performance.stallForce.toFixed(2)} → {preview.stallForce.toFixed(2)} N</dd></div><div><dt>舗装の旋回限界</dt><dd>{performance.lateralLimit.toFixed(1)} → {preview.lateralLimit.toFixed(1)} m/s²</dd></div><div><dt>悪路の駆動伝達率</dt><dd>{(dirt.traction*100).toFixed(0)} → {(previewDirt.traction*100).toFixed(0)} %</dd></div><div><dt>悪路の追加抵抗</dt><dd>{dirt.resistance.toFixed(3)} → {previewDirt.resistance.toFixed(3)} N</dd></div></dl><p>ひなたは砂利・砂地のダートコース。悪路の接地・抵抗と制振装備が実際の走行に影響します。こもれび・あおぞら・公式杯第1戦は舗装路です。</p><small>左：現在 / 右：選択パーツ装着時。実走速度は抵抗・コーナー・重量で変化します。</small></section>
      <section className="setting-panel condition-panel"><h2>コンディション</h2><p>電池残量 {batteryLabel(equipment.battery,condition.batterySeconds)} ／ モーター：{motorLabel(condition.motorSeconds,equipment.motor)}・性能 {(motorFactor(condition.motorSeconds,equipment.motor)*100).toFixed(1)}%・摩耗 {(motorWear(condition.motorSeconds,equipment.motor)*100).toFixed(1)}%</p><p>慣らしは約60秒でピーク。60〜180秒は好調を維持し、それ以降は摩耗します。レース・慣らしの使用時間を個体別に引き継ぎます。</p>
        <p>モーター・電池は種類ごとに1個まで所持でき、作業台で付け替えられます。同じ種類を再購入するとその種類だけ新品に交換します。他の種類の慣らし・摩耗・電池残量は保持します。</p>
        <div className="condition-units"><h3>無料の救済パーツへの交換</h3><p>モーター・電池ともに他の種類を残したまま装着します。リユースモーターは低出力・消耗なし、リチャージセルは出力95%・残量固定です。</p><button disabled={equipment.motor==='motor-rescue'} onClick={()=>exchangeReusable('motor')}>無料リユースモーターを装着（他のモーターは保持）</button><button disabled={equipment.battery==='battery-recharge'} onClick={()=>exchangeReusable('battery')}>無料リチャージセルを装着（他の電池は保持）</button></div>
        <button onClick={breakIn} disabled={batteryCharge(equipment.battery,condition.batterySeconds)<=0}>30秒ならす（即時実行・{batteryConsumption(equipment.battery)===0?'電池消費なし':'電池を消費'}）</button><p role="status">{notice}</p><small>新品購入時は使用時間0秒で自動装着。同種だけ交換し、他の種類の慣らし・摩耗・電池残量は保持します。変更はこのブラウザへ自動保存されます。</small>
      </section>
    </div><footer>装備は交換時に即時反映されます。次のレースはこのセッティングで走行します。<SaveControls/></footer>
  </section>;
}
