# 目次サイドバー表示 実装仕様書

## 概要

PC 画面（lg: ブレークポイント以上）で記事ページの目次を右側サイドバーに表示する。モバイルでは既存のインライン折りたたみ目次を維持する。

## 変更対象ファイル

| ファイル                                      | 変更種別 | 概要                                           |
| --------------------------------------------- | -------- | ---------------------------------------------- |
| `src/layouts/BaseLayout.astro`                | 変更     | `maxWidth` prop を追加                         |
| `src/layouts/PostLayout.astro`                | 変更     | 2 カラム Grid レイアウト、サイドバー目次を追加 |
| `src/components/TableOfContentsSidebar.astro` | 新規     | サイドバー専用の目次コンポーネント             |

## `src/layouts/BaseLayout.astro` — 変更内容

### 変更前

```astro
---
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description } = Astro.props;
---

<!doctype html>
<html lang="ja" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <meta property="og:title" content={title} />
    <meta property="og:type" content="website" />
    {description && <meta property="og:description" content={description} />}
  </head>
  <body class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <Header />
    <main class="flex-1 container mx-auto px-4 py-8 max-w-4xl">
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

### 変更後

```astro
---
import Header from "../components/Header.astro";
import Footer from "../components/Footer.astro";
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
  maxWidth?: string;
}

const { title, description, maxWidth = "max-w-4xl" } = Astro.props;
---

<!doctype html>
<html lang="ja" data-theme="light">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    {description && <meta name="description" content={description} />}
    <meta property="og:title" content={title} />
    <meta property="og:type" content="website" />
    {description && <meta property="og:description" content={description} />}
  </head>
  <body class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <Header />
    <main class={`flex-1 container mx-auto px-4 py-8 ${maxWidth}`}>
      <slot />
    </main>
    <Footer />
  </body>
</html>
```

**変更点:**

1. Props に `maxWidth?: string` を追加（デフォルト値: `"max-w-4xl"`）
2. `<main>` の class 属性をテンプレートリテラルに変更し、`maxWidth` を動的に適用
3. デフォルト値が現行と同じ `max-w-4xl` のため、`maxWidth` を渡さないページは既存の挙動を維持

## `src/layouts/PostLayout.astro` — 変更内容

### 変更前

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

### 変更後

```astro
---
import BaseLayout from "./BaseLayout.astro";
import TableOfContents from "../components/TableOfContents.astro";
import TableOfContentsSidebar from "../components/TableOfContentsSidebar.astro";

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
const tocHeadings = headings.filter((h) => h.depth === 2 || h.depth === 3);
const hasToc = tocHeadings.length > 0;
---

<BaseLayout title={title} description={description} maxWidth={hasToc ? "max-w-6xl" : "max-w-4xl"}>
  <div class={hasToc ? "lg:grid lg:grid-cols-[1fr_16rem] lg:gap-8" : ""}>
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
      <div class="lg:hidden">
        <TableOfContents headings={headings} />
      </div>
      <div class="prose prose-base max-w-none">
        <slot />
      </div>
    </article>
    {
      hasToc && (
        <aside class="hidden lg:block">
          <div class="sticky top-8">
            <TableOfContentsSidebar headings={headings} />
          </div>
        </aside>
      )
    }
  </div>
</BaseLayout>
```

**変更点:**

1. `TableOfContentsSidebar` を import
2. `tocHeadings` と `hasToc` を算出し、目次の有無で動的にレイアウトを切り替え
3. `BaseLayout` に `maxWidth` prop を渡す（目次ありの場合 `max-w-6xl`、なしの場合 `max-w-4xl`）
4. 外側に Grid コンテナ `<div>` を追加（目次がある場合のみ Grid を適用）
5. 既存の `<TableOfContents>` を `<div class="lg:hidden">` で囲み、デスクトップでは非表示に
6. `<aside class="hidden lg:block">` 内に `TableOfContentsSidebar` を配置（モバイルでは非表示）
7. サイドバー内の目次に `sticky top-8` を適用しスクロール追従

## `src/components/TableOfContentsSidebar.astro` — 新規作成

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
    <nav class="py-4">
      <h2 class="font-semibold text-base-content text-sm mb-3">目次</h2>
      <ul class="list-none p-0 m-0 space-y-1">
        {tocHeadings.map((heading) => (
          <li class={heading.depth === 3 ? "ml-4" : ""}>
            <a
              href={`#${heading.slug}`}
              class="link link-hover text-xs leading-relaxed text-base-content/70 hover:text-base-content"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

### 既存 `TableOfContents` との違い

| 項目           | TableOfContents（インライン）      | TableOfContentsSidebar（サイドバー） |
| -------------- | ---------------------------------- | ------------------------------------ |
| 折りたたみ     | `collapse collapse-arrow` で開閉可 | なし（常に展開）                     |
| 外側の要素     | `<div class="collapse ...">`       | `<nav>`                              |
| タイトル       | `collapse-title` 内の「目次」      | `<h2>` タグの「目次」                |
| フォントサイズ | `text-sm`                          | `text-xs`                            |
| 背景色         | `bg-base-200`                      | なし（透明）                         |
| 余白           | `mb-8`                             | `py-4`                               |
| リンク色       | デフォルト                         | `text-base-content/70`（やや薄め）   |

## レスポンシブ動作

### モバイル（画面幅 < 1024px）

- Grid なし。1 カラムレイアウト
- `<div class="lg:hidden">` 内のインライン目次（`TableOfContents`）が表示される
- `<aside class="hidden lg:block">` のサイドバー目次は非表示
- `BaseLayout` の `maxWidth` は `max-w-6xl` だが、画面幅が小さいため実質的に全幅に近い表示

### デスクトップ（画面幅 >= 1024px）

- CSS Grid が有効: `grid-cols-[1fr_16rem]`
  - 左カラム（`1fr`）: 記事本文。残りの幅を占める
  - 右カラム（`16rem` = 256px）: サイドバー目次
- `<div class="lg:hidden">` のインライン目次は非表示
- `<aside class="hidden lg:block">` のサイドバー目次が表示される
- サイドバー目次は `sticky top-8` でスクロール追従

### 目次なしの記事

- `hasToc` が `false` の場合、Grid コンテナの Grid クラスが適用されない
- `<aside>` 自体が描画されない
- `BaseLayout` の `maxWidth` は `max-w-4xl`（現行と同じ）
- レイアウトは完全に現行と同一

## テスト観点

- デスクトップ（lg: 以上）でサイドバーに目次が表示されること
- デスクトップでインライン目次が非表示であること
- モバイル（lg: 未満）でインライン目次が表示されること
- モバイルでサイドバー目次が非表示であること
- サイドバー目次が `sticky` でスクロール追従すること
- サイドバー目次のリンクをクリックすると対応する見出しにジャンプすること
- 見出しのない記事で Grid レイアウトが適用されず、現行と同じ表示であること
- `BaseLayout` の `maxWidth` を渡さない他のページが `max-w-4xl` のまま表示されること
- ビルド（`astro build`）が正常に完了すること
