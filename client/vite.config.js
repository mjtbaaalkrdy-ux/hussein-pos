import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["logo.jpeg"],
      manifest: {
        name: "حسين - نظام إدارة المتاجر",
        short_name: "حسين",
        description: "نظام إدارة المتاجر والمخازن ونقاط البيع",
        theme_color: "#1e3a5f",
        background_color: "#ffffff",
        display: "standalone",
        orientation: "portrait",
        lang: "ar",
        dir: "rtl",
        icons: [
          { src: "logo.jpeg", sizes: "192x192", type: "image/jpeg" },
        ],
      },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3001", changeOrigin: true },
      "/socket.io": { target: "http://localhost:3001", ws: true },
    },
  },
});
