import { test } from 'node:test';
import assert from 'node:assert/strict';
import { legends } from '../data/legends';
import { parts } from '../data/parts';
import { proficiencyRanks, proficiencyStandings } from '../data/proficiency';
import { fixtures } from '../data/shop';
import { machinePerformance } from './driving';
import { snapshotGame } from './saveData';
import { useGame } from './store';
import { bodyDesign } from '../data/bodies';
import { isStocked } from '../data/progression';
test('レジェンド4人の愛機は独自名・異なるボディ・有効な装備。最高称号で初めて5位圏内へ',()=>{
  assert.equal(legends.length,4);assert.equal(new Set(legends.map(l=>l.machine)).size,4);
  assert.equal(new Set(legends.map(l=>l.equipment.body)).size,4);
  for(const l of legends){for(const id of Object.values(l.equipment))assert.ok(parts.some(p=>p.id===id));assert.ok(machinePerformance(l.equipment).freeSpeed>0);}
  const peak=proficiencyRanks.at(-1)!.points;
  for(const points of [0,100,520,peak-1])assert.ok(proficiencyStandings(points).findIndex(p=>p.id==='player')>=5);
  assert.equal(proficiencyStandings(peak)[4].id,'player');
  assert.deepEqual(proficiencyStandings(peak).slice(0,4).map(p=>p.id),legends.map(l=>l.id));
  assert.ok(fixtures.some(f=>f.kind==='legends'));
});
test('レジェンド専用ボディは流麗・ウェッジ・国産GTを描き分け、上位店でも非売品',()=>{
  const expected={'legend-rei':'flow','legend-gaku':'wedge','legend-koya':'muscle'};
  for(const [id,shape]of Object.entries(expected)){
    const legend=legends.find(l=>l.id===id)!;
    assert.equal(bodyDesign(legend.equipment.body).silhouette,shape);
    assert.equal(isStocked(parts.find(p=>p.id===legend.equipment.body)!,{name:'上位店',maxPartLevel:10}),false);
  }
});
test('展示を開閉しても所持金・装備・進行は変化しない',()=>{
  const previous=useGame.getState();try{
    const before=snapshotGame(previous);useGame.getState().openLegends();assert.equal(useGame.getState().overlay,'legends');
    useGame.getState().close();assert.deepEqual(snapshotGame(useGame.getState()),before);
  }finally{useGame.setState(previous);}
});
