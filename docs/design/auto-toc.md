# 目次（Table of Contents）自動生成 実装仕様書

## 概要

記事ページの見出し（h2, h3）から目次を自動生成し、記事ヘッダーと本文の間に折りたたみ可能なセクションとして表示する。

## 変更対象ファイル

| ファイル                               | 変更種別 | 概要                                                   |
| -------------------------------------- | -------- | ------------------------------------------------------ |
| `src/components/TableOfContents.astro` | 新規     | 目次コンポーネント                                     |
| `src/pages/posts/[slug].astro`         | 変更     | `render()` から `headings` を取得し PostLayout に渡す  |
| `src/layouts/PostLayout.astro`         | 変更     | Props に `headings` を追加し、TOC を header 直後に配置 |

## `src/components/TableOfContents.astro` — 新規作成

```astro
---
interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  headings: Heading[];
}

const { headings } = Astro.props;
const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);
---

{
  tocHeadings.length > 0 && (
    <div class="collapse collapse-arrow bg-base-200 mb-8">
      <input type="checkbox" checked />
      <div class="collapse-title font-semibold text-base-content">目次</div>
      <div class="collapse-content">
        <ul class="list-none p-0 m-0">
          {tocHeadings.map((heading) => (
            <li class={heading.depth === 3 ? "ml-4" : ""}>
              <a href={`#${heading.slug}`} class="link link-hover text-sm leading-relaxed">
                {heading.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
```

## `src/pages/posts/[slug].astro` — 変更内容

### 変更前

```astro
---
import { getCollection, render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content } = await render(post);
---

<PostLayout
  frontmatter={{
    title: post.data.title,
    date: post.data.date,
    tags: post.data.tags,
    description: post.data.description,
  }}
>
  <Content />
</PostLayout>
```

### 変更後

```astro
---
import { getCollection, render } from "astro:content";
import PostLayout from "../../layouts/PostLayout.astro";

export async function getStaticPaths() {
  const posts = await getCollection("posts", ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}

const { post } = Astro.props;
const { Content, headings } = await render(post);
---

<PostLayout
  frontmatter={{
    title: post.data.title,
    date: post.data.date,
    tags: post.data.tags,
    description: post.data.description,
  }}
  headings={headings}
>
  <Content />
</PostLayout>
```

**変更点:** `render()` の戻り値から `headings` を追加で分割代入し、`PostLayout` に `headings` prop として渡す。

## `src/layouts/PostLayout.astro` — 変更内容

### 変更前

```astro
---
import BaseLayout from "./BaseLayout.astro";

interface Props {
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
  };
}

const { frontmatter } = Astro.props;
const { title, date, tags, description } = frontmatter;
const formattedDate = date.toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<BaseLayout title={title} description={description}>
  <article class="max-w-none">
    <header class="mb-8 border-b border-base-300 pb-6">
      <h1 class="text-4xl font-bold text-base-content mb-3">{title}</h1>
      <p class="text-base-content/60 text-sm mb-3">{formattedDate}</p>
      {
        tags.length > 0 && (
          <div class="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <a
                href={`/tags/${tag.toLowerCase()}`}
                class="badge badge-outline badge-sm hover:badge-primary transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        )
      }
    </header>
    <div class="prose prose-base max-w-none">
      <slot />
    </div>
  </article>
</BaseLayout>
```

### 変更後

```astro
---
import BaseLayout from "./BaseLayout.astro";
import TableOfContents from "../components/TableOfContents.astro";

interface Heading {
  depth: number;
  slug: string;
  text: string;
}

interface Props {
  frontmatter: {
    title: string;
    date: Date;
    tags: string[];
    description: string;
  };
  headings?: Heading[];
}

const { frontmatter, headings = [] } = Astro.props;
const { title, date, tags, description } = frontmatter;
const formattedDate = date.toLocaleDateString("ja-JP", {
  year: "numeric",
  month: "long",
  day: "numeric",
});
---

<BaseLayout title={title} description={description}>
  <article class="max-w-none">
    <header class="mb-8 border-b border-base-300 pb-6">
      <h1 class="text-4xl font-bold text-base-content mb-3">{title}</h1>
      <p class="text-base-content/60 text-sm mb-3">{formattedDate}</p>
      {
        tags.length > 0 && (
          <div class="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <a
                href={`/tags/${tag.toLowerCase()}`}
                class="badge badge-outline badge-sm hover:badge-primary transition-colors"
              >
                {tag}
              </a>
            ))}
          </div>
        )
      }
    </header>
    <TableOfContents headings={headings} />
    <div class="prose prose-base max-w-none">
      <slot />
    </div>
  </article>
</BaseLayout>
```

**変更点:**

1. `TableOfContents` コンポーネントを import
2. `Heading` インターフェースを定義
3. Props に `headings?: Heading[]` を追加（オプショナルで後方互換性を維持）
4. `headings` をデフォルト値 `[]` で分割代入
5. `</header>` と `<div class="prose">` の間に `<TableOfContents headings={headings} />` を配置

## 実装詳細

### headings 配列の構造

Astro の `render()` が返す `headings` は以下の型を持つ:

```typescript
interface Heading {
  depth: number; // 1=h1, 2=h2, 3=h3, ...
  slug: string; // rehype-slug が自動生成した ID（例: "setup-guide"）
  text: string; // 見出しの plain text
}
```

### 目次のフィルタリング

`depth === 2 || depth === 3` の見出しのみを表示する。

| depth | HTML 要素 | 目次での扱い           |
| ----- | --------- | ---------------------- |
| 1     | h1        | 除外（ページタイトル） |
| 2     | h2        | 表示（トップレベル）   |
| 3     | h3        | 表示（インデント）     |
| 4+    | h4+       | 除外（細かすぎる）     |

### collapse コンポーネントの動作原理

daisyUI の `collapse` は `<input type="checkbox">` の checked 状態で開閉を制御する。

1. `<input type="checkbox" checked />` により初期状態は「開」
2. ユーザーがタイトル部分をクリック → checkbox の checked が toggle
3. CSS の `:checked` 擬似クラスにより `collapse-content` の表示/非表示が切り替わる

JavaScript は一切不要。

### インデントの実装

h3 の `<li>` に `ml-4`（margin-left: 1rem）を適用し、h2 配下のサブ項目として視覚的に区別する。

| 見出し | クラス | インデント |
| ------ | ------ | ---------- |
| h2     | なし   | 0          |
| h3     | `ml-4` | 1rem       |

### 見出し 0 件の場合

`tocHeadings.length > 0` の条件により、h2/h3 が 1 つもない記事では目次セクション自体が描画されない。

## テスト観点

- h2 と h3 が含まれる記事で目次が表示されること
- h2 のみの記事で目次が正しく表示されること
- h2/h3 が存在しない記事で目次が表示されないこと
- 各目次リンクをクリックすると対応する見出しにスクロールすること
- h3 項目が h2 項目よりインデントされていること
- 目次の折りたたみ（開閉）が動作すること
- `headings` prop を渡さない場合でもエラーにならないこと（デフォルト値 `[]`）
- ビルド（`astro build`）が正常に完了すること
