import {categories,type Category} from './parts';
export const librarySpawn={x:480,y:535};
export const libraryExit={x:440,y:575,w:80,h:7};
export const libraryShelves=(Object.keys(categories) as Category[]).map((category,i)=>({id:`library-${category}`,category,label:`${categories[category]}の本棚`,x:i<6?84+i*130:104+(i-6)*154,y:i<6?140:300,w:i<6?112:120,h:60}));
export const libraryReadingDesk={id:'library-catalogue',label:'全パーツ図鑑の閲覧台',x:440,y:440,w:80,h:40};
export const libraryTables=[{x:140,y:440,w:180,h:60},{x:650,y:440,w:180,h:60}];
export const libraryObstacles=[...libraryShelves,libraryReadingDesk,...libraryTables].map(p=>({x:p.x,y:p.y,width:p.w,height:p.h}));
