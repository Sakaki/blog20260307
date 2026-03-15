# 01. プロジェクト概要

## 目的

Astro + TypeScript + daisyUI を用いた静的ブログシステムの構築。
記事は MDX 形式で管理し、MDX 内で React コンポーネントを利用できる。

## 技術スタック

| カテゴリ                | 採用技術                  | バージョン目安 |
| ----------------------- | ------------------------- | -------------- |
| フレームワーク          | Astro                     | 5.x            |
| 言語                    | TypeScript                | 5.x            |
| UIコンポーネント        | daisyUI                   | 5.x            |
| CSSフレームワーク       | Tailwind CSS v4           | 4.x            |
| Reactインテグレーション | @astrojs/react            | 最新           |
| MDXサポート             | @astrojs/mdx              | 最新           |
| コンテンツ管理          | Astro Content Collections | -              |

## デプロイ方針

- **出力形式**: Static (SSG) — `output: "static"`
- **ビルド成果物**: `dist/` ディレクトリ
- **Webサーバー**: 自宅サーバーの Nginx
- `dist/` の中身を Nginx のドキュメントルートに配置する

### Nginx 設定の要点

```nginx
server {
    listen 80;
    root /var/www/blog/dist;
    index index.html;

    location / {
        try_files $uri $uri/ $uri.html =404;
    }
}
```

## daisyUI テーマ

- 固定テーマ（ライト・ダーク切り替えなし）
- デフォルトは `light` を使用（後から `tailwind.config.mjs` で変更可能）
- 候補: `light` / `nord` / `cupcake`
