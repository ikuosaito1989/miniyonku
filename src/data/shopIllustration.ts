import { room, type Fixture } from './shop';
export const shopIllustrationKey='shop-illustration-v1';
export const shopIllustrationSize={width:room.width,height:room.height};
/** 前景の切り出し範囲。地面の影は背景に残し、家具だけを人物のY順で重ねる。 */
export function fixtureArtFrame(fixture:Fixture){
  // 原画の床は不透明。家具より上まで切り出すと背後の人物まで床で隠してしまう。
  const y=fixture.y;
  return {x:fixture.x,y,width:fixture.w,height:fixture.y+fixture.h-y,depth:fixture.y+fixture.h};
}
