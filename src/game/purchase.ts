import { parts } from '../data/parts';
import { isStocked, starterShop, type ShopStock } from '../data/progression';
export interface Wallet { money: number; inventory: Record<string, number> }
export function purchase(wallet: Wallet, id: string, shop:ShopStock=starterShop): { wallet: Wallet; message: string; success: boolean } {
  const part = parts.find(p => p.id === id);
  if (!part) return { wallet, message: 'このパーツは販売していません。', success: false };
  if(!isStocked(part,shop))return {wallet,message:'この模型店では取り扱っていません。',success:false};
  if (wallet.money < part.price) return { wallet, message: '所持金が足りません。ほかのパーツも見てみよう。', success: false };
  return { wallet: { money: wallet.money - part.price, inventory: { ...wallet.inventory, [id]: (wallet.inventory[id] ?? 0) + 1 } }, message: `${part.name}を購入しました！`, success: true };
}
