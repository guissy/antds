import { defineConfig } from 'vite';
import solidPlugin from 'vite-plugin-solid';
import {resolve} from "path";
export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      "antd/lib/tooltip/style/index.css": resolve(__dirname, "./src/Tooltip.css"),
      "antd/lib/tooltip": resolve(__dirname, "./src/Tooltip.tsx"),
    }
  }
});
