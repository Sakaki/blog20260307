# 0001. Mermaid グラフレンダラーの実装方針

Date: 2026-03-15
Status: Accepted

## Context

MDX 記事内でシステム構成図・フローチャートなどのダイアグラムをテキストで記述・描画したいという要件がある。
mermaid.js はテキストベースのダイアグラム記述言語として広く使われており、MDX との相性が良い。

このプロジェクトは `output: "static"` (SSG) で動作する Astro 5.x ベースのブログであり、
ビルド時に Node.js 環境で SVG を生成するサーバーサイドレンダリングは使えない。
また、`@astrojs/react` が導入済みであり、React コンポーネントをクライアントサイドで動作させる仕組みが整っている。

既存の MDX カスタムコンポーネント（`Callout.tsx`、`CodeBlock.tsx`）は `src/components/mdx/` に配置されており、
同じ配置ルールに従う必要がある。

## Decision

### レイヤー構成（クリーンアーキテクチャ）

本機能はシンプルな UI コンポーネントであるため、クリーンアーキテクチャの層は以下のように対応させる。

| 層             | 役割                                                        | ファイル                         |
| -------------- | ----------------------------------------------------------- | -------------------------------- |
| Domain         | なし（外部ライブラリ `mermaid` がドメインロジック相当）     | -                                |
| Use Case       | なし（レンダリング処理は mermaid.js に委譲）                | -                                |
| Adapter (UI)   | React コンポーネント。`mermaid` を呼び出して SVG を描画する | `src/components/mdx/Mermaid.tsx` |
| Infrastructure | npm パッケージ `mermaid` の導入                             | `package.json`                   |

**採用するアーキテクチャ方針:**

- `Mermaid.tsx` を `client:load` ディレクティブを前提とした純粋な React コンポーネントとして実装する
- `useEffect` + `useRef` を使い、コンポーネントのマウント後に `mermaid.render()` を呼び出して SVG を生成する
- 生成した SVG 文字列を `dangerouslySetInnerHTML` で DOM に注入する
- エラー状態（構文エラーなど）を型安全に管理し、エラー時はフォールバック表示を行う
- daisyUI + Tailwind CSS のクラスでスタイリングし、`<style>` タグは使用しない

**Astro での使用方法:**

MDX 記事からは `client:load` ディレクティブ付きで使用する。
ただし、MDX ファイル内では Astro のディレクティブを直接使えないため、
ラッパーの Astro コンポーネント（`MermaidWrapper.astro`）は作成せず、
`Mermaid.tsx` 自体を `client:only="react"` 想定で設計する。

実際には MDX 内でのインポート後、Astro ページ（`[slug].astro`）側から
`components` プロパティとして渡す方式（`<Content components={{ Mermaid }} />`）は使わず、
MDX 内で直接インポートして使う（既存の `Callout.tsx` と同じ方式）。

### 採用しなかった選択肢

| 選択肢                                        | 不採用の理由                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ビルド時 SVG 生成（Astro remark plugin）      | `output: "static"` + Node.js 環境での `mermaid` の headless 実行は設定複雑度が高く、Playwright 等の依存が必要になるケースがある |
| `react-mermaid2` などのサードパーティラッパー | 保守状況が不安定。`mermaid` 本体を直接使う方がバージョン管理しやすい                                                            |
| iframe による sandboxing                      | オーバーエンジニアリング。ブログ記事の自前 MDX コンテンツはソース管理済みであり XSS リスクは限定的                              |

## Consequences

**メリット:**

- 既存コンポーネント設計（`Callout.tsx`、`CodeBlock.tsx`）と一貫した実装パターンを維持できる
- `mermaid` ライブラリのアップデートに追従しやすい
- クライアントサイドレンダリングのため、Astro のビルドパイプラインへの影響がない

**デメリット・注意点:**

- JavaScript が無効な環境では描画されない（静的ブログとして許容範囲内）
- 初回描画時に mermaid.js のバンドルサイズ（約 600KB min+gzip で約 200KB）がロードされる
- `dangerouslySetInnerHTML` の使用が必要だが、入力が自前の MDX コンテンツに限定されるためリスクは低い

## 参照

- [mermaid.js 公式ドキュメント](https://mermaid.js.org/)
- [mermaid npm パッケージ](https://www.npmjs.com/package/mermaid)
- `src/components/mdx/Callout.tsx` — 既存コンポーネントの実装パターン
- `src/components/mdx/CodeBlock.tsx` — `useState` + クライアントインタラクションの実装パターン
- `docs/03_content.md` — MDX カスタムコンポーネント仕様
