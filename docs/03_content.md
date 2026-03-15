# 03. コンテンツ仕様（MDX・カスタムコンポーネント）

## 記事ファイルの配置

- 配置先: `src/content/posts/`
- ファイル名: `[slug].mdx`（URL `/posts/[slug]` と対応）
- ファイル名はすべて英数字・ハイフンのみを使用する

例:

```
src/content/posts/
├── hello-world.mdx
├── astro-getting-started.mdx
└── my-first-post.mdx
```

## フロントマター仕様

各 MDX ファイルの先頭に YAML フロントマターを記述する。

```yaml
---
title: "記事タイトル"
description: "記事の概要（一覧ページやOGPに使用）"
date: 2026-03-07
tags: ["astro", "typescript", "blog"]
draft: false
---
```

| フィールド    | 型       | 必須 | 説明                                      |
| ------------- | -------- | ---- | ----------------------------------------- |
| `title`       | string   | ✓    | 記事タイトル                              |
| `description` | string   | ✓    | 概要文（一覧・OGP用）                     |
| `date`        | date     | ✓    | 公開日（YYYY-MM-DD形式）                  |
| `tags`        | string[] | -    | タグ一覧（省略時は空配列）                |
| `draft`       | boolean  | -    | `true` の場合は非公開（省略時は `false`） |

## MDX 記事の書き方

フロントマターの後に Markdown と JSX を混在して記述できる。

````mdx
---
title: "Astroではじめるブログ"
description: "Astroを使ってブログを構築する方法を解説します。"
date: 2026-03-07
tags: ["astro", "blog"]
---

import Callout from "../../components/mdx/Callout.tsx";

## はじめに

これは普通の Markdown テキストです。

<Callout type="info">React コンポーネントをこのように埋め込めます。</Callout>

## コードブロック

```ts
const greeting = "Hello, World!";
console.log(greeting);
```
````

````

## カスタムコンポーネント

### Callout.tsx

注意書きや補足情報を目立たせるためのコンポーネント。

**インターフェース:**

```ts
type CalloutProps = {
  type: "info" | "warning" | "error" | "success";
  children: React.ReactNode;
};
````

**使用例:**

```mdx
import Callout from "../../components/mdx/Callout.tsx";

<Callout type="warning">この操作は元に戻せません。</Callout>

<Callout type="info">補足情報をここに書きます。</Callout>
```

**見た目のマッピング（daisyUI alert）:**

| type      | daisyUI クラス  |
| --------- | --------------- |
| `info`    | `alert-info`    |
| `warning` | `alert-warning` |
| `error`   | `alert-error`   |
| `success` | `alert-success` |

### Mermaid.tsx

Mermaid 記法でダイアグラムを描画するコンポーネント。クライアントサイドでレンダリングされる。

**インターフェース:**

```ts
interface MermaidProps {
  chart: string;
}
```

**使用例:**

```mdx
import Mermaid from "../../components/mdx/Mermaid.tsx";

<Mermaid
  client:load
  chart={`
flowchart LR
    A --> B --> C
`}
/>
```

**注意事項:**

- `client:load` ディレクティブを必ず付与すること
- `chart` 属性にはテンプレートリテラル（バッククォート）を使うと複数行で記述しやすい

## 画像の扱い

- 画像ファイルは `public/images/` 以下に配置する
- MDX 内での参照パスは絶対パスを使用する

```mdx
![説明テキスト](/images/my-image.png)
```

## 記事の追加手順

1. `src/content/posts/` に `[slug].mdx` を作成
2. フロントマターを記述
3. 本文を Markdown + JSX で記述
4. `draft: false` にして `npm run build`（または開発中は `npm run dev`）
