export const DEFAULT_OG_IMAGE_PATH = "/images/ogp-default.png" as const;

/**
 * pathname と siteUrl から canonical URL を構築する。
 */
export function buildCanonicalUrl(pathname: string, siteUrl: string): string {
  return new URL(pathname, siteUrl).href;
}

/**
 * heroImage から OGP 画像の絶対 URL を構築する。
 * heroImage が未指定の場合はデフォルト OGP 画像にフォールバックする。
 */
export function buildOgImageUrl(heroImage: string | undefined, siteUrl: string): string {
  if (heroImage === undefined) {
    return new URL(DEFAULT_OG_IMAGE_PATH, siteUrl).href;
  }
  if (heroImage.startsWith("http://") || heroImage.startsWith("https://")) {
    return heroImage;
  }
  return new URL(heroImage, siteUrl).href;
}
