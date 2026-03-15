# Hero Image 設計書

## 概要

各記事の frontmatter に任意の `heroImage` フィールドを追加し、
指定がある場合は記事詳細ページのタグ一覧の下にヒーロー画像を表示する。

## 変更対象ファイル

| ファイル                       | 変更内容                                              |
| ------------------------------ | ----------------------------------------------------- |
| `src/content/config.ts`        | スキーマに `heroImage` (optional string) を追加       |
| `src/layouts/PostLayout.astro` | Props に `heroImage` を追加、タグ一覧の下に画像を表示 |
| `src/pages/posts/[slug].astro` | `heroImage` を PostLayout に渡す                      |

## フロントマター仕様

```yaml
heroImage: "https://example.com/hero.jpg" # 任意
```

- 型: `z.string().optional()`
- 未指定の場合: ヒーロー画像エリアは表示しない

## 表示仕様

- 配置: タグ一覧（`.flex.flex-wrap.gap-2`）の下、記事本文の上
- スタイル: 80%幅、角丸（rounded-lg）、シャドウ（shadow-md）、中央寄せ
- alt テキスト: 記事タイトルを使用

## テスト方針

- ビルドテスト: `npm run build` が成功すること
- E2E: heroImage ありの記事で画像が表示されること、なしの記事で表示されないこと
