import { useState } from "react";

interface Props {
  code: string;
  lang?: string;
  filename?: string;
  children?: string;
}

export default function CodeBlock({ code, lang, filename, children }: Props) {
  const [copied, setCopied] = useState(false);
  const content = code ?? children ?? "";
  const lines = content.split("\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="my-4 rounded overflow-hidden font-mono text-sm"
      style={{ border: "1px solid var(--border-color)" }}
    >
      {/* Header bar */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{
          background: "var(--bg-tertiary)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div className="flex items-center gap-2">
          {lang && (
            <span className="text-xs uppercase tracking-wide" style={{ color: "var(--accent)" }}>
              {lang}
            </span>
          )}
          {filename && (
            <span className="text-xs" style={{ color: "var(--text-secondary)" }}>
              {filename}
            </span>
          )}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{
            background: "var(--bg-secondary)",
            color: "var(--text-secondary)",
            border: "1px solid var(--border-color)",
          }}
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code area */}
      <div className="overflow-x-auto" style={{ background: "var(--bg-primary)" }}>
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="codeblock-row">
                <td
                  className="select-none text-right px-3 py-0 w-10 text-xs leading-6"
                  style={{
                    color: "var(--text-secondary)",
                    borderRight: "1px solid var(--border-color)",
                    opacity: 0.5,
                  }}
                >
                  {i + 1}
                </td>
                <td
                  className="px-4 py-0 leading-6 whitespace-pre"
                  style={{ color: "var(--text-primary)" }}
                >
                  {line || " "}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
