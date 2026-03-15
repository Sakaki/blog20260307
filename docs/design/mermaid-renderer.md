# 設計書: Mermaid レンダラーコンポーネント

## 概要

MDX 記事内で `<Mermaid>` タグを使って Mermaid ダイアグラムを描画する React コンポーネントを実装する。
`mermaid` npm パッケージを使い、クライアントサイドで SVG をレンダリングする。

## 成果物ファイル一覧

| ファイルパス                     | 種別     | 説明                                         |
| -------------------------------- | -------- | -------------------------------------------- |
| `src/components/mdx/Mermaid.tsx` | 新規作成 | Mermaid レンダラー React コンポーネント      |
| `package.json`                   | 修正     | `mermaid` パッケージを `dependencies` に追加 |
| `docs/03_content.md`             | 修正     | `<Mermaid>` コンポーネントの使用方法を追記   |

## インストール

```bash
npm install mermaid
```

`mermaid` の型定義は本体に含まれているため `@types/mermaid` は不要。

## コンポーネント仕様

### ファイルパス

`src/components/mdx/Mermaid.tsx`

### Props インターフェース

```typescript
interface MermaidProps {
  chart: string;
}
```

| プロパティ | 型       | 必須 | 説明                                   |
| ---------- | -------- | ---- | -------------------------------------- |
| `chart`    | `string` | ✓    | Mermaid 記法のダイアグラム定義テキスト |

### コンポーネント実装仕様

```typescript
"use client"; // Astro では不要だが React の慣習として明示しない
// client:load は MDX 呼び出し側（.mdx ファイル）で付与する

import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps): JSX.Element {
  // ...実装詳細は下記参照
}
```

### 内部状態

| state   | 型               | 初期値 | 説明                        |
| ------- | ---------------- | ------ | --------------------------- |
| `svg`   | `string \| null` | `null` | レンダリング済み SVG 文字列 |
| `error` | `string \| null` | `null` | エラーメッセージ            |

### 処理フロー

```
コンポーネントマウント (useEffect)
  ↓
mermaid.initialize({ startOnLoad: false, theme: "default" })
  ↓
一意な id 生成（例: `mermaid-${Date.now()}`）
  ↓
mermaid.render(id, chart) を呼び出す
  ├─ 成功: svg state にSVG文字列をセット
  └─ 失敗: error state にエラーメッセージをセット
```

**注意点:**

- `mermaid.render()` は Promise を返す（mermaid v10以降）
- `chart` props が変化したとき（依存配列に `chart` を含める）再レンダリングする
- `mermaid.initialize()` は毎回呼ぶ必要はないが、初期化済みかの状態管理をシンプルにするため `useEffect` 内で呼ぶ

### レンダリング状態ごとの表示

| 状態                                     | 表示内容                                                                    |
| ---------------------------------------- | --------------------------------------------------------------------------- |
| 初期（`svg === null && error === null`） | ローディング表示（daisyUI の `loading loading-spinner`）                    |
| 成功（`svg !== null`）                   | SVG を `dangerouslySetInnerHTML` で描画、`overflow-x-auto` でスクロール対応 |
| エラー（`error !== null`）               | daisyUI の `alert alert-error` でエラーメッセージ表示                       |

### スタイリング仕様（Tailwind + daisyUI クラス）

```
// ラッパー div
"my-6 rounded-lg overflow-hidden"

// ローディング状態
"flex justify-center items-center p-8"
  └ <span className="loading loading-spinner loading-md text-primary" />

// 成功状態（SVG コンテナ）
"overflow-x-auto flex justify-center p-4 bg-base-100 rounded-lg border border-base-300"

// エラー状態
"alert alert-error"
  └ <span>{error}</span>
```

### 実装例（全体）

```typescript
import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

export default function Mermaid({ chart }: MermaidProps): JSX.Element {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const idRef = useRef<string>(`mermaid-${Math.random().toString(36).slice(2)}`);

  useEffect(() => {
    let cancelled = false;

    const render = async (): Promise<void> => {
      setSvg(null);
      setError(null);

      mermaid.initialize({ startOnLoad: false, theme: "default" });

      try {
        const { svg: rendered } = await mermaid.render(idRef.current, chart);
        if (!cancelled) {
          setSvg(rendered);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          const message = err instanceof Error ? err.message : "Mermaid レンダリングに失敗しました";
          setError(message);
        }
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error !== null) {
    return (
      <div className="my-6">
        <div role="alert" className="alert alert-error">
          <span>Mermaid エラー: {error}</span>
        </div>
      </div>
    );
  }

  if (svg === null) {
    return (
      <div className="my-6 flex justify-center items-center p-8">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  return (
    <div className="my-6 overflow-x-auto flex justify-center p-4 bg-base-100 rounded-lg border border-base-300">
      <div dangerouslySetInnerHTML={{ __html: svg }} />
    </div>
  );
}
```

## MDX 内での使用方法

```mdx
---
title: "システム構成図"
description: "Mermaid でシステム構成図を描く例"
date: 2026-03-15
tags: ["mermaid", "diagram"]
---

import Mermaid from "../../components/mdx/Mermaid.tsx";

## フローチャート

<Mermaid
  client:load
  chart={`
flowchart TD
    A[Start] --> B{Is it?}
    B -- Yes --> C[OK]
    B -- No --> D[End]
`}
/>

## シーケンス図

<Mermaid
  client:load
  chart={`
sequenceDiagram
    participant Alice
    participant Bob
    Alice->>Bob: Hello Bob, how are you?
    Bob-->>Alice: Great!
`}
/>
```

**重要:** MDX 内では必ず `client:load` ディレクティブを付与すること。
付与しないとサーバーサイド（ビルド時）に実行されようとして失敗する。

## `docs/03_content.md` への追記内容

`docs/03_content.md` の「カスタムコンポーネント」セクションに以下を追加する。

````markdown
### Mermaid.tsx

Mermaid 記法でダイアグラムを描画するコンポーネント。クライアントサイドでレンダリングされる。

**インターフェース:**

```ts
interface MermaidProps {
  chart: string;
}
```

**使用例:**

```mdx
import Mermaid from "../../components/mdx/Mermaid.tsx";

<Mermaid
  client:load
  chart={`
flowchart LR
    A --> B --> C
`}
/>
```

**注意事項:**

- `client:load` ディレクティブを必ず付与すること
- `chart` 属性にはテンプレートリテラル（バッククォート）を使うと複数行で記述しやすい
````

## 型安全性の注意事項

- `err: unknown` を使い、`any` は一切使用しない
- `err instanceof Error` でメッセージを安全に取り出す
- `mermaid.render()` の戻り値は `{ svg: string; bindFunctions?: (element: Element) => void }` 型

## テスト観点

1. 正常なフローチャート記法を渡したとき SVG が描画される
2. 不正な Mermaid 記法を渡したとき `alert alert-error` が表示される
3. `chart` props を動的に変更したとき再描画される
4. 初期描画中はローディングスピナーが表示される
