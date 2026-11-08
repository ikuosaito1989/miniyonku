import type Phaser from 'phaser';
/** 光源の微かな光沢だけを重ねる。文字や共通の家具は追加しない。 */
export function drawShopDetails(scene:Phaser.Scene,_mirrored=false){
 const g=scene.add.graphics().setDepth(-90);g.fillStyle(0xffefc8,.025).fillRect(40,115,880,455);
}
