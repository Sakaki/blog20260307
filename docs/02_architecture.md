# 02. アーキテクチャ・ディレクトリ構成

## ディレクトリ構成

```
blog20260307/
├── src/
│   ├── content/
│   │   ├── config.ts           # Content Collection のスキーマ定義
│   │   └── posts/              # MDX 記事ファイル置き場
│   │       └── hello-world.mdx
│   ├── components/
│   │   ├── Header.astro
│   │   ├── Footer.astro
│   │   ├── PostCard.astro      # 記事一覧で使うカードコンポーネント
│   │   └── mdx/
│   │       └── Callout.tsx     # MDX 内で使える React コンポーネント（サンプル）
│   ├── layouts/
│   │   ├── BaseLayout.astro    # 全ページ共通レイアウト（head, header, footer）
│   │   └── PostLayout.astro    # 記事ページ専用レイアウト
│   └── pages/
│       ├── index.astro         # ホームページ（最新10件の記事一覧）
│       └── posts/
│           ├── index.astro     # 全記事一覧ページ
│           └── [slug].astro    # 記事詳細ページ
├── public/
│   └── images/                 # 記事内で参照する画像ファイル
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
└── package.json
```

## ページ構成

| URL             | ファイル                   | 説明                               |
| --------------- | -------------------------- | ---------------------------------- |
| `/`             | `pages/index.astro`        | ホーム。最新10件の記事カードを表示 |
| `/posts`        | `pages/posts/index.astro`  | 全記事一覧。日付降順               |
| `/posts/[slug]` | `pages/posts/[slug].astro` | 記事詳細。MDX をレンダリング       |

## コンポーネント設計

### BaseLayout.astro

全ページで使う共通レイアウト。

- `<html>` / `<head>` / `<body>` を含む
- `<Header>` と `<Footer>` を内包
- props: `title: string`, `description?: string`

### PostLayout.astro

記事ページ専用。`BaseLayout` をラップする。

- フロントマターの表示（タイトル、日付、タグ）
- MDX コンテンツの描画領域
- props: `frontmatter` (title, date, tags, description)

### PostCard.astro

記事一覧で使うカードコンポーネント。

- daisyUI の `card` コンポーネントを使用
- 表示項目: タイトル、日付、description、タグ一覧
- リンク先: `/posts/[slug]`

### Header.astro

- サイトタイトル（リンク: `/`）
- ナビゲーション: Home (`/`), Posts (`/posts`)
- daisyUI の `navbar` を使用

### Footer.astro

- コピーライト表示のみ（シンプル構成）

## Content Collections

`src/content/config.ts` で記事スキーマを定義する。

```ts
import { defineCollection, z } from "astro:content";

const posts = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { posts };
```

### `draft: true` の記事の扱い

- `getCollection("posts")` 取得時にフィルタリングして非表示にする
- 本番ビルドでは `draft: true` の記事をページ生成対象から除外する

```ts
// 例: draft を除外してビルド
const posts = await getCollection("posts", ({ data }) => !data.draft);
```

## Astro の設定方針

```js
// astro.config.mjs
export default defineConfig({
  output: "static",
  integrations: [
    react(), // MDX 内で React コンポーネントを使うため
    mdx(),
    tailwind(),
  ],
});
```
