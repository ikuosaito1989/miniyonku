# オンライン記録・上位装備とのレース

ゲームの進行・所持品・装備のセーブは、引き続き現在のオリジンのIndexedDBに保存します。
オンラインでは、コース・ルール版ごとの自己ベストと、その走行開始時の装備・慣らし・電池状態だけを公開します。
通常CPUの記録は投稿しません。星皇装備・チュートリアル中・チート使用済みのプレイはオンライン投稿対象外です。
自分が完走した時点で投稿を準備するため、ほかのCPUの完走待ち中でも記録できます。

コース記録の看板から「オンライン タイムアタック TOP 4」を開きます。
表示名を保存すると、次の走行からその名前で投稿します。
「上位の装備を使うCPUとレース」で上位4件までの装備・開始時コンディションを使って対戦します。
これは走行トレースのゴーストではなく、スタートやレーンによって実際のタイムは異なります。
通常CPUの難易度補正・性能の乱数補正は掛けません。
オンライン対戦は賞金・熟練度・大会進行を変えず、消耗と記録だけを反映します。

## 接続

ブラウザは同一オリジンのゲームWorker `/api/miniyonku/records` に接続します。
Workerだけが `https://neglegere.com/api/auth/login` へ専用サービスアカウントでログインし、
取得した15分JWTを使ってneglegereの記録APIを呼び出します。JWTは14分までメモリに保持し、401時は再取得します。
`VITE_MINIYONKU_API_URL` は使用しません。旧設定が残っていてもブラウザからneglegereへ直接接続しません。
本番ビルドはオンライン対応、Vite開発時は `VITE_MINIYONKU_ONLINE_ENABLED=true` で有効化できます。
開発時も同一オリジンにWorker中継が必要です。`wrangler dev` はビルド済みアプリと中継を同時に提供します。

Worker Secretsに `MINIYONKU_SERVICE_EMAIL` と `MINIYONKU_SERVICE_PASSWORD` を保存します。
これらやJWTをViteの環境変数、ブラウザ、Gitへ渡してはいけません。
Workerは固定の記録APIだけを中継し、ブラウザ指定のAuthorization・Cookie・プレイヤーIDは転送しません。
POSTの `X-Miniyonku-Player-Token` からSHA-256の匿名IDを生成して、JWTと別のヘッダーでバックエンドに渡します。
既存の端末トークンと公開IDは保持され、全プレイヤーがサービスアカウント1人分に統合されることはありません。

voice-clone側の専用D1と専用ロールの導入手順は `docs/miniyonku-records.md` を参照してください。

- `GET /api/miniyonku/records?circuitId=leaf&rulesVersion=2`：上位4件。
- `POST /api/miniyonku/records`：匿名プレイヤー単位の自己ベスト更新。
- デバイスの投稿トークンと未送信ベストは、ゲームセーブとは別のIndexedDB `tiny-drive-online`に保存します。
- 送信に失敗した場合は再接続・再起動・「再送・ランキング更新」で再送します。コースごとに未送信の最速記録を保持します。
- サイトデータ削除や別オリジン・別端末では別プレイヤーになります。端末トークンは自分の記録を更新するための情報なので共有しないでください。
- 公開ランキングはクライアント申告の記録です。サーバーでの走行再検証はまだありません。
- 過去のローカル記録は開始時の状態が不明なため自動投稿せず、新しい完走から投稿します。

## 検証

- TypeScriptの型チェック・Viteビルド成功。
- 関連するレース・結果処理テスト27件成功（オンライン記録の対象・装備検証・CPU補正・賞金と進行の不変性を含む）。
- 全329テスト中328件成功。`townPeople.test.ts`の「土屋 大地」の配置判定が1件失敗し、変更前の`origin/Preview`（`29a56c8`）でも同じ失敗を再現。
- ChromiumでAPIレスポンスを模擬し、ランキング取得・表示名保存・上位4台のCPU対戦開始・記録画面への復帰を確認。390px幅で横方向のはみ出しなし、ページ例外なし。
- IndexedDBの未送信キューで、オフライン時のベスト保持・再送成功時の削除・不正な保存応答を受けた場合の記録保持をブラウザで確認。
- 実際のCloudflare D1への接続・本番APIへの投稿は、認証と接続設定後に確認が必要です。

## 2026-11-07の認証切り替え状況

- Cloudflareアカウント用APIトークンの認証成功。
- 専用D1 `miniyonku` を作成しmigration適用済み（voice-clone側にbinding設定を追加）。
- ゲームWorker `shiningscorpion` に専用ログイン情報をSecretsとして保存済み。
- サービスアカウントは無効状態で作成。バックエンドの権限制限をデプロイ・確認してから有効化する。
- 中継のJWT再取得・キャッシュ、匿名ID分離、Cookie遮断、本文サイズ・Origin・method制限を手動確認。
- Workerを含む型チェック・ゲームビルド・Worker deploy dry-run・関連31テスト成功。
- バックエンド全体のビルドは既存piper-plusの `../../assets/` 解決エラーで失敗。
  そのため新コードの本番公開、アカウント有効化、実サービス間の疎通確認は未実施。

## プレビュー公開・実接続確認

CloudflareのPreviewは本番WorkerとSecretsを別管理します。`preview`へも専用ログイン情報を設定し、
本番Workerと同じ専用アカウントへ接続します。専用アカウントは有効化済みです。
パスワードを変更するときは本番Worker・PreviewのSecretsとユーザーDBのbcryptハッシュを同期します。

Workerの外部fetchは `redirect: "manual"` とし、リダイレクト応答も成功扱いしません。
Cloudflare Workersで未対応の `redirect: "error"` は使いません。

プレビュー公開: `pnpm deploy:preview`（`wrangler preview --name preview`）。
URL: https://preview-shiningscorpion.ikuosaito1989.workers.dev
