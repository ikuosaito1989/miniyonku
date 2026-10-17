import { create } from 'zustand';
import { purchase, type Wallet } from './purchase';
import { createStarterInventory, starterEquipment, type Equipment } from '../data/machine';
interface GameState extends Wallet {
  equipment: Equipment;
  overlay: 'dialogue' | 'shop' | 'race' | null; speaker: string; dialogue: string; shopAfter: boolean; notice: string; nearby: string;
  startTrial: () => void;
  talk: (speaker: string, text: string, shopAfter?: boolean) => void; advance: () => void; close: () => void; buy: (id: string) => void;
}
export const useGame = create<GameState>((set) => ({
  money: 3000, inventory: createStarterInventory(), equipment: {...starterEquipment}, overlay: null, speaker: '', dialogue: '', shopAfter: false, notice: '', nearby: '',
  startTrial: () => set({overlay:'race',shopAfter:false,notice:''}),
  talk: (speaker, dialogue, shopAfter = false) => set({ overlay:'dialogue',speaker,dialogue,shopAfter }),
  advance: () => set(s => ({ overlay: s.shopAfter ? 'shop' : null, shopAfter:false,notice:'' })),
  close: () => set({overlay:null,shopAfter:false,notice:''}),
  buy: id => set(s => { const result = purchase(s,id); return {...result.wallet, notice:result.message}; }),
}));
