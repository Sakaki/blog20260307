# ホームページ BIO セクション 設計書

## 概要

トップページの記事一覧直前に、ターミナルの `whoami` コマンド出力を模した BIO セクションを追加する。

## ファイル構成

| ファイル                          | 役割                                        |
| --------------------------------- | ------------------------------------------- |
| `src/components/BioSection.astro` | BIO セクション Astro コンポーネント（新規） |
| `src/styles/global.css`           | `.bio-*` クラス群を追記                     |
| `src/pages/index.astro`           | BioSection を import して記事一覧の前に配置 |

## コンポーネント仕様

### BioSection.astro

テンプレートのみ（frontmatter のロジックなし）。

#### 構造

1. **プロンプト行** (`.bio-prompt`): `sakaki@dev:~$ whoami`
2. **出力ブロック** (`.bio-output`):
   - name: Sakaki
   - role: engineer / illustrator（engineer=緑, illustrator=ピンク）
   - about: 自己紹介文
3. **リンクグループ** (`.bio-link-group`):
   - tech (緑): GitHub, X
   - creative (ピンク): Pixiv, Fanbox, Skeb, BOOTH
4. **末尾プロンプト** (`.bio-prompt--tail`): 点滅カーソル付き

#### リンク先

| サービス | URL                                  |
| -------- | ------------------------------------ |
| GitHub   | https://github.com/Sakaki            |
| X        | https://x.com/sakaki333              |
| Pixiv    | https://www.pixiv.net/users/52366365 |
| Fanbox   | https://sakaki333.fanbox.cc/         |
| Skeb     | http://skeb.jp/@Sakaki333            |
| BOOTH    | https://sakaki333.booth.pm/          |

## CSS 仕様

`global.css` に追記する `.bio-*` クラス群。既存の CSS カスタムプロパティを使用。

- ピンクカラー: `#f472b6`（creative 系リンク・illustrator ロール）
- カーソル点滅: `@keyframes bio-blink` で 1.1s ステップアニメーション
- モバイル対応: `@media (max-width: 640px)` で `.bio-key` の width を `4rem` に縮小

## テスト方針

- ビルドが通ること（`npm run build`）
- Playwright でトップページにアクセスし、BIO セクションの各要素が表示されていることを確認
- リンクの href が正しいことを確認
