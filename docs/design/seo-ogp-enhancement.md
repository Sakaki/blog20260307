# SEO/OGP メタタグ改善 設計書

## 概要

BaseLayout の `<head>` を拡張し、SEO/OGP に必要なメタタグを追加する。
記事ページでは `og:type` を `"article"` にし、公開日や OGP 画像を適切に設定する。
あわせて `robots.txt` と canonical URL を追加する。

## 変更対象ファイル

| ファイル                       | 変更内容                                                   |
| ------------------------------ | ---------------------------------------------------------- |
| `src/layouts/BaseLayout.astro` | Props 拡張、メタタグ追加（canonical, og:url, og:image 等） |
| `src/layouts/PostLayout.astro` | BaseLayout に ogType / ogImage / publishedTime を渡す      |
| `public/robots.txt`            | 新規作成                                                   |

## BaseLayout.astro の Props 拡張

### 現在の Props

```typescript
interface Props {
  title: string;
  description?: string;
  maxWidth?: string;
  pageTitle?: string;
}
```

### 変更後の Props

```typescript
interface Props {
  title: string;
  description?: string;
  maxWidth?: string;
  pageTitle?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  publishedTime?: string; // ISO 8601 形式（例: "2026-03-19T00:00:00.000Z"）
}
```

- すべて optional でデフォルト値あり。既存の呼び出し元への影響なし。

### 追加するメタタグ

BaseLayout の `<head>` 内に以下を追加する：

```astro
---
const {
  title,
  description,
  maxWidth = "max-w-4xl",
  pageTitle,
  ogType = "website",
  ogImage,
  publishedTime,
} = Astro.props;

const siteUrl = "https://sakaki333.dev";
const canonicalUrl = new URL(Astro.url.pathname, siteUrl).href;
const resolvedOgImage = ogImage
  ? ogImage.startsWith("http")
    ? ogImage
    : new URL(ogImage, siteUrl).href
  : new URL("/images/ogp-default.png", siteUrl).href;
---
```

`<head>` 内の変更箇所：

```html
<!-- canonical URL（新規追加） -->
<link rel="canonical" href="{canonicalUrl}" />

<!-- og:type を Props から受け取る（既存の固定値を置き換え） -->
<meta property="og:type" content="{ogType}" />

<!-- og:url（新規追加） -->
<meta property="og:url" content="{canonicalUrl}" />

<!-- og:image（新規追加） -->
<meta property="og:image" content="{resolvedOgImage}" />

<!-- article:published_time（記事ページのみ、新規追加） -->
{publishedTime && <meta property="article:published_time" content="{publishedTime}" />}

<!-- twitter:image（新規追加） -->
<meta name="twitter:image" content="{resolvedOgImage}" />

<!-- twitter:site（新規追加） -->
<meta name="twitter:site" content="@sakaki333" />
```

### 既存メタタグとの対応

| メタタグ                 | 現在                | 変更後                                        |
| ------------------------ | ------------------- | --------------------------------------------- |
| `og:type`                | `"website"`（固定） | Props `ogType` から（デフォルト `"website"`） |
| `og:url`                 | なし                | `Astro.url` から自動生成                      |
| `og:image`               | なし                | Props `ogImage` またはデフォルト画像          |
| `canonical`              | なし                | `Astro.url` から自動生成                      |
| `article:published_time` | なし                | Props `publishedTime`（記事のみ）             |
| `twitter:image`          | なし                | `og:image` と同じ値                           |
| `twitter:site`           | なし                | `@sakaki333`                                  |
| `og:title`               | あり（変更なし）    | --                                            |
| `og:site_name`           | あり（変更なし）    | --                                            |
| `og:description`         | あり（変更なし）    | --                                            |
| `twitter:card`           | あり（変更なし）    | --                                            |
| `twitter:title`          | あり（変更なし）    | --                                            |
| `twitter:description`    | あり（変更なし）    | --                                            |

## PostLayout.astro の変更

PostLayout から BaseLayout に OGP 情報を渡す。

```astro
<BaseLayout
  title={title}
  description={description}
  maxWidth={hasToc ? "max-w-6xl" : "max-w-4xl"}
  pageTitle={title}
  ogType="article"
  ogImage={heroImage}
  publishedTime={date.toISOString()}
/>
```

- `ogType`: 記事ページは常に `"article"`
- `ogImage`: frontmatter の `heroImage` をそのまま渡す（undefined の場合は BaseLayout でデフォルト画像にフォールバック）
- `publishedTime`: `date`（Date オブジェクト）を ISO 8601 文字列に変換

## robots.txt

`public/robots.txt` に以下の内容で新規作成する：

```
User-agent: *
Allow: /

Sitemap: https://sakaki333.dev/sitemap-index.xml
```

- 全クローラーに全ページのクロールを許可
- Sitemap の URL を記載（Astro の `@astrojs/sitemap` が生成する `sitemap-index.xml` を参照。未導入の場合は Sitemap 行を省略するか、別途導入を検討）

## デフォルト OGP 画像

- パス: `public/images/ogp-default.png`
- 推奨サイズ: 1200 x 630 px（OGP 推奨サイズ）
- 内容: サイトロゴやサイト名を含む汎用画像
- 注意: このファイルは別途デザイン・作成が必要。実装時はファイルが存在しなくても動作するが、SNS シェア時にサムネイルが表示されない

## twitter:site のアカウント名

- `@sakaki333` を使用（変更が必要な場合は BaseLayout のハードコード値を修正する）

## テスト方針

- ビルドテスト: `npm run build` が成功すること
- ホームページ: `og:type` が `"website"`、canonical URL が `https://sakaki333.dev/`
- 記事ページ: `og:type` が `"article"`、`article:published_time` が存在、`og:image` が heroImage または デフォルト画像
- robots.txt: `https://sakaki333.dev/robots.txt` にアクセスできること
