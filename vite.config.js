import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import manifest from "./manifest.json";

// https://vite.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react(), crx({ manifest })],
  server: {
    cors: {
      origin: "*",
      methods: ["GET", "HEAD", "OPTIONS"],
    },
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
});
