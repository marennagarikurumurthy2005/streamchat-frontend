import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // important for Vercel to serve from root
  server: {
    port: 5173, // local dev
    open: true,
  },
  build: {
    outDir: "dist", // Vercel expects build output here
  },
});
