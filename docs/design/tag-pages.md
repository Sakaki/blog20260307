# タグページ機能 実装仕様書

## 概要

タグをクリック可能なリンクにし、タグ一覧ページ (`/tags`) とタグ別記事一覧ページ (`/tags/[tag]`) を追加する。

## URL 設計

| URL           | ページ                       | 説明                       |
| ------------- | ---------------------------- | -------------------------- |
| `/tags`       | `src/pages/tags/index.astro` | 全タグ一覧（記事件数付き） |
| `/tags/[tag]` | `src/pages/tags/[tag].astro` | 指定タグの記事一覧         |

## タグの正規化ルール

- タグ文字列を `toLowerCase()` で小文字に変換して URL パラメータとして使用する
- 表示上は元の大文字/小文字を保持する（最初に出現した表記を採用）
- 例: 記事 A が `["Astro"]`、記事 B が `["astro"]` を持つ場合、同じタグとして集約される

## 変更対象ファイル一覧

### 新規作成

1. `src/pages/tags/index.astro`
2. `src/pages/tags/[tag].astro`

### 変更

3. `src/components/PostCard.astro` — タグをリンク化
4. `src/layouts/PostLayout.astro` — タグをリンク化
5. `src/components/Header.astro` — ナビゲーションに Tags リンク追加

---

## 1. `src/pages/tags/index.astro` — タグ一覧ページ

### 動作

- `getCollection("posts")` で draft を除外した全記事を取得
- 全記事の tags を走査し、タグごとの記事件数を集計する
- タグ名（小文字正規化済み）のアルファベット順にソートして表示

### タグ集約ロジック

```typescript
const allPosts = await getCollection("posts", ({ data }) => !data.draft);

// Map<正規化タグ, { displayName: string; count: number }>
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

// アルファベット順にソート
const tags = [...tagMap.entries()]
  .sort(([a], [b]) => a.localeCompare(b))
  .map(([slug, { displayName, count }]) => ({ slug, displayName, count }));
```

### テンプレート構造

```astro
<BaseLayout title="タグ一覧 | Blog" description="全タグの一覧">
  <h1 class="text-4xl font-bold text-base-content mb-8">タグ一覧</h1>
  <div class="flex flex-wrap gap-3">
    {
      tags.map((tag) => (
        <a
          href={`/tags/${tag.slug}`}
          class="badge badge-outline badge-lg gap-1 hover:badge-primary transition-colors"
        >
          {tag.displayName}
          <span class="badge badge-sm badge-neutral">{tag.count}</span>
        </a>
      ))
    }
  </div>
</BaseLayout>
```

- タグが 0 件の場合は「タグがまだありません。」と表示する

---

## 2. `src/pages/tags/[tag].astro` — タグ別記事一覧ページ

### 動作

- `getStaticPaths` で全タグ分のパスを静的生成する
- 各タグに紐づく記事を日付の降順でソートして表示する
- 既存の PostCard コンポーネントで記事カードを描画する

### getStaticPaths 実装

```typescript
export async function getStaticPaths() {
  const allPosts = await getCollection("posts", ({ data }) => !data.draft);

  // タグごとに記事をグルーピング
  const tagMap = new Map<string, { displayName: string; posts: typeof allPosts }>();

  for (const post of allPosts) {
    for (const tag of post.data.tags) {
      const normalized = tag.toLowerCase();
      const existing = tagMap.get(normalized);
      if (existing) {
        existing.posts.push(post);
      } else {
        tagMap.set(normalized, { displayName: tag, posts: [post] });
      }
    }
  }

  return [...tagMap.entries()].map(([slug, { displayName, posts }]) => ({
    params: { tag: slug },
    props: {
      displayName,
      posts: posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf()),
    },
  }));
}
```

### テンプレート構造

```astro
<BaseLayout
  title={`${displayName} の記事一覧 | Blog`}
  description={`タグ「${displayName}」の記事一覧`}
>
  <div class="mb-8">
    <a href="/tags" class="link link-hover text-sm text-base-content/60"> &larr; タグ一覧に戻る </a>
  </div>
  <h1 class="text-4xl font-bold text-base-content mb-8">
    <span class="badge badge-outline badge-lg mr-2">{displayName}</span>
    の記事一覧
  </h1>
  {
    posts.length === 0 ? (
      <p class="text-base-content/60">記事がまだありません。</p>
    ) : (
      <div class="grid gap-4">
        {posts.map((post) => (
          <PostCard
            title={post.data.title}
            date={post.data.date}
            description={post.data.description}
            tags={post.data.tags}
            slug={post.slug}
          />
        ))}
      </div>
    )
  }
</BaseLayout>
```

---

## 3. `src/components/PostCard.astro` — タグのリンク化

### 変更内容

タグ表示部分の `<span>` を `<a>` タグに変更する。

**変更前:**

```astro
<span class="badge badge-outline badge-sm">{tag}</span>
```

**変更後:**

```astro
<a
  href={`/tags/${tag.toLowerCase()}`}
  class="badge badge-outline badge-sm hover:badge-primary transition-colors"
>
  {tag}
</a>
```

### 注意点

- PostCard 全体がカードリンク（`<a class="absolute inset-0 z-10">` による全面リンク）になっている
- タグリンクは `relative z-20` を持つ `card-actions` の中にあるため、タグリンクのクリックはカードリンクより優先される（既存の z-index 設計をそのまま活用）

---

## 4. `src/layouts/PostLayout.astro` — タグのリンク化

### 変更内容

PostCard と同様に、タグ表示部分の `<span>` を `<a>` タグに変更する。

**変更前:**

```astro
<span class="badge badge-outline badge-sm">{tag}</span>
```

**変更後:**

```astro
<a
  href={`/tags/${tag.toLowerCase()}`}
  class="badge badge-outline badge-sm hover:badge-primary transition-colors"
>
  {tag}
</a>
```

---

## 5. `src/components/Header.astro` — ナビゲーション追加

### 変更内容

既存のナビゲーションリンク（Home, Posts）に Tags リンクを追加する。

**変更前:**

```astro
<a href="/" class="btn btn-ghost btn-sm">Home</a>
<a href="/posts" class="btn btn-ghost btn-sm">Posts</a>
```

**変更後:**

```astro
<a href="/" class="btn btn-ghost btn-sm">Home</a>
<a href="/posts" class="btn btn-ghost btn-sm">Posts</a>
<a href="/tags" class="btn btn-ghost btn-sm">Tags</a>
```

---

## テスト観点

- `/tags` ページに全タグが記事件数付きで表示されること
- `/tags/[tag]` ページに該当タグの記事のみが表示されること
- `draft: true` の記事のタグがタグ一覧・件数に含まれないこと
- PostCard / PostLayout のタグバッジをクリックすると `/tags/[tag]` に遷移すること
- タグの大文字/小文字が異なる場合でも同一タグとして集約されること
- Header のナビゲーションに Tags リンクが表示されること
- ビルド（`astro build`）が正常に完了すること
