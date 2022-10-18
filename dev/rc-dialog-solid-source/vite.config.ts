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
      "rc-util-solid/lib": resolve(__dirname, "../rc-util-solid/src"),
      "rc-motion-solid": resolve(__dirname, "../rc-motion-solid/src/index.tsx"),
      "rc-align-solid": resolve(__dirname, "../rc-align-solid/src/index.ts"),
      "dom-align": resolve(__dirname, "./node_modules/dom-align"),
      "@rc-component-solid/portal": resolve(__dirname, "../rc-portal-solid/src/index.tsx"),
    }
  }
});
