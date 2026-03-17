# ADR 0011: BIO セクション ASCII スプラッシュ追加

## ステータス

承認

## コンテキスト

ホームページの BIO セクション（whoami 出力型）の最上部に、ターミナルの MOTD 風 ASCII アートを追加し、サイトの個性を強化したい。

## 決定

- figlet Big フォント相当で `SAKAKI333` を表示する `<pre>` ブロックを `.bio-prompt` の直前に挿入
- `.dev` サフィックスを右寄せで添える
- セパレーター `<hr>` で whoami ブロックと区切る
- 既存の whoami 出力・リンクチップには変更を加えない

## 影響範囲

- `src/components/BioSection.astro` — ASCII スプラッシュ HTML 追加
- `src/styles/global.css` — `.bio-splash`, `.bio-ascii`, `.bio-splash-sub`, `.bio-splash-rule` 追加
- モバイル対応: 640px 以下でフォントサイズ縮小
