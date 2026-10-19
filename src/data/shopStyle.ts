/** 原画用の共通色。既存作品の素材・パレットデータは使用しない。 */
export const shopPalette={
  outline:0x35445f,wall:0x858fae,wallDark:0x707c9c,wallLight:0xabb6cc,
  floor:[0xb9e1d4,0xc4e8dc,0xb1d9ce,0xc9e9dd],grout:0x79aa9e,
  tileLight:0xe0f5e7,tileShade:0x98c8ba,tileGrain:0xa4d2c4,
  metal:0xabb6d0,metalLight:0xe8ebf7,metalShade:0x7585a6,
  shelfBack:0x455675,shelfEdge:0xc0c9de,
} as const;
export function tileSpeckles(column:number,row:number){
  return Array.from({length:24},(_,i)=>{
    const hash=(value:number)=>{let n=value;n=Math.imul(n^(n>>>16),0x45d9f3b);n=Math.imul(n^(n>>>16),0x45d9f3b);return (n^(n>>>16))>>>0;};
    const seed=hash(column*173+row*971+i*37);
    return {x:3+seed%25,y:3+hash(seed+17)%25,light:seed%3===0};
  });
}
