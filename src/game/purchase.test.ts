import { test } from 'node:test';
import assert from 'node:assert/strict';
import { purchase } from './purchase';
test('購入で所持金と所持数を更新し、元の状態は変更しない',()=>{
  const initial={money:1000,inventory:{}};
  const first=purchase(initial,'motor-rev');
  assert.equal(first.wallet.money,150); assert.equal(first.wallet.inventory['motor-rev'],1); assert.equal(initial.money,1000);
  const second=purchase(first.wallet,'motor-rev'); assert.equal(second.success,false); assert.equal(second.wallet,first.wallet);
});
test('不明な商品は購入できず、同じ商品を複数所持できる',()=>{
  const initial={money:1000,inventory:{'shaft-0':1}};
  assert.equal(purchase(initial,'missing').success,false);
  assert.equal(purchase(initial,'shaft-0').wallet.inventory['shaft-0'],2);
});
