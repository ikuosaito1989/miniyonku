# レース効果音の素材

実録音は次のCC0素材から制作した。Freesoundの元WAVはログインが必要なため、公開されているHQ MP3プレビューを取得し、必要区間をモノラル・44.1 kHz・128 kbpsに変換した。プレビュー由来のため元の24-bit WAVと同じ音質ではない。

- モーター高速: JeroenWals「electrische auto lang.wav」 https://freesound.org/people/JeroenWals/sounds/592497/ 、8〜13秒、CC0。
- モーター低速: JeroenWals「electrische auto sloom.wav」 https://freesound.org/people/JeroenWals/sounds/592496/ 、1〜5秒、CC0。
- 車輪: domestophonics「Toy car passing by.wav」 https://freesound.org/people/domestophonics/sounds/420403/ 、1〜4秒、CC0。木床の玩具の録音であり、樹脂コースそのものの実録ではない。
- 機械音: BMacZero「Mechanical Sounds」 https://opengameart.org/content/mechanical-sounds の squeakyclick1.wav と lightclunk1.wav、CC0。

ファイルは `src/assets/sfx/` に同梱。波形の端は再生前に90ms重ね合わせてループを作る。カウント音は自作の三角波と正弦波で、実録素材ではない。音声ファイルの取得・復号に失敗した場合は従来の合成音へフォールバックする。

開発環境で `pnpm dev` を起動し `/sound-lab.html` を開くと、以前と現在の走行音を同じ速度で切り替え、カウントダウンも試聴できる。プレビューでは `/sound-lab.html` から直接開ける。通常のゲーム画面からはリンクしない。

今後必要な素材：高回転模型用DCモーターの複数回転数の未圧縮録音、樹脂コースを走る車輪・壁接触・継ぎ目・ゲートの近接録音。現状の車輪録音は木床であり、素材だけで実コースの音響を完全に再現したものではない。配布可能な原音を取得して、実機スピーカーとイヤホンで聞き直す。
