import {test} from 'node:test';import assert from 'node:assert/strict';
import {parts} from '../data/parts';import {motorOutput,partStats,partSummary} from '../data/partStats';import {modelShops} from '../data/world';import {isStocked} from '../data/progression';
const part=(id:string)=>parts.find(p=>p.id===id)!;
test('モーターの回転数・トルクと単体理論出力を表示し、役割の違いを見分けられる',()=>{
 const stock=part('motor-stock'),rev=part('motor-rev'),torque=part('motor-torque'),peers=[stock,rev,torque];
 assert.ok(Math.abs(motorOutput(stock)-.4398229715)<1e-8);
 const stats=(id:string)=>Object.fromEntries(partStats(part(id),peers,stock).map(m=>[m.id,m]));
 assert.ok(stats('motor-rev').rpm.score>stats('motor-torque').rpm.score);assert.ok(stats('motor-torque').torque.score>stats('motor-rev').torque.score);
 assert.equal(stats('motor-stock').rpm.display,'14,000 rpm');assert.equal(stats('motor-stock').torque.display,'1.2 mN·m');assert.ok(stats('motor-stock').power.display.includes('W'));assert.equal(stats('motor-rev').rpm.reference?.display,'14,000 rpm');
});
test('ローラーは架空のrpmではなく摩擦・安定・制振で比較する。軽い回転ほど長い棒になる',()=>{
 const peers=['roller-0','roller-1','roller-2'].map(part),smooth=partStats(part('roller-2'),peers),rubber=partStats(part('roller-1'),peers);
 assert.ok(smooth.find(m=>m.id==='friction')!.score>rubber.find(m=>m.id==='friction')!.score);assert.ok(smooth.every(m=>!m.display.includes('rpm')));assert.equal(smooth.find(m=>m.id==='stability')!.value,1);
});
test('ギアとタイヤは速さと安定・駆動力の交換関係を逆向きの棒で示す',()=>{
 const peers=['gear-3.5','gear-4','gear-5'].map(part),fast=partStats(peers[0],peers),force=partStats(peers[2],peers);assert.ok(fast.find(m=>m.id==='speed')!.score>force.find(m=>m.id==='speed')!.score);assert.ok(fast.find(m=>m.id==='force')!.score<force.find(m=>m.id==='force')!.score);
 const tires=['tire-1','tire-2'].map(part),soft=partStats(tires[0],tires),hard=partStats(tires[1],tires);assert.ok(soft.find(m=>m.id==='grip')!.score>hard.find(m=>m.id==='grip')!.score);assert.ok(soft.find(m=>m.id==='scrub')!.score<hard.find(m=>m.id==='scrub')!.score);assert.ok(soft.find(m=>m.id==='rebound')!.score<hard.find(m=>m.id==='rebound')!.score);
});
test('全店舗・全種類のグラフが有効で、残量固定と有限の容量を混同しない',()=>{
 for(const shop of Object.values(modelShops)){const stock=parts.filter(p=>isStocked(p,shop));for(const p of stock){const stats=partStats(p,stock);assert.ok(stats.length>0,p.id);for(const m of stats){assert.ok(Number.isFinite(m.score)&&m.score>=0&&m.score<=100,`${p.id}:${m.id}`);assert.ok(m.display&&!m.display.includes('NaN')&&!m.display.includes('undefined'));}}}
 const peers=['battery-basic','battery-recharge'].map(part),fixed=partStats(peers[1],peers).find(m=>m.id==='capacity')!,finite=partStats(peers[0],peers).find(m=>m.id==='capacity')!;assert.equal(fixed.display,'無制限');assert.equal(fixed.score,100);assert.ok(finite.score<fixed.score);assert.equal(finite.display,'12分相当');
});
test('特徴は短い一文に整理し、専売・店舗案内・価格の繰り返しを表示しない',()=>{
 for(const p of parts){const summary=partSummary(p);assert.ok(summary.length>0&&summary.length<=40,`${p.id}:${summary}`);assert.doesNotMatch(summary,/専売|限定|模型店|非売品|円|所持|購入/);}
 assert.ok(partSummary(part('accessory-brake-hard')).includes('制動'));assert.ok(partSummary(part('chassis-hoshi-fm')).includes('前寄り重心'));assert.ok(partSummary(part('accessory-none')).includes('外して'));
});
