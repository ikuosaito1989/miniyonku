import { officialRace, type OfficialRound } from '../data/officialRace';
import { doctor, doctorGiftBody, doctorGiftMessage } from '../data/doctor';
import { replaceConsumable } from './consumables';
import { reviewRace, type RaceReview } from './raceAdvice';
import type { ArrivalKind } from './arrival';
import { create } from 'zustand';
import { parts } from '../data/parts';
import { purchase, type Wallet } from './purchase';
import { createStarterInventory, starterEquipment, type Equipment, type EquipmentSlot } from '../data/machine';
import { equipPart } from './equipment';
import { racePrize } from './reward';
import { rankRacers, type RaceState } from './race';
import { INITIAL_MONEY } from '../data/economy';
import { nextRaceSeed } from './raceSeed';
import { batteryCharge, batteryCapacity, batteryConsumption, createStarterUnits, type UnitInventory } from './condition';
import { breakInPractice } from '../data/proficiency';
import { hintBooks, nextShopRace } from '../data/shopHints';
import { canEnterShop, currentShop, type ShopId, type WorldLocation } from '../data/world';
import { challenger, challengerInvitation } from '../data/challenger';
export type DialogueStage='none'|'legend-intro'|'legend-invite'|'legend-debrief'|'villain-intro'|'villain-win'|'villain-loss'|'doctor-gift'|'official-invite';
export interface GameState extends Wallet {
  officialQualified:boolean;officialWon:boolean;officialSpeedWon:boolean;officialDirtWon:boolean;officialRound:OfficialRound;officialChallengeActive:boolean;officialQualificationNotice:boolean;
  openOfficialRace:()=>void;startOfficialRace:()=>void;
  doctorGiftReceived:boolean;openLegendChallenge:()=>void;
  arrivalEvent:ArrivalKind|null;beginArrival:(kind:ArrivalKind)=>void;completeArrival:()=>void;
  aozoraWon:boolean;villainDefeated:boolean;villainChallengeActive:boolean;villainArrivalPending:boolean;villainDebriefPending:boolean;thirdShopNotice:boolean;
  openVillainChallenge:()=>void;startVillainChallenge:()=>void;
  location:WorldLocation;lastShop:ShopId;legendRaceCompleted:boolean;
  leaveShop:()=>void;enterShop:(id:ShopId)=>void;
  cheatUsed:boolean;cheatReturnToSettings:boolean;
  openCheat:(fromSettings?:boolean)=>void;applyCheat:(amount:'max'|1000)=>void;
  purchaseCount:number;
  lastRaceReview:RaceReview|null;
  exchangeReusable:(slot:'motor'|'battery')=>void;
  hintBookIndex:number; readHintBook:()=>void;
  unlockedRaces:string[]; qualificationNotice:boolean;
  legendEventSeen:boolean;legendEventPending:boolean;legendDebriefPending:boolean;legendChallengeActive:boolean;dialogueStage:DialogueStage;startLegendChallenge:()=>void;
  raceSeed:number;
  equipment: Equipment;
  proficiencyPoints:number;
  openProficiency:()=>void;
  openLegends:()=>void;
  units:UnitInventory; selectedUnits:Record<'motor'|'battery',string>; unitSerial:number; usageSeconds:number;
  selectUnit:(slot:'motor'|'battery',id:string)=>void; breakIn:()=>void;
  raceAttempt: number; settledAttempt: number; lastPrize: number;
  settleRace: (attempt: number, race: RaceState) => void;
  overlay: 'arrival' | 'dialogue' | 'shop' | 'race' | 'setting' | 'settings' | 'proficiency' | 'legends' | 'cheat' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  openSetting: () => void; equip: (id: string,slot?:EquipmentSlot) => void;
  openSettings:()=>void;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
export const useGame = create<GameState>((set) => ({
  officialQualified:false,officialWon:false,officialSpeedWon:false,officialDirtWon:false,officialRound:'speed',officialChallengeActive:false,officialQualificationNotice:false,
  openOfficialRace:()=>set(s=>s.overlay==='race'||s.overlay==='arrival'||!['town','hinata'].includes(s.location)?s:s.officialQualified?{overlay:'dialogue',speaker:'森野 陸',dialogue:officialRace.invitation+`\n\n高速舗装：${s.officialSpeedWon?'1位獲得':'未クリア'} ／ ダート：${s.officialDirtWon?'1位獲得':'未クリア'}。次は${s.officialSpeedWon&&!s.officialDirtWon?'第2戦の悪路用':'第1戦の高速用'}セッティングを準備しよう。`,dialogueStage:'official-invite',shopAfter:false}:{overlay:'dialogue',speaker:'森野 陸',dialogue:'僕は森野 陸。ダートなら任せて！ ひなた模型店のレースで1位になれば、若葉公式ダート杯への出場権がもらえるよ。砂地の接地とダンパーを整えて勝負しよう。',dialogueStage:'none',shopAfter:false}),
  startOfficialRace:()=>set(s=>!s.officialQualified||!['town','hinata'].includes(s.location)||s.overlay==='race'||s.overlay==='arrival'?s:{overlay:'race',officialChallengeActive:true,officialRound:s.officialSpeedWon&&!s.officialDirtWon?'dirt':'speed',...(s.officialSpeedWon&&s.officialDirtWon?{officialSpeedWon:false,officialDirtWon:false}:{}),legendChallengeActive:false,villainChallengeActive:false,legendDebriefPending:false,villainDebriefPending:false,shopAfter:false,dialogueStage:'none',notice:'',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,officialQualificationNotice:false,qualificationNotice:false,thirdShopNotice:false}),
  arrivalEvent:null,doctorGiftReceived:false,
  beginArrival:kind=>set(s=>s.overlay||kind==='legend'&&(s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)||s.legendRaceCompleted)||kind==='villain'&&(s.location!=='aozora'||!s.aozoraWon||s.villainDefeated)||kind==='doctor'&&(s.location!=='komorebi'||!s.legendRaceCompleted||s.doctorGiftReceived)?s:{overlay:'arrival',arrivalEvent:kind,dialogueStage:'none',shopAfter:false}),
  completeArrival:()=>set(s=>{
    if(s.overlay!=='arrival'||!s.arrivalEvent)return s;
    if(s.arrivalEvent==='doctor'&&!s.legendRaceCompleted)return s;
    if(s.arrivalEvent==='doctor')return s.doctorGiftReceived?{overlay:null,arrivalEvent:null}:{overlay:'dialogue',arrivalEvent:null,speaker:doctor.name,dialogue:doctorGiftMessage,dialogueStage:'doctor-gift',shopAfter:false,doctorGiftReceived:true,inventory:{...s.inventory,[doctorGiftBody]:Math.max(1,s.inventory[doctorGiftBody]??0)}};
    return s.arrivalEvent==='villain'
      ?{overlay:'dialogue',arrivalEvent:null,speaker:challenger.name,dialogue:challengerInvitation,dialogueStage:'villain-intro',villainArrivalPending:false,shopAfter:false}
      :{overlay:'dialogue',arrivalEvent:null,legendEventPending:false,speaker:'風見 怜',dialogue:'君がこもれび模型店で優勝した朝倉湊くんだね。僕たちは兄弟で全国の大会を回っているんだ。町へ出る前に、僕たちと一度走ってみないか？ 周回遅れでリタイアしても、この特別レースの経験になるよ。',dialogueStage:'legend-intro',shopAfter:false};
  }),
  aozoraWon:false,villainDefeated:false,villainChallengeActive:false,villainArrivalPending:false,villainDebriefPending:false,thirdShopNotice:false,
  openVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.overlay==='race'||s.overlay==='arrival'?s:{overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'くっ、今日はお前の勝ちだ。ひなた模型店への紹介状は約束どおり渡した。次は俺が勝つ。覚えておけよ！':challengerInvitation,dialogueStage:s.villainDefeated?'villain-win':'villain-intro',shopAfter:false,villainArrivalPending:false}),
  startVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.villainDefeated||s.overlay==='arrival'?s:{overlay:'race',shopAfter:false,notice:'黒岩 豪からの挑戦！',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:true,villainArrivalPending:false,villainDebriefPending:false,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false,thirdShopNotice:false}),
  location:'komorebi',lastShop:'komorebi',legendRaceCompleted:false,
  leaveShop:()=>set(s=>{
    if(s.location==='town'||s.overlay==='race'||s.overlay==='arrival')return s;
    if(s.unlockedRaces.includes(nextShopRace.id)&&!s.legendRaceCompleted)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false,legendEventPending:true};
    if(s.location==='komorebi'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    return {location:'town',lastShop:s.location,overlay:null,nearby:'',notice:'',shopAfter:false};
  }),
  enterShop:id=>set(s=>s.location!=='town'||!canEnterShop(id,s)?s:{location:id,lastShop:id,overlay:null,nearby:'',notice:'',shopAfter:false}),
  hintBookIndex:0,unlockedRaces:[],qualificationNotice:false,legendEventSeen:false,legendEventPending:false,legendDebriefPending:false,legendChallengeActive:false,dialogueStage:'none',cheatUsed:false,cheatReturnToSettings:false,
  purchaseCount:0,lastRaceReview:null,
  exchangeReusable:slot=>set(s=>s.location==='town'||s.overlay==='race'||s.overlay==='arrival'?s:{...replaceConsumable(s,slot==='motor'?'motor-rescue':'battery-recharge'),notice:slot==='motor'?'リユースモーターを装着しました。他の種類のモーターは保持しています。':'リチャージセルを装着しました。他の種類の電池は保持しています。'}),
  readHintBook:()=>set(s=>{
    const index=s.hintBookIndex%hintBooks.length,book=hintBooks[index];
    return {overlay:'dialogue',speaker:`セッティング本棚 ${index+1} / ${hintBooks.length}・${book.title}`,dialogue:`${book.text}（閉じてもう一度調べると次の本）`,shopAfter:false,hintBookIndex:(index+1)%hintBooks.length};
  }),
  raceSeed:0x5eed,
  money: INITIAL_MONEY, inventory: createStarterInventory(), equipment: {...starterEquipment}, overlay: null, speaker: '', dialogue: '', shopAfter: false, notice: '', nearby: '',
  raceAttempt: 0, settledAttempt: -1, lastPrize: 0,
  proficiencyPoints:0,
  openProficiency:()=>set({overlay:'proficiency',shopAfter:false,notice:''}),
  openLegends:()=>set({overlay:'legends',shopAfter:false,notice:''}),
  units:createStarterUnits(),selectedUnits:{motor:'starter-motor',battery:'starter-battery'},unitSerial:0,usageSeconds:0,
  selectUnit:(slot,id)=>set(s=>s.overlay==='race'||!s.units[s.equipment[slot]]?.some(u=>u.id===id)?s:{selectedUnits:{...s.selectedUnits,[slot]:id}}),
  breakIn:()=>set(s=>{
    if(s.overlay!=='setting')return s;
    if(parts.find(p=>p.id===s.equipment.motor)?.specs.wear===0)return {notice:'リユースモーターは消耗せず性能一定です。慣らしは不要です。'};
    const battery=s.units[s.equipment.battery]?.find(u=>u.id===s.selectedUnits.battery);
    if(!battery||batteryCharge(s.equipment.battery,battery.seconds)<=0)return {notice:'電池が空です。別の電池に交換してください。'};
    const rechargeable=batteryConsumption(s.equipment.battery)===0;
    const duration=rechargeable?30:Math.min(30,Math.max(0,batteryCapacity(s.equipment.battery)-battery.seconds));
    const units={...s.units};
    for(const slot of ['motor','battery'] as const)units[s.equipment[slot]]=units[s.equipment[slot]].map(u=>u.id===s.selectedUnits[slot]?{...u,seconds:u.seconds+duration}:u);
    const motor=s.units[s.equipment.motor]?.find(u=>u.id===s.selectedUnits.motor);
    const practice=breakInPractice(motor?.seconds??0,duration);
    return {units,proficiencyPoints:s.proficiencyPoints+practice,notice:`${duration.toFixed(0)}秒の慣らし運転を行いました。${rechargeable?'充電電池の残量は減りません。':'電池も消耗します。'}${practice>0?' 整備の熟練度が上がりました。':''}`};
  }),
  startTrial: () => set(s=>s.location==='town'?s:({overlay:'race',officialChallengeActive:false,officialQualificationNotice:false,shopAfter:false,notice:'',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:false,villainDebriefPending:false,thirdShopNotice:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
  settleRace: (attempt,race) => set(s=>{
    if(attempt!==s.raceAttempt)return s;
    const player=race.racers.find(r=>r.id==='player');
    const seconds=player?.driving.time??0,delta=Math.max(0,seconds-s.usageSeconds);
    const units={...s.units};
    if(delta>0&&player)for(const slot of ['motor','battery'] as const){
      const id=player.equipment[slot];units[id]=(units[id]??[]).map(u=>u.id===s.selectedUnits[slot]?{...u,seconds:u.seconds+delta}:u);
    }
    const reward=race.phase==='finished'&&s.settledAttempt!==attempt;
    const prize=reward&&!s.legendChallengeActive?racePrize(race):0;
    const firstWin=reward&&s.location==='komorebi'&&!s.legendChallengeActive&&player?.driving.status==='finished'&&rankRacers(race)[0]?.id==='player'&&!s.unlockedRaces.includes(nextShopRace.id);
    const completedLegend=reward&&s.legendChallengeActive&&(player?.driving.status==='finished'||player?.driving.stopReason==='lapped')&&rankRacers(race)[0]?.id.startsWith('legend-')===true;
    const playerWon=reward&&player?.driving.status==='finished'&&rankRacers(race)[0]?.id==='player';
    const firstAozoraWin=playerWon&&s.location==='aozora'&&!s.villainChallengeActive&&!s.aozoraWon;
    const defeatedVillain=playerWon&&s.location==='aozora'&&s.villainChallengeActive&&!s.villainDefeated;
    const firstHinataWin=playerWon&&race.circuitId==='sun'&&s.location==='hinata'&&!s.officialChallengeActive&&race.event!=='official'&&!s.officialQualified;
    const officialWin=playerWon&&s.officialChallengeActive&&race.event==='official'&&race.circuitId===(s.officialRound==='speed'?'sprint':'sun');
    const speedWin=officialWin&&race.circuitId==='sprint',dirtWin=officialWin&&race.circuitId==='sun';
    const seriesWin=(s.officialSpeedWon||speedWin)&&(s.officialDirtWon||dirtWin);
    const inventory=s.inventory;
    if(!delta&&!reward)return s;
    const practice=reward&&player?(player.driving.status==='finished'?5+(rankRacers(race)[0]?.id==='player'?5:0):seconds>0?1:0):0;
    return {...(firstHinataWin?{officialQualified:true,officialQualificationNotice:true}:{}),...(speedWin?{officialSpeedWon:true}:{}),...(dirtWin?{officialDirtWon:true}:{}),...(officialWin&&seriesWin?{officialWon:true}:{}),...(reward?{lastRaceReview:reviewRace(race)}:{}),units,inventory,usageSeconds:Math.max(s.usageSeconds,seconds),money:s.money+prize,proficiencyPoints:s.proficiencyPoints+practice,...(firstWin?{unlockedRaces:[...s.unlockedRaces,nextShopRace.id],qualificationNotice:true,...(!s.legendRaceCompleted?{legendEventPending:true}:{})}:{}),...(firstAozoraWin?{aozoraWon:true,villainArrivalPending:true}:{}),...(defeatedVillain?{villainDefeated:true,thirdShopNotice:true}:{}),...(s.villainChallengeActive&&reward?{villainDebriefPending:true}:{}),...(completedLegend?{legendRaceCompleted:true}:{}),...(s.legendChallengeActive&&reward?{legendDebriefPending:true}:{}),...(reward?{lastPrize:prize,settledAttempt:attempt}:{})};
  }),
  openSetting: () => set({overlay:'setting',shopAfter:false,notice:''}),
  openSettings:()=>set({overlay:'settings',shopAfter:false,notice:''}),
  openCheat:(fromSettings=false)=>set({overlay:'cheat',shopAfter:false,notice:'',cheatReturnToSettings:fromSettings}),
  applyCheat:(amount)=>set(s=>({money:amount==='max'?9_999_999:s.money+1000,cheatUsed:true,overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,notice:''})),
  equip: (id,slot) => set(s => {
    if(s.overlay==='race')return s;
    const equipment=equipPart(s.equipment,s.inventory,id,slot),selectedUnits={...s.selectedUnits};
    for(const key of ['motor','battery'] as const)if(equipment[key]!==s.equipment[key])selectedUnits[key]=s.units[equipment[key]]?.[0]?.id??'';
    return {equipment,selectedUnits};
  }),
  openLegendChallenge:()=>set(s=>s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)||s.legendRaceCompleted||s.overlay==='race'||s.overlay==='arrival'?s:{overlay:'dialogue',speaker:'火野 岳',dialogue:'準備はできたかい？ 僕たち兄弟とのレースに、何度でも挑んでおいで。',dialogueStage:'legend-invite',shopAfter:false}),
  startLegendChallenge:()=>set(s=>s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)||s.overlay==='arrival'?s:({overlay:'race',shopAfter:false,notice:'最強兄弟との特別レース！',legendEventPending:false,legendDebriefPending:false,legendEventSeen:true,legendChallengeActive:true,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
  talk: (speaker, dialogue, shopAfter = false) => set({ overlay:'dialogue',speaker,dialogue,shopAfter,dialogueStage:'none' }),
  advance: () => set(s => s.dialogueStage==='legend-intro'?{overlay:'dialogue',speaker:'火野 岳',dialogue:'優勝したばかりで悪いが、僕たちとも走ってくれないか？ 速さの世界を見せてあげるよ。',dialogueStage:'legend-invite'}:{ overlay: s.shopAfter ? 'shop' : null, shopAfter:false,notice:'',dialogueStage:'none' }),
  close: () => set(s=>{
    if(s.overlay==='arrival')return s;
    if(s.overlay==='dialogue'&&s.dialogueStage==='legend-debrief'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='cheat')return {overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.officialChallengeActive)return {overlay:'dialogue',speaker:'森野 陸',dialogue:s.officialSpeedWon&&s.officialDirtWon?'2レースとも1位！ 若葉公式ダート杯の総合優勝、おめでとう！ また受付で新しい2連戦に挑めるよ。':s.officialSpeedWon?'高速レースの1位は獲得済み！ 次はオフロードレースだ。タイヤ・モーター・ダンパー・ローラーを悪路用に組み直そう。準備してから第2戦へ進めるよ。':'まずは第1戦の高速ロングレースで1位を目指そう。軽量化と高速用ギア、長距離用の電池を見直そう。',officialChallengeActive:false,dialogueStage:'official-invite',shopAfter:false};
    if(s.overlay==='race'&&s.officialQualificationNotice)return {overlay:'dialogue',speaker:'日向 誠二',dialogue:officialRace.invitation,dialogueStage:'none',officialQualificationNotice:false,shopAfter:false};
    if(s.overlay==='race'&&s.villainChallengeActive&&s.villainDebriefPending)return {overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'な、なんだと……俺が負けた？ ちっ、約束は守る。ひなた模型店への紹介状だ。町の、あおぞら模型店の右隣へ行け。次は負けないからな！':'ふん、まだその程度か。ギアと電池、それにモーターの慣らしを見直してこい。ここで待っている。勝てるまで何度でも相手をしてやる！',dialogueStage:s.villainDefeated?'villain-win':'villain-loss',villainChallengeActive:false,villainDebriefPending:false,shopAfter:false};
    if(s.overlay==='race'&&s.location==='aozora'&&s.villainArrivalPending)return {overlay:'arrival',arrivalEvent:'villain',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.location==='komorebi'&&s.legendEventPending)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.legendDebriefPending)return {overlay:'dialogue',speaker:'風見 怜',dialogue:s.legendRaceCompleted?'これが僕たち兄弟の走りだよ。今日は僕たちの勝ち。でも、君のマシンには伸びしろがある。外の町へ出て、あおぞら模型店にも挑戦してごらん。店の下の出口から行けるよ。またコースで会おう！':'今回は最後まで走れなかったね。電池や安定性を調整して、僕たちともう一度走ろう。出口で声をかけてくれれば、いつでも待っているよ。',dialogueStage:'legend-debrief',legendDebriefPending:false,legendChallengeActive:false,legendEventPending:!s.legendRaceCompleted,shopAfter:false};
    return {overlay:null,shopAfter:false,notice:'',dialogueStage:'none',legendChallengeActive:false,villainChallengeActive:false,villainDebriefPending:false};
  }),
  buy: id => set(s => {
    if(s.overlay==='race'||s.overlay==='arrival')return s;
    if(s.location==='town')return {notice:'パーツは模型店の店主から購入できます。'};
    const result=purchase(s,id,currentShop(s.location));
    if(!result.success)return {notice:result.message};
    const consumable=id.startsWith('motor-')||id.startsWith('battery-');
    return {...result.wallet,purchaseCount:s.purchaseCount+1,notice:result.message,...(consumable?replaceConsumable(s,id):{})};
  }),
}));
