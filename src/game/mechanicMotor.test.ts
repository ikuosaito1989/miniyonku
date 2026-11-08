import {test} from 'node:test';import assert from 'node:assert/strict';
import {useGame} from './store';import {snapshotGame,decodeSave} from './saveData';
import {mechanicMasterPoints,mechanicMotorFor,mechanicMotorStages,isMechanicMotor} from '../data/mechanicMotor';
import {proficiencyStandings} from '../data/proficiency';import {parts} from '../data/parts';import {isStocked} from '../data/progression';
import {motorFactor,motorWear} from './condition';import {machinePerformance} from './driving';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';import {townSpawn,townWalkBounds,townVenues,townBlocks} from '../data/world';
import {townPeople} from '../data/townPeople';import {canStand,findWalkingPath} from './navigation';import {createRaceState} from './race';
const gifts=()=>Object.keys(useGame.getState().inventory).filter(id=>isMechanicMotor(id)&&useGame.getState().inventory[id]>0);
test('路地の職人は最初から歩いて到達でき、通常の地図に登録されない',()=>{
 const obstacles=[...townVenues,...townBlocks].map(b=>({x:b.x,y:b.y,width:b.w,height:b.h}));
 assert.ok(canStand(hiddenMechanicSpot,obstacles,townWalkBounds));
 for(const p of [...townPeople,hiddenMechanicSpot])obstacles.push({x:p.x-12,y:p.y-9,width:24,height:21});
 const approach={x:hiddenMechanicSpot.x,y:hiddenMechanicSpot.y+32};assert.ok(canStand(approach,obstacles,townWalkBounds));assert.ok(findWalkingPath(townSpawn('komorebi'),approach,obstacles,townWalkBounds).length);
 assert.ok(!townVenues.some(v=>v.id==='mechanic-man'));
});
test('発見時は無料で一個だけ受け取り、通常装備や個体の状態を保持する',()=>{
 const before=useGame.getState();try{
 useGame.setState({...useGame.getInitialState(),location:'town',money:0},true);const original=snapshotGame(useGame.getState());useGame.getState().talkMechanicMan();
 assert.deepEqual(gifts(),[mechanicMotorFor(0).id]);assert.deepEqual(useGame.getState().equipment,original.equipment);assert.equal(useGame.getState().money,0);assert.deepEqual(useGame.getState().units['motor-stock'],original.units['motor-stock']);
 const once=snapshotGame(useGame.getState());useGame.getState().close();useGame.getState().talkMechanicMan();assert.deepEqual(snapshotGame(useGame.getState()),once);
 assert.deepEqual(decodeSave({version:1,savedAt:123,game:once}).game,once);
 for(const id of gifts())assert.equal(isStocked(parts.find(p=>p.id===id)!,{name:'全品店',maxPartLevel:10}),false);
 }finally{useGame.setState(before,true);}
});
test('熟練度だけで外していても自動成長、装着中は一個と選択個体を引き継ぐ',()=>{
 const before=useGame.getState();try{
 useGame.setState({...useGame.getInitialState(),location:'town'},true);useGame.getState().talkMechanicMan();useGame.getState().close();
 useGame.setState({proficiencyPoints:520});assert.deepEqual(gifts(),[mechanicMotorFor(520).id]);assert.equal(useGame.getState().equipment.motor,'motor-stock');
 useGame.setState({location:'komorebi'});useGame.getState().openSetting();useGame.getState().equip(gifts()[0],'motor');const unit=useGame.getState().selectedUnits.motor;
 useGame.setState({proficiencyPoints:1400});assert.deepEqual(gifts(),[mechanicMotorFor(1400).id]);assert.equal(useGame.getState().equipment.motor,gifts()[0]);assert.equal(useGame.getState().selectedUnits.motor,unit);assert.equal(useGame.getState().inventory['motor-stock'],1);
 useGame.getState().breakIn();assert.equal(useGame.getState().units[gifts()[0]][0].seconds,0);assert.match(useGame.getState().notice,/ブレークインは不要/);
 }finally{useGame.setState(before,true);}
});
test('レース中の熟練度上昇では装備を替えず、終了して戻ったときに反映する',()=>{
 const before=useGame.getState();try{
 useGame.setState({...useGame.getInitialState(),location:'town',proficiencyPoints:99},true);useGame.getState().talkMechanicMan();useGame.getState().close();useGame.setState({location:'komorebi'});useGame.getState().openSetting();useGame.getState().equip(gifts()[0],'motor');useGame.getState().close();useGame.getState().startTrial();
 const attempt=useGame.getState().raceAttempt,race=createRaceState(useGame.getState().equipment);race.phase='finished';race.racers=race.racers.map((p,i)=>({...p,driving:{...p.driving,status:'finished',time:40+i}}));
 useGame.getState().settleRace(attempt,race);assert.ok(useGame.getState().proficiencyPoints>=100);assert.equal(useGame.getState().equipment.motor,mechanicMotorFor(99).id);assert.equal(useGame.getState().overlay,'race');
 useGame.getState().close();assert.equal(useGame.getState().equipment.motor,mechanicMotorFor(useGame.getState().proficiencyPoints).id);assert.equal(useGame.getState().raceAttempt,attempt);
 }finally{useGame.setState(before,true);}
});
test('称号マスターや同点1位では最高級にならず、ランキング単独1位で初めて最高段階',()=>{
 assert.equal(mechanicMasterPoints,1601);assert.notEqual(proficiencyStandings(750)[0].id,'player');assert.notEqual(proficiencyStandings(1600)[0].id,'player');assert.equal(proficiencyStandings(1601)[0].id,'player');
 const best=mechanicMotorStages.at(-1)!;assert.notEqual(mechanicMotorFor(1600).id,best.id);assert.equal(mechanicMotorFor(1601).id,best.id);
 const premium=parts.find(p=>p.id==='motor-sovereign')!;for(const stage of mechanicMotorStages.slice(0,-1)){assert.ok(stage.rpm<premium.specs.rpm);assert.ok(stage.torque<premium.specs.torque);}
 assert.equal(best.rpm,parts.find(p=>p.id==='motor-tempest')!.specs.rpm);assert.ok(best.torque>=Math.max(...parts.filter(p=>p.category==='motor'&&p.id!=='motor-sovereign'&&!p.id.startsWith('motor-mechanic-')).map(p=>p.specs.torque)));
 for(const stage of mechanicMotorStages)for(const seconds of [0,60,1200,100000]){assert.equal(motorFactor(seconds,stage.id),1);assert.equal(motorWear(seconds,stage.id),0);}
 const equipment={...useGame.getInitialState().equipment,motor:best.id};const fresh=machinePerformance(equipment),old=machinePerformance(equipment,{motorSeconds:100000,batterySeconds:0});assert.equal(fresh.freeSpeed,old.freeSpeed);assert.equal(fresh.stallForce,old.stallForce);
});
test('熟練度不相応の最高段階と複数所持を拒否し、練習で本編のモーターを変更しない',()=>{
 const before=useGame.getState();try{
 useGame.setState({...useGame.getInitialState(),location:'town',proficiencyPoints:1601},true);useGame.getState().talkMechanicMan();useGame.getState().close();const baseline=snapshotGame(useGame.getState());
 assert.throws(()=>decodeSave({version:1,savedAt:123,game:{...baseline,proficiencyPoints:1600}}),/成長モーター/);
 const duplicate=structuredClone(baseline),low=mechanicMotorStages[0].id;duplicate.inventory[low]=1;duplicate.units[low]=[{id:'extra-gift',seconds:0}];assert.throws(()=>decodeSave({version:1,savedAt:123,game:duplicate}),/成長モーター/);
 useGame.getState().startTutorial(true);assert.deepEqual(snapshotGame(useGame.getState()),baseline);useGame.getState().finishTutorial();assert.deepEqual(snapshotGame(useGame.getState()),baseline);assert.equal(gifts().length,1);
 }finally{useGame.setState(before,true);}
});
