import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Netlify handles the stable /download redirects in production. These
// middleware hooks keep `vite dev` and `vite preview` working the same way.
const DOWNLOAD_REDIRECTS = {
  "/download": "/StopC_x64-setup.exe",
  "/download/msix": "/StopC_x64.msix",
};

function stableDownloads() {
  const middleware = (req, res, next) => {
    const pathname = (req.url || "").split("?")[0];
    const target = DOWNLOAD_REDIRECTS[pathname];
    if (!target) {
      next();
      return;
    }
    res.statusCode = 302;
    res.setHeader("Location", target);
    res.end();
  };

  return {
    name: "stable-downloads",
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), stableDownloads()],
});
