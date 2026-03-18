import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

// Tailwind CSS v4 は @tailwindcss/vite 経由で設定（daisyUI 5.x 対応）
export default defineConfig({
  site: "https://sakaki333.dev",
  output: "static",
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
