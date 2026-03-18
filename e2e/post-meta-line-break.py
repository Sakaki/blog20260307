"""
E2E test: post_meta_line_break
記事ページのメタ情報（日付・読了時間）が2行で表示されることを検証する。

前提: dev サーバーが http://localhost:4321 で起動していること
"""

from playwright.sync_api import sync_playwright
import sys


def test_meta_line_break():
    """日付と読了時間が flex-col で縦並びになっていることを検証する"""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 900})

        page.goto("http://localhost:4321/posts/hello-world/")
        page.wait_for_load_state("networkidle")

        # --- Check 1: メタ情報コンテナが flex-col を持つ div であること ---
        meta_container = page.locator("header .date-terminal").locator("..")
        assert meta_container.count() > 0, "メタ情報コンテナが見つからない"

        tag_name = meta_container.evaluate("el => el.tagName.toLowerCase()")
        assert tag_name == "div", f"メタ情報コンテナが <div> ではなく <{tag_name}>"

        classes = meta_container.evaluate("el => el.className")
        assert "flex" in classes, f"flex クラスがない: {classes}"
        assert "flex-col" in classes, f"flex-col クラスがない: {classes}"
        assert "gap-1" in classes, f"gap-1 クラスがない: {classes}"

        # --- Check 2: 日付が表示されていること ---
        date_el = page.locator(".date-terminal")
        assert date_el.count() > 0, "日付要素 (.date-terminal) が見つからない"
        date_text = date_el.text_content()
        assert date_text and len(date_text.strip()) > 0, "日付テキストが空"

        # --- Check 3: 読了時間が表示されていること（記事による） ---
        reading_time_el = page.locator(".reading-time")
        if reading_time_el.count() > 0:
            rt_text = reading_time_el.text_content()
            assert rt_text and "min read" in rt_text, f"読了時間のテキストが不正: {rt_text}"

            # 読了時間に ml-4 クラスがないこと（横並び用マージン削除済み）
            rt_classes = reading_time_el.evaluate("el => el.className")
            assert "ml-4" not in rt_classes, f"ml-4 が残っている: {rt_classes}"

        # --- Check 4: 日付と読了時間が別の行にあること（Y座標が異なる） ---
        if reading_time_el.count() > 0:
            date_box = date_el.bounding_box()
            rt_box = reading_time_el.bounding_box()
            assert date_box is not None and rt_box is not None, "バウンディングボックスが取得できない"
            assert rt_box["y"] > date_box["y"], (
                f"読了時間が日付より下に表示されていない: date.y={date_box['y']}, rt.y={rt_box['y']}"
            )

        # --- スクリーンショット保存 ---
        page.screenshot(path="/tmp/post_meta_line_break_e2e.png", full_page=False)
        print("E2E: All checks passed")

        browser.close()


if __name__ == "__main__":
    try:
        test_meta_line_break()
    except Exception as e:
        print(f"E2E FAIL: {e}", file=sys.stderr)
        sys.exit(1)
