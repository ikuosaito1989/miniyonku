# 16bit風アートの共通方針

街・建物・店内・会場・人物・UIを、低彩度の青緑、暖かい石色、金属の淡い金色で統一する。光は左上、接地影は右下。滑らかなグラデーションより段階的な色面と細かなハイライトを使い、木目・石目・金具・布地を描き分ける。

- `PixelArtMaterials.ts` は座標から決まる素材模様と樹木の葉群を描く。フレームごとの乱数は使わない。
- `SceneryCanvas.ts` は段階色、面取り、接地影、素材描画の共通部品。
- `TownArt.ts` は地面、舗道、道路、住宅、樹木、街灯、ベンチ。地面と装飾はテクスチャに焼き、毎フレームの描画命令を増やさない。
- `ShopTrackArt.ts` は実コース形状を参照し、厚みのあるレーン、継ぎ目、固定具、高架、スタート設備を描く。走行物理やコース形状は変更しない。
- `RecordBoardArt.ts` はトロフィーと時計を使った共通看板。文字・記録一覧は操作後のUIで表示する。屋外は `outdoorTimeBoardPlacement` を描画とタップ範囲で共用する。
- `WorldDetailArt.ts` は各室の採光・素材・縁取りを追加する。既存の店舗・会場の背景原画と家具原画は維持する。図書館は `LibraryRoomArt.ts` で床板、本の装丁、棚の金具、机を描く。
- 人物の共通仕上げは `pixelDrawing.ts`。輪郭・服装・共通テクスチャ寸法・表示寸法を変えず、半ドットの縫い目と反射光を追加する。

装飾の変更で歩行判定、設備配置、進行、所持品、セーブデータ、オンライン記録条件を変えない。PCとスマホの両方で人物・看板の判別性を確認する。

## 街の生活感

`world.ts` は既存施設を維持して空き区画へ住宅を補充する。住宅は歩行障害物として共用し、地図にも描く。店・コース・住宅に加え、帰還地点と道路の通路を空ける。

`townCrowd.ts` はコースを見る観客、店先・歩道・住宅前の住民を座標固定で配置する。入口・帰還地点・看板前・案内人の会話位置を確保し、足元の障害物を `ShopScene` の経路探索と衝突判定へ渡す。`TownCrowdArt.ts` は共通人物原画で子ども・大人・年配の外観を使い、模型や袋を持たせる。足元の位置を動かさず、ときどき顔を向ける仕草を付け、画面外は描画しない。進行や保存データに群衆を追加しない。

`townLife.test.ts` は全コースの観客、配置の再現性、施設・看板・案内人・職人までの実歩行経路を検証する。

## 人物と屋外コースの仕上げ

人物の60×80原画は各キャラクターと方向の形状を維持し、住人の髪の束・目元・衣服の縫い目に半ドットの明暗を加える。歩行の足運びと上下動は原画のフレームで表現し、歩行速度・接触判定は変えない。街・店内の人物は左上からの光と二段階の接地影を共有する。道路の骨材、樹冠の葉群、コース外壁とレーン縁の明暗は既存のキャッシュ済み描画に焼き込み、毎フレームのオブジェクトを増やさない。

画像生成を使った将来の原画更新では、単発のイラストを歩行画像に置き換えず、同一人物の4方向×4歩行フレーム、60×80の範囲、足元位置、半ドット格子、透過背景を揃えてから個別に検証する。生成用の指示例：

> Create an original Japanese 16-bit RPG character sprite sheet using the supplied existing character as an identity and costume reference. Four directions (front, left, back, right), four walk frames per direction, same exact head size, proportions, foot anchor and costume in every frame. Refined clusters for hair, fabric folds, shoes and warm upper-left light; restrained blue-green and warm stone palette matching the supplied model-shop background. Transparent background, no labels, no ground shadow, no blur, no glow, no perspective change. Preserve the character's defining hair, facial features and clothing; do not copy any existing franchise character.
