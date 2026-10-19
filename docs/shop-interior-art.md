# 店内の専用背景

組み込み画像生成ツールで独自の模型店を制作。既存ゲームの画像は素材として使用していません。

- 配置参照: [art/shop-layout-reference.png](art/shop-layout-reference.png)。既存描画から人物・UIを除いた960×640の配置図。
- 使用画像: `src/assets/shop/interior-v1.webp`。生成原画1536×1024を最近傍補間で1920×1280へ調整しWebP品質90へ変換。約511KB。
- 論理マップは960×640。画像の家具輪郭に合わせ`src/data/shop.ts`の当たり判定を調整。
- 背景と前景は同一テクスチャを共有。家具の底辺で重なり順を決定。前景は家具の上端から切り出し、不透明な床で背後の人物を隠さない。
- 店名・熟練度表・分類はライブテキスト。人物は60×80歩行スプライトを継続使用。
- 背景読み込み失敗時は従来のコード描画へフォールバック。

## 最終生成プロンプト

```text
Use case: style-transfer / game environment production art. Input image is the EXACT ORIGINAL GAME MAP LAYOUT, not a visual quality target. Repaint this entire 960x640 LANDSCAPE 3:2 map into much richer, beautiful hand-crafted 16-bit Japanese console RPG pixel art of a welcoming miniature racing model hobby shop. This is a usable game background asset, NOT a mockup or cinematic illustration. CRITICAL: keep the same straight-on overhead RPG projection, same canvas bounds, same wall/floor boundary, SAME position and screen-space bounding footprint of EVERY fixture. Do not rotate, tilt, zoom, crop, center or rearrange the room. Floor grid stays axis-aligned, no vanishing point. No people, characters, UI, dialogue boxes or portraits anywhere. No logos or existing franchise graphics. No readable text: leave the top-left shop sign and the tall left ranking board as clean empty dark panels for live text overlays.
Make the art much more detailed and inviting than the primitive reference: restrained mint/seafoam terrazzo tiles with small natural stone flecks, less heavy repetitive grid, blue-gray textured wall, warm cream and periwinkle counters with wooden trim, carefully shaded contact shadows and tiny soft reflected highlights. Add handcrafted pixel detail, not photorealism, no blurry painting, no 3D render, no isometric diorama. Rich but controlled colorful palettes and deliberate crisp pixel clusters.
Exact objects to preserve, coordinates in the original 960x640 layout: ranking board at (56,124) size38x116, EMPTY dark middle; original glass counter at (100,150) size230x62, with tiny original racing models under glass, top tray, register, catalog and package stacks ONLY on its surface; two three-tier merchandise shelves at (100,290) and (270,290), each100x120, each packed with genuinely DIFFERENT illustrated model kit boxes, motors in blister packs, tire packets and price labels rather than abstract plus symbols; a low hint bookcase at (140,440) size190x50, recognizable book spines and magazines; a hobby workbench at (660,160) size195x85, with green cutting mat, a tiny red racing model, screwdriver, motor, organizer trays and a task lamp WITHIN its existing footprint; five-lane mini oval course at (590,340) size265x145, white guardrails, colored lane starts, small course markings and textured green infield; leafy potted plant at (70,490) size40x45; entry mat at (409,570) size145x30. The upper wall strip y35..120 contains hanging model-kit racks, pegboard tools, wall clock and the blank shop sign; enrich these existing displays without adding floor furniture. Keep all existing open floor paths clear. Do NOT add extra shelves, chairs, floor boxes, doors, tables, windows or objects in walkable areas. Favor visual craftsmanship and material detail over random clutter. All product box artwork is original tiny racing vehicles with no trademarks. No watermark.
```

