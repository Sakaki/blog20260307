/**
 * 日付を日本語のロング形式（例: 2026年3月15日）にフォーマットする。
 */
export function formatDateJa(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 日付を日本語のショート形式（例: 2026年3月15日）にフォーマットする。
 * サイドバーなど狭い領域向け。
 */
export function formatDateJaShort(date: Date): string {
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
