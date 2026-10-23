import { shopPeople, shopVisitors, story } from './story';
import { modelShops, type ShopId } from './world';
export const shopCasts={
  komorebi:{owner:shopPeople.owner,rival:shopPeople.rival,visitors:shopVisitors},
  aozora:{owner:{x:740,y:139},rival:{x:445,y:335},visitors:[{x:430,y:215,name:'三浦 結衣',kind:'guide' as const},{x:160,y:275,name:'佐伯 匠',kind:'mechanic' as const}]},
  hinata:{owner:{x:160,y:139},rival:{x:550,y:245},visitors:[{x:450,y:470,name:'三浦 結衣',kind:'guide' as const},{x:425,y:275,name:'佐伯 匠',kind:'mechanic' as const}]},
};
export function shopCast(id:ShopId){
  const cast=shopCasts[id];
  return {owner:{...cast.owner,name:modelShops[id].owner},rival:{...cast.rival,name:id==='hinata'?'森野 陸':story.rival},visitors:cast.visitors};
}
