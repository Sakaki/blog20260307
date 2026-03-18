/**
 * Unit tests for Figure.astro の Skeleton ローディング機能
 *
 * Figure.astro は Astro コンポーネントのため React Testing Library では直接テストできない。
 * 代わりに、設計書で定義されたインラインスクリプト (initFigures) が操作する
 * DOM 構造をセットアップし、ロジックの正しさを検証する。
 *
 * テスト対象: initFigures() 関数のロジック
 * - Skeleton の表示/非表示制御
 * - img の opacity 切り替え
 * - キャッシュ済み画像の即時 reveal
 * - load / error イベントでの reveal
 */

import { describe, it, expect, beforeEach } from "vitest";
import { initFigures } from "./figure-loading";

// ---------------------------------------------------------------------------
// ヘルパー: 設計書で定義された HTML 構造を生成する
// ---------------------------------------------------------------------------
function createFigureDOM(options?: { complete?: boolean; naturalWidth?: number }): {
  wrapper: HTMLDivElement;
  img: HTMLImageElement;
  skeleton: HTMLDivElement;
} {
  const wrapper = document.createElement("div");
  wrapper.className = "figure-img-wrapper relative max-w-[80%] w-full";

  const skeleton = document.createElement("div");
  skeleton.className = "figure-skeleton skeleton h-48 w-full rounded";
  wrapper.appendChild(skeleton);

  const img = document.createElement("img");
  img.className =
    "figure-img rounded border border-[var(--border-color)] w-full opacity-0 transition-opacity duration-300";
  img.src = "/images/test.png";
  img.alt = "テスト画像";
  img.loading = "lazy";

  // jsdom では img.complete と img.naturalWidth はデフォルトで false/0
  // テスト用にオーバーライドする
  if (options?.complete !== undefined) {
    Object.defineProperty(img, "complete", {
      value: options.complete,
      writable: true,
    });
  }
  if (options?.naturalWidth !== undefined) {
    Object.defineProperty(img, "naturalWidth", {
      value: options.naturalWidth,
      writable: true,
    });
  }

  wrapper.appendChild(img);
  document.body.appendChild(wrapper);

  return { wrapper, img, skeleton };
}

