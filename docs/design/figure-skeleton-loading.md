# Figure Skeleton Loading 設計書

## 概要

`Figure` コンポーネント（`src/components/mdx/Figure.astro`）で画像ロード中に daisyUI の Skeleton プレースホルダーを表示し、読み込み完了後に画像に切り替える。

## 現在の Figure.astro の構造

```astro
---
interface Props {
  src: string;
  alt: string;
  caption?: string;
  sourceUrl?: string;
  sourceName?: string;
}

const { src, alt, caption, sourceUrl, sourceName } = Astro.props;
const displayCaption = caption ?? alt;
---

<figure class="my-6 flex flex-col items-center">
  <figcaption class="...">...</figcaption>
  <img src={src} alt={alt} class="max-w-[80%] rounded border ..." />
  {sourceUrl && sourceName && <p>...</p>}
</figure>
```

Props は `src`, `alt`, `caption`(optional), `sourceUrl`(optional), `sourceName`(optional) の5つ。これらは全て維持する。

## 変更対象ファイル

| ファイル                          | 変更内容                                                        |
| --------------------------------- | --------------------------------------------------------------- |
| `src/components/mdx/Figure.astro` | Skeleton 要素の追加、img の初期非表示、インラインスクリプト追加 |

## 変更方針: Astro + インラインスクリプト

React への変換は行わない（ADR 0012 参照）。Astro コンポーネント内にインライン `<script>` を追加して制御する。

## 実装設計

### HTML 構造

```astro
<figure class="my-6 flex flex-col items-center">
  <figcaption class="...">...</figcaption>
  <div class="figure-img-wrapper relative max-w-[80%] w-full">
    <!-- Skeleton: 画像ロード前に表示 -->
    <div class="figure-skeleton skeleton h-48 w-full rounded"></div>
    <!-- Image: 初期は非表示、ロード完了で表示 -->
    <img
      src={src}
      alt={alt}
      class="figure-img rounded border border-[var(--border-color)] w-full opacity-0 transition-opacity duration-300"
      loading="lazy"
    />
  </div>
  {sourceUrl && sourceName && <p>...</p>}
</figure>
```

### インラインスクリプト

```html
<script>
  function initFigures(): void {
    document.querySelectorAll<HTMLDivElement>(".figure-img-wrapper").forEach((wrapper) => {
      const img = wrapper.querySelector<HTMLImageElement>(".figure-img");
      const skeleton = wrapper.querySelector<HTMLDivElement>(".figure-skeleton");
      if (!img || !skeleton) return;

      const reveal = (): void => {
        skeleton.classList.add("hidden");
        img.classList.remove("opacity-0");
        img.classList.add("opacity-100");
      };

      if (img.complete && img.naturalWidth > 0) {
        // ブラウザキャッシュ済みの場合
        reveal();
      } else {
        img.addEventListener("load", reveal, { once: true });
        img.addEventListener("error", reveal, { once: true });
      }
    });
  }

  // 初回ロード
  initFigures();
  // ViewTransitions 対応（将来）
  document.addEventListener("astro:page-load", initFigures);
</script>
```

### 動作フロー

1. ページ HTML がレンダリングされる
2. Skeleton（`skeleton h-48 w-full`）が表示される。`<img>` は `opacity-0` で不可視
3. ブラウザが `<img>` の読み込みを開始する（`loading="lazy"` によりビューポート近辺で開始）
4. `img.complete` チェック: 既にキャッシュ済みなら即座に reveal
5. 未ロードの場合は `load` イベントで reveal
6. reveal: Skeleton に `hidden` を付与し、img の opacity を `0` -> `100` に切り替え（`transition-opacity duration-300` で 300ms フェードイン）
7. `error` 時も reveal して Skeleton を除去する（壊れた画像アイコンを表示）

### Skeleton のサイズ

- 高さ: `h-48`（192px）を固定プレースホルダーとして使用
- 幅: `w-full`（ラッパーの幅に追従）
- 画像ロード後は Skeleton が `hidden` になり、実際の画像サイズが反映される

## Props インターフェース（変更なし）

```typescript
interface Props {
  src: string;
  alt: string;
  caption?: string;
  sourceUrl?: string;
  sourceName?: string;
}
```

既存の MDX 記事での呼び出しに一切の変更は不要。

## テスト方針

- **ビルドテスト**: `npm run build` が成功すること
- **目視確認**: DevTools の Network タブで画像読み込みをスロットリング（Slow 3G）にし、Skeleton が表示された後に画像がフェードインすることを確認
- **キャッシュ済み確認**: ページリロード時にキャッシュ済み画像で Skeleton がちらつかず即座に画像が表示されること
- **エラーケース**: 存在しない画像 URL を指定した場合、Skeleton が消えてブラウザのデフォルトエラー表示になること
- **既存記事の確認**: Figure を使用している記事（`nuro-10g-home-network.mdx`, `keyboard-majestouch-convertible3.mdx`）で表示崩れがないこと
