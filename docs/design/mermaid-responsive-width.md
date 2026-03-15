# Mermaid SVG レスポンシブ横幅対応 設計書

## 概要

`Mermaid.tsx` の SVG コンテナに Tailwind CSS クラスを追加し、PC 表示時に SVG がコンテナ横幅いっぱいに拡大されるようにする。

## 成果物ファイル一覧

| ファイルパス                     | 種別 | 説明                                      |
| -------------------------------- | ---- | ----------------------------------------- |
| `src/components/mdx/Mermaid.tsx` | 修正 | SVG コンテナ div に Tailwind クラスを追加 |

## 変更内容

### 対象箇所

`Mermaid.tsx` の成功状態レンダリング部分（83行目付近）にある内側の `div`:

```typescript
// 変更前
<div dangerouslySetInnerHTML={{ __html: svg }} />

// 変更後
<div className="[&>svg]:w-full [&>svg]:h-auto" dangerouslySetInnerHTML={{ __html: svg }} />
```

### 動作説明

| クラス           | 効果                                                            |
| ---------------- | --------------------------------------------------------------- |
| `[&>svg]:w-full` | 直下の `<svg>` 要素に `width: 100%` を適用                      |
| `[&>svg]:h-auto` | 直下の `<svg>` 要素に `height: auto` を適用（アスペクト比維持） |

Tailwind の任意バリアント `[&>svg]` は、子セレクタ `> svg` に対応する。
`mermaid.render()` が生成する SVG の固定 `width` / `height` 属性を CSS で上書きし、コンテナ幅に追従させる。

## テスト観点

1. PC 幅（1024px 以上）でダイアグラムがコンテナ横幅いっぱいに表示される
2. スマホ幅（375px 程度）で表示が崩れない（既存動作と同等）
3. 複数の図種（flowchart, sequence, class diagram など）で表示が正常
