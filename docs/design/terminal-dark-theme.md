# Terminal Dark テーマ設計書

## 概要

ブログ全体を daisyUI light テーマからターミナル風ダークテーマに切り替える。
フォント・配色・疑似要素プレフィックスにより、技術ブログらしい外観を実現する。
MDX コンテンツファイルは変更しない。

## カラーパレット（CSS カスタムプロパティ）

```css
:root {
  --bg-primary: #0a0a0a; /* ページ背景 */
  --bg-secondary: #141414; /* カード・サイドバー背景 */
  --bg-code: #1a1a2e; /* コードブロック背景 */
  --text-primary: #e0e0e0; /* 本文 */
  --text-secondary: #a0a0a0; /* 補足テキスト */
  --text-heading: #ffffff; /* 見出し */
  --accent: #00ff88; /* アクセント（リンク・プレフィックス） */
  --accent-hover: #66ffaa; /* アクセントホバー */
  --border: #2a2a2a; /* ボーダー */
}
```

## フォント

- 英字・コード: JetBrains Mono（Google Fonts）
- 日本語: Noto Sans JP（Google Fonts）
- 読み込み: `<link>` タグで BaseLayout に追加
- フォールバック: `monospace`, `sans-serif`

## ターミナル風疑似要素プレフィックス

| 要素     | プレフィックス | 実装方法                            |
| -------- | -------------- | ----------------------------------- |
| h1       | `# `           | `::before { content: "# " }`        |
| h2       | `## `          | `::before { content: "## " }`       |
| 日付表示 | `$ date → `    | `::before { content: "$ date → " }` |

- 色は `var(--accent)` を使用
- MDX 内の見出しにも適用されるよう、PostLayout 内の `.prose` スコープで定義

## TOC アクティブ状態

- Intersection Observer で各セクションの可視状態を監視
- 現在表示中のセクションに対応する TOC リンクに `.active` クラスを付与
- アクティブ状態のスタイル: `color: var(--accent); border-left: 2px solid var(--accent)`

## 変更対象ファイル

| ファイル                        | 変更内容                                                                         |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `src/layouts/BaseLayout.astro`  | Google Fonts 読み込み追加、`<html>` のテーマ属性変更                             |
| `src/layouts/PostLayout.astro`  | 疑似要素プレフィックスのスタイル追加、TOC アクティブ状態の Intersection Observer |
| `src/styles/global.css`         | CSS カスタムプロパティ定義、ダークテーマ基本スタイル                             |
| `src/components/Header.astro`   | ダークテーマに合わせた配色変更                                                   |
| `src/components/Footer.astro`   | ダークテーマに合わせた配色変更                                                   |
| `src/components/PostCard.astro` | カード背景・テキスト色の変更                                                     |
| `src/pages/index.astro`         | 背景・テキスト色の調整                                                           |
| `src/pages/posts/index.astro`   | 背景・テキスト色の調整                                                           |
| `src/pages/posts/[slug].astro`  | 背景色の調整                                                                     |

## 変更しないファイル

- `src/content/posts/*.mdx` - コンテンツファイルは一切変更しない
- `src/content/config.ts` - スキーマ変更なし

## テスト方針

- ビルドテスト: `npm run build` が成功すること
- 目視確認: 各ページでダークテーマが正しく適用されていること
- フォント確認: JetBrains Mono / Noto Sans JP が読み込まれていること
- TOC: スクロールに応じてアクティブ状態が切り替わること
