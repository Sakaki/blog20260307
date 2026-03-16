# 0009. ホームページ BIO セクション（whoami 出力型）

Date: 2026-03-16
Status: Accepted

## Context

Terminal Dark テーマ実装済みのブログ（sakaki333.dev）のトップページに、
サイトオーナーの自己紹介を表示したい。
ターミナルテーマに合わせ、`whoami` コマンド出力を模した BIO セクションとして実装する。

## Decision

### コンポーネント設計

`BioSection.astro` を新規作成し、`index.astro` の記事一覧の直前に配置する。

- **Astro コンポーネント**（React 不要）: 静的コンテンツのためクライアント JS は不要
- **CSS アニメーション**のみ: カーソル点滅は `@keyframes` で実現
- **グローバル CSS に追記**: `.bio-*` クラス群を `global.css` に定義

### 構成要素

1. プロンプト行: `sakaki@dev:~$ whoami`
2. whoami 出力: name, role, about
3. リンクグループ: tech（GitHub, X）、creative（Pixiv, Fanbox, Skeb, BOOTH）
4. 末尾プロンプト: 点滅カーソル付き

### 採用しなかった選択肢

1. React コンポーネント: 静的コンテンツに JS バンドルは不要
2. タイピングアニメーション: 初回訪問時のみの効果で UX 向上が限定的、実装の複雑さに見合わない

## Consequences

### 良い点

- ターミナルテーマとの統一感がある
- JS 不要で軽量
- 既存コンポーネントへの影響なし

### トレードオフ

- BIO の内容がハードコーディングされる（将来的に CMS 化する場合は要改修）
