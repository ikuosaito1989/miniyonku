import type {PersonKind} from '../game/PeopleArt';
export type NpcAppearance={tile:number;kind:PersonKind;hair:string;highlight:string;shirt:string;light:string;shade:string;skin:string;width:number;jaw:number;eyes:'smile'|'narrow'|'round'|'sleepy'|'sharp';haircut:'bald'|'side'|'spiky'|'wave'|'fringe'|'slick'|'beard'|'bob'|'braids'|'crop'|'cap'|'ponytail'|'curls';glasses?:boolean;freckles?:boolean};
const child={kind:'rival' as const,light:'#e0ccd0',shade:'#644856',skin:'#f3c5a0'};
const adult={kind:'owner' as const,light:'#d4d5c6',shade:'#4b5363',skin:'#edbd9c'};
export const npcAppearances={
 owner:{...adult,tile:0,hair:'#66616a',highlight:'#ada0a0',shirt:'#607ca0',width:17,jaw:14,eyes:'smile',haircut:'bald'},
 aozoraOwner:{...adult,tile:1,hair:'#343b56',highlight:'#686d87',shirt:'#4c7d9b',width:13,jaw:10,eyes:'narrow',haircut:'side',glasses:true},
 hinataOwner:{...adult,tile:2,hair:'#644434',highlight:'#a78055',shirt:'#c38246',skin:'#ca9872',width:17,jaw:16,eyes:'sharp',haircut:'spiky'},
 wakabaOwner:{...adult,tile:3,hair:'#70493d',highlight:'#a5785a',shirt:'#638369',width:15,jaw:11,eyes:'sleepy',haircut:'wave'},
 yuunagiOwner:{...adult,tile:4,hair:'#b5b5c2',highlight:'#e3ddcf',shirt:'#72718e',width:12,jaw:9,eyes:'narrow',haircut:'fringe'},
 akatsukiOwner:{...adult,tile:5,hair:'#282e3c',highlight:'#596070',shirt:'#875365',width:14,jaw:10,eyes:'sharp',haircut:'slick'},
 atelierOwner:{...adult,tile:6,hair:'#d9d2c6',highlight:'#fff0d9',shirt:'#836698',width:16,jaw:12,eyes:'sleepy',haircut:'beard',glasses:true},
 venueStaff:{...adult,tile:7,hair:'#352f43',highlight:'#746074',shirt:'#496279',width:14,jaw:10,eyes:'round',haircut:'bob'},
 rival:{...child,tile:8,hair:'#4a2d47',highlight:'#89506b',shirt:'#b14b67',width:14,jaw:9,eyes:'sharp',haircut:'side'},
 guide:{...child,tile:9,kind:'guide',hair:'#714a41',highlight:'#b4856b',shirt:'#9c568c',width:16,jaw:13,eyes:'round',haircut:'braids',freckles:true},
 mechanic:{...child,tile:10,kind:'mechanic',hair:'#303e55',highlight:'#627a89',shirt:'#317d91',width:14,jaw:13,eyes:'narrow',haircut:'crop',glasses:true},
 ren:{...child,tile:11,kind:'mechanic',hair:'#805d3f',highlight:'#b98e55',shirt:'#7a9e82',width:17,jaw:14,eyes:'round',haircut:'cap'},
 sou:{...child,tile:12,kind:'mechanic',hair:'#293344',highlight:'#627389',shirt:'#4c8293',skin:'#d8ae8c',width:13,jaw:10,eyes:'sleepy',haircut:'cap'},
 momo:{...child,tile:13,kind:'guide',hair:'#7d3f3e',highlight:'#b56e59',shirt:'#bd648e',width:13,jaw:9,eyes:'sharp',haircut:'ponytail'},
 offroader:{...child,tile:14,kind:'mechanic',hair:'#694b3a',highlight:'#b18a60',shirt:'#698c54',skin:'#d7a47b',width:17,jaw:14,eyes:'round',haircut:'curls'},
 starter:{...adult,tile:15,hair:'#293e55',highlight:'#587d92',shirt:'#d5b35c',width:14,jaw:10,eyes:'narrow',haircut:'cap'},
} satisfies Record<string,NpcAppearance>;
export type NpcAppearanceId=keyof typeof npcAppearances;
export function npcAppearanceId(name:string):NpcAppearanceId|null{
 const normalized=name.replace(/[\s　]/g,'');
 const names:Record<string,NpcAppearanceId>={'長谷川守':'owner','コース係':'venueStaff','鉄田剛':'hinataOwner','風間翔':'aozoraOwner','山野茂':'wakabaOwner','小坂歩':'ren','白石芽衣':'guide','土屋大地':'offroader','水野澪':'momo','久保悠':'sou','望月律':'rival','小野寺春夫':'owner','青井晴彦':'aozoraOwner','日向誠二':'hinataOwner','若松修一':'wakabaOwner','夕凪慎吾':'yuunagiOwner','暁堂司':'akatsukiOwner','星野玄一':'atelierOwner','大会受付係':'venueStaff','早瀬凪':'rival','三浦結衣':'guide','佐伯匠':'mechanic','高橋蓮':'ren','石川蒼':'sou','桃香':'momo','森野陸':'offroader'};
 return Object.entries(names).find(([key])=>normalized.includes(key))?.[1]??null;
}
