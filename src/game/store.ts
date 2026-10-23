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
export type DialogueStage='none'|'legend-intro'|'legend-invite'|'legend-debrief'|'villain-intro'|'villain-win'|'villain-loss';
export interface GameState extends Wallet {
  aozoraWon:boolean;villainDefeated:boolean;villainChallengeActive:boolean;villainArrivalPending:boolean;villainDebriefPending:boolean;thirdShopNotice:boolean;
  openVillainChallenge:()=>void;startVillainChallenge:()=>void;
  location:WorldLocation;lastShop:ShopId;legendRaceCompleted:boolean;
  leaveShop:()=>void;enterShop:(id:ShopId)=>void;
  cheatUsed:boolean;cheatReturnToSettings:boolean;
  openCheat:(fromSettings?:boolean)=>void;applyCheat:(amount:'max'|1000)=>void;
  purchaseCount:number;
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
  overlay: 'dialogue' | 'shop' | 'race' | 'setting' | 'settings' | 'proficiency' | 'legends' | 'cheat' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  openSetting: () => void; equip: (id: string,slot?:EquipmentSlot) => void;
  openSettings:()=>void;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
export const useGame = create<GameState>((set) => ({
  aozoraWon:false,villainDefeated:false,villainChallengeActive:false,villainArrivalPending:false,villainDebriefPending:false,thirdShopNotice:false,
  openVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.overlay==='race'?s:{overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'くっ、今日はお前の勝ちだ。ひなた模型店への紹介状は約束どおり渡した。次は俺が勝つ。覚えておけよ！':challengerInvitation,dialogueStage:s.villainDefeated?'villain-win':'villain-intro',shopAfter:false,villainArrivalPending:false}),
  startVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.villainDefeated?s:{overlay:'race',shopAfter:false,notice:'影山 陸からの挑戦！',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:true,villainArrivalPending:false,villainDebriefPending:false,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false,thirdShopNotice:false}),
  location:'komorebi',lastShop:'komorebi',legendRaceCompleted:false,
  leaveShop:()=>set(s=>{
    if(s.location==='town'||s.overlay==='race')return s;
    if(!s.unlockedRaces.includes(nextShopRace.id))return {overlay:'dialogue',speaker:'小野寺 春夫',dialogue:'まずは、こもれび模型店で1位を目指してみよう。優勝したら、外の町の模型店にも挑戦できるよ。',shopAfter:false,dialogueStage:'none'};
    if(!s.legendRaceCompleted)return {overlay:'dialogue',speaker:'風見 怜',dialogue:'君がこもれび模型店で優勝した朝倉湊くんだね。僕たちは兄弟で全国の大会を回っているんだ。町へ出る前に、僕たちと一度走ってみないか？ 周回遅れでリタイアしても、この特別レースの経験になるよ。',shopAfter:false,dialogueStage:'legend-intro',legendEventPending:true};
    return {location:'town',lastShop:s.location,overlay:null,nearby:'',notice:'',shopAfter:false};
  }),
  enterShop:id=>set(s=>s.location!=='town'||!s.legendRaceCompleted||!s.unlockedRaces.includes(nextShopRace.id)||!canEnterShop(id,s)?s:{location:id,lastShop:id,overlay:null,nearby:'',notice:'',shopAfter:false}),
  hintBookIndex:0,unlockedRaces:[],qualificationNotice:false,legendEventSeen:false,legendEventPending:false,legendDebriefPending:false,legendChallengeActive:false,dialogueStage:'none',cheatUsed:false,cheatReturnToSettings:false,
  purchaseCount:0,
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
  startTrial: () => set(s=>s.location==='town'?s:({overlay:'race',shopAfter:false,notice:'',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:false,villainDebriefPending:false,thirdShopNotice:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
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
    const winnerBody='body-champion';
    const inventory=firstWin&&!(s.inventory[winnerBody]>0)?{...s.inventory,[winnerBody]:1}:s.inventory;
    if(!delta&&!reward)return s;
    const practice=reward&&player?(player.driving.status==='finished'?5+(rankRacers(race)[0]?.id==='player'?5:0):seconds>0?1:0):0;
    return {units,inventory,usageSeconds:Math.max(s.usageSeconds,seconds),money:s.money+prize,proficiencyPoints:s.proficiencyPoints+practice,...(firstWin?{unlockedRaces:[...s.unlockedRaces,nextShopRace.id],qualificationNotice:true,...(!s.legendRaceCompleted?{legendEventPending:true}:{})}:{}),...(firstAozoraWin?{aozoraWon:true,villainArrivalPending:true}:{}),...(defeatedVillain?{villainDefeated:true,thirdShopNotice:true}:{}),...(s.villainChallengeActive&&reward?{villainDebriefPending:true}:{}),...(completedLegend?{legendRaceCompleted:true}:{}),...(s.legendChallengeActive&&reward?{legendDebriefPending:true}:{}),...(reward?{lastPrize:prize,settledAttempt:attempt}:{})};
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
  startLegendChallenge:()=>set(s=>s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)?s:({overlay:'race',shopAfter:false,notice:'最強兄弟との特別レース！',legendEventPending:false,legendDebriefPending:false,legendEventSeen:true,legendChallengeActive:true,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
  talk: (speaker, dialogue, shopAfter = false) => set({ overlay:'dialogue',speaker,dialogue,shopAfter,dialogueStage:'none' }),
  advance: () => set(s => s.dialogueStage==='legend-intro'?{overlay:'dialogue',speaker:'火野 岳',dialogue:'優勝したばかりで悪いが、僕たちとも走ってくれないか？ 速さの世界を見せてあげるよ。',dialogueStage:'legend-invite'}:{ overlay: s.shopAfter ? 'shop' : null, shopAfter:false,notice:'',dialogueStage:'none' }),
  close: () => set(s=>{
    if(s.overlay==='cheat')return {overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.villainChallengeActive&&s.villainDebriefPending)return {overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'な、なんだと……俺が負けた？ ちっ、約束は守る。ひなた模型店への紹介状だ。町の、あおぞら模型店の右隣へ行け。次は負けないからな！':'ふん、まだその程度か。ギアと電池、それにモーターの慣らしを見直してこい。ここで待っている。勝てるまで何度でも相手をしてやる！',dialogueStage:s.villainDefeated?'villain-win':'villain-loss',villainChallengeActive:false,villainDebriefPending:false,shopAfter:false};
    if(s.overlay==='race'&&s.villainArrivalPending)return {overlay:'dialogue',speaker:challenger.name,dialogue:challengerInvitation,dialogueStage:'villain-intro',villainArrivalPending:false,shopAfter:false};
    if(s.overlay==='race'&&s.legendEventPending)return {overlay:'dialogue',speaker:'風見 怜',dialogue:'君が優勝した朝倉湊くん？ 噂は聞いているよ。初優勝、おめでとう。',dialogueStage:'legend-intro',shopAfter:false};
    if(s.overlay==='race'&&s.legendDebriefPending)return {overlay:'dialogue',speaker:'風見 怜',dialogue:s.legendRaceCompleted?'これが僕たち兄弟の走りだよ。今日は僕たちの勝ち。でも、君のマシンには伸びしろがある。外の町へ出て、あおぞら模型店にも挑戦してごらん。店の下の出口から行けるよ。またコースで会おう！':'今回は最後まで走れなかったね。電池や安定性を調整して、僕たちともう一度走ろう。出口で声をかけてくれれば、いつでも待っているよ。',dialogueStage:'legend-debrief',legendDebriefPending:false,legendChallengeActive:false,shopAfter:false};
    return {overlay:null,shopAfter:false,notice:'',dialogueStage:'none',legendChallengeActive:false,villainChallengeActive:false,villainDebriefPending:false};
  }),
  buy: id => set(s => {
    if(s.location==='town')return {notice:'パーツは模型店の店主から購入できます。'};
    const result=purchase(s,id,currentShop(s.location));
    if(!result.success)return {notice:result.message};
    const consumable=id.startsWith('motor-')||id.startsWith('battery-');
    return {...result.wallet,purchaseCount:s.purchaseCount+1,notice:result.message,...(consumable?{unitSerial:s.unitSerial+1,units:{...s.units,[id]:[...(s.units[id]??[]),{id:`unit-${s.unitSerial+1}`,seconds:0}]}}:{})};
  }),
}));
