import {yuunagiTimeLimit} from '../data/yuunagiCircuit';
import {emptyCup,cupComplete,cupPlayerPlace,cupProgression,enterCupHeat,finishCupHeat,forfeitCupHeat,raceCupHeat,type CupProgress} from './cup';
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
import { officialTime, rankRacers, type RaceState } from './race';
import { INITIAL_MONEY } from '../data/economy';
import { nextRaceSeed } from './raceSeed';
import { batteryCharge, batteryCapacity, batteryConsumption, createStarterUnits, type UnitInventory } from './condition';
import { breakInPractice } from '../data/proficiency';
import { hintBooks, nextShopRace } from '../data/shopHints';
import { canEnterShop, currentShop, type ShopId, type WorldLocation } from '../data/world';
import { challenger, challengerInvitation } from '../data/challenger';
export type DialogueStage='none'|'legend-intro'|'legend-invite'|'legend-debrief'|'villain-intro'|'villain-win'|'villain-loss'|'doctor-gift'|'official-invite';
export interface GameState extends Wallet {
  yuunagiUnlocked:boolean;yuunagiBestTime:number|null;finalQualified:boolean;
  wakabaCup:CupProgress;technicalCup:CupProgress;gameOver:boolean;wakabaUnlocked:boolean;thirdOfficialQualified:boolean;
  enterOfficialVenue:(id?:'stadium-5'|'stadium-9')=>void;townReturnVenue:'stadium-5'|'stadium-9'|null;
  officialQualified:boolean;officialWon:boolean;officialSpeedWon:boolean;officialDirtWon:boolean;officialRound:OfficialRound;officialChallengeActive:boolean;officialQualificationNotice:boolean;
  openOfficialRace:(round?:OfficialRound)=>void;startOfficialRace:()=>void;
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
  overlay: 'mission' | 'town-map' | 'arrival' | 'dialogue' | 'shop' | 'race' | 'setting' | 'settings' | 'proficiency' | 'legends' | 'cheat' | 'game-over' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  openSetting: () => void; equip: (id: string,slot?:EquipmentSlot) => void;
  openSettings:()=>void;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
function activeCup(s:GameState){return s.location==='stadium-9'?s.technicalCup:s.wakabaCup;}
function activeRound(s:GameState):OfficialRound{return s.location==='stadium-9'?'technical':s.wakabaCup.results.length?'dirt':'speed';}
function updateCup(s:GameState,cup:CupProgress){
 const updated=cupProgression(s.location==='stadium-9'?s.wakabaCup:cup,s.location==='stadium-9'?cup:s.technicalCup,s.thirdOfficialQualified);
 return {...updated,gameOver:s.gameOver||updated.gameOver};
}
export const useGame = create<GameState>((set) => ({
  yuunagiUnlocked:false,yuunagiBestTime:null,finalQualified:false,
  wakabaCup:emptyCup(),technicalCup:emptyCup(),gameOver:false,wakabaUnlocked:false,thirdOfficialQualified:false,
  townReturnVenue:null,enterOfficialVenue:(id='stadium-5')=>set(s=>s.gameOver||s.location!=='town'||!(id==='stadium-5'?s.officialQualified:s.thirdOfficialQualified)||s.overlay==='race'||s.overlay==='arrival'?s:{location:id,overlay:null,nearby:'',notice:'',shopAfter:false,townReturnVenue:null}),
  officialQualified:false,officialWon:false,officialSpeedWon:false,officialDirtWon:false,officialRound:'speed',officialChallengeActive:false,officialQualificationNotice:false,
  openOfficialRace:round=>set(s=>{
    if(s.gameOver||s.overlay==='race'||s.overlay==='arrival')return s;
    if(s.location!=='stadium-5'&&s.location!=='stadium-9')return {overlay:'dialogue',speaker:'森野 陸',dialogue:'公式戦は各公式会場のコースで開催するよ。若葉杯の総合入賞でわかば模型店、優勝で第3公式大会への出場権が得られる。一度限りの勝負に向けて準備しよう。',dialogueStage:'none',shopAfter:false};
    const cup=activeCup(s),kind=s.location==='stadium-9'?'technical':'wakaba',next=activeRound(s);
    if(cupComplete(cup,kind))return {overlay:'dialogue',speaker:'大会受付係',dialogue:`この大会は出場済みです。総合${cupPlayerPlace(cup)}位。公式大会は一度限りで、再出場はできません。`,dialogueStage:'none',shopAfter:false};
    if(round&&round!==next)return {overlay:'dialogue',speaker:'大会受付係',dialogue:next==='speed'?'まずは第1戦の高速コースから出場してください。':'第1戦は終了しました。ピットで装備を組み直し、第2戦のダートへ進んでください。',dialogueStage:'none',shopAfter:false};
    return {overlay:'dialogue',speaker:'大会受付係',dialogue:(kind==='technical'?'全4大会の第3公式大会・星空テクニカル杯。連続コーナーを約2分走る一発勝負です。':officialRace.briefing)+`\n\n大会への出場は一度だけです。途中退出・再読み込みはそのレースの棄権になります。総合3位以内で次へ進み、4位以下はゲームオーバー。${kind==='wakaba'?'2レースの得点合計（同点は完走数・合計タイム）で総合順位を決めます。現在'+cup.results.length+'/2戦終了。次は'+(next==='speed'?'第1戦・高速舗装':'第2戦・ダート')+'です。':''}`,dialogueStage:'official-invite',shopAfter:false};
  }),
  startOfficialRace:()=>set(s=>{
    if(s.gameOver||s.overlay==='race'||s.overlay==='arrival'||s.location!=='stadium-5'&&s.location!=='stadium-9')return s;
    if(!(s.location==='stadium-9'?s.thirdOfficialQualified:s.officialQualified))return s;
    const round=activeRound(s),id=round==='technical'?'comet':round==='speed'?'sprint':'sun',old=activeCup(s),cup=enterCupHeat(old,id,s.location==='stadium-9'?'technical':'wakaba');
    if(cup===old)return s;
    return {...(s.location==='stadium-9'?{technicalCup:cup}:{wakabaCup:cup}),overlay:'race',officialChallengeActive:true,officialRound:round,legendChallengeActive:false,villainChallengeActive:false,legendDebriefPending:false,villainDebriefPending:false,shopAfter:false,dialogueStage:'none',notice:'',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,officialQualificationNotice:false,qualificationNotice:false,thirdShopNotice:false};
  }),
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
    if(s.gameOver)return s;
    if(s.location==='town'||s.overlay==='race'||s.overlay==='arrival')return s;
    if(s.location==='komorebi'&&s.unlockedRaces.includes(nextShopRace.id)&&!s.legendRaceCompleted)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false,legendEventPending:true};
    if(s.location==='komorebi'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    return {location:'town',townReturnVenue:s.location==='stadium-5'||s.location==='stadium-9'?s.location:null,lastShop:s.location==='stadium-5'||s.location==='stadium-9'?s.lastShop:s.location,overlay:null,nearby:'',notice:'',shopAfter:false};
  }),
  enterShop:id=>set(s=>s.gameOver||s.location!=='town'||!canEnterShop(id,s)?s:{location:id,lastShop:id,townReturnVenue:null,overlay:null,nearby:'',notice:'',shopAfter:false}),
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
  startTrial: () => set(s=>s.gameOver||s.location==='atelier'||s.location==='town'||s.location==='stadium-5'||s.location==='stadium-9'?s:({overlay:'race',officialChallengeActive:false,officialQualificationNotice:false,shopAfter:false,notice:'',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:false,villainDebriefPending:false,thirdShopNotice:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
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
    const cupUpdate=reward&&s.officialChallengeActive&&race.event==='official'?updateCup(s,finishCupHeat(activeCup(s),raceCupHeat(race))):{};
    const firstWakabaWin=playerWon&&s.location==='wakaba'&&!s.officialChallengeActive;
    const trialFinished=reward&&s.location==='yuunagi'&&race.circuitId==='trail'&&race.event==='shop'&&!s.officialChallengeActive&&player?.driving.status==='finished';
    const trialTime=trialFinished&&player?officialTime(race,player):Infinity;
    const yuunagiBestTime=trialFinished?Math.min(s.yuunagiBestTime??Infinity,trialTime):s.yuunagiBestTime;
    const finalQualified=s.finalQualified||s.yuunagiUnlocked&&trialFinished&&trialTime<=yuunagiTimeLimit;
    const inventory=s.inventory;
    if(!delta&&!reward)return s;
    const practice=reward&&player?(player.driving.status==='finished'?5+(rankRacers(race)[0]?.id==='player'?5:0):seconds>0?1:0):0;
    return {yuunagiBestTime,finalQualified,...(firstHinataWin?{officialQualified:true,officialQualificationNotice:true}:{}),...cupUpdate,...(firstWakabaWin?{thirdOfficialQualified:true}:{}),...(reward?{lastRaceReview:reviewRace(race)}:{}),units,inventory,usageSeconds:Math.max(s.usageSeconds,seconds),money:s.money+prize,proficiencyPoints:s.proficiencyPoints+practice,...(firstWin?{unlockedRaces:[...s.unlockedRaces,nextShopRace.id],qualificationNotice:true,...(!s.legendRaceCompleted?{legendEventPending:true}:{})}:{}),...(firstAozoraWin?{aozoraWon:true,villainArrivalPending:true}:{}),...(defeatedVillain?{villainDefeated:true,thirdShopNotice:true}:{}),...(s.villainChallengeActive&&reward?{villainDebriefPending:true}:{}),...(completedLegend?{legendRaceCompleted:true}:{}),...(s.legendChallengeActive&&reward?{legendDebriefPending:true}:{}),...(reward?{lastPrize:prize,settledAttempt:attempt}:{})};
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
    if(s.overlay==='game-over')return s;
    if(s.overlay==='arrival')return s;
    if(s.overlay==='dialogue'&&s.dialogueStage==='legend-debrief'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='cheat')return {overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.officialChallengeActive){
      const updated=updateCup(s,forfeitCupHeat(activeCup(s))),cup=s.location==='stadium-9'?updated.technicalCup:updated.wakabaCup,done=cupComplete(cup,s.location==='stadium-9'?'technical':'wakaba');
      if(updated.gameOver)return {...updated,overlay:'game-over',officialChallengeActive:false,dialogueStage:'none',shopAfter:false};
      return {...updated,overlay:'dialogue',speaker:'大会受付係',dialogue:done?s.location==='stadium-9'?`星空テクニカル杯・総合${cupPlayerPlace(cup)}位、おめでとうございます。長距離の連続コーナーを走り切りました。街のゆうなぎ模型店が開放されました！ 次は一本道コースを43秒以内で完走して、第4公式大会の出場権を目指してください。この大会は再出場できません。`:`総合${cupPlayerPlace(cup)}位、おめでとうございます。${updated.officialWon?'第3公式大会・星空テクニカル杯の出場権を獲得！':''}${updated.wakabaUnlocked?'街のわかば模型店が開放されました。':''}この大会は再出場できません。`:'第1戦の結果を記録しました。ピットで装備を組み直し、第2戦へ進んでください。第1戦はやり直せません。',officialChallengeActive:false,dialogueStage:done?'none':'official-invite',shopAfter:false};
    }
    if(s.overlay==='race'&&s.officialQualificationNotice)return {overlay:'dialogue',speaker:'日向 誠二',dialogue:officialRace.invitation,dialogueStage:'none',officialQualificationNotice:false,shopAfter:false};
    if(s.overlay==='race'&&s.villainChallengeActive&&s.villainDebriefPending)return {overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'な、なんだと……俺が負けた？ ちっ、約束は守る。ひなた模型店への紹介状だ。町の、あおぞら模型店の右隣へ行け。次は負けないからな！':'ふん、まだその程度か。ギアと電池、それにモーターの慣らしを見直してこい。ここで待っている。勝てるまで何度でも相手をしてやる！',dialogueStage:s.villainDefeated?'villain-win':'villain-loss',villainChallengeActive:false,villainDebriefPending:false,shopAfter:false};
    if(s.overlay==='race'&&s.location==='aozora'&&s.villainArrivalPending)return {overlay:'arrival',arrivalEvent:'villain',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.location==='komorebi'&&s.legendEventPending)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.legendDebriefPending)return {overlay:'dialogue',speaker:'風見 怜',dialogue:s.legendRaceCompleted?'これが僕たち兄弟の走りだよ。今日は僕たちの勝ち。でも、君のマシンには伸びしろがある。外の町へ出て、あおぞら模型店にも挑戦してごらん。店の下の出口から行けるよ。またコースで会おう！':'今回は最後まで走れなかったね。電池や安定性を調整して、僕たちともう一度走ろう。出口で声をかけてくれれば、いつでも待っているよ。',dialogueStage:'legend-debrief',legendDebriefPending:false,legendChallengeActive:false,legendEventPending:!s.legendRaceCompleted,shopAfter:false};
    return {overlay:null,shopAfter:false,notice:'',dialogueStage:'none',legendChallengeActive:false,villainChallengeActive:false,villainDebriefPending:false};
  }),
  buy: id => set(s => {
    if(s.overlay==='race'||s.overlay==='arrival')return s;
    if(s.location==='town'||s.location==='stadium-5'||s.location==='stadium-9')return {notice:'パーツは模型店の店主から購入できます。'};
    const result=purchase(s,id,currentShop(s.location));
    if(!result.success)return {notice:result.message};
    const consumable=id.startsWith('motor-')||id.startsWith('battery-');
    return {...result.wallet,purchaseCount:s.purchaseCount+1,notice:result.message,...(consumable?replaceConsumable(s,id):{})};
  }),
}));
