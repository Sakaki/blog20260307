import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import Callout from "./Callout";

describe("Callout コンポーネント", () => {
  // ---------------------------------------------------------------------------
  // type → class マッピング
  // ---------------------------------------------------------------------------
  const types = ["info", "warning", "error", "success"] as const;

  it.each(types)('type="%s" のとき alert-%s クラスが付与される', (type) => {
    render(<Callout type={type}>テスト</Callout>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass(`alert-${type}`);
  });

  it.each(types)('type="%s" のとき共通の alert クラスが付与される', (type) => {
    render(<Callout type={type}>テスト</Callout>);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveClass("alert");
  });

  // ---------------------------------------------------------------------------
  // children の描画
  // ---------------------------------------------------------------------------
  it("children のテキストが表示される", () => {
    render(<Callout type="info">重要なお知らせ</Callout>);
    expect(screen.getByText("重要なお知らせ")).toBeInTheDocument();
  });

  it("children に JSX を渡せる", () => {
    render(
      <Callout type="warning">
        <strong>注意:</strong> テスト
      </Callout>
    );
    expect(screen.getByText("注意:")).toBeInTheDocument();
    expect(screen.getByText("テスト")).toBeInTheDocument();
  });

  // ---------------------------------------------------------------------------
  // role="alert" の存在
  // ---------------------------------------------------------------------------
  it("role=alert が設定されている", () => {
    render(<Callout type="success">OK</Callout>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
