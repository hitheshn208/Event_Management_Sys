import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development the Express API runs on :3000. Proxying keeps everything
// same-origin, so the httpOnly auth cookie works without any CORS setup.
const BACKEND = process.env.VITE_BACKEND_URL || "http://localhost:3000";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": BACKEND,
      "/uploads": BACKEND,
    },
  },
});
