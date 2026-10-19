import { test } from 'node:test';
import assert from 'node:assert/strict';
import { raceSoundCue, RaceAudio } from './RaceAudio';
import { createRaceState, startRace, stepRace, COUNTDOWN_TICKS } from './race';
import { starterEquipment } from '../data/machine';

test('電子音は3・2・1・GOの順。描画頻度によらずカウントの変化を識別する',()=>{
  let race=startRace(createRaceState(starterEquipment));
  const cues=new Set<string>();
  for(let i=0;i<=COUNTDOWN_TICKS;i++){cues.add(raceSoundCue(race));race=stepRace(race);}
  assert.deepEqual([...cues],['3','2','1','go']);
  assert.equal(raceSoundCue({...race,phase:'finished'}),'finished');
});

test('音声非対応環境でunlockに失敗してもゲームを妨げない',()=>{
  const previous=Object.getOwnPropertyDescriptor(globalThis,'document');
  Object.defineProperty(globalThis,'document',{configurable:true,value:{hidden:false,addEventListener(){},removeEventListener(){}}});
  try{
    const audio=new RaceAudio();
    assert.doesNotThrow(()=>{audio.unlock();audio.update(startRace(createRaceState(starterEquipment)));audio.setEnabled(false);audio.dispose();});
  }finally{
    if(previous)Object.defineProperty(globalThis,'document',previous);else Reflect.deleteProperty(globalThis,'document');
  }
});
