import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("トップページ (index.astro)", () => {
  const indexPath = resolve(__dirname, "../../pages/index.astro");
  const content = readFileSync(indexPath, "utf-8");

  // ---------------------------------------------------------------------------
  // タイトルの検証
  // ---------------------------------------------------------------------------
  it("BaseLayout の title が 'sakaki333.dev' に設定されている", () => {
    expect(content).toMatch(/title\s*=\s*"sakaki333\.dev"/);
  });

  it("BaseLayout の title に旧タイトル 'Blog' が使われていない", () => {
    expect(content).not.toMatch(/title\s*=\s*"Blog"/);
  });
});
