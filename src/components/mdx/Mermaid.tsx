import { type JSX, useEffect, useId, useRef, useState } from "react";
import mermaid from "mermaid";

interface MermaidProps {
  chart: string;
}

/** mermaid.initialize() に渡す設定。自動スキャンを無効化し手動 render() のみ使用する。 */
const MERMAID_CONFIG = { startOnLoad: false, theme: "default" } as const;

/** mermaid.render() が Error 以外をスローした場合のフォールバックメッセージ */
const RENDER_FALLBACK_MESSAGE = "Mermaid レンダリングに失敗しました";

/** unknown 型のエラーからメッセージ文字列を安全に取り出す */
function extractErrorMessage(err: unknown): string {
  return err instanceof Error ? err.message : RENDER_FALLBACK_MESSAGE;
}

export default function Mermaid({ chart }: MermaidProps): JSX.Element {
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // useId で安定した一意の id を生成する（同一ページに複数配置しても衝突しない）
  const reactId = useId();
  // mermaid.render() に渡す id は英数字・ハイフンのみ必要なため ":" を除去する
  const idRef = useRef<string>(`mermaid-${reactId.replace(/:/g, "")}`);

  // mermaid の初期化はマウント時に一度だけ行う（chart 変化のたびに呼ぶ必要はない）
  useEffect(() => {
    mermaid.initialize(MERMAID_CONFIG);
  }, []);

  useEffect(() => {
    // アンマウント後に setState を呼ばないためのフラグ
    let cancelled = false;

    const renderChart = async (): Promise<void> => {
      // chart が変化したときにリセットして再描画する
      setSvg(null);
      setError(null);

      try {
        const { svg: rendered } = await mermaid.render(idRef.current, chart);
        if (!cancelled) {
          setSvg(rendered);
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(extractErrorMessage(err));
        }
      }
    };

    renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error !== null) {
    return (
      <div className="my-6">
        <div role="alert" className="alert alert-error">
          <span>Mermaid エラー: {error}</span>
        </div>
      </div>
    );
  }

  if (svg === null) {
    return (
      <div className="my-6 flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-md text-primary" />
      </div>
    );
  }

  return (
    // overflow-x-auto でダイアグラムが横幅を超えた場合にスクロール対応する
    <div className="my-6 flex justify-center overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-4">
      {/* dangerouslySetInnerHTML: mermaid.render() が返す SVG 文字列を注入する。
          入力は自前の MDX コンテンツのみで XSS リスクは限定的（ADR 0001 参照）。 */}
      <div
        className="w-full [&>svg]:w-full [&>svg]:h-auto [&>svg]:![max-width:none]"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
