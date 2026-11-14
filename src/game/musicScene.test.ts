import test from 'node:test';import assert from 'node:assert/strict';
import {selectMusicScene} from './musicScene';import {useGame} from './store';
test('兄弟・黒岩・博士は登場からイベント会話まで同じ曲、レースと通常場面は元の曲へ戻る',()=>{
 const base={...useGame.getInitialState(),location:'town' as const};
 for(const kind of ['legend','villain','doctor'] as const)assert.equal(selectMusicScene({...base,overlay:'arrival',arrivalEvent:kind}),'event');
 for(const dialogueStage of ['legend-intro','legend-invite','legend-debrief','villain-intro','villain-win','villain-loss','doctor-gift','official-invite'] as const)assert.equal(selectMusicScene({...base,overlay:'dialogue',dialogueStage}),'event');
 for(const speaker of ['風見 怜','火野 岳','黒岩 豪','青葉 源蔵'])assert.equal(selectMusicScene({...base,overlay:'dialogue',speaker}),'event');
 assert.equal(selectMusicScene({...base,overlay:'race',speaker:'黒岩 豪',dialogueStage:'villain-intro'}),'race');
 assert.equal(selectMusicScene({...base,overlay:'race',officialChallengeActive:true}),'official');
 for(const location of ['stadium-5','stadium-9','stadium-10','stadium-7'] as const)assert.equal(selectMusicScene({...base,overlay:'race',location,officialChallengeActive:false}),'official');
 for(const overlay of ['escort','towa-escort'] as const)assert.equal(selectMusicScene({...base,overlay}),'event');
 assert.equal(selectMusicScene({...base,overlay:'podium',officialChallengeActive:true}),'podium');
 for(const overlay of [null,'setting','shop','settings'] as const)assert.equal(selectMusicScene({...base,overlay,speaker:'青葉 源蔵',dialogueStage:'doctor-gift'}),'shop');
 assert.equal(selectMusicScene({...base,overlay:'dialogue',speaker:'佐伯 匠'}),'shop');
});
test('模型店では専用 BGM、街や専門店では従来の BGM を使う',()=>{
 const base=useGame.getInitialState();
 for(const location of ['komorebi','aozora','hinata','wakaba','yuunagi','akatsuki','hoshikuzu'] as const)assert.equal(selectMusicScene({...base,location,overlay:null}),'model-shop');
 for(const location of ['town','library','torque','stadium-5'] as const)assert.equal(selectMusicScene({...base,location,overlay:null}),'shop');
 assert.equal(selectMusicScene({...base,location:'komorebi',overlay:'race'}),'race');
});
