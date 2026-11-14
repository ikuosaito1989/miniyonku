export const replayEvents=[
 {id:'opening',label:'はじまりの導入'},
 {id:'legend',label:'最強兄弟の登場'},
 {id:'doctor',label:'博士の登場・セイラン贈呈'},
 {id:'seiran',label:'セイラン受け取り演出'},
 {id:'villain',label:'黒岩の挑戦'},
 {id:'koya',label:'昊也と星空レース場へ'},
 {id:'towa',label:'斗和と緑川グランプリへ'},
 {id:'wakaba-cup',label:'若葉公式ダート杯'},
 {id:'technical-cup',label:'星空テクニカル杯'},
 {id:'final-cup',label:'緑川グランプリ'},
 {id:'zenith-cup',label:'天頂決戦'},
] as const;
export type ReplayEventId=typeof replayEvents[number]['id'];
