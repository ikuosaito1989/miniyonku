import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parts, categories } from '../data/parts';
import { MAX_PART_LEVEL,partLevels,isStocked,starterShop } from '../data/progression';
import { starterEquipment } from '../data/machine';
import { rivals } from '../data/rivals';
import { purchase } from './purchase';

test('全パーツに1〜10のレベルがあり、初期装備はLv.1、入門店はLv.2まで',()=>{
  assert.equal(MAX_PART_LEVEL,10);assert.equal(starterShop.maxPartLevel,2);
  for(const part of parts){assert.ok(Number.isInteger(part.level)&&part.level>=1&&part.level<=10);assert.equal(part.level,partLevels[part.id]);}
  assert.ok(parts.some(p=>p.level===10));
  for(const id of Object.values(starterEquipment))assert.equal(parts.find(p=>p.id===id)?.level,1);
  for(const category of Object.keys(categories).filter(category=>category!=='body'))assert.ok(parts.some(p=>p.category===category&&p.level===2&&isStocked(p)));
  for(const rival of rivals)for(const id of Object.values(rival.equipment))assert.ok(parts.find(p=>p.id===id)!.level<=2);
});
test('店頭と購入ロジックが共通の販売制限を使い、上位パーツは資金があっても買えない',()=>{
  const wallet={money:100000,inventory:{}};
  for(const part of parts){const result=purchase(wallet,part.id);assert.equal(result.success,isStocked(part));if(!isStocked(part))assert.equal(result.wallet,wallet);}
  const top=parts.find(p=>p.level===10)!;
  assert.equal(purchase(wallet,top.id).success,false);
  assert.equal(purchase(wallet,top.id,{name:'テスト上位店',maxPartLevel:10}).success,true);
});
test('初優勝記念ボディはLv.10相当の非売品として受け取る',()=>{
  const reward=parts.find(part=>part.id==='body-champion')!;
  assert.equal(reward.level,10);
  assert.equal(isStocked(reward,{name:'最上位店',maxPartLevel:10}),false);
});
test('コンパクトボディは既存セーブ互換性を保ちながら店頭から外す',()=>{
  const compact=parts.find(part=>part.id==='body-entry')!;
  assert.equal(isStocked(compact),false);
  assert.equal(isStocked(compact,{name:'上位店',maxPartLevel:10}),false);
});
