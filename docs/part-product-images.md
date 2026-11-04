# パーツ画像

ボディ以外の83パーツは、`PartProductModel.ts`のカテゴリ別3Dモデルを640×440の透過WebPに書き出し、`src/assets/parts/<part-id>.webp`で管理する。部品ごとの色・刻印・構造差は`partAppearance`を使う。ボディは従来どおりマシンと同じ3Dモデルから生成する。

モーターは金属缶・軸・軸受け・通気穴・端子、シャーシは肉抜き・リブ・電池受け・ギアボックス・ビス穴、ほかのカテゴリも実際の立体構造と素材を描き分ける。撮影は環境光・面光源の反射・接地影・アンチエイリアスを使う。ゲーム側は静止画を遅延読み込みし、画像表示のためのWebGLコンテキストは作らない。

再生成にはPlaywrightとChromiumが必要。Viteを起動した状態で実行する。

```sh
pnpm dev
# 別のターミナル。CHROMIUM_PATHは環境に合わせて指定、Playwright同梱ブラウザなら省略可。
CHROMIUM_PATH=/usr/bin/chromium node scripts/render-part-products.cjs http://localhost:5173
```

書き出し用のモジュールはアプリからimportしない。新しいIDの画像が未生成の場合は既存のSVG原画を使う。
