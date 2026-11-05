import {test} from 'node:test';
import assert from 'node:assert/strict';
import {parts,categories} from '../data/parts';
import {specGlossary,formatSpec,libraryGuides,librarySource,searchLibrary} from '../data/library';
import {townVenues,townBlocks,townSpawn,townWalkBounds,isVenueOpen,venueMessage} from '../data/world';
import {townPeople} from '../data/townPeople';
import {hiddenMechanicSpot} from '../data/hiddenMechanic';
import {findWalkingPath,canTravel} from './navigation';
import {useGame} from './store';
import {snapshotGame} from './saveData';
test('未所持・後半・専用品・成長全段階を含む全種類を掲載し、すべての性能項目を説明する',()=>{
 assert.deepEqual(searchLibrary('all','').map(p=>p.id),parts.map(p=>p.id));
 for(const category of Object.keys(categories) as (keyof typeof categories)[]){assert.ok(libraryGuides[category].text.length>30);assert.deepEqual(searchLibrary(category,'').map(p=>p.id),parts.filter(p=>p.category===category).map(p=>p.id));}
 for(const p of parts){assert.ok(librarySource(p));for(const [key,value] of Object.entries(p.specs)){assert.ok(specGlossary[key],`${p.id}:${key}`);assert.ok(formatSpec(key,value));}}
 assert.equal(searchLibrary('all','ギア比').length,parts.filter(p=>p.category==='gear').length);assert.ok(searchLibrary('motor','トルク').length>0);assert.ok(searchLibrary('gear','４：１').some(p=>p.id==='gear-4'));assert.deepEqual(searchLibrary('motor','存在しない書籍'),[]);
 assert.equal(formatSpec('ratio',4),'4:1');assert.equal(formatSpec('damping',.38),'38 %');assert.equal(formatSpec('consumption',0),'×0');assert.match(librarySource(parts.find(p=>p.id==='motor-mechanic-8')!),/1601pt・単独1位/);
});
test('初期進行から無料で入館・退館でき、財布・装備・保存する居場所を変えない',()=>{
 const original=useGame.getState();try{
  useGame.setState({...useGame.getInitialState(),location:'town'},true);const before=snapshotGame(useGame.getState()),library=townVenues.find(v=>v.id==='library')!;assert.equal(isVenueOpen(library,useGame.getState()),true);assert.match(venueMessage(library),/最初から無料/);
  useGame.getState().openLibrary();assert.equal(useGame.getState().overlay,'library');assert.deepEqual(snapshotGame(useGame.getState()),before);useGame.getState().close();assert.equal(useGame.getState().location,'town');assert.equal(useGame.getState().overlay,null);
  useGame.setState({overlay:'race'});useGame.getState().openLibrary();assert.equal(useGame.getState().overlay,'race');
 }finally{useGame.setState(original,true);}
});
test('初めの模型店から図書館の入口まで、建物・住民・メカニックを避けて歩ける',()=>{
 const obstacles=[...[...townVenues,...townBlocks].map(v=>({x:v.x,y:v.y,width:v.w,height:v.h})),...[...townPeople,hiddenMechanicSpot].map(p=>({x:p.x-12,y:p.y-9,width:24,height:21}))];const start=townSpawn('komorebi'),v=townVenues.find(v=>v.id==='library')!,goal={x:v.x+v.w/2,y:v.y+v.h+28},path=findWalkingPath(start,goal,obstacles,townWalkBounds);assert.deepEqual(path.at(-1),goal);let previous=start;for(const p of path){assert.ok(canTravel(previous,p,obstacles,townWalkBounds));previous=p;}
});
