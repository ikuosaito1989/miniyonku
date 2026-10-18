# 開発ルール

- Pull Requestは明示的なDraft指定がない限りReady for reviewで作成する。既存PRもDraftに戻さない。
- Vite + React + TypeScript、Phaser、Three.js、Zustand、IndexedDB、pnpmを使用する。
- ゲームロジックはReact・描画から分離し、パーツとマップはデータとして管理する。
- オリジナルの名称・キャラクター・画像・コース・音楽のみを使用する。
- 変更後は `pnpm typecheck` と `pnpm build` を実行する。
- 現在の実装範囲はTASKS.mdのマイルストーン1、作業台でのセッティング、5レーン・CPU4台との3D練習レース。未実装の機能を動作するように表示しない。
