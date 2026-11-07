# 以前の依頼と Preview の照合

2026-11-04。修正済みの Preview を基準に確認。旧 main の独立した TownScene を再導入しない。

| 依頼 | 現在の実装・確認箇所 |
| --- | --- |
| 外と模型店の倍率を模型店に合わせる | ShopScene の両方で shopWorldZoom を共用。縦横・DPR・リサイズ時の人物表示サイズを確認 |
| 狭い外を削除し、初期化後も広い街へ | ShopWorld / ShopScene と data/world の 3200×2400 の街。persistence の初期化先は town |
| PCキー操作の案内を削除 | タイトル・会話・レースの表示から除去。キーボード操作自体は維持 |
| タイトルのこもれび表記を削除 | TitleScreen から除去済み。ブラウザのページタイトルも TINY DRIVE のみに統一 |
| 電池・モーターの状態をカード上部へ | PartCondition の長いバー1本と状態テキスト。右ランプは実際の装着時だけ赤 |
| レースの3つの表示とマシン表示倍率 | raceCameraViews の拡大・全体・マシンを見る。machineViewScale は1.5 |
| 火野 岳を男キャラにし、レジェンドの顔を描き分け | legendPortraits / LegendPeopleArt / dialoguePeople。展示と会話は同じ専用画像 |
| 斗和・昊也のマシン、最終の4人 | LegendBodies / legendLineup / zenithRace / shopCast。黒岩の先輩は斗和 |
| 展示に持ち主の顔、パーツ画像の品質向上 | LegendGallery の持ち主画像。assets/parts の高解像度WebP |
| コース端の歴代タイム上位3件 | TimeBoard / timeRecords。完走公式タイムをコース別・昇順に保存 |
| 購入確認 | PurchaseConfirmation の確定時だけ購入。キャンセル時は変更なし |
| ダートのノーマル装備は停止させず超低速、警告不要 | driving の DIRT_CRAWL_SPEED。設定・レースの装備警告は表示しない |
| レース係の枠から文字をはみ出させない | trial.css の内容に応じた高さと枠内スクロール |
| 6時間後のログインで500円 | recordLogin / persistence / loginBonus.test。時刻と所持金を保存 |
| タイヤ・ローラーの回転と設定によるがたつき | MachineModel / raceMotion / TrialRenderer。固定軸と回転部分を分離 |
| 必ずコミットし Preview へ | AGENTS.md の完了条件。リモート一致と公開成果物の一致を確認 |

検証：typecheck・build成功、全239テスト成功。Chromiumでタッチ端末と通常端末それぞれ390×650、320×568、844×390、1280×800（DPR2）を確認。外と店内の人物の表示幅・高さが一致し、街のカメラ範囲は3200×2400を維持。実行時エラーなし。
