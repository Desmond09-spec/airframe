import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

import fs from "fs";

const host = process.env.TAURI_DEV_HOST;

// https://vite.dev/config/
export default defineConfig(async () => ({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "neutralino-auth-injector",
      transformIndexHtml(html) {
        try {
          const authPath = path.resolve(__dirname, ".tmp/auth_info.json");
          if (fs.existsSync(authPath)) {
            const auth = JSON.parse(fs.readFileSync(authPath, "utf-8"));
            const port = auth.nlPort || auth.port;
            const token = auth.nlToken || auth.token;
            return html.replace(
              "<head>",
              `<head>\n    <script>window.NL_PORT=${port}; window.NL_TOKEN="${token}"; window.NL_ARGS=[]; window.NL_CVERSION="5.3.0"; window.NL_VERSION="5.3.0"; window.NL_OS="Windows";</script>`
            );
          }
        } catch (e) {
          console.error("Failed to inject Neutralino auth:", e);
        }
        return html;
      },
    },
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
