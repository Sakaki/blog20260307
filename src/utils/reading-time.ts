/**
 * MDX/Markdown のテキストから読了時間（分）を算出する。
 * 日本語は 400 文字/分、英単語は 200 words/分 で計算。
 */
export function getReadingTime(content: string): number {
  // MDXのインポート文やコンポーネント宣言を除去
  const cleaned = content
    .replace(/^---[\s\S]*?---/m, "")
    .replace(/import\s+.*?from\s+['"].*?['"]/g, "")
    .replace(/<[^>]+>/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/`[^`]*`/g, "")
    .replace(/!\[.*?\]\(.*?\)/g, "")
    .replace(/\[([^\]]*)\]\(.*?\)/g, "$1");

  // 日本語文字数（CJK統合漢字 + ひらがな + カタカナ）
  const japaneseChars = (cleaned.match(/[\u3000-\u9fff\uff00-\uffef]/g) || []).length;

  // 英単語数（ASCII系の単語）
  const englishWords = (cleaned.match(/[a-zA-Z0-9]+/g) || []).length;

  const minutes = japaneseChars / 400 + englishWords / 200;
  return Math.max(1, Math.ceil(minutes));
}
