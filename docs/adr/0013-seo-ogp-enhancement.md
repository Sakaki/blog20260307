# ADR 0013: SEO/OGP メタタグの改善

## ステータス

承認

## コンテキスト

現在の BaseLayout.astro には基本的な OGP メタタグ（og:title, og:type, og:site_name, og:description, twitter:card, twitter:title, twitter:description）が設定されているが、以下の情報が不足している：

- **og:url / canonical**: 各ページの正規 URL が未指定。検索エンジンが重複コンテンツを正しく処理できない
- **og:image / twitter:image**: OGP 画像が未指定。SNS でシェアされた際にサムネイルが表示されない
- **og:type の区別**: 全ページで `"website"` を使用しており、記事ページで `"article"` を使っていない
- **article:published_time**: 記事の公開日が構造化データとして提供されていない
- **robots.txt**: クローラーへの指示ファイルが存在しない
- **twitter:site**: Twitter アカウントとの紐付けがない

サイト URL は `astro.config.mjs` で `https://sakaki333.dev` と設定済み。

## 決定事項

### 1. BaseLayout の Props を拡張して OGP 情報を受け取る

BaseLayout に以下の optional Props を追加する：

- `ogType`: `"website" | "article"`（デフォルト `"website"`）
- `ogImage`: OGP 画像の URL（デフォルトはサイト共通のデフォルト画像）
- `publishedTime`: 記事公開日の ISO 8601 文字列（article のみ）
- `canonicalUrl`: 正規 URL（`Astro.url` から自動生成）

この方式を採用する理由：

1. **既存構造との整合性**: BaseLayout が `<head>` を一元管理しており、Props 追加だけで対応できる
2. **後方互換性**: 全 Props が optional でデフォルト値を持つため、既存の呼び出し元に変更不要
3. **責務の明確さ**: メタタグの出力は BaseLayout、OGP 固有情報の提供は PostLayout という責務分担が明確

### 2. canonical URL は Astro.url から自動生成

`Astro.url` と `Astro.site` を使って canonical URL を自動生成する。Props で明示的に渡す必要がない場合は BaseLayout 内で完結させる。これにより呼び出し元の変更を最小限に抑える。

### 3. OGP 画像のフォールバック戦略

記事ページでは以下の優先順で OGP 画像を決定する：

1. frontmatter の `heroImage`（記事固有の画像がある場合）
2. サイト共通のデフォルト OGP 画像（`/images/ogp-default.png`）

デフォルト OGP 画像は `public/images/ogp-default.png` に配置する（別途作成が必要）。

### 4. robots.txt は public/ に静的ファイルとして配置

Astro の動的生成（`src/pages/robots.txt.ts`）ではなく、`public/robots.txt` に静的ファイルとして配置する。理由：

1. **SSG との親和性**: 静的サイトなので動的生成の必要がない
2. **シンプルさ**: 内容が固定なのでファイルを直接配置するのが最も単純
3. **可視性**: リポジトリ上で内容が直接確認できる

## 影響範囲

- `src/layouts/BaseLayout.astro` -- Props 拡張、メタタグ追加
- `src/layouts/PostLayout.astro` -- BaseLayout に ogType / ogImage / publishedTime を渡す
- `public/robots.txt` -- 新規作成
- `public/images/ogp-default.png` -- 新規作成（デザイン作業が別途必要）
