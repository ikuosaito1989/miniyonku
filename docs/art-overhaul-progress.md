# セイラン 2Dアート全面改修 — 対象台帳と進捗

この台帳は全面改修の作業範囲と、実機確認の有無を明確にするためのもの。変更を一部の画面だけで「全体改修済み」と扱わない。

## 共通仕様

- カメラ: 2D探索画面は一貫した南向き3/4俯瞰。壁・床・家具・人物は同じ投影にそろえ、文字/UIだけは高DPIで滑らかに描く。
- 論理スケール: 屋内960×640、公式会場の可視範囲880×579（roomViewの原画オフセット込み）、町5400×2400。見た目の整列は16ワールド単位を目安にするが、既存の自由移動座標は維持する。
- キャラクター: 原画60×80、表示48×64を基準に足元と接地影を合わせる。NPC個性、歩行フレーム、会話肖像、当たり判定は同じキャラクター定義を使う。
- 原画密度: 屋内は論理寸法の1.6〜2倍、公式会場は現行roomViewに合わせた原画、人物は原画枠に沿う密度を基準にする。拡大処理だけで細部を作ったことにはしない。
- 画風: 手描きの高密度ピクセルクラスター、限定パレット、整理した輪郭、左上光源、4段階程度の陰影、接地影。床はマット、照り返しは小さくする。展示商品は人物・棚に対する縮尺を守る。
- 高DPI: CanvasのCSS表示寸法と内部解像度を分離し、端末DPRは上限2。原画はNEAREST、動き・文字・UIは読みやすさを優先する。
- 互換性: イベント、NPC、入口、タップ矩形、衝突、出現位置、レース経路、セーブ形式を変える場合は関連する全座標とデータ互換を同時に更新する。

## 対象台帳

