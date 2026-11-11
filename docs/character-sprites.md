# 歩行キャラ原画の刷新

歩行キャラ24人を専用の透過スプライトへ変更。生成したオリジナル原画は
`src/assets/characters/source-atlas-*.webp` に保存している。各原画は4人×4方向
（正面・右・背面・左）。髪型・服装・年齢・固有の目元を人物ごとに指定した。
会話用ポートレートは既存の専用原画を継続使用する。

## 素材を再構成する

Pillowの入ったPythonで `python3 scripts/pack-character-sprites.py` を実行する。
透明な行間から各方向を切り出し、頭の描き込みを残して胴・脚を短く整える。
半透明の周縁を整理し、共通の180×240へ正規化する。
脚の付け根を固定し、左右の脚と体の上下動から4歩行フレームを構成する。
出力は各人720×960 WebP（横4歩行フレーム、縦4方向）。

`characterSprites` が人物ID・方向・歩行フレームを描画データへ付ける。
ShopSceneのpreloadで原画を読み込み、PersonTextureで該当セルを描画する。
順位欄も同じファイルの同じセルを使う。旧ベクター原画は画像を読み込めない
場合のフォールバックとして保持する。街の持ち物など追加の描画は原画の上へ重ねる。
表示サイズ48×64、移動速度、当たり判定、セーブ形式は変更していない。

## 見た目の確認

Vite起動後、PlaywrightとChromiumが利用できる環境で
`node scripts/render-character-preview.cjs` を実行する。
比較画像の下段末尾は実際の48×64サイズ。店内・街は390×844の画面で撮影する。
このスクリプトはローカルの使い捨てブラウザだけで進行状態を設定する。
既存ユーザーのセーブには触れない。

- [旧版との比較](screenshots/character-remake-comparison.png)
- [店内](screenshots/character-remake-shop.png)
- [街](screenshots/character-remake-town.png)
