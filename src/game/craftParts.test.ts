import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {craftStages,craftStageFor,isCraftPart} from '../data/craftParts';
import {hiddenCrafts} from '../data/hiddenCrafts';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {townBlocks,townVenues,townSpawn,townWalkBounds} from '../data/world';
import {townPeople} from '../data/townPeople';
import {townCrowdObstacles,crowdFootprint} from '../data/townCrowd';
import {isStocked} from '../data/progression';
import {parts} from '../data/parts';
import {useGame} from './store';
import {snapshotGame,decodeSave} from './saveData';
import {loadSavedGame} from './autoSave';
import {canStand,canTravel,findWalkingPath} from './navigation';
import {buildMachineModel} from './MachineModel';
import {buildRaceMachineModel} from './MachineModel';
import {createRaceState} from './race';
import {disposeSceneResources} from './modelFinish';
import {machinePerformance} from './driving';

test('2人の職人は別々の建物裏にいて、群衆を避けて歩いて到達できる',()=>{
 const obstacles=[...[...townVenues,...townBlocks].map(b=>({x:b.x,y:b.y,width:b.w,height:b.h})),...[...townPeople,hiddenMechanicSpot,...hiddenCrafts].map(crowdFootprint),...townCrowdObstacles];
 assert.ok(Math.hypot(hiddenCrafts[0].x-hiddenCrafts[1].x,hiddenCrafts[0].y-hiddenCrafts[1].y)>=1000);
 for(const person of hiddenCrafts){const target={x:person.x,y:person.y+32},start=townSpawn('komorebi');assert.ok(canStand(target,obstacles,townWalkBounds));const path=findWalkingPath(start,target,obstacles,townWalkBounds);assert.deepEqual(path.at(-1),target);let p=start;for(const q of path){assert.ok(canTravel(p,q,obstacles,townWalkBounds));p=q;}assert.ok(!townVenues.some(v=>v.id===person.kind));}
});
test('無料贈呈は一度だけ、未発見には付与されず、所持していれば自動成長する',()=>{
 const before=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',proficiencyPoints:100},true);
  assert.ok(!Object.keys(useGame.getState().inventory).some(id=>isCraftPart(id,'body')||isCraftPart(id,'chassis')));
  for(const kind of ['body','chassis'] as const){useGame.getState().talkCraftsperson(kind);assert.equal(useGame.getState().inventory[craftStageFor(100)[kind]],1);useGame.getState().close();const once=snapshotGame(useGame.getState());useGame.getState().talkCraftsperson(kind);useGame.getState().close();assert.deepEqual(snapshotGame(useGame.getState()),once);}
  useGame.setState({location:'komorebi'});useGame.getState().openSetting();for(const kind of ['body','chassis'] as const)useGame.getState().equip(craftStageFor(100)[kind],kind);
  useGame.setState({proficiencyPoints:750});for(const kind of ['body','chassis'] as const){assert.equal(useGame.getState().equipment[kind],craftStageFor(750)[kind]);assert.equal(useGame.getState().inventory[craftStageFor(750)[kind]],1);}
  useGame.setState({overlay:'race',proficiencyPoints:1601});for(const kind of ['body','chassis'] as const)assert.equal(useGame.getState().equipment[kind],craftStageFor(750)[kind]);
  useGame.setState({overlay:null});for(const kind of ['body','chassis'] as const)assert.equal(useGame.getState().equipment[kind],craftStageFor(1601)[kind]);
  const saved=snapshotGame(useGame.getState());assert.deepEqual(decodeSave({version:1,savedAt:123,game:saved}).game,saved);
  const invalid=structuredClone(saved);invalid.inventory[craftStages[0].body]=1;assert.throws(()=>decodeSave({version:1,savedAt:123,game:invalid}),/職人パーツ/);
  assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...saved,proficiencyPoints:1600}}),/職人パーツ/);
  for(const s of craftStages)for(const id of [s.body,s.chassis])assert.equal(isStocked(parts.find(p=>p.id===id)!,{name:'全品店',maxPartLevel:10}),false);
 }finally{useGame.setState(before,true);}
});
test('未装着でも成長し、未発見のもう一方や他の装備と所持金は変わらない',()=>{
 const before=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',money:1234},true);
  const equipment={...useGame.getState().equipment};useGame.getState().talkCraftsperson('body');useGame.getState().close();
  useGame.setState({proficiencyPoints:1400});const state=useGame.getState();
  assert.deepEqual(state.equipment,equipment);assert.equal(state.money,1234);assert.equal(state.inventory[craftStageFor(1400).body],1);
  assert.ok(!Object.keys(state.inventory).some(id=>isCraftPart(id,'chassis')));
  assert.equal(craftStageFor(1600).level,8);assert.equal(craftStageFor(1601).level,9);
 }finally{useGame.setState(before,true);}
});
test('レース中に保存した未反映の成長は再開後に追いつく',async()=>{
 const before=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town'},true);useGame.getState().talkCraftsperson('body');useGame.getState().close();
  useGame.setState({overlay:'race',proficiencyPoints:520});const saved=decodeSave({version:1,savedAt:123,game:snapshotGame(useGame.getState())});
  assert.equal(saved.game.inventory[craftStages[0].body],1);
  await loadSavedGame({read:async()=>saved,write:async()=>{}});
  assert.equal(useGame.getState().inventory[craftStageFor(520).body],1);
  assert.ok(!Object.keys(useGame.getState().inventory).some(id=>isCraftPart(id,'chassis')));
 }finally{useGame.setState(before,true);}
});
test('レース報酬の熟練度では終了まで据え置き、練習後も本編の所持を保つ',()=>{
 const before=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',proficiencyPoints:99},true);
  for(const kind of ['body','chassis'] as const){useGame.getState().talkCraftsperson(kind);useGame.getState().close();}
  useGame.setState({location:'komorebi'});useGame.getState().openSetting();for(const kind of ['body','chassis'] as const)useGame.getState().equip(craftStages[0][kind],kind);useGame.getState().close();useGame.getState().startTrial();
  const attempt=useGame.getState().raceAttempt,race=createRaceState(useGame.getState().equipment);race.phase='finished';race.racers=race.racers.map((p,i)=>({...p,driving:{...p.driving,status:'finished',time:40+i}}));
  useGame.getState().settleRace(attempt,race);assert.ok(useGame.getState().proficiencyPoints>=100);
  for(const kind of ['body','chassis'] as const)assert.equal(useGame.getState().equipment[kind],craftStages[0][kind]);
  useGame.getState().close();for(const kind of ['body','chassis'] as const)assert.equal(useGame.getState().equipment[kind],craftStageFor(useGame.getState().proficiencyPoints)[kind]);
  const saved=snapshotGame(useGame.getState());useGame.getState().startTutorial(true);assert.deepEqual(snapshotGame(useGame.getState()),saved);useGame.getState().finishTutorial();assert.deepEqual(snapshotGame(useGame.getState()),saved);
 }finally{useGame.setState(before,true);}
});
test('職人ボディとシャーシは成長段階で専用の立体部品を描く',()=>{
 for(const level of [0,2,5,8]){
  const state=useGame.getInitialState(),model=buildMachineModel(0x63b6b4,{...state.equipment,body:craftStages[level].body,chassis:craftStages[level].chassis});
  assert.ok(model.getObjectByName('craft-cowl-stripe'));assert.equal(!!model.getObjectByName('craft-side-fin'),level>=2);assert.equal(!!model.getObjectByName('craft-rear-fin'),level>=5);assert.equal(!!model.getObjectByName('craft-crown-fin'),level>=8);
  model.traverse(o=>{if(o instanceof THREE.Mesh)for(const n of o.geometry.getAttribute('position').array)assert.ok(Number.isFinite(n));});disposeSceneResources(model);
  const race=buildRaceMachineModel(createRaceState({...state.equipment,body:craftStages[level].body,chassis:craftStages[level].chassis}).racers[0]);
  assert.ok(race.getObjectByName('craft-cowl-stripe'));assert.equal(!!race.getObjectByName('craft-crown-fin'),level>=8);disposeSceneResources(race);
 }
});
test('初期は入門装備に近く、最終段階も悪路専用車や星皇と使い分ける',()=>{
 const base=useGame.getInitialState().equipment,first={...base,body:craftStages[0].body,chassis:craftStages[0].chassis},last={...base,body:craftStages[8].body,chassis:craftStages[8].chassis};
 const stock=machinePerformance(base),initial=machinePerformance(first),ultimate=machinePerformance(last);
 assert.equal(initial.mass,stock.mass);assert.ok(ultimate.mass<initial.mass);
 const part=(id:string)=>parts.find(p=>p.id===id)!;
 assert.ok(part(craftStages[8].body).specs.drag>part('body-sovereign').specs.drag);
 assert.ok(part(craftStages[8].body).specs.roughGrip<part('body-rally').specs.roughGrip);
 assert.ok(part(craftStages[8].chassis).specs.efficiency<part('chassis-sovereign').specs.efficiency);
});
