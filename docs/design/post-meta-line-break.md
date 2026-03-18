# 記事メタ情報 改行表示 設計書

## 概要

PostLayout.astro の記事ヘッダーにある日付と読了時間を、横並び（1行）から縦並び（2行）に変更する。

## 対象ファイル

| ファイル                       | 変更内容                                          |
| ------------------------------ | ------------------------------------------------- |
| `src/layouts/PostLayout.astro` | メタ情報の表示レイアウトを `flex flex-col` に変更 |

## 変更仕様

### Before（現状）

```html
<p class="text-[var(--text-secondary)] text-sm mb-3 font-mono">
  <span class="date-terminal">{formattedDate}</span>
  {readingTime && <span class="ml-4 reading-time">{readingTime} min read</span>}
</p>
```

日付と読了時間が同一行に `ml-4` の余白で横並び。

### After（変更後）

```html
<div class="flex flex-col gap-1 text-[var(--text-secondary)] text-sm mb-3 font-mono">
  <span class="date-terminal">{formattedDate}</span>
  {readingTime && <span class="reading-time">{readingTime} min read</span>}
</div>
```

- `<p>` を `<div>` に変更（ブロック要素として `flex flex-col` を適用）
- `flex flex-col gap-1` で縦並び、行間は `gap-1`（0.25rem）
- 読了時間の `ml-4` を削除（横並び用の左マージンが不要になるため）

## テスト方針

| 対象       | テスト種別 | 確認内容                                                |
| ---------- | ---------- | ------------------------------------------------------- |
| PostLayout | visual     | 日付と読了時間が2行で表示されること                     |
| PostLayout | visual     | readingTime が未設定の場合、日付のみ1行で表示されること |
