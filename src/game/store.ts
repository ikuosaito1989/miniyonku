import {opponentCourseAvailable} from './raceOpponents';
import {officialTimeBoards} from '../data/timeBoard';
import {currentRaceRulesVersion} from './timeRecords';
import type {OnlineChallenge, OnlineRecord} from './onlineRecords';
import {isPracticeCourse,type PracticeCourseId} from '../data/practiceCourses';
import type {CircuitId} from '../data/circuit';
import {towaEscortLocation} from './towaEscort';
import {KOYA_ESCORT_END,koyaEscortActive,koyaEscortLocation} from './koyaEscort';
import {syncMechanicMotor} from './mechanicMotor';
import {mechanicMotorFor,mechanicMotorStages} from '../data/mechanicMotor';
import {mechanicManName} from '../data/hiddenMechanic';
import {decodeBodyPaint} from '../data/bodyPaint';
import {legacyRetrySnapshot} from './retrySave';
import {snapshotGame,type SavedGame} from './saveData';
import {tutorialActive,TUTORIAL_PART,type TutorialStage} from './tutorial';
import {OPENING_END,openingIndex,openingIsWalk,openingLocation,type OpeningTour} from './opening';
import {recordRaceTimes,type TimeHistory} from './timeRecords';
import {yuunagiTimeLimit} from '../data/yuunagiCircuit';
import {emptyCup,cupComplete,cupPlayerPlace,cupProgression,enterCupHeat,finishCupHeat,forfeitCupHeat,raceCupHeat,type CupProgress} from './cup';
import { officialRace, type OfficialRound } from '../data/officialRace';
import { doctor, doctorGiftBody, doctorGiftMessage } from '../data/doctor';
import { replaceConsumable } from './consumables';
import { reviewRace, type RaceReview } from './raceAdvice';
import type { ArrivalKind } from './arrival';
import { create } from 'zustand';
import { parts,type Category } from '../data/parts';
import { purchase, type Wallet } from './purchase';
import { createStarterInventory, starterEquipment, type Equipment, type EquipmentSlot } from '../data/machine';
import { equipPart } from './equipment';
import { racePrize } from './reward';
import { officialTime, rankRacers, type RaceState } from './race';
import { INITIAL_MONEY } from '../data/economy';
import { nextRaceSeed } from './raceSeed';
import { createStarterUnits, type UnitInventory } from './condition';
import { breakInPractice } from '../data/proficiency';
import { hintBooks, nextShopRace } from '../data/shopHints';
import { isSalesShop, canEnterShop, currentShop, type ShopId, type WorldLocation } from '../data/world';
import { challenger, challengerInvitation } from '../data/challenger';
export type DialogueStage='none'|'legend-intro'|'legend-invite'|'legend-debrief'|'villain-intro'|'villain-win'|'villain-loss'|'doctor-gift'|'official-invite';
export interface GameState extends Wallet {
  playerName:string;playSeconds:number;setPlayerName:(name:string)=>void;
  raceChoiceCircuit:CircuitId|null;raceChoiceFromBoard:boolean;mobChallenge:CircuitId|null;openRaceChoice:(id:CircuitId)=>void;startMobTrial:(id:CircuitId)=>void;
  onlineChallenge:OnlineChallenge|null;startOnlineTrial:(circuitId:CircuitId,records:OnlineRecord[])=>void;
  adviceThinking:boolean;bodyPaint:number|null;setBodyPaint:(color:number|null)=>void;tutorialStage:TutorialStage;tutorialReturn:SavedGame|null;retryCheckpoint:SavedGame|null;retryFromSave:()=>void;
  startTutorial:(practice?:boolean)=>void;resumeTutorial:()=>void;inspectTutorial:(slot:EquipmentSlot)=>void;openTutorialShop:()=>void;finishTutorial:()=>void;
  podiumPending:boolean;
  towaEscortStep:number;resumeTowaEscort:()=>void;advanceTowaEscort:(expected:number)=>void;
  koyaEscortStep:number;resumeKoyaEscort:()=>void;advanceKoyaEscort:(expected:number)=>void;
  openingStep:number;openingActive:boolean;openingTour:OpeningTour|null;
  startOpening:(replay?:boolean)=>void;advanceOpening:(expectedStep:number)=>void;completeOpeningWalk:(expectedStep:number)=>void;finishOpening:(showSetting?:boolean)=>void;
  lastLoginAt:number|null;loginBonusReceived:boolean;recordLogin:(now?:number)=>void;
  timeHistory:TimeHistory;legacyTimeHistory:TimeHistory;timeBoardCircuit:CircuitId|null;openTimeBoard:(id?:CircuitId)=>void;officialReplayActive:boolean;
  yuunagiUnlocked:boolean;yuunagiBestTime:number|null;finalQualified:boolean;
  wakabaCup:CupProgress;technicalCup:CupProgress;finalCup:CupProgress;grandprixCleared:boolean;zenithCup:CupProgress;zenithCleared:boolean;akatsukiRaceCount:number;zenithQualified:boolean;gameOver:boolean;wakabaUnlocked:boolean;thirdOfficialQualified:boolean;
  enterOfficialVenue:(id?:'stadium-5'|'stadium-9'|'stadium-10'|'stadium-7')=>void;townReturnVenue:PracticeCourseId|'library'|'stadium-5'|'stadium-9'|'stadium-10'|'stadium-7'|null;
  officialQualified:boolean;officialWon:boolean;officialSpeedWon:boolean;officialDirtWon:boolean;officialRound:OfficialRound;officialChallengeActive:boolean;officialQualificationNotice:boolean;
  openOfficialRace:(round?:OfficialRound)=>void;startOfficialRace:()=>void;
  doctorGiftReceived:boolean;openLegendChallenge:()=>void;
  arrivalEvent:ArrivalKind|null;beginArrival:(kind:ArrivalKind)=>void;completeArrival:()=>void;
  aozoraWon:boolean;villainDefeated:boolean;villainChallengeActive:boolean;villainArrivalPending:boolean;villainDebriefPending:boolean;thirdShopNotice:boolean;
  openVillainChallenge:()=>void;startVillainChallenge:()=>void;
  location:WorldLocation;lastShop:ShopId;legendRaceCompleted:boolean;
  leaveShop:()=>void;enterShop:(id:ShopId)=>void;
  outdoorCourse:PracticeCourseId|null;startOutdoorRace:(id:PracticeCourseId)=>void;
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
  proficiencyPoints:number;talkMechanicMan:()=>void;
  openProficiency:()=>void;
  openLegends:()=>void;
  units:UnitInventory; selectedUnits:Record<'motor'|'battery',string>; unitSerial:number; usageSeconds:number;
  selectUnit:(slot:'motor'|'battery',id:string)=>void; breakIn:()=>void;
  raceAttempt: number; settledAttempt: number; lastPrize: number;
  settleRace: (attempt: number, race: RaceState) => void;
  overlay: 'race-opponents' | 'library' | 'podium' | 'towa-escort' | 'escort' | 'opening' | 'time-board' | 'mission' | 'town-map' | 'arrival' | 'dialogue' | 'shop' | 'race' | 'setting' | 'settings' | 'proficiency' | 'legends' | 'cheat' | 'game-over' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  openSetting: () => void; equip: (id: string,slot?:EquipmentSlot) => void;
  openSettings:()=>void;libraryShelf:Category|'all';enterLibrary:()=>void;openLibrary:(category?:Category|'all')=>void;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
function cupKind(s:GameState){return s.location==='stadium-7'?'zenith' as const:s.location==='stadium-10'?'final' as const:s.location==='stadium-9'?'technical' as const:'wakaba' as const;}
function activeCup(s:GameState){return s.location==='stadium-7'?s.zenithCup:s.location==='stadium-10'?s.finalCup:s.location==='stadium-9'?s.technicalCup:s.wakabaCup;}
function activeRound(s:GameState):OfficialRound{return s.location==='stadium-7'?'zenith':s.location==='stadium-10'?'final':s.location==='stadium-9'?'technical':s.wakabaCup.results.length?'dirt':'speed';}
function updateCup(s:GameState,cup:CupProgress){
 const updated=cupProgression(s.location==='stadium-5'?cup:s.wakabaCup,s.location==='stadium-9'?cup:s.technicalCup,s.thirdOfficialQualified,s.location==='stadium-10'?cup:s.finalCup,s.location==='stadium-7'?cup:s.zenithCup);
 return {...updated,gameOver:s.gameOver||updated.gameOver};
}
function outdoorRaceState(s:GameState,id:PracticeCourseId):Partial<GameState>{
 if(s.location!=='town'||s.overlay!==null||s.openingActive||s.gameOver||!isPracticeCourse(id)||!canEnterShop(id,s))return {};
 return {raceChoiceCircuit:null,raceChoiceFromBoard:false,mobChallenge:null,onlineChallenge:null,outdoorCourse:id,townReturnVenue:id,overlay:'race',officialChallengeActive:false,officialReplayActive:false,officialQualificationNotice:false,shopAfter:false,notice:'',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:false,villainDebriefPending:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false};
}
export const useGame = create<GameState>((set) => ({
  playerName:'',playSeconds:0,setPlayerName:name=>set({playerName:name.trim().slice(0,24)}),
  adviceThinking:false,bodyPaint:null,setBodyPaint:color=>set({bodyPaint:decodeBodyPaint(color)}),tutorialStage:'pending',tutorialReturn:null,retryCheckpoint:null,
  retryFromSave:()=>set(s=>{
    if(!s.gameOver)return {};
    const checkpoint=s.retryCheckpoint??legacyRetrySnapshot(snapshotGame(s));
    return {...useGame.getInitialState(),...structuredClone(checkpoint),playerName:s.playerName,playSeconds:s.playSeconds,retryCheckpoint:structuredClone(checkpoint),overlay:null,gameOver:false,legendEventPending:checkpoint.unlockedRaces.includes(nextShopRace.id)&&!checkpoint.legendRaceCompleted,villainArrivalPending:checkpoint.aozoraWon&&!checkpoint.villainDefeated};
  }),
  startTutorial:(practice=false)=>set(s=>tutorialStart(s,practice)),
  resumeTutorial:()=>set(s=>{
    if(s.openingActive||!tutorialActive(s.tutorialStage)||s.overlay==='race')return {};
    const stage=s.tutorialStage==='racing'?'start':s.tutorialStage;
    return {tutorialStage:stage,location:'komorebi',lastShop:'komorebi',overlay:stage==='purchase'?'shop':['motor','tire','shop','equip'].includes(stage)?'setting':null,shopAfter:false};
  }),
  inspectTutorial:slot=>set(s=>s.tutorialStage==='motor'&&slot==='motor'?{tutorialStage:'tire'}:s.tutorialStage==='tire'&&slot==='tire'?{tutorialStage:'shop'}:{}),
  openTutorialShop:()=>set(s=>!tutorialActive(s.tutorialStage)?{}:(s.inventory[TUTORIAL_PART]??0)>0?{tutorialStage:'equip',overlay:'setting',location:'komorebi',lastShop:'komorebi'}:{tutorialStage:'purchase',overlay:'shop',location:'komorebi',lastShop:'komorebi',shopAfter:false}),
  finishTutorial:()=>set(s=>{
    if(s.tutorialReturn)return {...s.tutorialReturn,playerName:s.playerName,playSeconds:s.playSeconds,tutorialReturn:null,openingActive:false,openingTour:null,overlay:'settings',notice:'',shopAfter:false,dialogueStage:'none',legendEventPending:s.tutorialReturn.unlockedRaces.includes(nextShopRace.id)&&!s.tutorialReturn.legendRaceCompleted,villainArrivalPending:s.tutorialReturn.aozoraWon&&!s.tutorialReturn.villainDefeated,arrivalEvent:null};
    return {tutorialStage:'done',overlay:null,shopAfter:false,notice:''};
  }),
  podiumPending:false,
  towaEscortStep:0,
  resumeTowaEscort:()=>set(s=>!s.gameOver&&!s.openingActive&&koyaEscortActive(s.towaEscortStep)&&s.overlay!=='race'?{overlay:'towa-escort',location:towaEscortLocation(s.towaEscortStep),lastShop:'yuunagi',townReturnVenue:null}:{}),
  advanceTowaEscort:expected=>set(s=>{
    if(s.overlay!=='towa-escort'||s.towaEscortStep!==expected||!koyaEscortActive(expected))return {};
    const step=expected+1;return {towaEscortStep:step,location:towaEscortLocation(step),lastShop:'yuunagi',townReturnVenue:null,overlay:step===KOYA_ESCORT_END?null:'towa-escort',nearby:'',notice:''};
  }),
  koyaEscortStep:0,
  resumeKoyaEscort:()=>set(s=>!s.gameOver&&!s.openingActive&&koyaEscortActive(s.koyaEscortStep)&&s.overlay!=='race'?{overlay:'escort',location:koyaEscortLocation(s.koyaEscortStep),lastShop:'wakaba',townReturnVenue:null}:{}),
  advanceKoyaEscort:expected=>set(s=>{
    if(s.overlay!=='escort'||s.koyaEscortStep!==expected||!koyaEscortActive(expected))return {};
    const step=expected+1;
    return {koyaEscortStep:step,location:koyaEscortLocation(step),lastShop:'wakaba',townReturnVenue:null,overlay:step===KOYA_ESCORT_END?null:'escort',nearby:'',notice:''};
  }),
  openingStep:0,openingActive:false,openingTour:null,
  startOpening:(replay=false)=>set(s=>{
    if(s.openingActive||!replay&&s.openingStep>=OPENING_END)return {};
    const openingTour=replay?{step:0,location:s.location,lastShop:s.lastShop,townReturnVenue:s.townReturnVenue}:null;
    const step=replay?0:s.openingStep;
    return {openingTour,openingActive:true,location:openingLocation(step),lastShop:'komorebi',townReturnVenue:null,overlay:'opening',shopAfter:false,nearby:'',notice:''};
  }),
  advanceOpening:expected=>set(s=>{
    const step=openingIndex(s);if(!s.openingActive||step!==expected||openingIsWalk(step)||step>=OPENING_END-1)return {};
    return s.openingTour?{openingTour:{...s.openingTour,step:step+1}}:{openingStep:step+1};
  }),
  completeOpeningWalk:expected=>set(s=>{
    const step=openingIndex(s);if(!s.openingActive||step!==expected||!openingIsWalk(step))return {};
    return {...(s.openingTour?{openingTour:{...s.openingTour,step:step+1}}:{openingStep:step+1}),location:openingLocation(step+1)};
  }),
  finishOpening:(showSetting=false)=>set(s=>{
    if(!s.openingActive)return {};
    if(s.openingTour&&showSetting)return tutorialStart(s,true);
    if(s.openingTour)return {openingTour:null,openingActive:false,location:s.openingTour.location,lastShop:s.openingTour.lastShop,townReturnVenue:s.openingTour.townReturnVenue,overlay:'settings'};
    if(showSetting&&s.tutorialStage==='pending')return {...tutorialStart(s,false),openingStep:OPENING_END};
    return {tutorialStage:s.tutorialStage==='pending'?'done':s.tutorialStage,openingStep:OPENING_END,openingActive:false,location:'komorebi',lastShop:'komorebi',townReturnVenue:null,overlay:showSetting?'setting':null,shopAfter:false,nearby:'',notice:''};
  }),
  legacyTimeHistory:{},timeBoardCircuit:null,officialReplayActive:false,
  raceChoiceCircuit:null,raceChoiceFromBoard:false,mobChallenge:null,
  openRaceChoice:id=>set(s=>!opponentCourseAvailable(s,id)||s.overlay!==null&&s.overlay!=='time-board'&&s.overlay!=='race-opponents'&&s.overlay!=='dialogue'?s:{raceChoiceCircuit:id,raceChoiceFromBoard:s.overlay==='time-board',overlay:'race-opponents',timeBoardCircuit:id,shopAfter:false,notice:''}),
  startMobTrial:id=>set(s=>{
    if(s.overlay!=='race-opponents'||s.raceChoiceCircuit!==id||!opponentCourseAvailable(s,id))return s;
    if(isPracticeCourse(id))return {...outdoorRaceState({...s,overlay:null},id),raceChoiceCircuit:null,mobChallenge:null,onlineChallenge:null};
    return {qualificationNotice:false,officialQualificationNotice:false,thirdShopNotice:false,legendDebriefPending:false,villainDebriefPending:false,mobChallenge:id,onlineChallenge:null,outdoorCourse:null,overlay:'race',officialChallengeActive:false,officialReplayActive:false,legendChallengeActive:false,villainChallengeActive:false,podiumPending:false,shopAfter:false,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,notice:''};
  }),
  onlineChallenge:null,
  startOnlineTrial:(circuitId,records)=>set(s=>(s.overlay!=='time-board'&&s.overlay!=='race-opponents')||!opponentCourseAvailable(s,circuitId)||s.overlay==='race-opponents'&&s.raceChoiceCircuit!==circuitId||!records.length||records.length>4||records.some(r=>r.circuitId!==circuitId||r.rulesVersion!==currentRaceRulesVersion(circuitId)||!Number.isFinite(r.time)||r.time<=0)?s:{qualificationNotice:false,officialQualificationNotice:false,thirdShopNotice:false,legendDebriefPending:false,villainDebriefPending:false,shopAfter:false,dialogueStage:'none',onlineChallenge:{circuitId,records:structuredClone(records)},mobChallenge:null,outdoorCourse:null,overlay:'race',officialChallengeActive:false,officialReplayActive:false,legendChallengeActive:false,villainChallengeActive:false,podiumPending:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,notice:''}),
  timeHistory:{},openTimeBoard:(id)=>set(s=>s.location==='town'&&!isPracticeCourse(id??'')||isSalesShop(s.location)||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'?s:{overlay:'time-board',shopAfter:false,timeBoardCircuit:id??null}),
  yuunagiUnlocked:false,yuunagiBestTime:null,finalQualified:false,
  wakabaCup:emptyCup(),technicalCup:emptyCup(),finalCup:emptyCup(),grandprixCleared:false,zenithCup:emptyCup(),zenithCleared:false,akatsukiRaceCount:0,zenithQualified:false,gameOver:false,wakabaUnlocked:false,thirdOfficialQualified:false,
  townReturnVenue:null,enterOfficialVenue:(id='stadium-5')=>set(s=>s.gameOver||s.location!=='town'||!(id==='stadium-7'?s.zenithQualified:id==='stadium-10'?s.finalQualified:id==='stadium-5'?s.officialQualified:s.thirdOfficialQualified)||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'?s:{location:id,overlay:null,nearby:'',notice:'',shopAfter:false,townReturnVenue:null}),
  officialQualified:false,officialWon:false,officialSpeedWon:false,officialDirtWon:false,officialRound:'speed',officialChallengeActive:false,officialQualificationNotice:false,
  openOfficialRace:round=>set(s=>{
    if(s.gameOver||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival')return s;
    if(s.location!=='stadium-5'&&s.location!=='stadium-9'&&s.location!=='stadium-10'&&s.location!=='stadium-7')return {overlay:'dialogue',speaker:'森野 陸',dialogue:'公式戦は各公式会場のコースで開催するよ。若葉杯の総合入賞でわかば模型店、優勝で第3公式大会への出場権が得られる。一度限りの勝負に向けて準備しよう。',dialogueStage:'none',shopAfter:false};
    if(s.zenithCleared){const selected=s.location==='stadium-5'?(round==='dirt'?'dirt':'speed'):s.location==='stadium-9'?'technical':s.location==='stadium-10'?'final':'zenith';return {officialRound:selected,raceChoiceCircuit:officialTimeBoards(s.location).find(b=>b.circuitId===(selected==='speed'?'sprint':selected==='dirt'?'sun':selected==='technical'?'comet':selected==='final'?'grandprix':'zenith'))!.circuitId,raceChoiceFromBoard:false,overlay:'race-opponents',speaker:'大会受付係',dialogue:'クリア後の公式コース・タイムアタックです。1台で何度でも挑戦できます。本編の大会結果は変わりません。星皇パーツを1つでも装着した走行は記録対象外です。準備ができたらスタートしましょう。',dialogueStage:'official-invite',shopAfter:false};}
    const cup=activeCup(s),kind=cupKind(s),next=activeRound(s);
    if(cupComplete(cup,kind))return {overlay:'dialogue',speaker:'大会受付係',dialogue:`この大会は出場済みです。総合${cupPlayerPlace(cup)}位。公式大会は一度限りで、再出場はできません。`,dialogueStage:'none',shopAfter:false};
    if(round&&round!==next)return {overlay:'dialogue',speaker:'大会受付係',dialogue:next==='speed'?'まずは第1戦の高速コースから出場してください。':'第1戦は終了しました。ピットで装備を組み直し、第2戦のダートへ進んでください。',dialogueStage:'none',shopAfter:false};
    return {overlay:'dialogue',speaker:'大会受付係',dialogue:(kind==='zenith'?'最終大会・天頂決戦ゼニス・クラウン。怜・岳・斗和・昊也のレジェンド4人との最長の一本道です。縦ループ・横スパイラル・砂・坂・ジャンプのすべてを制してください。':kind==='final'?'第4公式大会・緑川グランプリ。高架スパイラル、ジャンプ、連続S字の一本道決勝です。黒岩 豪、先輩の橘 斗和、石川 蒼、高橋 蓮と勝負します。風見 怜と火野 岳も応援に来ています。':kind==='technical'?'全4大会の第3公式大会・星空テクニカル杯。連続コーナーを約2分走る一発勝負です。':officialRace.briefing)+`\n\n大会への出場は一度だけです。途中退出・再読み込みはそのレースの棄権になります。${kind==='zenith'?'2位以内の完走でゲームクリア、3位以下・リタイアはゲームオーバー。':kind==='final'?'2位以内であかつき模型店を開放、3位以下・リタイアはゲームオーバー。':'総合3位以内で次へ進み、4位以下はゲームオーバー。'}${kind==='wakaba'?'2レースの得点合計（同点は完走数・合計タイム）で総合順位を決めます。現在'+cup.results.length+'/2戦終了。次は'+(next==='speed'?'第1戦・高速舗装':'第2戦・ダート')+'です。':''}`,dialogueStage:'official-invite',shopAfter:false};
  }),
  startOfficialRace:()=>set(s=>{
    if(s.gameOver||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'||s.location!=='stadium-5'&&s.location!=='stadium-9'&&s.location!=='stadium-10'&&s.location!=='stadium-7')return s;
    if(!(s.location==='stadium-7'?s.zenithQualified:s.location==='stadium-10'?s.finalQualified:s.location==='stadium-9'?s.thirdOfficialQualified:s.officialQualified))return s;
    if(s.zenithCleared)return {raceChoiceCircuit:null,raceChoiceFromBoard:false,mobChallenge:null,onlineChallenge:null,officialRound:s.location==='stadium-5'?(s.raceChoiceCircuit?(s.raceChoiceCircuit==='sun'?'dirt':'speed'):(s.officialRound==='speed'?'speed':'dirt')):s.location==='stadium-9'?'technical':s.location==='stadium-10'?'final':'zenith',overlay:'race',officialChallengeActive:true,officialReplayActive:true,legendChallengeActive:false,villainChallengeActive:false,podiumPending:false,shopAfter:false,dialogueStage:'none',notice:'',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0};
    const round=activeRound(s),id=round==='zenith'?'zenith':round==='final'?'grandprix':round==='technical'?'comet':round==='speed'?'sprint':'sun',old=activeCup(s),cup=enterCupHeat(old,id,cupKind(s));
    if(cup===old)return s;
    return {retryCheckpoint:snapshotGame(s),...(s.location==='stadium-7'?{zenithCup:cup}:s.location==='stadium-10'?{finalCup:cup}:s.location==='stadium-9'?{technicalCup:cup}:{wakabaCup:cup}),overlay:'race',officialChallengeActive:true,officialRound:round,legendChallengeActive:false,villainChallengeActive:false,legendDebriefPending:false,villainDebriefPending:false,shopAfter:false,dialogueStage:'none',notice:'',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,officialQualificationNotice:false,qualificationNotice:false,thirdShopNotice:false};
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
  openVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'?s:{overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'くっ、今日はお前の勝ちだ。ひなた模型店への紹介状は約束どおり渡した。次は俺が勝つ。覚えておけよ！':challengerInvitation,dialogueStage:s.villainDefeated?'villain-win':'villain-intro',shopAfter:false,villainArrivalPending:false}),
  startVillainChallenge:()=>set(s=>s.location!=='aozora'||!s.aozoraWon||s.villainDefeated||s.overlay==='arrival'?s:{overlay:'race',shopAfter:false,notice:'黒岩 豪からの挑戦！',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:true,villainArrivalPending:false,villainDebriefPending:false,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false,thirdShopNotice:false}),
  location:'komorebi',lastShop:'komorebi',legendRaceCompleted:false,
  leaveShop:()=>set(s=>{
    if(s.gameOver)return s;
    if(s.location==='town'||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival')return s;
    if(s.location==='komorebi'&&s.unlockedRaces.includes(nextShopRace.id)&&!s.legendRaceCompleted)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false,legendEventPending:true};
    if(s.location==='komorebi'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    return {location:'town',townReturnVenue:s.location==='library'||s.location==='stadium-5'||s.location==='stadium-9'||s.location==='stadium-10'||s.location==='stadium-7'?s.location:null,lastShop:s.location==='library'||s.location==='stadium-5'||s.location==='stadium-9'||s.location==='stadium-10'||s.location==='stadium-7'?s.lastShop:s.location,overlay:null,nearby:'',notice:'',shopAfter:false};
  }),
  outdoorCourse:null,
  startOutdoorRace:id=>set(s=>outdoorRaceState(s,id)),
  enterShop:id=>set(s=>isPracticeCourse(id)?outdoorRaceState(s,id):(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.gameOver||s.location!=='town'||!canEnterShop(id,s)?s:{location:id,lastShop:id,townReturnVenue:null,overlay:null,nearby:'',notice:'',shopAfter:false}),
  hintBookIndex:0,unlockedRaces:[],qualificationNotice:false,legendEventSeen:false,legendEventPending:false,legendDebriefPending:false,legendChallengeActive:false,dialogueStage:'none',cheatUsed:false,cheatReturnToSettings:false,
  purchaseCount:0,lastRaceReview:null,
  exchangeReusable:slot=>set(s=>s.location==='town'||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'?s:{...replaceConsumable(s,slot==='motor'?'motor-rescue':'battery-recharge'),notice:slot==='motor'?'リユースモーターを装着しました。他の種類のモーターは保持しています。':'リチウムセルを装着しました。他の種類の電池は保持しています。'}),
  readHintBook:()=>set(s=>{
    const index=s.hintBookIndex%hintBooks.length,book=hintBooks[index];
    return {overlay:'dialogue',speaker:`セッティング本棚 ${index+1} / ${hintBooks.length}・${book.title}`,dialogue:`${book.text}（閉じてもう一度調べると次の本）`,shopAfter:false,hintBookIndex:(index+1)%hintBooks.length};
  }),
  raceSeed:0x5eed,
  lastLoginAt:null,loginBonusReceived:false,
  recordLogin:(now=Date.now())=>set(s=>{
    if(!Number.isSafeInteger(now)||now<0)return {};
    const reward=s.lastLoginAt!==null&&now-s.lastLoginAt>=6*60*60*1000;
    return {lastLoginAt:Math.max(s.lastLoginAt??0,now),money:s.money+(reward?500:0),loginBonusReceived:s.loginBonusReceived||reward};
  }),
  money: INITIAL_MONEY, inventory: createStarterInventory(), equipment: {...starterEquipment}, overlay: null, speaker: '', dialogue: '', shopAfter: false, notice: '', nearby: '',
  raceAttempt: 0, settledAttempt: -1, lastPrize: 0,
  proficiencyPoints:0,
  talkMechanicMan:()=>set(s=>{
   if(s.location!=='town'||s.overlay||s.openingActive)return {};
   const update=syncMechanicMotor(s,true),stage=mechanicMotorFor(s.proficiencyPoints),next=mechanicMotorStages[stage.level];
   const owned=Object.keys(s.inventory).some(id=>id.startsWith('motor-mechanic-')&&s.inventory[id]>0);
   return {...update,overlay:'dialogue',speaker:mechanicManName,shopAfter:false,dialogueStage:'none',dialogue:`よくこの路地を見つけたな。私はメカニックマン。${owned?'贈ったモーターの調子はどうだ？':'君に、メカニック・リンクを一つ贈ろう。模型店の作業台で装着できるぞ。'} 今の君の熟練度は${Math.floor(s.proficiencyPoints)}pt。モーターはLv.${stage.level}、${stage.rpm.toLocaleString('en-US')}rpm・トルク${stage.torque.toFixed(2)}。消耗せず、ブレークインもいらない。熟練度が上がれば、私のところに戻らなくても自動で強化される。${next?`次は${next.points}ptだ。`:'熟練度ランキング単独1位、おめでとう！ 最高段階の力を託そう。'} 最高段階は、レジェンドも含めた熟練度ランキングの単独1位になったときだけだ。腕を磨いてこい！`};
  }),
  openProficiency:()=>set({overlay:'proficiency',shopAfter:false,notice:''}),
  openLegends:()=>set({overlay:'legends',shopAfter:false,notice:''}),
  units:createStarterUnits(),selectedUnits:{motor:'starter-motor',battery:'starter-battery'},unitSerial:0,usageSeconds:0,
  selectUnit:(slot,id)=>set(s=>s.overlay==='race'||!s.units[s.equipment[slot]]?.some(u=>u.id===id)?s:{selectedUnits:{...s.selectedUnits,[slot]:id}}),
  breakIn:()=>set(s=>{
    if(s.overlay!=='setting')return s;
    const motorPart=parts.find(p=>p.id===s.equipment.motor);
    if(motorPart?.specs.wear===0)return {notice:`${motorPart.name}は消耗しません。ブレークインは不要です。`};
    const duration=30;
    const units={...s.units,[s.equipment.motor]:s.units[s.equipment.motor].map(u=>u.id===s.selectedUnits.motor?{...u,seconds:u.seconds+duration}:u)};
    const motor=s.units[s.equipment.motor]?.find(u=>u.id===s.selectedUnits.motor);
    const practice=breakInPractice(motor?.seconds??0,duration);
    return {units,proficiencyPoints:s.proficiencyPoints+practice,notice:`${duration.toFixed(0)}秒のブレークイン運転を行いました。電池の残量は減りません。${practice>0?' 整備の熟練度が上がりました。':''}`};
  }),
  startTrial: () => set(s=>(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.gameOver||s.location==='library'||isSalesShop(s.location)||s.location==='town'||s.location==='stadium-5'||s.location==='stadium-9'||s.location==='stadium-10'||s.location==='stadium-7'?s:({raceChoiceCircuit:null,raceChoiceFromBoard:false,mobChallenge:null,onlineChallenge:null,tutorialStage:s.tutorialStage==='start'||s.tutorialStage==='racing'?'racing':s.tutorialStage,overlay:'race',officialChallengeActive:false,officialQualificationNotice:false,shopAfter:false,notice:'',legendChallengeActive:false,legendDebriefPending:false,villainChallengeActive:false,villainDebriefPending:false,thirdShopNotice:false,raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
  settleRace: (attempt,race) => set(s=>{
    if(attempt!==s.raceAttempt)return s;
    const player=race.racers.find(r=>r.id==='player');
    const seconds=player?.driving.time??0,delta=Math.max(0,seconds-s.usageSeconds);
    const units={...s.units};
    if(delta>0&&player)for(const slot of ['motor','battery'] as const){
      const id=player.equipment[slot];units[id]=(units[id]??[]).map(u=>u.id===s.selectedUnits[slot]?{...u,seconds:u.seconds+delta}:u);
    }
    const reward=race.phase==='finished'&&s.settledAttempt!==attempt;
    if(s.onlineChallenge||s.mobChallenge&&s.location.startsWith('stadium-'))return !delta&&!reward?s:{units,usageSeconds:Math.max(s.usageSeconds,seconds),...(reward?{timeHistory:recordRaceTimes(s.timeHistory,race,attempt),settledAttempt:attempt,lastPrize:0}:{})};
    const prize=reward&&!s.legendChallengeActive?racePrize(race):0;
    const firstWin=reward&&s.location==='komorebi'&&!s.legendChallengeActive&&player?.driving.status==='finished'&&rankRacers(race)[0]?.id==='player'&&!s.unlockedRaces.includes(nextShopRace.id);
    const completedLegend=reward&&s.legendChallengeActive&&(player?.driving.status==='finished'||player?.driving.stopReason==='lapped')&&rankRacers(race)[0]?.id.startsWith('legend-')===true;
    const playerWon=reward&&player?.driving.status==='finished'&&rankRacers(race)[0]?.id==='player';
    const firstAozoraWin=playerWon&&s.location==='aozora'&&!s.villainChallengeActive&&!s.aozoraWon;
    const defeatedVillain=playerWon&&s.location==='aozora'&&s.villainChallengeActive&&!s.villainDefeated;
    const firstHinataWin=playerWon&&race.circuitId==='sun'&&s.location==='hinata'&&!s.officialChallengeActive&&race.event!=='official'&&!s.officialQualified;
    const cupUpdate=reward&&s.officialChallengeActive&&!s.officialReplayActive&&race.event==='official'?updateCup(s,finishCupHeat(activeCup(s),raceCupHeat(race))):{};
    const firstWakabaWin=playerWon&&s.location==='wakaba'&&!s.officialChallengeActive;
    const trialFinished=reward&&s.location==='yuunagi'&&race.circuitId==='trail'&&race.event==='shop'&&!s.officialChallengeActive&&player?.driving.status==='finished';
    const trialTime=trialFinished&&player?officialTime(race,player):Infinity;
    const yuunagiBestTime=trialFinished?Math.min(s.yuunagiBestTime??Infinity,trialTime):s.yuunagiBestTime;
    const finalQualified=s.finalQualified||s.yuunagiUnlocked&&trialFinished&&trialTime<=yuunagiTimeLimit;
    const training=reward&&s.location==='akatsuki'&&race.circuitId==='forge'&&race.event==='shop'&&seconds>0;
    const akatsukiRaceCount=s.akatsukiRaceCount+Number(training),zenithQualified=s.zenithQualified||s.grandprixCleared&&akatsukiRaceCount>=5;
    const inventory=s.inventory;
    if(!delta&&!reward)return s;
    const practice=reward&&player?(player.driving.status==='finished'?5+(rankRacers(race)[0]?.id==='player'?5:0):seconds>0?1:0):0;
    return {...(reward&&s.officialChallengeActive&&!s.officialReplayActive&&race.event==='official'?{podiumPending:true}:{}),...(s.yuunagiUnlocked&&trialFinished&&trialTime<=yuunagiTimeLimit&&s.towaEscortStep===0&&!s.finalCup.entered?{towaEscortStep:1}:{}),...(reward&&s.tutorialStage==='racing'?{tutorialStage:'result' as const}:{}),...(reward?{timeHistory:recordRaceTimes(s.timeHistory,race,attempt)}:{}),akatsukiRaceCount,zenithQualified,yuunagiBestTime,finalQualified,...(firstHinataWin?{officialQualified:true,officialQualificationNotice:true}:{}),...cupUpdate,...(firstWakabaWin?{thirdOfficialQualified:true,...(s.koyaEscortStep===0&&!s.technicalCup.entered?{koyaEscortStep:1}:{})}:{}),...(reward?{lastRaceReview:reviewRace(race)}:{}),units,inventory,usageSeconds:Math.max(s.usageSeconds,seconds),money:s.money+prize,proficiencyPoints:s.proficiencyPoints+practice,...(firstWin?{unlockedRaces:[...s.unlockedRaces,nextShopRace.id],qualificationNotice:true,...(!s.legendRaceCompleted?{legendEventPending:true}:{})}:{}),...(firstAozoraWin?{aozoraWon:true,villainArrivalPending:true}:{}),...(defeatedVillain?{villainDefeated:true,thirdShopNotice:true}:{}),...(s.villainChallengeActive&&reward?{villainDebriefPending:true}:{}),...(completedLegend?{legendRaceCompleted:true}:{}),...(s.legendChallengeActive&&reward?{legendDebriefPending:true}:{}),...(reward?{lastPrize:prize,settledAttempt:attempt}:{})};
  }),
  openSetting: () => set(s=>(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')?{}:{overlay:'setting',shopAfter:false,notice:''}),
  libraryShelf:'all',
  enterLibrary:()=>set(s=>s.location==='town'&&!s.overlay&&!s.openingActive&&!s.gameOver?{location:'library',townReturnVenue:null,overlay:null,nearby:'',notice:''}:{}),
  openLibrary:(category='all')=>set(s=>s.location==='library'&&!s.overlay&&!s.openingActive?{overlay:'library',libraryShelf:category,nearby:'',notice:''}:{}),
  openSettings:()=>set(s=>(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')?{}:{overlay:'settings',shopAfter:false,notice:''}),
  openCheat:(fromSettings=false)=>set({overlay:'cheat',shopAfter:false,notice:'',cheatReturnToSettings:fromSettings}),
  applyCheat:(amount)=>set(s=>({money:amount==='max'?9_999_999:s.money+1000,cheatUsed:s.cheatUsed||amount==='max',overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,notice:''})),
  equip: (id,slot) => set(s => {
    if(s.overlay==='race')return s;
    const equipment=equipPart(s.equipment,s.inventory,id,slot),selectedUnits={...s.selectedUnits};
    for(const key of ['motor','battery'] as const)if(equipment[key]!==s.equipment[key])selectedUnits[key]=s.units[equipment[key]]?.[0]?.id??'';
    return {equipment,selectedUnits,...(s.tutorialStage==='equip'&&equipment.gear===TUTORIAL_PART?{tutorialStage:'start' as const}:{})};
  }),
  openLegendChallenge:()=>set(s=>s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)||s.legendRaceCompleted||s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival'?s:{overlay:'dialogue',speaker:'火野 岳',dialogue:'準備はできたかい？ 僕たち兄弟とのレースに、何度でも挑んでおいで。',dialogueStage:'legend-invite',shopAfter:false}),
  startLegendChallenge:()=>set(s=>s.location!=='komorebi'||!s.unlockedRaces.includes(nextShopRace.id)||s.overlay==='arrival'?s:({overlay:'race',shopAfter:false,notice:'最強兄弟との特別レース！',legendEventPending:false,legendDebriefPending:false,legendEventSeen:true,legendChallengeActive:true,dialogueStage:'none',raceAttempt:s.raceAttempt+1,raceSeed:nextRaceSeed(s.raceSeed),lastPrize:0,usageSeconds:0,qualificationNotice:false})),
  talk: (speaker, dialogue, shopAfter = false) => set({ overlay:'dialogue',speaker,dialogue,shopAfter,dialogueStage:'none',adviceThinking:false }),
  advance: () => set(s => s.dialogueStage==='legend-intro'?{overlay:'dialogue',speaker:'火野 岳',dialogue:'優勝したばかりで悪いが、僕たちとも走ってくれないか？ 速さの世界を見せてあげるよ。',dialogueStage:'legend-invite'}:{ overlay: s.shopAfter ? 'shop' : null, shopAfter:false,notice:'',dialogueStage:'none' }),
  close: () => set(s=>{
    if(s.overlay==='race'&&(s.onlineChallenge||s.mobChallenge))return {overlay:s.raceChoiceCircuit?'race-opponents':'time-board',onlineChallenge:null,mobChallenge:null,notice:''};
    if(s.overlay==='race-opponents')return {overlay:s.raceChoiceFromBoard?'time-board':null,raceChoiceCircuit:null,raceChoiceFromBoard:false,notice:''};
    if(s.openingActive)return s;
    if(s.overlay==='game-over')return s;
    if(s.overlay==='race'&&s.outdoorCourse)return {overlay:null,outdoorCourse:null,shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.officialReplayActive)return {overlay:null,officialReplayActive:false,officialChallengeActive:false,shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.officialChallengeActive&&s.podiumPending)return {overlay:'podium'};
    if(s.overlay==='race'&&s.location==='yuunagi'&&s.towaEscortStep===1)return {overlay:'towa-escort',shopAfter:false,notice:''};
    if(s.overlay==='arrival'||s.overlay==='escort'||s.overlay==='towa-escort')return s;
    if(s.overlay==='race'&&s.location==='wakaba'&&s.koyaEscortStep===1)return {overlay:'escort',shopAfter:false,notice:''};
    if(s.overlay==='race'&&s.location==='komorebi'&&!s.officialChallengeActive&&!s.legendChallengeActive&&tutorialActive(s.tutorialStage))return {overlay:null,shopAfter:false,notice:''};
    if(s.overlay==='dialogue'&&s.dialogueStage==='legend-debrief'&&s.legendRaceCompleted&&!s.doctorGiftReceived)return {overlay:'arrival',arrivalEvent:'doctor',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='cheat')return {overlay:s.cheatReturnToSettings?'settings':null,cheatReturnToSettings:false,shopAfter:false,notice:''};
    if((s.overlay==='race'||s.overlay==='podium')&&s.officialChallengeActive){
      const updated=updateCup(s,forfeitCupHeat(activeCup(s))),cup=s.location==='stadium-7'?updated.zenithCup:s.location==='stadium-10'?updated.finalCup:s.location==='stadium-9'?updated.technicalCup:updated.wakabaCup,done=cupComplete(cup,cupKind(s));
      if(updated.gameOver)return {...updated,podiumPending:false,overlay:'game-over',officialChallengeActive:false,dialogueStage:'none',shopAfter:false};
      return {...updated,podiumPending:false,overlay:'dialogue',speaker:'大会受付係',dialogue:done?s.location==='stadium-7'?`天頂決戦・ゼニス・クラウン、${cupPlayerPlace(cup)}位！ おめでとう！ すべての難所と強豪を越え、今度こそゲームクリアです。ほしくず模型店と、街の東側の巨大マスターコース4か所が開放されました！ 各公式会場でも何度でもタイムアタックに挑戦できます！ 星皇装着の走行は記録されません。`:s.location==='stadium-10'?`緑川グランプリ・${cupPlayerPlace(cup)}位！ おめでとう、あかつき模型店が開放されました！ 最上位パーツを揃え、強豪たちと5回走って天頂決戦の出場権をつかんでください。`:s.location==='stadium-9'?`星空テクニカル杯・総合${cupPlayerPlace(cup)}位、おめでとうございます。長距離の連続コーナーを走り切りました。街のゆうなぎ模型店が開放されました！ 次は一本道コースを40秒以内で完走して、第4公式大会の出場権を目指してください。この大会は再出場できません。`:`総合${cupPlayerPlace(cup)}位、おめでとうございます。${updated.officialWon?'第3公式大会・星空テクニカル杯の出場権を獲得！':''}${updated.wakabaUnlocked?'街のわかば模型店が開放されました。':''}この大会は再出場できません。`:'第1戦の結果を記録しました。ピットで装備を組み直し、第2戦へ進んでください。第1戦はやり直せません。',officialChallengeActive:false,dialogueStage:done?'none':'official-invite',shopAfter:false};
    }
    if(s.overlay==='race'&&s.officialQualificationNotice)return {overlay:'dialogue',speaker:'日向 誠二',dialogue:officialRace.invitation,dialogueStage:'none',officialQualificationNotice:false,shopAfter:false};
    if(s.overlay==='race'&&s.villainChallengeActive&&s.villainDebriefPending)return {overlay:'dialogue',speaker:challenger.name,dialogue:s.villainDefeated?'な、なんだと……俺が負けた？ ちっ、約束は守る。ひなた模型店への紹介状だ。町の、あおぞら模型店の右隣へ行け。次は負けないからな！':'ふん、まだその程度か。ギアと電池、それにモーターのブレークインを見直してこい。ここで待っている。勝てるまで何度でも相手をしてやる！',dialogueStage:s.villainDefeated?'villain-win':'villain-loss',villainChallengeActive:false,villainDebriefPending:false,shopAfter:false};
    if(s.overlay==='race'&&s.location==='aozora'&&s.villainArrivalPending)return {overlay:'arrival',arrivalEvent:'villain',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.location==='komorebi'&&s.legendEventPending)return {overlay:'arrival',arrivalEvent:'legend',dialogueStage:'none',shopAfter:false};
    if(s.overlay==='race'&&s.legendDebriefPending)return {overlay:'dialogue',speaker:'風見 怜',dialogue:s.legendRaceCompleted?'これが僕たち兄弟の走りだよ。今日は僕たちの勝ち。でも、君のマシンには伸びしろがある。外の町へ出て、あおぞら模型店にも挑戦してごらん。店の下の出口から行けるよ。またコースで会おう！':'今回は最後まで走れなかったね。電池や安定性を調整して、僕たちともう一度走ろう。出口で声をかけてくれれば、いつでも待っているよ。',dialogueStage:'legend-debrief',legendDebriefPending:false,legendChallengeActive:false,legendEventPending:!s.legendRaceCompleted,shopAfter:false};
    return {overlay:null,shopAfter:false,notice:'',dialogueStage:'none',legendChallengeActive:false,villainChallengeActive:false,villainDebriefPending:false};
  }),
  buy: id => set(s => {
    if(s.overlay==='race'||(s.overlay==='escort'||s.overlay==='towa-escort'||s.overlay==='podium')||s.overlay==='arrival')return s;
    if(s.location==='library'||s.location==='town'||s.location==='stadium-5'||s.location==='stadium-9'||s.location==='stadium-10'||s.location==='stadium-7')return {notice:'パーツは模型店の店主から購入できます。'};
    const result=purchase(s,id,currentShop(s.location));
    if(!result.success)return {notice:result.message};
    const consumable=id.startsWith('motor-')||id.startsWith('battery-');
    return {...result.wallet,...(s.tutorialStage==='purchase'&&id===TUTORIAL_PART?{tutorialStage:'equip' as const,overlay:'setting' as const}:{}),purchaseCount:s.purchaseCount+1,notice:result.message,...(consumable?replaceConsumable(s,id):{})};
  }),
}));

function tutorialStart(state:GameState,practice:boolean):Partial<GameState>{
 if(tutorialActive(state.tutorialStage))return {};
 if(practice){const baseline=snapshotGame(state);return {...useGame.getInitialState(),playerName:state.playerName,playSeconds:state.playSeconds,openingStep:OPENING_END,openingActive:false,openingTour:null,tutorialReturn:baseline,retryCheckpoint:state.retryCheckpoint,tutorialStage:'motor',location:'komorebi',lastShop:'komorebi',overlay:'setting'};}
 return {tutorialStage:'motor',openingActive:false,openingTour:null,location:'komorebi',lastShop:'komorebi',overlay:'setting',shopAfter:false};
}

// 熟練度の獲得、保存復元、練習終了、再開にも同じ成長規則を適用する。
useGame.subscribe((state,previous)=>{
 if(state.overlay==='race'||state.proficiencyPoints===previous.proficiencyPoints&&state.overlay===previous.overlay)return;
 const update=syncMechanicMotor(state);if(update)useGame.setState(update);
});
