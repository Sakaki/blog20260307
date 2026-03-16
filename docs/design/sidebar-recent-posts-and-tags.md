# サイドバー: 最近の記事 & タグ一覧

## 概要

PC版記事詳細ページの右サイドバー（目次の下）に「最近の記事」と「タグ一覧」セクションを追加する。

## 変更対象ファイル

| ファイル                                  | 変更内容                                                   |
| ----------------------------------------- | ---------------------------------------------------------- |
| `src/components/SidebarRecentPosts.astro` | 新規作成                                                   |
| `src/components/SidebarTags.astro`        | 新規作成                                                   |
| `src/layouts/PostLayout.astro`            | サイドバーに2コンポーネントを追加、sticky に overflow 対応 |

## コンポーネント設計

### SidebarRecentPosts.astro

最新記事をコンパクトに一覧表示する。

#### Props

```typescript
interface Props {
  currentSlug?: string; // 現在表示中の記事 slug（除外用）
}
```

#### データ取得

```typescript
import { getCollection } from "astro:content";

const allPosts = await getCollection("posts", ({ data }) => !data.draft);
const recentPosts = allPosts
  .filter((post) => post.slug !== currentSlug)
  .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
  .slice(0, 5);
```

#### マークアップ

```astro
<section class="py-4 border-t border-base-300">
  <h2 class="font-semibold text-base-content text-base mb-3">最近の記事</h2>
  <ul class="list-none p-0 m-0 space-y-2">
    {
      recentPosts.map((post) => (
        <li>
          <a href={`/posts/${post.slug}`} class="block group">
            <span class="text-sm leading-snug text-base-content/70 group-hover:text-base-content link-hover line-clamp-2">
              {post.data.title}
            </span>
            <span class="text-xs text-base-content/50">
              {post.data.date.toLocaleDateString("ja-JP", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </span>
          </a>
        </li>
      ))
    }
  </ul>
</section>
```

#### デザインポイント

- タイトルは `line-clamp-2` で最大2行に制限
- 日付はタイトルの下に小さく表示
- ホバー時にタイトルの色が濃くなる
- 目次と同じ `text-sm` ベースのコンパクトなスタイル
- セクション上部に `border-t` で区切り線

### SidebarTags.astro

全タグをバッジ形式で表示する。

#### Props

なし（全記事からタグを収集）

#### データ取得

```typescript
import { getCollection } from "astro:content";

const allPosts = await getCollection("posts", ({ data }) => !data.draft);
const tagMap = new Map<string, { displayName: string; count: number }>();

for (const post of allPosts) {
  for (const tag of post.data.tags) {
    const normalized = tag.toLowerCase();
    const existing = tagMap.get(normalized);
    if (existing) {
      existing.count++;
    } else {
      tagMap.set(normalized, { displayName: tag, count: 1 });
    }
  }
}

const tags = [...tagMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, { displayName, count }]) => ({ slug, displayName, count }));
```

タグ集計ロジックは `tags/index.astro` と同一。現時点では共通化せず各コンポーネントに記述する（コンポーネントが2箇所のみのため）。

#### マークアップ

```astro
<section class="py-4 border-t border-base-300">
  <h2 class="font-semibold text-base-content text-base mb-3">タグ</h2>
  <div class="flex flex-wrap gap-1.5">
    {
      tags.map((tag) => (
        <a
          href={`/tags/${tag.slug}`}
          class="badge badge-outline badge-sm border-primary text-primary hover:badge-primary transition-colors"
        >
          {tag.displayName}
        </a>
      ))
    }
  </div>
</section>
```

#### デザインポイント

- 記事詳細ヘッダーのタグと同じ `badge-sm badge-outline` スタイルを使用
- 件数表示は省略（サイドバー幅に収めるためコンパクトに）
- `gap-1.5` でバッジ間を詰めて配置

## PostLayout.astro の変更

### 変更前

```astro
<aside class="hidden lg:block">
  <div class="sticky top-8">
    <TableOfContentsSidebar headings={headings} />
  </div>
</aside>
```

### 変更後

```astro
<aside class="hidden lg:block">
  <div class="sticky top-8 max-h-[calc(100vh-4rem)] overflow-y-auto">
    <TableOfContentsSidebar headings={headings} />
    <SidebarRecentPosts currentSlug={currentSlug} />
    <SidebarTags />
  </div>
</aside>
```

#### sticky + overflow 対応

- `max-h-[calc(100vh-4rem)]`: ビューポート高さから上下マージン分を引いた最大高さ
- `overflow-y-auto`: コンテンツが最大高さを超えた場合にサイドバー内でスクロール可能にする
- これにより目次 + 最近の記事 + タグが長くてもページ全体のスクロールを阻害しない

### currentSlug の取得

PostLayout は記事の slug を直接 props で受け取っていないため、`Astro.url.pathname` から取得する。

```typescript
const currentSlug = Astro.url.pathname.replace(/^\/posts\//, "").replace(/\/$/, "");
```

## 表示条件

- PC版（lg: 以上）: 既存の `hidden lg:block` により自動的に対応
- 目次がない記事（`hasToc === false`）: 右ペイン自体が表示されないため、最近の記事・タグも表示されない
  - 将来的に目次がなくてもサイドバーを表示する対応は、今回のスコープ外とする
