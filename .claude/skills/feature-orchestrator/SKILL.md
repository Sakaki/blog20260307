---
name: feature-orchestrator
description: >
  機能実装のフルサイクルを自動化するオーケストレータースキル。
  「〇〇機能を実装して」「このIssueを対応して」「新しいエンドポイントを作って」のような実装依頼に対して、
  設計→コード→テスト→リファクタリング→レビュー→Git操作の各専門エージェントを順番に呼び出し、
  クリーンアーキテクチャに基づいた高品質な実装を完結させる。
  言語・フレームワーク非依存（汎用）。実装タスクが発生したら必ずこのスキルを使うこと。
---

# Feature Orchestrator

機能実装のフルサイクルを6つの専門sub-agentに委譲して完結させるオーケストレーター。

## エージェント一覧

| Agent        | ファイル                 | 役割                                |
| ------------ | ------------------------ | ----------------------------------- |
| Designer     | `agents/designer.md`     | ADR作成・クリーンアーキテクチャ設計 |
| Coder        | `agents/coder.md`        | 設計書に基づくコード実装            |
| Tester       | `agents/tester.md`       | unit / integration テスト作成・実行 |
| Refactorer   | `agents/refactorer.md`   | 可読性・構造・モジュール分解の改善  |
| Reviewer     | `agents/reviewer.md`     | コード・テスト・設計の総合レビュー  |
| Git Operator | `agents/git-operator.md` | branch作成・commit・PR作成          |

---

## 実行フロー

```
[タスク受け取り]
      │
      ▼
1. Designer     ──→ docs/adr/NNNN-*.md, docs/design/*.md
      │
      ▼
2. Coder        ──→ src/ 以下に実装（UI変更時は Playwright で視覚検証）
      │
      ▼
3. Tester       ──→ tests/ 以下にテスト作成・実行
      │
      ▼
4. Refactorer   ──→ src/ / tests/ を改善（設計書も必要なら更新）
      │
      ▼
5. Reviewer     ──→ レビューレポート + 要修正リスト
      │
    修正あり？
    Yes ──→ Coder → Tester → Refactorer → Reviewer (ループ、最大2回)
    No  ──→
      │
      ▼
6. Git Operator ──→ branch / commit / PR
```

---

## オーケストレーターの責務

### 1. タスクの解析

受け取ったタスクから以下を抽出してコンテキストを組み立てる：

```
TASK_CONTEXT:
  feature_name: <機能名（英語スネークケース）>
  description:  <何を実装するか>
  language:     <使用言語（判別できない場合は "unknown"）>
  framework:    <フレームワーク（不明な場合は "unknown"）>
  constraints:  <既存コードとの整合性、パフォーマンス要件など>
  repo_root:    <リポジトリルートのパス>
```

### 2. エージェントの呼び出し方法

各エージェントは `claude -p` で呼び出す。エージェント定義ファイルをシステムプロンプト、タスク固有のコンテキストをstdinで渡す。

```bash
# 基本パターン
result=$(claude -p "$(cat agents/<agent>.md)" <<EOF
TASK_CONTEXT:
$(echo "$TASK_CONTEXT")

PREVIOUS_OUTPUT:
$(echo "$previous_result")
EOF
)

# 並列実行が可能なケース（現状このフローでは基本直列）
agent_a_result=$(claude -p "$(cat agents/agent-a.md)" <<< "$input") &
agent_b_result=$(claude -p "$(cat agents/agent-b.md)" <<< "$input") &
wait
```

### 3. コンテキストの引き継ぎ

各エージェントの出力は次のエージェントへ `PREVIOUS_OUTPUT` として渡す。
ファイルを生成したエージェントは **生成したファイルパスの一覧** を出力に含めること（次のエージェントが参照できるように）。

### 4. レビューループの管理

Reviewer が `NEEDS_REVISION: true` を返した場合、以下のエージェントを再実行する（最大2回）：

1. Coder（指摘箇所の修正）
2. Tester（テストの更新・再実行）
3. Refactorer（再リファクタリング）
4. Reviewer（再レビュー）

2回ループしても `NEEDS_REVISION: true` が続く場合は、レビュー結果をユーザーに提示して判断を仰ぐ。

### 5. 完了報告

Git Operator の実行後、以下をユーザーに報告する：

```
## 実装完了レポート

### 概要
- 機能名: <feature_name>
- ブランチ: <branch_name>
- PR: <pr_url>

### 生成ファイル
- 設計書: <adr_path>, <design_doc_path>
- 実装: <src_files>
- テスト: <test_files>

### テスト結果
<test_summary>

### レビュー指摘（対応済み）
<resolved_issues>
```

---

## ディレクトリ規約

エージェントが生成するファイルは以下のディレクトリに配置する（リポジトリ構造が既に存在する場合はそれを優先）：

```
<repo_root>/
├── docs/
│   ├── adr/
│   │   └── NNNN-<feature-name>.md   # ADRはゼロ埋め4桁連番
│   └── design/
│       └── <feature-name>.md
├── src/                              # または lib/, app/ など既存構造に従う
│   └── <language-specific layout>
└── tests/                            # または test/, spec/ など
    └── <language-specific layout>
```

---

## エラーハンドリング

| 状況                         | 対応                                         |
| ---------------------------- | -------------------------------------------- |
| エージェントがエラーを返した | エラー内容をユーザーに提示し、継続可否を確認 |
| テストが全件失敗             | Coder に差し戻し（Testerの出力を添付）       |
| レビューループが上限超過     | 現状をユーザーに報告し手動介入を依頼         |
| ファイル競合が発生           | Git Operator が検出・報告する                |
