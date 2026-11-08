import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parts,categories} from '../data/parts';
import {specGlossary,formatSpec,libraryGuides,librarySource,searchLibrary,zenithSetupGuide} from '../data/library';
import {townVenues,townBlocks,townSpawn,townWalkBounds,isVenueOpen,venueMessage} from '../data/world';
import {townPeople} from '../data/townPeople';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {findWalkingPath,canTravel} from './navigation';
import {useGame} from './store';
import {snapshotGame} from './saveData';
import {loadSavedGame} from './autoSave';
import {libraryShelves,libraryReadingDesk,librarySpawn,libraryExit,libraryObstacles} from '../data/libraryRoom';
test('未所持・後半・専用品・成長全段階を含む全種類を掲載し、すべての性能項目を説明する',()=>{
 assert.match(zenithSetupGuide.text,/4:1/);assert.match(zenithSetupGuide.text,/新品に交換/);
 assert.deepEqual(searchLibrary('all','').map(p=>p.id),parts.map(p=>p.id));
 for(const category of Object.keys(categories) as (keyof typeof categories)[]){assert.ok(libraryGuides[category].text.length>30);assert.deepEqual(searchLibrary(category,'').map(p=>p.id),parts.filter(p=>p.category===category).map(p=>p.id));}
 for(const p of parts){assert.ok(librarySource(p));for(const [key,value] of Object.entries(p.specs)){assert.ok(specGlossary[key],`${p.id}:${key}`);assert.ok(formatSpec(key,value));}}
 assert.equal(searchLibrary('all','ギア比').length,parts.filter(p=>p.category==='gear').length);assert.ok(searchLibrary('motor','トルク').length>0);assert.ok(searchLibrary('gear','４：１').some(p=>p.id==='gear-4'));assert.deepEqual(searchLibrary('motor','存在しない書籍'),[]);
 assert.equal(formatSpec('ratio',4),'4:1');assert.equal(formatSpec('damping',.38),'38 %');assert.equal(formatSpec('consumption',0),'×0');assert.match(librarySource(parts.find(p=>p.id==='motor-mechanic-8')!),/1601pt・単独1位/);
});
test('初期から歩ける館内へ入れ、棚の図鑑を閉じても館内に戻る。保存再開と街の出口も維持',async()=>{
 const original=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town',openingStep:9,tutorialStage:'done'},true);const before=snapshotGame(useGame.getState()),library=townVenues.find(v=>v.id==='library')!;assert.equal(isVenueOpen(library,useGame.getState()),true);assert.match(venueMessage(library),/最初から無料/);
  useGame.getState().enterLibrary();assert.equal(useGame.getState().location,'library');assert.equal(useGame.getState().overlay,null);assert.equal(useGame.getState().money,before.money);assert.deepEqual(useGame.getState().equipment,before.equipment);const inside=snapshotGame(useGame.getState());
  useGame.getState().openLibrary('gear');assert.equal(useGame.getState().overlay,'library');assert.equal(useGame.getState().libraryShelf,'gear');assert.deepEqual(snapshotGame(useGame.getState()),inside);useGame.getState().close();assert.equal(useGame.getState().location,'library');assert.equal(useGame.getState().overlay,null);
  const attempt=useGame.getState().raceAttempt;useGame.getState().startTrial();assert.equal(useGame.getState().raceAttempt,attempt);useGame.getState().buy('gear-4');assert.equal(useGame.getState().money,before.money);
  await loadSavedGame({read:async()=>({version:1,savedAt:123,game:inside}),write:async()=>{}});assert.equal(useGame.getState().location,'library');assert.equal(useGame.getState().overlay,null);
  useGame.getState().leaveShop();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().townReturnVenue,'library');assert.equal(useGame.getState().lastShop,before.lastShop);
  const outside=snapshotGame(useGame.getState());await loadSavedGame({read:async()=>({version:1,savedAt:123,game:outside}),write:async()=>{}});assert.equal(useGame.getState().townReturnVenue,'library');assert.deepEqual(townSpawn('library'),{x:library.x+library.w/2,y:library.y+library.h+42});
  useGame.setState({overlay:'race'});useGame.getState().enterLibrary();assert.equal(useGame.getState().overlay,'race');
 }finally{useGame.setState(original,true);}
});
test('館内は全11種類の本棚と閲覧台まで障害物を避けて往復できる',()=>{
 assert.deepEqual(libraryShelves.map(s=>s.category).sort(),Object.keys(categories).sort());
 for(const shelf of [...libraryShelves,libraryReadingDesk]){const goal={x:shelf.x+shelf.w/2,y:shelf.y+shelf.h+18};for(const [from,to] of [[librarySpawn,goal],[goal,{x:libraryExit.x+libraryExit.w/2,y:570}]] as const){const path=findWalkingPath(from,to,libraryObstacles);assert.deepEqual(path.at(-1),to);let previous=from;for(const point of path){assert.ok(canTravel(previous,point,libraryObstacles));previous=point;}}}
});
test('初めの模型店から図書館の入口まで、建物・住民・メカニックを避けて歩ける',()=>{
 const obstacles=[...[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...[...townPeople,hiddenMechanicSpot].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];const start=townSpawn('komorebi'),v=townVenues.find(v=>v.id==='library')!,goal={x:v.x+v.w/2,y:v.y+v.h+28},path=findWalkingPath(start,goal,obstacles,townWalkBounds);assert.deepEqual(path.at(-1),goal);let previous=start;for(const p of path){assert.ok(canTravel(previous,p,obstacles,townWalkBounds));previous=p;}
});
