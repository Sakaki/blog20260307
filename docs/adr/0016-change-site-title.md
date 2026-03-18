# 0016. トップページの HTML タイトルを sakaki333.dev に変更

Date: 2026-03-19
Status: Accepted

## Context

現在、トップページ (`src/pages/index.astro`) の `<title>` は `"Blog"` となっている。
サイトのブランド名は `sakaki333.dev` であり、ヘッダーや OGP の `og:site_name` では既にこの名前が使われているが、HTML `<title>` だけが `"Blog"` のままで一貫性がない。

## Decision

`src/pages/index.astro` で `BaseLayout` に渡す `title` props を `"Blog"` から `"sakaki333.dev"` に変更する。

変更箇所は 1 行のみ:

- `src/pages/index.astro`: `title="Blog"` → `title="sakaki333.dev"`

### 採用しなかった選択肢

1. **定数ファイル（consts.ts）を新設して一元管理**: 現時点ではタイトル文字列の参照箇所が少なく、定数ファイルを導入するほどの複雑さがないため見送り。将来的に参照箇所が増えた場合に検討する。
2. **BaseLayout 側でデフォルト title を設定**: 他のページでは個別の title を渡す設計のため、デフォルト値を持たせると意図しない副作用が生じる可能性がある。

## Consequences

### 良い点

- ブラウザのタブやブックマークで「sakaki333.dev」と表示され、サイトのブランドが明確になる
- OGP の `og:title` もトップページでは `"sakaki333.dev"` になり、SNS シェア時の見た目が改善される

### トレードオフ

- 特になし（変更は 1 行のみで影響範囲が極めて小さい）
