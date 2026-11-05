import {townSpawn,type WorldLocation} from '../data/world';
export const towaEscortLocation=(step:number):WorldLocation=>step===4?'town':step>=5?'stadium-10':'yuunagi';
export const towaEscortSpawn=(step:number)=>step===4?townSpawn('yuunagi'):{x:480,y:535};
export const towaEscortText=(step:number)=>step===1?'橘 斗和が、店の入口からやってきた。':step===2?'40秒以内で走り切ったか。俺は橘 斗和。お前の走りを見ていた。緑川グランプリに出る資格は十分だ。会場まで案内しよう。次は俺も相手になる。':step===3?'斗和と一緒に、模型店の外へ。':step===4?'斗和の案内で、緑川グランプリ会場へ向かう。':'ここが緑川グランプリの決勝会場だ。高架、ジャンプ、連続S字。一本のコースで、今までのセッティングが試される。ピットで準備を整えろ。2位以内に完走すれば次へ進める。一度きりの勝負だ。コースで会おう。';