// ---------------------------------------------------------------------------
// テストスイート
// ---------------------------------------------------------------------------
describe("Figure Skeleton ローディング (initFigures)", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  // -------------------------------------------------------------------------
  // 初期 HTML 構造
  // -------------------------------------------------------------------------
  describe("初期 HTML 構造", () => {
    it("Skeleton 要素に skeleton クラスが付与されている", () => {
      const { skeleton } = createFigureDOM();
      expect(skeleton.classList.contains("skeleton")).toBe(true);
    });

    it("Skeleton 要素に h-48 クラス（固定高さ）が付与されている", () => {
      const { skeleton } = createFigureDOM();
      expect(skeleton.classList.contains("h-48")).toBe(true);
    });

    it("img 要素が初期状態で opacity-0 クラスを持つ", () => {
      const { img } = createFigureDOM();
      expect(img.classList.contains("opacity-0")).toBe(true);
    });

    it("img 要素が初期状態で opacity-100 クラスを持たない", () => {
      const { img } = createFigureDOM();
      expect(img.classList.contains("opacity-100")).toBe(false);
    });

    it("img 要素に loading=lazy が設定されている", () => {
      const { img } = createFigureDOM();
      expect(img.loading).toBe("lazy");
    });

    it("img 要素に transition-opacity クラスが付与されている", () => {
      const { img } = createFigureDOM();
      expect(img.classList.contains("transition-opacity")).toBe(true);
    });

    it("img 要素に duration-300 クラスが付与されている", () => {
      const { img } = createFigureDOM();
      expect(img.classList.contains("duration-300")).toBe(true);
    });

    it("Skeleton が初期状態で hidden クラスを持たない", () => {
      const { skeleton } = createFigureDOM();
      expect(skeleton.classList.contains("hidden")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // キャッシュ済み画像: img.complete && naturalWidth > 0
  // -------------------------------------------------------------------------
  describe("キャッシュ済み画像（img.complete=true, naturalWidth>0）", () => {
    it("Skeleton に hidden クラスが即座に付与される", () => {
      const { skeleton } = createFigureDOM({
        complete: true,
        naturalWidth: 800,
      });
      initFigures();
      expect(skeleton.classList.contains("hidden")).toBe(true);
    });

    it("img から opacity-0 クラスが除去される", () => {
      const { img } = createFigureDOM({
        complete: true,
        naturalWidth: 800,
      });
      initFigures();
      expect(img.classList.contains("opacity-0")).toBe(false);
    });

    it("img に opacity-100 クラスが付与される", () => {
      const { img } = createFigureDOM({
        complete: true,
        naturalWidth: 800,
      });
      initFigures();
      expect(img.classList.contains("opacity-100")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // 未ロード画像: load イベント
  // -------------------------------------------------------------------------
  describe("未ロード画像: load イベント発火時", () => {
    it("initFigures 呼び出し直後は Skeleton が表示されたまま", () => {
      const { skeleton } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      expect(skeleton.classList.contains("hidden")).toBe(false);
    });

    it("initFigures 呼び出し直後は img が opacity-0 のまま", () => {
      const { img } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      expect(img.classList.contains("opacity-0")).toBe(true);
    });

    it("load イベント発火後に Skeleton が hidden になる", () => {
      const { img, skeleton } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("load"));
      expect(skeleton.classList.contains("hidden")).toBe(true);
    });

    it("load イベント発火後に img が opacity-100 になる", () => {
      const { img } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("load"));
      expect(img.classList.contains("opacity-100")).toBe(true);
    });

    it("load イベント発火後に img の opacity-0 が除去される", () => {
      const { img } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("load"));
      expect(img.classList.contains("opacity-0")).toBe(false);
    });

    it("load イベントは once: true で登録される（2回目は発火しない）", () => {
      const { img, skeleton } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("load"));

      // reveal 済みの状態をリセットして再度発火しても変化しないことを確認
      skeleton.classList.remove("hidden");
      img.dispatchEvent(new Event("load"));
      // once: true なので2回目の load では reveal が呼ばれず hidden は付与されない
      expect(skeleton.classList.contains("hidden")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // エラーケース: error イベント
  // -------------------------------------------------------------------------
  describe("エラーケース: error イベント発火時", () => {
    it("error イベント発火後に Skeleton が hidden になる", () => {
      const { img, skeleton } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("error"));
      expect(skeleton.classList.contains("hidden")).toBe(true);
    });

    it("error イベント発火後に img が opacity-100 になる", () => {
      const { img } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("error"));
      expect(img.classList.contains("opacity-100")).toBe(true);
    });

    it("error イベント発火後に img の opacity-0 が除去される", () => {
      const { img } = createFigureDOM({
        complete: false,
        naturalWidth: 0,
      });
      initFigures();
      img.dispatchEvent(new Event("error"));
      expect(img.classList.contains("opacity-0")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 境界値: img.complete=true だが naturalWidth=0
  // -------------------------------------------------------------------------
  describe("境界値: img.complete=true, naturalWidth=0（壊れた画像）", () => {
    it("即座に reveal せずイベントリスナーを登録する", () => {
      const { skeleton } = createFigureDOM({
        complete: true,
        naturalWidth: 0,
      });
      initFigures();
      // complete=true でも naturalWidth=0 の場合はキャッシュ済みとみなさない
      expect(skeleton.classList.contains("hidden")).toBe(false);
    });
  });

  // -------------------------------------------------------------------------
  // 複数 figure の独立動作
  // -------------------------------------------------------------------------
  describe("複数 figure 要素", () => {
    it("各 figure が独立して動作する", () => {
      // 1つ目: キャッシュ済み
      const first = createFigureDOM({ complete: true, naturalWidth: 800 });
      // 2つ目: 未ロード
      const second = createFigureDOM({ complete: false, naturalWidth: 0 });

      initFigures();

      // 1つ目は即座に reveal
      expect(first.skeleton.classList.contains("hidden")).toBe(true);
      expect(first.img.classList.contains("opacity-100")).toBe(true);

      // 2つ目はまだ Skeleton 表示中
      expect(second.skeleton.classList.contains("hidden")).toBe(false);
      expect(second.img.classList.contains("opacity-0")).toBe(true);

      // 2つ目が load すると reveal
      second.img.dispatchEvent(new Event("load"));
      expect(second.skeleton.classList.contains("hidden")).toBe(true);
      expect(second.img.classList.contains("opacity-100")).toBe(true);
    });
  });

  // -------------------------------------------------------------------------
  // wrapper 内に img または skeleton が無い場合
  // -------------------------------------------------------------------------
  describe("不完全な DOM 構造", () => {
    it("img が無い wrapper はスキップされる（エラーにならない）", () => {
      const wrapper = document.createElement("div");
      wrapper.className = "figure-img-wrapper";
      const skeleton = document.createElement("div");
      skeleton.className = "figure-skeleton";
      wrapper.appendChild(skeleton);
      document.body.appendChild(wrapper);

      expect(() => initFigures()).not.toThrow();
    });

    it("skeleton が無い wrapper はスキップされる（エラーにならない）", () => {
      const wrapper = document.createElement("div");
      wrapper.className = "figure-img-wrapper";
      const img = document.createElement("img");
      img.className = "figure-img";
      wrapper.appendChild(img);
      document.body.appendChild(wrapper);

      expect(() => initFigures()).not.toThrow();
    });
  });
});
