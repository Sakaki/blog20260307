# ハンバーガーメニュー 実装仕様書

## 概要

スマートフォンなど横幅の小さい画面で、Header のナビゲーションリンクをハンバーガーメニュー（daisyUI dropdown）にまとめるレスポンシブ対応を行う。

## 変更対象ファイル

| ファイル                      | 変更種別 | 概要                                |
| ----------------------------- | -------- | ----------------------------------- |
| `src/components/Header.astro` | 変更     | navbar-end をレスポンシブ対応に変更 |

## レスポンシブ設計

| 画面幅                    | 表示                                          |
| ------------------------- | --------------------------------------------- |
| モバイル（< 1024px）      | ハンバーガーアイコン → タップで dropdown 表示 |
| デスクトップ（>= 1024px） | 従来通りインラインでリンクを横並び表示        |

## `src/components/Header.astro` — 変更内容

### 変更前

```astro
---

---

<header class="navbar bg-base-100 shadow-sm">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost text-xl font-bold">Sakaki333.dev</a>
  </div>
  <div class="navbar-end">
    <nav class="flex gap-2">
      <a href="/" class="btn btn-ghost btn-sm">Home</a>
      <a href="/posts" class="btn btn-ghost btn-sm">Posts</a>
      <a href="/tags" class="btn btn-ghost btn-sm">Tags</a>
    </nav>
  </div>
</header>
```

### 変更後

```astro
---

---

<header class="navbar bg-base-100 shadow-sm">
  <div class="navbar-start">
    <a href="/" class="btn btn-ghost text-xl font-bold">Sakaki333.dev</a>
  </div>
  <div class="navbar-end">
    <!-- モバイル: ハンバーガーメニュー -->
    <div class="dropdown dropdown-end lg:hidden">
      <div tabindex="0" role="button" class="btn btn-ghost btn-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </div>
      <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-10 w-40 p-2 shadow">
        <li><a href="/">Home</a></li>
        <li><a href="/posts">Posts</a></li>
        <li><a href="/tags">Tags</a></li>
      </ul>
    </div>
    <!-- デスクトップ: インラインナビゲーション -->
    <nav class="hidden lg:flex gap-2">
      <a href="/" class="btn btn-ghost btn-sm">Home</a>
      <a href="/posts" class="btn btn-ghost btn-sm">Posts</a>
      <a href="/tags" class="btn btn-ghost btn-sm">Tags</a>
    </nav>
  </div>
</header>
```

## 実装詳細

### ハンバーガーアイコン

標準的な 3 本線の SVG アイコンを使用する（24x24 viewBox、`h-5 w-5` で表示）。
daisyUI の Heroicons パターンに合わせた `stroke` ベースの描画。

### dropdown の動作原理

daisyUI の dropdown は `tabindex="0"` を持つ要素の `:focus-within` 擬似クラスで開閉を制御する。

1. ユーザーがハンバーガーアイコンをタップ/クリック → ボタンにフォーカスが当たる
2. `:focus-within` が有効になり、`dropdown-content` が表示される
3. メニュー外をタップ/クリック → フォーカスが外れ、メニューが閉じる

JavaScript は一切不要。

### レスポンシブクラスの役割

| クラス           | 対象要素          | 効果                                    |
| ---------------- | ----------------- | --------------------------------------- |
| `lg:hidden`      | dropdown コンテナ | 1024px 以上で非表示（モバイル専用）     |
| `hidden lg:flex` | インライン nav    | 1024px 未満で非表示（デスクトップ専用） |

### dropdown のスタイル

| クラス         | 効果                                            |
| -------------- | ----------------------------------------------- |
| `dropdown-end` | メニューを右端に揃える（navbar-end に合わせる） |
| `menu`         | daisyUI の標準メニュースタイルを適用            |
| `rounded-box`  | 角丸をテーマの box 設定に合わせる               |
| `z-10`         | メニューがコンテンツの上に表示されるようにする  |
| `w-40`         | メニュー幅を 10rem（160px）に固定               |
| `shadow`       | メニューにドロップシャドウを付ける              |

## テスト観点

- モバイル幅（< 1024px）でハンバーガーアイコンが表示され、インラインリンクが非表示であること
- デスクトップ幅（>= 1024px）でインラインリンクが表示され、ハンバーガーアイコンが非表示であること
- ハンバーガーアイコンをクリックすると dropdown メニューが開くこと
- dropdown メニュー内の各リンク（Home, Posts, Tags）が正しい URL に遷移すること
- メニュー外をクリックすると dropdown が閉じること
- ビルド（`astro build`）が正常に完了すること
