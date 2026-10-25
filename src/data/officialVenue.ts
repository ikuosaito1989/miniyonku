export const officialVenue={id:'stadium-5' as const,name:'若葉公式レース会場',spawn:{x:480,y:535},exit:{x:440,y:575,w:80,h:7}};
export const officialVenueFixtures=[
 {id:'speed',x:220,y:230,w:250,h:210,label:'第1戦・高速ロングコース',kind:'official-speed' as const},
 {id:'dirt',x:490,y:230,w:250,h:210,label:'第2戦・オフロードコース',kind:'official-dirt' as const},
 {id:'pit',x:65,y:275,w:130,h:130,label:'ピット・セッティング',kind:'bench' as const},
 {id:'reception',x:770,y:260,w:125,h:75,label:'大会受付',kind:'official-reception' as const},
 {id:'stand-left',x:65,y:135,w:190,h:65,label:'観客席',kind:'decoration' as const},
 {id:'stand-right',x:705,y:135,w:190,h:65,label:'観客席',kind:'decoration' as const},
];
export const officialVenuePeople=[
 {id:'staff',x:815,y:362,name:'大会受付係',kind:'owner' as const,text:'高速舗装とダートの2戦制です。各コースの前で出場登録できます。総合3位以内で次の模型店、優勝で第3大会の出場権！ 一度限りの大会です。'},
 {id:'riku',x:700,y:480,name:'森野 陸',kind:'mechanic' as const,text:'ダートは僕の得意分野だ。高速戦が終わったら、左のピットで悪路用に組み直そう。'},
 {id:'go',x:270,y:480,name:'黒岩 豪',kind:'rival' as const,text:'ここが公式の舞台だ。高速でもダートでも、俺は負けない。コースの前で勝負しろ！'},
 {id:'sou',x:340,y:180,name:'石川 蒼',kind:'mechanic' as const,text:'長い高速コースでは舗装用タイヤとギアの選び方が大事だね。'},
 {id:'ren',x:600,y:180,name:'高橋 蓮',kind:'guide' as const,text:'2つのコースは別のセッティングが必要。電池もピットで確認しておこう。'},
];
export function officialVenueFor(id:string){
 return id==='stadium-9'?{...officialVenue,id:'stadium-9' as const,name:'星空公式レース会場'}:officialVenue;
}
export function officialFixturesFor(id:string){
 return id==='stadium-9'?[
  {id:'technical',x:220,y:230,w:520,h:210,label:'第3公式大会・星空テクニカルコース',kind:'official-technical' as const},
  ...officialVenueFixtures.filter(f=>f.id!=='speed'&&f.id!=='dirt'),
 ]:officialVenueFixtures;
}

export function officialPeopleFor(id:string){
 if(id!=='stadium-9')return officialVenuePeople;
 return officialVenuePeople.map(p=>({...p,text:p.id==='riku'?'ここは長い舗装コーナー。ダート装備のままでは重すぎる。昔の舗装用パーツに組み直して走るよ。':p.id==='go'?'最高速だけで勝てると思うな。ローラーと低重心、ウェイトの使い方が勝負だ！':p.id==='staff'?'第3公式大会・星空テクニカル杯。約2分の連続コーナーです。出場は一度だけ、3位以内を目指してください。':'4:1ギアとスポンジタイヤ、低重心シャーシにウェイトを組み合わせよう。昔のパーツがまだ役に立つよ。'}));
}
