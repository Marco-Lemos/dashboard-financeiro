import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

const plugins = [
  react(),
  tailwindcss(),
  VitePWA({
    registerType: "autoUpdate",
    includeAssets: ["icons/apple-touch-icon.png"],
    manifest: {
      name: "Controle Financeiro",
      short_name: "Finanças",
      description: "Controle suas receitas, despesas, contas fixas e parcelamentos em um só lugar.",
      theme_color: "#10b981",
      background_color: "#0a0a0f",
      display: "standalone",
      start_url: "/",
      scope: "/",
      lang: "pt-BR",
      icons: [
        { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
        { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
        { src: "/icons/icon-192-maskable.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    workbox: {
      // Assume controle assim que ativado, em vez de esperar todas as abas
      // antigas fecharem — reduz a janela em que uma versão antiga do app
      // (já em cache) convive com o HTML/JS mais novo, que é justamente o
      // tipo de descompasso que causa erros de DOM como o relatado.
      clientsClaim: true,
      skipWaiting: true,
      cleanupOutdatedCaches: true,
      // Nunca cachear chamadas de API — dado financeiro sempre precisa vir
      // fresco da rede, nunca de um cache antigo.
      navigateFallbackDenylist: [/^\/api\//],
      runtimeCaching: [
        {
          urlPattern: /^\/api\//,
          handler: "NetworkOnly",
        },
      ],
    },
  }),
];

export default defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    host: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
