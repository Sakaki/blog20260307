# トップページタイトル変更 設計書

## 概要

トップページの HTML `<title>` を `"Blog"` から `"sakaki333.dev"` に変更する。

## 変更対象ファイル

| ファイル                | 変更内容                                 |
| ----------------------- | ---------------------------------------- |
| `src/pages/index.astro` | `title="Blog"` → `title="sakaki333.dev"` |

## 影響範囲

この変更により以下が `"sakaki333.dev"` になる:

- HTML `<title>` タグ
- `og:title` メタタグ
- `twitter:title` メタタグ

既に `"sakaki333.dev"` が設定されている箇所（変更不要）:

| 箇所                   | ファイル           | 現状値            |
| ---------------------- | ------------------ | ----------------- |
| ヘッダーリンクテキスト | `Header.astro`     | `~/sakaki333.dev` |
| RSS title              | `BaseLayout.astro` | `sakaki333.dev`   |
| `og:site_name`         | `BaseLayout.astro` | `sakaki333.dev`   |

## テスト方針

- ビルドが通ることを確認
- トップページの `<title>` が `"sakaki333.dev"` であることを確認