| 対象 | データ/描画 | 状態 |
| --- | --- | --- |
| 街全域、道路、歩道、芝生、住宅、商店、植栽、外周 | `world.ts`, `TownArt.ts`, `PixelArtMaterials.ts`, `VenueFacadeArt.ts`, `WorldDetailArt.ts` | 調査済み。地形・施設密度・長距離表示を評価して改修 |
| 屋外コース、巨大マスターコース4面 | `OutdoorCourseArt.ts`, `shopTrackLayout.ts`, `world.ts` | 全コースの表示・経路・アクセスを調査して改修 |
| こもれび模型店 | `scenery/komorebi.webp`, `shop.ts`, `shopLayout.ts` | 背景更新・実画面確認 |
| あおぞら模型店 | `scenery/aozora.webp`, `shop.ts`, `shopLayout.ts` | 背景更新、左右反転の確認待ち |
| ひなた模型店 | `scenery/hinata.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| わかば模型店 | `scenery/wakaba.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| ゆうなぎ模型店 | `scenery/yuunagi.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| あかつき模型店 | `scenery/akatsuki.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| 星霧模型工房 | `scenery/atelier.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| ながみち耐久工房 | `scenery/endurance.webp`, `shop.ts`, `shopLayout.ts` | 背景更新 |
| 駆動・速度・悪路の専門店 | `scenery/hinata.webp`, `aozora.webp`, `wakaba.webp`, `specialtyParts.ts` | 共用の3背景を更新 |
| ほしくず模型店 | `scenery/hoshikuzu.webp`, `ThemedShopArt.ts` | 新規専用背景を追加 |
| 若葉レース場 | `scenery/stadium-5.webp`, `OfficialVenueArt.ts`, `officialVenue.ts` | 背景更新、実画面再撮影待ち |
| 星空レース場 | `scenery/stadium-9.webp`, 同上 | 背景更新 |
| 緑川グランプリ会場 | `scenery/stadium-10.webp`, 同上 | 背景更新 |
| 天頂決戦会場 | `scenery/stadium-7.webp`, 同上 | 背景更新 |
| 図書館 | `LibraryRoomArt.ts`, `libraryRoom.ts` | 棚・机・導線を対象 |
| 受付、コース案内、記録掲示板、会話マーカー | `CounterArt.ts`, `RecordBoardArt.ts`, `ShopScene.ts`, `raceIntro.ts` | 既存用途とタップ範囲を維持して対象 |
| プレイヤー、街NPC、店員、レジェンド、観客、メカニック | `PeopleArt.ts`, `PlayerArt.ts`, `NpcPeopleArt.ts`, `LegendPeopleArt.ts`, `TownCrowdArt.ts`, `PersonTexture.ts` | 既存の個別原画・60×80設計・48×64表示・足元影を維持し、全方向/歩行フレームの既存テスト確認 |
| パーツ商品画像181点 | `assets/parts`, `PartArtwork.tsx`, `BodyArtwork.tsx` | 一覧を視覚監査。商品ごとの精密な製品レンダーと透過背景を維持 |
| キャラクター肖像19点とNPCアトラス | `assets/portraits`, `NpcPeopleArt.ts` | 全肖像を一覧監査。既存のキャラ画風、顔立ち、歩行キャラとの対応を維持 |
| 実走レースの3Dマシン/コース、UI、タッチ操作 | `TrialView.tsx`, `MachineModel.ts`, CSS/UI | 2D世界との縮尺・色調和、既存機能を確認 |

## 進捗

- [x] 最新Previewを確認。作業開始時`a70c40b`、作業中にリモートの独立変更`4b5020e`を取り込み。未追跡`pnpm-workspace.yaml`は保持。
- [x] 描画経路、旧背景12点、店舗・会場配置、人物/パーツ素材構成を棚卸し。
- [x] 共通仕様と対象台帳を作成。
- [x] 店内9室と公式会場4面の原画を再制作し、店舗に未登録だったほしくず専用背景を追加。
- [x] 店舗の試走台背景から描き込みコースを除き、ゲームデータの実コース表示と重なる問題を修正。
- [x] レジェンド展示に4台の車両を表示する前景を追加。
- [x] 町の地面を区画ごとに描いてから配置し、草地の粒ノイズを減らす。
- [x] 町、図書館、屋外コース、観客、家具、商品、人物を一覧/実画面/コンタクトシートで監査。配置・役割・縮尺が合う既存の図書館・コース・観客・人物・商品原画はそのまま使用。
- [x] 移動、会話対象の吹き出し、コース描画、店内と会場の人物/家具重なりを実画面で確認。座標・イベント・当たり判定・セーブ形式に変更なし。
- [x] 全9店舗、4公式会場、町、図書館を1280×800で撮影。店舗と町を390×844・DPR2でも撮影。Chromiumで実行時エラーなし。iPhone Safari実機では未確認。
- [x] TypeScript型チェックとVite本番ビルド成功。最新Previewで全375テストを実行し372件成功。描画レイアウトとDPR2の対象テスト4件も通過。
- [ ] 下記3件の失敗は今回変更した背景・町描画・什器ファイル外で再現。完了前に一覧を報告する。

## 今回の変更と未解決事項

- 店内9室の高精細WebPと公式会場4面を再制作し、ほしくずの専用背景を追加。全背景を必要な場面だけロードする既存構造は維持。
- `drawShopTrack`が実際のコースデータを描くため、店背景にコースを焼き込まず、模型店の画面ではコース線が二重に見えないことを確認。
- レジェンド展示には4台、星霧工房の販売展示には2台の前景車体を描画。販売専門店で遊べないレースコースを表示しない。
- 町地面の3枚タイルは、タイルの区画内だけ草・歩道・建物接続を描画し、区画ごとの全域再描画をやめた。草地の細かな斑点を減らし、スマホのDPR2画面で確認。
- `src/assets/parts`の181商品画像は均一な物撮り・陰影・透過背景があり、形状読解に使われるため保持。歩行キャラと肖像は個人デザインを保ち、高精細な既存16bit肖像/3倍原画を保持。
- 全テスト実行は375件中372件成功。失敗は以下の通り（対象実装は今回変更していない）: `dirtCrawl.test.ts` 通常装備の砂路面走行、`installedAppearance.test.ts` 耐久ブレース外観、`raceAdvice.test.ts` 耐久店の案内文。
- `pnpm typecheck`は環境ラッパーの`ERR_PNPM_IGNORED_BUILDS`で依存インストール段階に停止。既存の`./node_modules/.bin/tsc --noEmit`は成功。`./node_modules/.bin/vite build`も成功（大きな既存JSチャンクのサイズ警告あり）。
- 比較画像と全店舗一覧は`/workspace/scratch/art-audit/review-all-shops.jpg`、元/新店舗は`baseline/komorebi.png`と`current/shop-final.png`、会場は`baseline/stadium-5.png`と`current/final-stadium-5.png`、町は`baseline/town.png`と`current/final-town.png`、モバイル相当は`current/mobile-komorebi.png`と`current/mobile-town.png`にある。

## マップ確認一覧

屋内: こもれび、あおぞら、ひなた、わかば、ゆうなぎ、あかつき、星霧、耐久、ほしくず、駆動、速度、悪路、図書館。

屋外: 町全域、緑川町立図書館外観、全店舗外観、全レース施設、全通常コース、4巨大マスターコース。

公式会場: 若葉ダート、星空テクニカル、緑川グランプリ、天頂ゼニスクラウン。

この文書内のチェック状態は実際の確認後に更新する。スクリーンショット未取得の表示を確認済みとしない。
