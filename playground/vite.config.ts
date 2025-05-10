import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import paths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [solid(), paths(), tailwindcss()],
});
