import test from 'node:test';import assert from 'node:assert/strict';
import {legacyCup} from './cup';
import {useGame} from './store';import {snapshotGame,decodeSave} from './saveData';import {loadSavedGame} from './autoSave';
import {officialVenue,officialVenueFixtures,officialVenuePeople} from '../data/officialVenue';import {townSpawn,townVenues} from '../data/world';import {nextShopRace} from '../data/shopHints';import {findWalkingPath,canTravel} from './navigation';
const initial=()=>({...useGame.getInitialState(),location:'town' as const,lastShop:'hinata' as const,legendRaceCompleted:true,aozoraWon:true,villainDefeated:true,officialQualified:true,unlockedRaces:[nextShopRace.id]});
test('公式戦は会場内からのみ開始。出場権で入場し、二戦目を先に開始できず、ピット後に再登録できる',()=>{
 const original=useGame.getState();try{
  useGame.setState({...initial(),officialQualified:false});useGame.getState().enterOfficialVenue();assert.equal(useGame.getState().location,'town');
  useGame.setState(initial());useGame.getState().startOfficialRace();assert.equal(useGame.getState().overlay,null);useGame.getState().openOfficialRace();assert.equal(useGame.getState().dialogueStage,'none');useGame.getState().close();
  useGame.getState().enterOfficialVenue();assert.equal(useGame.getState().location,'stadium-5');useGame.getState().startTrial();assert.equal(useGame.getState().overlay,null);
  useGame.getState().openOfficialRace('dirt');assert.equal(useGame.getState().dialogueStage,'none');assert.match(useGame.getState().dialogue,/第1戦/);useGame.getState().close();
  useGame.getState().openOfficialRace('speed');assert.equal(useGame.getState().dialogueStage,'official-invite');useGame.getState().openSetting();useGame.getState().close();useGame.getState().openOfficialRace('speed');useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialRound,'speed');
  useGame.getState().close();assert.equal(useGame.getState().location,'stadium-5');useGame.getState().close();useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().townReturnVenue,'stadium-5');
  const venue=townVenues.find(v=>v.id==='stadium-5')!;assert.ok(townSpawn('stadium-5').y<venue.y);
 }finally{useGame.setState(original,true);}
});
test('会場の現在地と戦間の進行を保存し、再読込後も会場から復帰。未資格の会場セーブは拒否',async()=>{
 const original=useGame.getState();try{
  useGame.setState({...initial(),location:'stadium-5',officialSpeedWon:true,wakabaCup:legacyCup(true,false)});const save=decodeSave({version:1,savedAt:100,game:snapshotGame(useGame.getState())});
  await loadSavedGame({read:async()=>save,write:async()=>{}});assert.equal(useGame.getState().location,'stadium-5');useGame.getState().openOfficialRace('dirt');useGame.getState().startOfficialRace();assert.equal(useGame.getState().officialRound,'dirt');
  assert.throws(()=>decodeSave({...save,game:{...save.game,officialQualified:false,officialSpeedWon:false}}),/公式会場/);
  useGame.getState().close();useGame.getState().close();useGame.getState().leaveShop();assert.equal(decodeSave({version:1,savedAt:101,game:snapshotGame(useGame.getState())}).game.townReturnVenue,'stadium-5');
 }finally{useGame.setState(original,true);}
});
test('専用会場に2コース・ピット・受付・4人の対戦相手を配置し、全調査対象まで障害物を避けて歩ける',()=>{
 assert.equal(officialVenueFixtures.filter(f=>f.kind.startsWith('official-')&&f.kind!=='official-reception').length,2);
 assert.deepEqual(officialVenuePeople.filter(p=>p.id!=='staff').map(p=>p.id),['riku','go','sou','ren']);
 const obstacles=[...officialVenueFixtures.map(f=>({x:f.x,y:f.y,width:f.w,height:f.h})),...officialVenuePeople.map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];
 for(const target of [...officialVenueFixtures.filter(f=>f.kind!=='decoration').map(f=>({x:f.x+f.w/2,y:f.y+f.h/2})),...officialVenuePeople.map(p=>({x:p.x,y:p.y})),{x:480,y:575}]){
  const path=findWalkingPath(officialVenue.spawn,target,obstacles);assert.ok(path.length>0);let before=officialVenue.spawn;for(const point of path){assert.ok(canTravel(before,point,obstacles));before=point;}
 }
});
