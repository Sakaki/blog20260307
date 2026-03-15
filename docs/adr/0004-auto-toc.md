# 0004. 記事ページへの目次（Table of Contents）自動生成

Date: 2026-03-15
Status: Accepted

## Context

現在の記事ページは、タイトル・日付・タグのヘッダーの後にすぐ本文が表示される。
長い記事では読者が全体の構成を把握しづらく、特定のセクションにジャンプする手段がない。

記事の見出し（h2, h3）から目次を自動生成し、ヘッダーと本文の間に表示することで、
読者が記事の全体像を把握し、目的のセクションに素早くアクセスできるようにしたい。

## Decision

### 実装方針

Astro の `render()` が返す `headings` 配列を活用し、
**JavaScript を一切使わず** Astro コンポーネント + daisyUI の `collapse` で目次を実現する。

| 変更種別 | ファイル                               | 概要                                                      |
| -------- | -------------------------------------- | --------------------------------------------------------- |
| 新規     | `src/components/TableOfContents.astro` | 目次コンポーネント（headings を受け取りリンク一覧を描画） |
| 変更     | `src/pages/posts/[slug].astro`         | `render()` から `headings` も取得し PostLayout に渡す     |
| 変更     | `src/layouts/PostLayout.astro`         | `headings` を Props に追加し、TOC コンポーネントを配置    |

**目次の表示ルール:**

- h2 と h3 のみを対象とする（h1 はページタイトル、h4 以下は細かすぎるため除外）
- 見出しが 0 件の場合は目次を一切表示しない
- daisyUI の `collapse` コンポーネントで折りたたみ可能にする（デフォルト開）
- 各見出しはアンカーリンク（`<a href="#slug">`）で該当箇所にジャンプ
- h3 は h2 の配下としてインデント表示

**使用する daisyUI パターン:**

- `collapse collapse-arrow` で開閉矢印付きの折りたたみセクション
- `<input type="checkbox" checked>` による初期状態「開」の制御（JS 不要）

### 採用しなかった選択肢

| 選択肢                                     | 不採用の理由                                                                      |
| ------------------------------------------ | --------------------------------------------------------------------------------- |
| rehype プラグインで TOC を HTML に埋め込む | Astro の `headings` API で十分であり、プラグイン追加は複雑性が増すだけ            |
| サイドバーに固定表示                       | 現在のレイアウトは 1 カラム構成であり、サイドバー追加はレイアウト変更が大きすぎる |
| JavaScript による目次ハイライト            | SSG の方針に沿い、JS なしで動作する実装を優先する                                 |
| 常に展開表示（折りたたみなし）             | 長い目次が本文を押し下げるため、折りたたみ可能にして読者に選択肢を与える          |
| h4 以下も含める                            | 目次が肥大化し、かえって見通しが悪くなるため h2/h3 に限定する                     |

## Consequences

**メリット:**

- 読者が記事の全体構成を一目で把握できる
- 見出しへのジャンプにより、長い記事のナビゲーションが改善される
- Astro 標準の `headings` API を使うため、追加の依存関係が不要
- JavaScript 不要のため、SSG の方針と整合しバンドルサイズに影響しない
- 折りたたみ可能なので、不要な場合は閉じて本文を優先的に表示できる

**デメリット・注意点:**

- `collapse` の `<input type="checkbox">` はフォーム要素であるため、セマンティクスが目次としてやや不自然
- 目次の見出しテキストは Markdown のインライン装飾（`**bold**` など）が除去された plain text になる
- 将来 h4 対応や現在位置ハイライトを追加する場合は、設計の見直しが必要

## 参照

- `src/components/TableOfContents.astro` — 新規作成コンポーネント
- `src/pages/posts/[slug].astro` — headings 取得の変更
- `src/layouts/PostLayout.astro` — TOC 配置の変更
- [Astro Content Collections: render()](https://docs.astro.build/en/guides/content-collections/#rendering-body-content) — headings API
- [daisyUI Collapse](https://daisyui.com/components/collapse/) — collapse コンポーネント仕様
