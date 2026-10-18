import { create } from 'zustand';
import { purchase, type Wallet } from './purchase';
import { createStarterInventory, starterEquipment, type Equipment, type EquipmentSlot } from '../data/machine';
import { equipPart } from './equipment';
import { racePrize } from './reward';
import type { RaceState } from './race';
import { batteryCharge, batteryCapacity, createStarterUnits, type UnitInventory } from './condition';
interface GameState extends Wallet {
  equipment: Equipment;
  units:UnitInventory; selectedUnits:Record<'motor'|'battery',string>; unitSerial:number; usageSeconds:number;
  selectUnit:(slot:'motor'|'battery',id:string)=>void; breakIn:()=>void;
  raceAttempt: number; settledAttempt: number; lastPrize: number;
  settleRace: (attempt: number, race: RaceState) => void;
  overlay: 'dialogue' | 'shop' | 'race' | 'setting' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  openSetting: () => void; equip: (id: string,slot?:EquipmentSlot) => void;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
export const useGame = create<GameState>((set) => ({
  money: 3000, inventory: createStarterInventory(), equipment: {...starterEquipment}, overlay: null, speaker: '', dialogue: '', shopAfter: false, notice: '', nearby: '',
  raceAttempt: 0, settledAttempt: -1, lastPrize: 0,
  units:createStarterUnits(),selectedUnits:{motor:'starter-motor',battery:'starter-battery'},unitSerial:0,usageSeconds:0,
  selectUnit:(slot,id)=>set(s=>s.overlay==='race'||!s.units[s.equipment[slot]]?.some(u=>u.id===id)?s:{selectedUnits:{...s.selectedUnits,[slot]:id}}),
  breakIn:()=>set(s=>{
    if(s.overlay!=='setting')return s;
    const battery=s.units[s.equipment.battery]?.find(u=>u.id===s.selectedUnits.battery);
    if(!battery||batteryCharge(s.equipment.battery,battery.seconds)<=0)return {notice:'電池が空です。別の電池に交換してください。'};
    const duration=Math.min(30,Math.max(0,batteryCapacity(s.equipment.battery)-battery.seconds));
    const units={...s.units};
    for(const slot of ['motor','battery'] as const)units[s.equipment[slot]]=units[s.equipment[slot]].map(u=>u.id===s.selectedUnits[slot]?{...u,seconds:u.seconds+duration}:u);
    return {units,notice:`${duration.toFixed(0)}秒の慣らし運転を行いました。電池も消耗します。`};
  }),
  startTrial: () => set(s=>({overlay:'race',shopAfter:false,notice:'',raceAttempt:s.raceAttempt+1,lastPrize:0,usageSeconds:0})),
  settleRace: (attempt,race) => set(s=>{
    if(attempt!==s.raceAttempt)return s;
    const player=race.racers.find(r=>r.id==='player');
    const seconds=player?.driving.time??0,delta=Math.max(0,seconds-s.usageSeconds);
    const units={...s.units};
    if(delta>0&&player)for(const slot of ['motor','battery'] as const){
      const id=player.equipment[slot];units[id]=(units[id]??[]).map(u=>u.id===s.selectedUnits[slot]?{...u,seconds:u.seconds+delta}:u);
    }
    const reward=race.phase==='finished'&&s.settledAttempt!==attempt;
    const prize=reward?racePrize(race):0;
    if(!delta&&!reward)return s;
    return {units,usageSeconds:Math.max(s.usageSeconds,seconds),money:s.money+prize,...(reward?{lastPrize:prize,settledAttempt:attempt}:{})};
  }),
  openSetting: () => set({overlay:'setting',shopAfter:false,notice:''}),
  equip: (id,slot) => set(s => {
    if(s.overlay==='race')return s;
    const equipment=equipPart(s.equipment,s.inventory,id,slot),selectedUnits={...s.selectedUnits};
    for(const key of ['motor','battery'] as const)if(equipment[key]!==s.equipment[key])selectedUnits[key]=s.units[equipment[key]]?.[0]?.id??'';
    return {equipment,selectedUnits};
  }),
  talk: (speaker, dialogue, shopAfter = false) => set({ overlay:'dialogue',speaker,dialogue,shopAfter }),
  advance: () => set(s => ({ overlay: s.shopAfter ? 'shop' : null, shopAfter:false,notice:'' })),
  close: () => set({overlay:null,shopAfter:false,notice:''}),
  buy: id => set(s => {
    const result=purchase(s,id);
    if(!result.success)return {notice:result.message};
    const consumable=id.startsWith('motor-')||id.startsWith('battery-');
    return {...result.wallet,notice:result.message,...(consumable?{unitSerial:s.unitSerial+1,units:{...s.units,[id]:[...(s.units[id]??[]),{id:`unit-${s.unitSerial+1}`,seconds:0}]}}:{})};
  }),
}));
