import { parts } from '../data/parts';
export interface Wallet { money: number; inventory: Record<string, number> }
export function purchase(wallet: Wallet, id: string): { wallet: Wallet; message: string; success: boolean } {
  const part = parts.find(p => p.id === id);
  if (!part) return { wallet, message: 'このパーツは販売していません。', success: false };
  if (wallet.money < part.price) return { wallet, message: '所持金が足りません。ほかのパーツも見てみよう。', success: false };
  return { wallet: { money: wallet.money - part.price, inventory: { ...wallet.inventory, [id]: (wallet.inventory[id] ?? 0) + 1 } }, message: `${part.name}を購入しました！`, success: true };
}
