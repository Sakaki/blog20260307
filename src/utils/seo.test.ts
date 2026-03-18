import { describe, it, expect } from "vitest";
import { buildCanonicalUrl, buildOgImageUrl } from "./seo";

describe("buildCanonicalUrl", () => {
  const siteUrl = "https://sakaki333.dev";

  // ---------------------------------------------------------------------------
  // 基本的な URL 構築
  // ---------------------------------------------------------------------------
  it("ルートパスから canonical URL を生成する", () => {
    expect(buildCanonicalUrl("/", siteUrl)).toBe("https://sakaki333.dev/");
  });

  it("記事パスから canonical URL を生成する", () => {
    expect(buildCanonicalUrl("/posts/my-article", siteUrl)).toBe(
      "https://sakaki333.dev/posts/my-article"
    );
  });

  it("末尾スラッシュ付きパスをそのまま保持する", () => {
    expect(buildCanonicalUrl("/posts/", siteUrl)).toBe("https://sakaki333.dev/posts/");
  });

  // ---------------------------------------------------------------------------
  // siteUrl の末尾スラッシュ処理
  // ---------------------------------------------------------------------------
  it("siteUrl の末尾スラッシュがあっても二重スラッシュにならない", () => {
    expect(buildCanonicalUrl("/posts/my-article", "https://sakaki333.dev/")).toBe(
      "https://sakaki333.dev/posts/my-article"
    );
  });

  // ---------------------------------------------------------------------------
  // 戻り値の型
  // ---------------------------------------------------------------------------
  it("文字列を返す", () => {
    const result = buildCanonicalUrl("/", siteUrl);
    expect(typeof result).toBe("string");
  });
});

describe("buildOgImageUrl", () => {
  const siteUrl = "https://sakaki333.dev";

  // ---------------------------------------------------------------------------
  // heroImage が指定されている場合
  // ---------------------------------------------------------------------------
  it("相対パスの heroImage を絶対 URL に変換する", () => {
    expect(buildOgImageUrl("/images/my-hero.png", siteUrl)).toBe(
      "https://sakaki333.dev/images/my-hero.png"
    );
  });

  it("絶対 URL の heroImage はそのまま返す", () => {
    expect(buildOgImageUrl("https://cdn.example.com/image.png", siteUrl)).toBe(
      "https://cdn.example.com/image.png"
    );
  });

  it("http:// で始まる URL もそのまま返す", () => {
    expect(buildOgImageUrl("http://cdn.example.com/image.png", siteUrl)).toBe(
      "http://cdn.example.com/image.png"
    );
  });

  // ---------------------------------------------------------------------------
  // heroImage が未指定の場合（デフォルト画像へのフォールバック）
  // ---------------------------------------------------------------------------
  it("undefined の場合はデフォルト OGP 画像の URL を返す", () => {
    expect(buildOgImageUrl(undefined, siteUrl)).toBe(
      "https://sakaki333.dev/images/ogp-default.png"
    );
  });

  // ---------------------------------------------------------------------------
  // siteUrl の末尾スラッシュ処理
  // ---------------------------------------------------------------------------
  it("siteUrl の末尾スラッシュがあっても正しく URL を構築する", () => {
    expect(buildOgImageUrl("/images/hero.png", "https://sakaki333.dev/")).toBe(
      "https://sakaki333.dev/images/hero.png"
    );
  });

  // ---------------------------------------------------------------------------
  // 戻り値の型
  // ---------------------------------------------------------------------------
  it("文字列を返す", () => {
    const result = buildOgImageUrl(undefined, siteUrl);
    expect(typeof result).toBe("string");
  });
});
