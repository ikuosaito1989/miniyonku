# 店舗・会場の2D原画

各施設の原画は `src/assets/scenery/<施設ID>.webp`。7店舗と4公式会場に別々の原画を用意。画像は1536px級の原画を品質88のWebPに変換したもの。元PNGは生成作業用ディレクトリに残す。

| 店舗 | デザイン |
| --- | --- |
| komorebi | 以前のミント色タイル・青灰色の壁・木とスチールの家具、葉のマーク |
| aozora | 空色とパールグレーのタイル・青白い家具・小さなレース旗 |
| hinata | 砂色とクリームのタイル・オリーブ／橙の家具・壁のタイヤとホース |
| wakaba | 若草とクリームのタイル・緑の家具・棚上の植物 |
| yuunagi | 青灰色と薄紫のタイル・使い込んだ木・壁の波と船の小物 |
| akatsuki | 淡いテラコッタのタイル・えんじの家具・控えめなトロフィー |
| atelier | 薄紫と灰色のタイル・実用的な工具・小さな天体模型とパーツ展示 |

公式会場は大会別に緑・紫・赤金・紺金のパレット。観客席・トラス照明・金属フレーム・チェッカー・トロフィーを描く。全施設の背景に説明文・店名・コース名・NPC名を描かない。記録や購入など操作用モーダルの文字は残す。

模型店の背景は旧原画と同じ全室 `{x:0,y:0,width:960,height:640}` に配置し、会場は `roomView={x:40,y:35,width:880,height:579}` に配置する。あおぞらは背景と前景を同じように左右反転する。家具の前景は同じ原画から同じ座標変換で切り出し、底辺のY座標で人物と前後を判定。通路・当たり判定・設備のタップ領域は既存のデータを維持する。コースは原画へ焼き込まず、暗緑の台に `drawShopTrack` が実コースの形を描く。

`ThemedShopArt`・`OfficialVenueArt` のCanvas描画は原画が取得できない場合のフォールバック。`VenueFacadeArt` は町の建物を店舗ごとの異なる屋根・窓・素材で描画する。地面は一枚のテクスチャに焼き込み、移動中の負荷を抑える。

会話用の `npc-atlas.webp` は4列4行の16種類の顔。上2行は7店舗の店主と受付、下2行は凪・結衣・匠・蓮・蒼・桃香・陸・レース係。`npcAppearance` でセルと身体的特徴を固定し、`NpcPeopleArt` の歩行・順位欄に同じ輪郭・目・髪型を反映する。レジェンド4人は従来の専用原画を保持する。

歩行速度は町282、店内・会場190（従来比約20%増）。店内と町は引き続き同じカメラ倍率を使用。

検証（2026-11-04）：全241テスト、typecheck、buildが成功。全7店舗・全4会場・町の12シーンを実ブラウザで開き、背景Textオブジェクトが0件、実行時エラーが0件であることを確認。スマホDPR2で町・店内・会場の倍率一致、40msの移動量（町11.28／店内7.6）、ピットから設定画面を開けること、3D拡大レースで回転と追加会場の描画が動作することを確認。

2026-11-04の追加指定：店舗は以前のinterior-v1の雰囲気を保ち、店別の色と控えめな小物で描き分ける。豪華な大理石・金装飾・大きな窓での店舗改装は撤回。会場の原画は維持。

追加調整の検証：typecheck・buildと関連13テスト成功。全7店舗・全4会場・町の表示を再確認し、背景Textオブジェクト0件・実行時エラー0件。スマホでも内外の倍率、約2割速い移動、設定画面への操作を再確認した。

## 専門店の原画と今後の制作

2026-11-08の調査：`interior-v1.webp` 自体は削除されていない。通常店は `07b2686` 以降 `scenery/` の店別原画を使用しているが、`2d0aaf9` の専門店追加時に専用WebPが用意されず、店内は `ThemedShopArt` の図形フォールバックになっていた。耐久店も同じ状態だった。

専門店は同じ960×640の家具配置を使うため、駆動店はひなた、速度店はあおぞら、悪路店はわかばの高精細原画を参照し、耐久店は同じ配置を基準に画像生成した `scenery/endurance.webp` を使用する。背景と家具の前景は施設IDごとに同じ画像を参照し、当たり判定・タップ範囲を変更しない。専門店の展示は従来の表示を維持する。既存の星霧工房・通常店の画像と表示は変えない。

専門店ごとの完全な専用背景、街の建物外観・広域地面、全方向・全歩行フレームの人物原画は今後の課題。原画制作時は各施設の現行画面と `docs/art/shop-layout-reference.png` を入力し、同じ画角・縮尺・家具の矩形と出口を固定する。背景と前景を同一画像から切り出し、家具と人物の前後関係、タップ箇所、進入不能箇所を確認してからWebPにする。街は3200×2400の既存施設・道路・衝突矩形を座標参照として保ち、広域画像を一括生成せず、建物・樹木・地面を透過素材または複数タイルとして配置検証する。人物は `pixel-art-direction.md` の方向・歩行フレーム仕様に従う。

専用背景用プロンプト例：

> Repaint the supplied original 960×640 overhead game-room layout as a detailed original 16-bit miniature racing specialist shop. Preserve every fixture's exact position, size, silhouette, floor paths and exit; use the supplied high-detail model shop image as a palette and pixel-density reference. Depict distinctive individually illustrated motor, gear, tire and tool packages, realistic wood and metal shelves, glass reflections and soft upper-left light. Keep the existing right-hand display footprint empty for the game's live overlay. No characters, UI, legible text, extra floor objects or changes to camera or projection.
