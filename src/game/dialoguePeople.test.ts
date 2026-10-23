import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dialogueChoices, dialoguePeople, dialoguePerson } from '../data/dialoguePeople';
import { story, shopVisitors } from '../data/story';

test('実際の話者表記から店主・来店客・兄弟の顔を選び、空白の違いを吸収する',()=>{
  assert.equal(dialoguePerson(`店主 ${story.owner}`),'owner');
  assert.equal(dialoguePerson(story.rival),'rival');
  for(const visitor of shopVisitors)assert.equal(dialoguePerson(visitor.name),visitor.kind);
  assert.equal(dialoguePerson('小野寺　春夫'),'owner');
  assert.equal(dialoguePerson('モーターパーツ棚'),null);
  assert.equal(dialoguePerson('セッティング本棚 1 / 6・はじめての走行会'),null);
  assert.equal(dialoguePerson('青井 晴彦'),'aozoraOwner');
  assert.equal(new Set(Object.values(dialoguePeople).map(person=>person.name)).size,Object.keys(dialoguePeople).length);
});
test('店主の承諾だけショップへ進み、断る・一般会話・本棚では閉じる',()=>{
  assert.deepEqual(dialogueChoices(true,false).map(choice=>choice.action),['advance','close']);
  assert.deepEqual(dialogueChoices(false,false).map(choice=>choice.action),['close']);
  assert.equal(dialogueChoices(false,true)[0].label,'本を閉じる');
});
test('店主は大人、モブは共通の小学生顔を使う',()=>{
  assert.equal(dialoguePeople.owner.ageGroup,'adult');
  for(const id of ['rival','guide','mechanic'] as const)assert.equal(dialoguePeople[id].ageGroup,'elementary');
  assert.equal(dialoguePeople.guide.faceBase,dialoguePeople.mechanic.faceBase);
  assert.match(dialoguePeople.mechanic.role,/小学生/);
});
