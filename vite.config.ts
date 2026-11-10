import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "next/image": path.resolve(__dirname, "./src/components/ui/Image.tsx"),
      "next/link": path.resolve(__dirname, "./src/components/ui/Link.tsx"),
      "next/navigation": path.resolve(__dirname, "./src/lib/navigation.ts"),
    },
  },
  server: {
  host: "127.0.0.1",
  port: 5174,
  strictPort: true,
},
});

