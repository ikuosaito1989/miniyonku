# 模型店の店内アート

## 現在の制作方式

実際の店内表示は`src/assets/scenery/<施設ID>.webp`を`PaintedScenery`から読み込む。`src/assets/shop/interior-v1.webp`はこもれび模型店の確認用コピー。2026-11-10の全面改修で、こもれび・あおぞら・ひなた・わかば・ゆうなぎ・あかつき・星霧・耐久・ほしくずの9室を共通画角と素材密度にそろえた。ほしくずは独立原画にして、これまで専用画像がなかった部屋も揃えた。駆動・速度・悪路の専門店は既存のとおり、ひなた・あおぞら・わかばの背景を共有する。

- 論理室内は960×640。全室の新原画は1536×1024、WebP品質90で、シーンごとに必要な背景だけを読み込む。
- 入口は南側の`shopExit`、開始位置は`room.spawn`。これらは変更しない。
- 家具の論理位置は`shopLayout`が決める。通常店は入口→受付・商品棚→本棚・整備台→コースの順に見通せる。コースは実際の試走設備として扱い、`drawShopTrack`の形状と走行ロジックを使う。
- 多くの家具は背景と同じ画像から切り出し、`drawPaintedFixture`が家具の下端で深度を決める。レジェンド展示は家具種類に応じた前景を優先し、4台のマシンを実際に表示する。試走コース台は背景にコースの絵を含めず、`drawShopTrack`が正規の走行コースだけを描く。既存のfixture矩形と移動判定は維持する。
- 店名、説明、記録、購入、キャラクターはゲーム内の文字・人物・UIで表示する。背景画像へ焼き込まない。
- `shopRenderScale`はDPR2まででCSS表示寸法と描画解像度を分離する。`PaintedScenery`はNEARESTサンプリングを使い、背景のピクセル輪郭を保つ。

## 家具と通路の縮尺

2026-11-10、歩行スプライト（48×64ワールド単位）に対して大きすぎた掲示板と商品棚を縮小した。掲示板は57×80、商品棚は93〜95×102。床置き家具は配置基準を保ったまま縮尺を調整し、作業台・カウンター・コースと経路探索は維持した。座標は`src/data/shop.ts`と`src/data/shopLayout.ts`から共用する。

## 画像更新時の品質確認

画像生成や手描きでは、既存施設の画面と`docs/art/shop-layout-reference.png`を配置の根拠として使う。高詳細なピクセルクラスター、素材ごとの輪郭、段階的な接地影、店ごとの識別色を描き、単なる解像度拡大や均一な記号の商品棚で済ませない。入口、カウンター、棚、整備台、コース、観覧場所の位置と通路を保ち、操作対象の矩形に合わせてからWebP化する。

```text
Repaint the supplied exact 960x640 overhead Japanese model-shop game map as original high-detail pixel art. Keep the identical top-down RPG camera, canvas bounds, wall/floor boundary, furniture footprints, course position, entrance and walkable floor paths. Preserve this shop's own palette and fixtures. Draw crisp, deliberate pixel clusters with distinct wood, painted metal, plastic, glass, tile and fabric materials, individually illustrated original model-kit boxes and tools, and stepped contact shadows under the furniture. No photorealism, 3D render, blur, glow, marble, excessive gold, text, logos, characters or UI. Do not add, remove, move, resize or rotate furniture; do not block any open walking area. Keep the actual course footprint and fixture locations aligned to the reference.
```

画像を反映したら、`paintedSceneryLayout`、`paintedFixtureFrame`で家具の切り出しと前後関係を確認する。画面幅390px相当とDPR2で入口、人物、コース、家具の輪郭が読み取れることを確かめる。背景更新だけで当たり判定や進行を変更しない。
