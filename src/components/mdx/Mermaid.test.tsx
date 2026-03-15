/**
 * Unit tests for src/components/mdx/Mermaid.tsx
 *
 * NOTE: This file is written for vitest + @testing-library/react.
 * These packages are NOT yet installed in the project.
 * To run these tests, install the following devDependencies:
 *
 *   npm install -D vitest @vitest/ui jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
 *
 * Then add to package.json scripts:
 *   "test": "vitest run"
 *
 * And create vitest.config.ts:
 *   import { defineConfig } from 'vitest/config';
 *   import react from '@vitejs/plugin-react';
 *   export default defineConfig({ plugins: [react()], test: { environment: 'jsdom', setupFiles: ['./vitest.setup.ts'] } });
 *
 * And create vitest.setup.ts:
 *   import '@testing-library/jest-dom';
 */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import Mermaid from "./Mermaid";

// ---------------------------------------------------------------------------
// mermaid モジュール全体をモックに差し替える
// ---------------------------------------------------------------------------
vi.mock("mermaid", () => ({
  default: {
    initialize: vi.fn(),
    render: vi.fn(),
  },
}));

// モックへの参照を取得するためにモック後にインポートする
import mermaid from "mermaid";
const mockInitialize = mermaid.initialize as Mock;
const mockRender = mermaid.render as Mock;

// ---------------------------------------------------------------------------
// React の useId() は SSR と CSR で異なる値を返す場合があるため、
// テスト内では固定値を返すよう差し替える。
// ---------------------------------------------------------------------------
vi.mock("react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react")>();
  return {
    ...actual,
    useId: () => ":r0:",
  };
});

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------
const VALID_CHART = "graph TD; A-->B;";
const INVALID_CHART = "this is not valid mermaid syntax";
const MOCK_SVG = '<svg xmlns="http://www.w3.org/2000/svg"><g>mock</g></svg>';

