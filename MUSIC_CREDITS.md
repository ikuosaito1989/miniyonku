# BGM素材

ユーザー指定の外部BGMのみ、オリジナル音楽限定の例外として使用する。

| 使用場面 | 曲名 | 制作者 | 配布元 |
| --- | --- | --- | --- |
| レース以外（模型店・会話・買い物・設定） | 今日の空も（Track 1） | POLARIS PLUS | https://opentracks.com/bgm/detail/23752 |
| レース（待機・カウント・走行・結果） | Rush Recklessly（指定のTrack 2） | FLASH☆BEAT | https://opentracks.com/bgm/detail/23946/track/2 |

音源はユーザーがダウンロードし提供したMP3。ファイル名だけではトラック番号を判別できないため、レース音源は指定Track 2として提供されたファイルを使用している。

- 音源利用ライセンス：https://opentracks.com/help/articles/license/
- サイト利用規約：https://opentracks.com/help/articles/terms/
- 確認日：2026-10-19
- 制作者は両名ともサイト準拠と表示。公開前に最新条件も確認すること。

ゲームの背景音楽としてのみ使用する。音楽のダウンロード機能は設けず、外部音源URLへ直リンク再生しない。素材を自由利用可能な自作音源と表示しない。

元MP3は`public/`から`private/audio/`へ移動して保存し、Git管理・配信対象外とする。`pnpm audio:pack`でAES-GCMのゲーム用コンテナ`src/assets/music/*.bgm`を生成する。Viteはコンテナのみを配信し、ブラウザ内で復号・デコードする。元MP3を再びpublicへ置かないこと。ブラウザ側に復号鍵が必要なため、これは直接の音声ファイル取得を避ける技術的対策であり、完全なDRMやライセンス適合の保証ではない。音源単体の抽出・再配布は禁止。

再パックには手動取得した同名のMP3を`private/audio/`へ配置する。通常の開発・ビルドでは、生成済みコンテナを使うためMP3は不要。Web CryptoのためBGM再生にはHTTPS（またはlocalhost）が必要。LAN内のHTTP開発サーバーではBGMが再生できない場合がある。
