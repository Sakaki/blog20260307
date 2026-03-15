# CLAUDE.md

## プロジェクト概要

Astro + TypeScript + daisyUI を使った静的ブログシステム。
記事は MDX 形式で管理し、MDX 内で React コンポーネントを利用できる。
ビルド成果物を自宅サーバーの Nginx に配置してホスティングする。

## 開発フロー

- feature ブランチで作業し、完了後は main にマージして push する
- GitHub PR は使用しない（個人開発のため）

### コマンド

| コマンド  | 説明                                      |
| --------- | ----------------------------------------- |
| `/deploy` | ビルドして自宅サーバー（Nginx）にデプロイ |

## 技術スタック

| カテゴリ                | 技術                      |
| ----------------------- | ------------------------- |
| フレームワーク          | Astro 5.x                 |
| 言語                    | TypeScript 5.x            |
| UIコンポーネント        | daisyUI 5.x               |
| CSSフレームワーク       | Tailwind CSS v4           |
| Reactインテグレーション | @astrojs/react            |
| MDXサポート             | @astrojs/mdx              |
| コンテンツ管理          | Astro Content Collections |

## ディレクトリ構成

```
src/
  content/
    config.ts          # Content Collection スキーマ
    posts/             # MDX 記事ファイル
  components/
    Header.astro
    Footer.astro
    PostCard.astro
    mdx/
      Callout.tsx      # MDX 内で使える React コンポーネント
  layouts/
    BaseLayout.astro
    PostLayout.astro
  pages/
    index.astro        # ホーム（最新10件）
    posts/
      index.astro      # 全記事一覧
      [slug].astro     # 記事詳細
public/
  images/              # 記事内で参照する画像
```

## 設計書

設計書は `docs/` に Markdown 形式で配置されています。
実装時は必ず該当する設計書を参照してください。

| ファイル                  | 内容                                               |
| ------------------------- | -------------------------------------------------- |
| `docs/01_overview.md`     | 技術スタック・デプロイ方針                         |
| `docs/02_architecture.md` | ディレクトリ構成・ページ設計・コンポーネント設計   |
| `docs/03_content.md`      | MDX フロントマター仕様・カスタムコンポーネント仕様 |

## コーディング規約

- TypeScript の型定義は明示的に書く（`any` 禁止）
- Astro コンポーネントのスタイルは Tailwind CSS + daisyUI クラスで記述する（`<style>` タグ不使用）
- MDX 記事内のカスタムコンポーネントは `src/components/mdx/` に配置する

## 注意事項

- 出力形式は `output: "static"` (SSG)。サーバーサイド機能は使わない
- daisyUI テーマは固定（ライト・ダーク切り替えなし）。デフォルトテーマは `light`
- `draft: true` の記事はビルド時に除外すること
- 記事 URL は `/posts/[slug]` の形式に統一する
