import { test } from 'node:test';
import assert from 'node:assert/strict';
import { proficiency,breakInPractice,proficiencyStandings } from '../data/proficiency';
import { useGame } from './store';
import { createRaceState } from './race';
import { starterEquipment } from '../data/machine';
import { createStarterUnits } from './condition';

test('熟練度表は経験に応じて称号を進め、最高段階で止まる',()=>{
  assert.equal(proficiency(0).rank.name,'かけだし');assert.equal(proficiency(9).remaining,1);
  assert.equal(proficiency(10).index,1);assert.equal(proficiency(15).progress,.25);
  assert.equal(proficiency(9999).rank.name,'マスター');assert.equal(proficiency(9999).remaining,0);
  assert.equal(proficiency(-10).index,0);
});
test('有効な慣らしだけ経験を得て、ピーク後の無駄な慣らしでは稼げない',()=>{
  assert.equal(breakInPractice(0,30),1);assert.equal(breakInPractice(30,30),1);
  assert.equal(breakInPractice(45,30),.5);assert.equal(breakInPractice(60,30),0);
});
test('熟練度順位は経験の増加に追従し、同点でも順序が再現可能',()=>{
  assert.equal(proficiencyStandings(0).at(-1)?.id,'player');
  assert.equal(proficiencyStandings(100).findIndex(p=>p.id==='player')+1,9);
  assert.ok(proficiencyStandings(749).findIndex(p=>p.id==='player')+1>5);
  assert.equal(proficiencyStandings(750).findIndex(p=>p.id==='player')+1,5);
  assert.deepEqual(proficiencyStandings(20),proficiencyStandings(20));
});
test('完走・優勝の熟練度は試行につき一回だけ。待機や途中報告では増えない',()=>{
  const original=useGame.getState();
  try{
    useGame.setState({proficiencyPoints:0,equipment:{...starterEquipment},units:createStarterUnits(),selectedUnits:{motor:'starter-motor',battery:'starter-battery'}});
    useGame.getState().startTrial();const attempt=useGame.getState().raceAttempt;
    let race=createRaceState(starterEquipment);useGame.getState().settleRace(attempt,race);
    assert.equal(useGame.getState().proficiencyPoints,0);
    race={...race,phase:'finished',playerStartOffset:0,racers:race.racers.map((r,i)=>({...r,driving:{...r.driving,time:40+i,status:'finished'}}))};
    useGame.getState().settleRace(attempt,race);useGame.getState().settleRace(attempt,race);
    assert.equal(useGame.getState().proficiencyPoints,10);
    useGame.getState().openProficiency();assert.equal(useGame.getState().overlay,'proficiency');
    useGame.getState().close();assert.equal(useGame.getState().proficiencyPoints,10);
    useGame.getState().openSetting();useGame.getState().breakIn();assert.ok(useGame.getState().proficiencyPoints>10);
  }finally{useGame.setState(original);}
});
