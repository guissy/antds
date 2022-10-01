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
      "rc-util-solid/lib/ref": resolve(__dirname, "../rc-util-solid/src/ref.ts"),
      "rc-util-solid/lib/hooks/useState": resolve(__dirname, "../rc-util-solid/src/hooks/useState.ts")
    }
  }
});
