# BGM素材

ユーザー指定の外部BGMのみ、オリジナル音楽限定の例外として使用する。

| 使用場面 | 曲名 | 制作者 | 配布元 |
| --- | --- | --- | --- |
| 通常（模型店・通常会話・買い物・設定） | 今日の空も（Track 1） | POLARIS PLUS | https://opentracks.com/bgm/detail/23752 |
| イベント（最強兄弟・黒岩・博士の登場と会話） | 解答Quizman（Track 1） | shimtone | https://opentracks.com/bgm/detail/23958 |
| レース（待機・カウント・走行・結果） | Rush Recklessly（指定のTrack 2） | FLASH☆BEAT | https://opentracks.com/bgm/detail/23946/track/2 |

既存2曲の音源はユーザーがダウンロードし提供したMP3。ファイル名だけではトラック番号を判別できないため、レース音源は指定Track 2として提供されたファイルを使用している。

- 音源利用ライセンス：https://opentracks.com/help/articles/license/
- サイト利用規約：https://opentracks.com/help/articles/terms/
- 確認日：2026-10-19
- 制作者は3名ともサイト準拠と表示。公開前に最新条件も確認すること。

ゲームの背景音楽としてのみ使用する。音楽のダウンロード機能は設けず、外部音源URLへ直リンク再生しない。素材を自由利用可能な自作音源と表示しない。

元MP3は`public/`から`private/audio/`へ移動して保存し、Git管理・配信対象外とする。`pnpm audio:pack`でAES-GCMのゲーム用コンテナ`src/assets/music/*.bgm`を生成する。Viteはコンテナのみを配信し、ブラウザ内で復号・デコードする。元MP3を再びpublicへ置かないこと。ブラウザ側に復号鍵が必要なため、これは直接の音声ファイル取得を避ける技術的対策であり、完全なDRMやライセンス適合の保証ではない。音源単体の抽出・再配布は禁止。

再パックには手動取得した同名のMP3を`private/audio/`へ配置する。通常の開発・ビルドでは、生成済みコンテナを使うためMP3は不要。Web CryptoのためBGM再生にはHTTPS（またはlocalhost）が必要。LAN内のHTTP開発サーバーではBGMが再生できない場合がある。

## イベントBGM

- 曲名：解答Quizman（Track 1、1:30）
- 制作者：shimtone
- 配布元：https://opentracks.com/bgm/detail/23958
- 用途：最強兄弟・黒岩・博士の登場、イベント会話、再会話。レース中は従来のレースBGM。
- 2026-10-23に配布ページ・利用規約・ライセンスを確認。制作者の条件はサイト準拠。
- サイト利用規約「禁止事項3」はbot等による画像・音源の自動収集を禁止。音源は2026-10-24にユーザーから手動ダウンロード済みMP3の提供を受け、ゲーム用コンテナに変換した。
- 提供されたMP3を `private/audio/解答Quizman.mp3` に置き、`pnpm audio:pack --event` で `event.bgm` のみ生成する。
- `event.bgm` 未配置時は従来BGMを維持し、この曲を再生中のクレジットには表示しない。
