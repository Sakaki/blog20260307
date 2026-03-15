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
    <div className="my-4 rounded-lg overflow-hidden border border-neutral-700 font-mono text-sm">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-neutral-800 border-b border-neutral-700">
        <div className="flex items-center gap-2">
          {lang && <span className="text-xs text-neutral-400 uppercase tracking-wide">{lang}</span>}
          {filename && <span className="text-xs text-neutral-300">{filename}</span>}
        </div>
        <button
          onClick={handleCopy}
          className="text-xs px-2 py-1 rounded bg-neutral-700 hover:bg-neutral-600 text-neutral-300 hover:text-white transition-colors"
        >
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Code area */}
      <div className="overflow-x-auto bg-black">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, i) => (
              <tr key={i} className="hover:bg-neutral-900">
                <td className="select-none text-right text-neutral-600 px-3 py-0 w-10 text-xs leading-6 border-r border-neutral-800">
                  {i + 1}
                </td>
                <td className="px-4 py-0 leading-6 text-neutral-100 whitespace-pre">
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
