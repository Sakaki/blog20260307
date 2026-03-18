import { render, screen, act, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import CodeBlock from "./CodeBlock";

// ---------------------------------------------------------------------------
// navigator.clipboard のモック
// ---------------------------------------------------------------------------
const mockWriteText = vi.fn().mockResolvedValue(undefined);
const originalClipboard = navigator.clipboard;

beforeEach(() => {
  vi.restoreAllMocks();
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: mockWriteText },
    writable: true,
    configurable: true,
  });
});

afterEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: originalClipboard,
    writable: true,
    configurable: true,
  });
  vi.useRealTimers();
});

describe("CodeBlock コンポーネント", () => {
  // ---------------------------------------------------------------------------
  // コード表示
  // ---------------------------------------------------------------------------
  it("code prop のテキストが表示される", () => {
    render(<CodeBlock code="console.log('hello')" />);
    expect(screen.getByText("console.log('hello')")).toBeInTheDocument();
  });

  it("code も children も未指定のとき空文字として扱う", () => {
    const { container } = render(<CodeBlock code="" />);
    const rows = container.querySelectorAll("tr");
    expect(rows.length).toBe(1);
  });

  // ---------------------------------------------------------------------------
  // 行番号
  // ---------------------------------------------------------------------------
  it("複数行のコードに対して正しい行数の行番号が表示される", () => {
    const code = "line1\nline2\nline3";
    const { container } = render(<CodeBlock code={code} />);
    const rows = container.querySelectorAll("tr");
    expect(rows.length).toBe(3);
  });

  it("行番号が1から始まる", () => {
    const code = "first\nsecond";
    render(<CodeBlock code={code} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // lang / filename ヘッダー
  // ---------------------------------------------------------------------------
  it("lang が指定されると表示される", () => {
    render(<CodeBlock code="x" lang="typescript" />);
    expect(screen.getByText("typescript")).toBeInTheDocument();
  });

  it("filename が指定されると表示される", () => {
    render(<CodeBlock code="x" filename="index.ts" />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("lang と filename の両方を表示できる", () => {
    render(<CodeBlock code="x" lang="ts" filename="app.ts" />);
    expect(screen.getByText("ts")).toBeInTheDocument();
    expect(screen.getByText("app.ts")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // コピーボタン
  // ---------------------------------------------------------------------------
  it('初期状態では "Copy" と表示される', () => {
    render(<CodeBlock code="hello" />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("クリックで navigator.clipboard.writeText が呼ばれる", async () => {
    render(<CodeBlock code="copy me" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
    });
    expect(mockWriteText).toHaveBeenCalledWith("copy me");
  });

  it('クリック後に "Copied!" と表示される', async () => {
    render(<CodeBlock code="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByText("Copy"));
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();
  });

  it("2秒後に Copy に戻る", async () => {
    vi.useFakeTimers();
    render(<CodeBlock code="hello" />);

    await act(async () => {
      fireEvent.click(screen.getByRole("button"));
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });
});
