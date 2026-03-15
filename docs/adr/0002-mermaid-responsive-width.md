# 0002. Mermaid SVG のレスポンシブ横幅対応

Date: 2026-03-15
Status: Accepted

## Context

ADR 0001 で導入した `Mermaid.tsx` コンポーネントは、`mermaid.render()` が生成する SVG をそのまま DOM に注入している。
生成される SVG には固定の `width` / `height` 属性が付与されており、PC の広い画面でもダイアグラムが小さく表示される問題がある。

スマホ表示ではコンテナ自体が狭いため SVG が自然にフィットしており、問題は発生していない。

## Decision

SVG を包含する内側の `div` に Tailwind CSS の任意バリアント `[&>svg]:w-full [&>svg]:h-auto` を追加し、
子要素の SVG をコンテナ幅に追従させる。

- `w-full` により SVG がコンテナの横幅いっぱいに拡大される
- `h-auto` によりアスペクト比を維持したまま高さが自動計算される
- スマホ表示は既に問題ないため影響なし

### 採用しなかった選択肢

1. **JavaScript で SVG の `viewBox` を書き換える**: mermaid の出力形式に依存する処理が増え、保守コストが高い
2. **CSS `<style>` タグでグローバルスタイルを適用**: プロジェクトのコーディング規約（Tailwind クラスのみ使用、`<style>` タグ不使用）に違反する

## Consequences

### 良い点

- 変更箇所が 1 行（Tailwind クラスの追加のみ）で、影響範囲が極めて小さい
- PC 表示時にダイアグラムが横幅を活用し、視認性が向上する

### トレードオフ

- 非常に横長のダイアグラムが引き伸ばされる可能性があるが、`overflow-x-auto` が既に適用されているため実害は少ない

## 参照

- `docs/adr/0001-mermaid-renderer.md` — Mermaid コンポーネントの初期設計
- `src/components/mdx/Mermaid.tsx` — 変更対象ファイル
