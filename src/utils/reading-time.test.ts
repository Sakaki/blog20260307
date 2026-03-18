import { describe, it, expect } from "vitest";
import { getReadingTime } from "./reading-time";

describe("getReadingTime", () => {
  // ---------------------------------------------------------------------------
  // 最小値の保証
  // ---------------------------------------------------------------------------
  it("空文字列でも最低1分を返す", () => {
    expect(getReadingTime("")).toBe(1);
  });

  it("非常に短いテキストでも最低1分を返す", () => {
    expect(getReadingTime("Hello")).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // 英語テキスト（200 words/分）
  // ---------------------------------------------------------------------------
  it("英語200語で1分を返す", () => {
    const words = Array(200).fill("word").join(" ");
    expect(getReadingTime(words)).toBe(1);
  });

  it("英語400語で2分を返す", () => {
    const words = Array(400).fill("word").join(" ");
    expect(getReadingTime(words)).toBe(2);
  });

  it("端数は切り上げる（201語 → 2分）", () => {
    const words = Array(201).fill("word").join(" ");
    expect(getReadingTime(words)).toBe(2);
  });

  // ---------------------------------------------------------------------------
  // 日本語テキスト（400 文字/分）
  // ---------------------------------------------------------------------------
  it("日本語400文字で1分を返す", () => {
    const chars = "あ".repeat(400);
    expect(getReadingTime(chars)).toBe(1);
  });

  it("日本語800文字で2分を返す", () => {
    const chars = "漢".repeat(800);
    expect(getReadingTime(chars)).toBe(2);
  });

  it("カタカナもカウントされる", () => {
    const chars = "ア".repeat(400);
    expect(getReadingTime(chars)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // 日本語 + 英語の混合
  // ---------------------------------------------------------------------------
  it("日本語200文字 + 英語100語 = 1分", () => {
    const jp = "あ".repeat(200);
    const en = Array(100).fill("word").join(" ");
    expect(getReadingTime(`${jp} ${en}`)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // フロントマターの除去
  // ---------------------------------------------------------------------------
  it("YAML フロントマターを除外する", () => {
    const content = `---
title: "テスト記事"
date: 2026-01-01
tags: ["test"]
---
Hello`;
    // frontmatter除去後は "Hello" のみ → 1分
    expect(getReadingTime(content)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // import 文の除去
  // ---------------------------------------------------------------------------
  it("import 文を除外する", () => {
    const content = `import Callout from '../components/mdx/Callout'
import { Code } from 'astro/components'
Hello`;
    expect(getReadingTime(content)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // コードブロックの除去
  // ---------------------------------------------------------------------------
  it("コードブロック内のテキストを除外する", () => {
    const codeBlock = Array(500).fill("word").join(" ");
    const content = `Some text\n\`\`\`js\n${codeBlock}\n\`\`\`\nEnd`;
    // "Some text" + "End" のみカウント → 1分
    expect(getReadingTime(content)).toBe(1);
  });

  it("インラインコードを除外する", () => {
    const content = "Use the `getReadingTime` function to calculate time";
    // "Use the  function to calculate time" → 7語 → 1分
    expect(getReadingTime(content)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // HTML タグの除去
  // ---------------------------------------------------------------------------
  it("HTML タグを除去しテキストのみカウントする", () => {
    const content = "<div>Hello</div> <span>World</span>";
    expect(getReadingTime(content)).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // Markdown リンク・画像の除去
  // ---------------------------------------------------------------------------
  it("Markdown 画像構文を除外する", () => {
    const content = "![alt text](https://example.com/image.png) Hello";
    expect(getReadingTime(content)).toBe(1);
  });

  it("Markdown リンクのテキスト部分はカウントする", () => {
    const content = "[click here](https://example.com)";
    // "click here" → 2語 → 1分
    expect(getReadingTime(content)).toBe(1);
  });

  it("Markdown リンクの URL 部分はカウントしない", () => {
    const linkText = Array(200).fill("word").join(" ");
    const content = `[${linkText}](https://example.com)`;
    expect(getReadingTime(content)).toBe(1);
  });
});
