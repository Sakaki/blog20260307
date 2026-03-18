import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * .bio-section の padding-top が設計書どおり 4px であることを検証する。
 * 変更前は 20px だったが、NavBar と ASCII アート間の隙間を詰めるため 4px に変更。
 */
describe("global.css - bio-section gap reduction", () => {
  const cssContent = readFileSync(resolve(__dirname, "global.css"), "utf-8");

  it(".bio-section の padding-top が 4px に設定されている", () => {
    // .bio-section ルールを抽出
    const bioSectionMatch = cssContent.match(/\.bio-section\s*\{[^}]*\}/);
    expect(bioSectionMatch).not.toBeNull();

    const bioSectionRule = bioSectionMatch![0];

    // padding の値を検証
    // "padding: 4px 0 24px" の形式を期待
    const paddingMatch = bioSectionRule.match(/padding:\s*(\d+)px\s+\d+\s+\d+px/);
    expect(paddingMatch).not.toBeNull();
    expect(paddingMatch![1]).toBe("4");
  });

  it(".bio-section の padding-bottom は 24px のまま変更されていない", () => {
    const bioSectionMatch = cssContent.match(/\.bio-section\s*\{[^}]*\}/);
    expect(bioSectionMatch).not.toBeNull();

    const bioSectionRule = bioSectionMatch![0];

    // padding: Xpx 0 24px の形式で末尾の 24px を検証
    const paddingMatch = bioSectionRule.match(/padding:\s*\d+px\s+\d+\s+(\d+)px/);
    expect(paddingMatch).not.toBeNull();
    expect(paddingMatch![1]).toBe("24");
  });

  it(".bio-section の border-bottom が維持されている", () => {
    const bioSectionMatch = cssContent.match(/\.bio-section\s*\{[^}]*\}/);
    expect(bioSectionMatch).not.toBeNull();

    const bioSectionRule = bioSectionMatch![0];
    expect(bioSectionRule).toContain("border-bottom:");
  });

  it(".bio-section の margin-bottom が維持されている", () => {
    const bioSectionMatch = cssContent.match(/\.bio-section\s*\{[^}]*\}/);
    expect(bioSectionMatch).not.toBeNull();

    const bioSectionRule = bioSectionMatch![0];
    expect(bioSectionRule).toContain("margin-bottom: 32px");
  });
});
