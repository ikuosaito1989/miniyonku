import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchase } from './purchase';
test('購入で所持金と所持数を更新し、元の状態は変更しない',()=>{
  const initial={money:1000,inventory:{}};
  const first=purchase(initial,'motor-rev');
  assert.equal(first.wallet.money,150); assert.equal(first.wallet.inventory['motor-rev'],1); assert.equal(initial.money,1000);
  const second=purchase(first.wallet,'motor-rev'); assert.equal(second.success,false); assert.equal(second.wallet,first.wallet);
});
test('不明な商品・所持済みの同じパーツは購入できず、代金も引かれない',()=>{
  const initial={money:1000,inventory:{'shaft-0':1}};
  assert.equal(purchase(initial,'missing').success,false);
  const duplicate=purchase(initial,'shaft-0');assert.equal(duplicate.success,false);assert.equal(duplicate.wallet,initial);assert.match(duplicate.message,/所持済み/);
});

test('全カテゴリで同一種類は1個まで、消耗品の再購入は新品交換として許可する',async()=>{
 const {parts}=await import('../data/parts');const {isStocked}=await import('../data/progression');const {modelShops}=await import('../data/world');
 for(const part of parts.filter(p=>p.price>0)){
 const shop=part.id.endsWith('sovereign')?modelShops.atelier:{name:'上位店',maxPartLevel:10};if(!isStocked(part,shop))continue;
 const initial={money:1000000,inventory:{}};const first=purchase(initial,part.id,shop);assert.ok(first.success,part.id);
 const second=purchase(first.wallet,part.id,shop),replaceable=part.category==='motor'||part.category==='battery';
 assert.equal(second.success,replaceable,part.id);assert.equal(second.wallet.inventory[part.id],1);assert.equal(second.wallet.money,first.wallet.money-(replaceable?part.price:0));
 }
});
