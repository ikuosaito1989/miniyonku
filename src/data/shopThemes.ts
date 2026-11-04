import type {ShopId} from './world';
export type ShopTheme={style:'timber'|'glass'|'garage'|'garden'|'harbor'|'deco'|'atelier';floor:string;floorDark:string;wall:string;ink:string;wood:string;metal:string;accent:string;light:string;pattern:'parquet'|'tile'|'concrete'|'stone'|'deck'|'marble'|'mosaic'};
export const shopThemes:Record<ShopId,ShopTheme>={
 komorebi:{style:'timber',floor:'#ad9472',floorDark:'#866a50',wall:'#cbbd98',ink:'#334c49',wood:'#74503d',metal:'#8b9b96',accent:'#588c70',light:'#ffe5ad',pattern:'parquet'},
 aozora:{style:'glass',floor:'#c4d6df',floorDark:'#8cabbc',wall:'#dbe6e7',ink:'#264d71',wood:'#738aa0',metal:'#d4e5ea',accent:'#4e9fc4',light:'#d9f8ff',pattern:'tile'},
 hinata:{style:'garage',floor:'#aca397',floorDark:'#837d73',wall:'#7e8b8d',ink:'#33454a',wood:'#755845',metal:'#c4c5b8',accent:'#d49a4e',light:'#ffdf9e',pattern:'concrete'},
 wakaba:{style:'garden',floor:'#a6b69d',floorDark:'#7f9279',wall:'#b8cbb0',ink:'#35554c',wood:'#6b6b4f',metal:'#bac9b3',accent:'#7fa871',light:'#e8f2ba',pattern:'stone'},
 yuunagi:{style:'harbor',floor:'#acb6b9',floorDark:'#82899e',wall:'#c4c8d8',ink:'#3a456b',wood:'#6a5570',metal:'#bfcdd9',accent:'#9c8cc0',light:'#e0defa',pattern:'deck'},
 akatsuki:{style:'deco',floor:'#57525f',floorDark:'#383d50',wall:'#5d4957',ink:'#202a3e',wood:'#4b3348',metal:'#d3b778',accent:'#d49073',light:'#ffe6ba',pattern:'marble'},
 atelier:{style:'atelier',floor:'#666178',floorDark:'#44445b',wall:'#71627f',ink:'#302e49',wood:'#584563',metal:'#d3bb86',accent:'#af94d4',light:'#f4deb7',pattern:'mosaic'},
};
export const walkingSpeed={town:282,interior:190} as const;
