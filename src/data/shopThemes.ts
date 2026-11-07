import type {ShopId} from './world';
export type ShopTheme={style:'timber'|'glass'|'garage'|'garden'|'harbor'|'deco'|'atelier';floor:string;floorDark:string;wall:string;ink:string;wood:string;metal:string;accent:string;light:string;pattern:'parquet'|'tile'|'concrete'|'stone'|'deck'|'marble'|'mosaic'};
const baseThemes:Record<Exclude<ShopId,'torque'|'velocity'|'terrain'>,ShopTheme>={
 hoshikuzu:{style:'deco',floor:'#c3d3dc',floorDark:'#9db4c5',wall:'#687c9d',ink:'#233954',wood:'#425a75',metal:'#ced8dd',accent:'#a9c5df',light:'#eee9bf',pattern:'tile'},
 komorebi:{style:'timber',floor:'#b9e1d4',floorDark:'#9cc6b7',wall:'#858fae',ink:'#334c49',wood:'#74503d',metal:'#8b9b96',accent:'#588c70',light:'#ffe5ad',pattern:'tile'},
 aozora:{style:'glass',floor:'#c5dee8',floorDark:'#a6c7d6',wall:'#879cb5',ink:'#264d71',wood:'#738aa0',metal:'#d4e5ea',accent:'#4e9fc4',light:'#d9f8ff',pattern:'tile'},
 hinata:{style:'garage',floor:'#e1cfaa',floorDark:'#c4b58e',wall:'#a49d8c',ink:'#33454a',wood:'#755845',metal:'#c4c5b8',accent:'#d49a4e',light:'#ffdf9e',pattern:'tile'},
 wakaba:{style:'garden',floor:'#c3d4b2',floorDark:'#a4bd99',wall:'#8ba28c',ink:'#35554c',wood:'#6b6b4f',metal:'#bac9b3',accent:'#7fa871',light:'#e8f2ba',pattern:'tile'},
 yuunagi:{style:'harbor',floor:'#c3ccd9',floorDark:'#abb8cd',wall:'#8e92b1',ink:'#3a456b',wood:'#6a5570',metal:'#bfcdd9',accent:'#9c8cc0',light:'#e0defa',pattern:'tile'},
 akatsuki:{style:'deco',floor:'#ddc2af',floorDark:'#c4a393',wall:'#a08c96',ink:'#202a3e',wood:'#4b3348',metal:'#bac4ca',accent:'#d49073',light:'#ffe6ba',pattern:'tile'},
 atelier:{style:'atelier',floor:'#d1cbdc',floorDark:'#b6aec8',wall:'#8f8ca8',ink:'#302e49',wood:'#584563',metal:'#b7c1cd',accent:'#af94d4',light:'#f4deb7',pattern:'tile'},
};
export const shopThemes:Record<ShopId,ShopTheme>={...baseThemes,torque:{...baseThemes.hinata,accent:'#bd7752',floor:'#d4c8b3',wall:'#8e8580',metal:'#b3aba2',style:'garage'},
velocity:{...baseThemes.aozora,accent:'#63c2dc',floor:'#d8e3ea',wall:'#738d9f',style:'glass'},
terrain:{...baseThemes.wakaba,accent:'#91aa58',floor:'#c4cbaa',wall:'#8b967e',style:'garden'}};
export const walkingSpeed={town:282,interior:190} as const;