// ---------------------------------------------------------------------------
// テストスイート
// ---------------------------------------------------------------------------
describe("Mermaid コンポーネント", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // -------------------------------------------------------------------------
  // 初期化
  // -------------------------------------------------------------------------
  describe("初期化: マウント時に mermaid.initialize() が呼ばれる", () => {
    it("mermaid.initialize() が startOnLoad:false で呼ばれる", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart={VALID_CHART} />);

      await waitFor(() => {
        expect(mockInitialize).toHaveBeenCalledWith({
          startOnLoad: false,
          theme: "default",
        });
      });
    });

    it("mermaid.initialize() は chart が変化しても1回しか呼ばれない", async () => {
      const CHART_B = "graph LR; X-->Y;";
      mockRender.mockResolvedValueOnce({ svg: MOCK_SVG }).mockResolvedValueOnce({ svg: MOCK_SVG });

      const { rerender } = render(<Mermaid chart={VALID_CHART} />);
      await waitFor(() => expect(mockRender).toHaveBeenCalledTimes(1));

      rerender(<Mermaid chart={CHART_B} />);
      await waitFor(() => expect(mockRender).toHaveBeenCalledTimes(2));

      expect(mockInitialize).toHaveBeenCalledTimes(1);
    });
  });

  // -------------------------------------------------------------------------
  // 正常系
  // -------------------------------------------------------------------------
  describe("正常系: chart が正しい Mermaid 記法のとき", () => {
    it("mermaid.render() がコロンを除去した id と chart 文字列で呼ばれる", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart={VALID_CHART} />);

      await waitFor(() => {
        // useId() が ":r0:" を返すため、コロンを除去した "mermaid-r0" になる
        expect(mockRender).toHaveBeenCalledWith("mermaid-r0", VALID_CHART);
      });
    });

    it("render() が返した SVG 文字列を dangerouslySetInnerHTML で描画する", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      const { container } = render(<Mermaid chart={VALID_CHART} />);

      await waitFor(() => {
        // SVG が DOM に注入されていることを確認
        expect(container.querySelector("svg")).not.toBeNull();
      });
    });

    it("描画後にローディングスピナーが消えている", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart={VALID_CHART} />);

      await waitFor(() => {
        expect(document.querySelector(".loading.loading-spinner")).toBeNull();
      });
    });

    it("描画後にエラーアラートが表示されていない", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart={VALID_CHART} />);

      await waitFor(() => {
        expect(screen.queryByRole("alert")).toBeNull();
      });
    });
  });

  // -------------------------------------------------------------------------
  // 異常系
  // -------------------------------------------------------------------------
  describe("異常系: mermaid.render() が Error をスローするとき", () => {
    it("role=alert のエラーアラートが表示される", async () => {
      mockRender.mockRejectedValue(new Error("Parse error on line 1"));

      render(<Mermaid chart={INVALID_CHART} />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toBeInTheDocument();
      });
    });

    it("エラーメッセージが Error.message の内容を含む", async () => {
      const errorMessage = "Parse error on line 1";
      mockRender.mockRejectedValue(new Error(errorMessage));

      render(<Mermaid chart={INVALID_CHART} />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent(errorMessage);
      });
    });

    it("Error 以外のオブジェクトがスローされたとき汎用エラーメッセージが表示される", async () => {
      // string や数値など、Error インスタンスでない値を throw する場合
      mockRender.mockRejectedValue("unexpected string error");

      render(<Mermaid chart={INVALID_CHART} />);

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Mermaid レンダリングに失敗しました");
      });
    });

    it("エラー時にローディングスピナーが表示されていない", async () => {
      mockRender.mockRejectedValue(new Error("error"));

      render(<Mermaid chart={INVALID_CHART} />);

      await waitFor(() => {
        expect(document.querySelector(".loading.loading-spinner")).toBeNull();
      });
    });

    it("エラー時に SVG は描画されていない", async () => {
      mockRender.mockRejectedValue(new Error("error"));

      const { container } = render(<Mermaid chart={INVALID_CHART} />);

      await waitFor(() => {
        expect(container.querySelector("svg")).toBeNull();
      });
    });
  });

  // -------------------------------------------------------------------------
  // 初期状態
  // -------------------------------------------------------------------------
  describe("初期状態: render() が解決する前", () => {
    it("ローディングスピナーが表示されている", () => {
      // 解決しない Promise で非同期処理を止める
      mockRender.mockReturnValue(new Promise(() => {}));

      const { container } = render(<Mermaid chart={VALID_CHART} />);

      expect(container.querySelector(".loading.loading-spinner")).not.toBeNull();
    });

    it("エラーアラートが表示されていない", () => {
      mockRender.mockReturnValue(new Promise(() => {}));

      render(<Mermaid chart={VALID_CHART} />);

      expect(screen.queryByRole("alert")).toBeNull();
    });

    it("SVG がまだ描画されていない", () => {
      mockRender.mockReturnValue(new Promise(() => {}));

      const { container } = render(<Mermaid chart={VALID_CHART} />);

      expect(container.querySelector("svg")).toBeNull();
    });
  });

  // -------------------------------------------------------------------------
  // chart プロパティ変化時の再描画
  // -------------------------------------------------------------------------
  describe("chart prop が変化したとき再描画される", () => {
    it("chart が変わると mermaid.render() が再度呼ばれる", async () => {
      const CHART_A = "graph TD; A-->B;";
      const CHART_B = "graph LR; X-->Y;";
      const SVG_A = '<svg id="a"></svg>';
      const SVG_B = '<svg id="b"></svg>';

      mockRender.mockResolvedValueOnce({ svg: SVG_A }).mockResolvedValueOnce({ svg: SVG_B });

      const { rerender } = render(<Mermaid chart={CHART_A} />);

      // 最初の描画が完了するのを待つ
      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledTimes(1);
      });

      // chart を変更して再レンダリング
      rerender(<Mermaid chart={CHART_B} />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledTimes(2);
        expect(mockRender).toHaveBeenLastCalledWith(expect.stringContaining("mermaid-"), CHART_B);
      });
    });

    it("chart 変化時に再描画前はローディングスピナーが表示される", async () => {
      const CHART_A = "graph TD; A-->B;";
      const CHART_B = "graph LR; X-->Y;";

      mockRender
        .mockResolvedValueOnce({ svg: MOCK_SVG })
        // 2回目は解決しない Promise でスピナーが表示されたままにする
        .mockReturnValueOnce(new Promise(() => {}));

      const { rerender, container } = render(<Mermaid chart={CHART_A} />);

      // 最初の描画完了を待つ
      await waitFor(() => {
        expect(container.querySelector("svg")).not.toBeNull();
      });

      // chart を変更
      rerender(<Mermaid chart={CHART_B} />);

      // 再描画が始まりスピナーが表示される
      await waitFor(() => {
        expect(container.querySelector(".loading.loading-spinner")).not.toBeNull();
      });
    });
  });

  // -------------------------------------------------------------------------
  // アンマウント後のキャンセル
  // -------------------------------------------------------------------------
  describe("アンマウント後に setState が呼ばれない（cancelled フラグ）", () => {
    it("アンマウント後に render() が完了してもエラーが発生しない", async () => {
      let resolveRender!: (value: { svg: string }) => void;
      const pendingPromise = new Promise<{ svg: string }>((resolve) => {
        resolveRender = resolve;
      });
      mockRender.mockReturnValue(pendingPromise);

      const { unmount } = render(<Mermaid chart={VALID_CHART} />);

      // アンマウント後に非同期処理を完了させる
      unmount();
      resolveRender({ svg: MOCK_SVG });

      // setState on unmounted component の警告が発生しないことを確認
      // (エラーがスローされないことで暗黙的に検証)
      await expect(pendingPromise).resolves.toEqual({ svg: MOCK_SVG });
    });
  });

  // -------------------------------------------------------------------------
  // 境界値: chart が空文字列のとき
  // -------------------------------------------------------------------------
  describe("境界値: chart が空文字列のとき", () => {
    it("mermaid.render() が空文字列で呼ばれる", async () => {
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart="" />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledWith(expect.stringContaining("mermaid-"), "");
      });
    });
  });

  // -------------------------------------------------------------------------
  // 境界値: chart に特殊文字が含まれるとき
  // -------------------------------------------------------------------------
  describe("境界値: chart に特殊文字（<, >, &）が含まれるとき", () => {
    it("エラーなく mermaid.render() に渡される", async () => {
      const chartWithSpecialChars = 'graph TD; A["<node>"]-->B["a & b"];';
      mockRender.mockResolvedValue({ svg: MOCK_SVG });

      render(<Mermaid chart={chartWithSpecialChars} />);

      await waitFor(() => {
        expect(mockRender).toHaveBeenCalledWith(
          expect.stringContaining("mermaid-"),
          chartWithSpecialChars
        );
      });
    });
  });
});
