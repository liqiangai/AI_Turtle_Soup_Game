import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  function normalizeEnv(v: string | undefined) {
    if (!v) return undefined;
    const s = v.trim();
    if (
      (s.startsWith("\"") && s.endsWith("\"")) ||
      (s.startsWith("'") && s.endsWith("'"))
    ) {
      return s.slice(1, -1);
    }
    return s;
  }

  const deepSeekApiKey = normalizeEnv(
    env.DEEPSEEK_API_KEY || env.VITE_DEEPSEEK_API_KEY,
  );
  const deepSeekBaseUrl =
    normalizeEnv(env.DEEPSEEK_BASE_URL || env.VITE_DEEPSEEK_BASE_URL) ||
    "https://api.deepseek.com/v1";

  const deepSeekUrl = new URL(deepSeekBaseUrl);
  const deepSeekOrigin = deepSeekUrl.origin;
  const deepSeekBasePath = deepSeekUrl.pathname.replace(/\/$/, "");

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api/ask": {
          target: deepSeekOrigin,
          changeOrigin: true,
          secure: true,
          headers: deepSeekApiKey
            ? { Authorization: `Bearer ${deepSeekApiKey}` }
            : undefined,
          rewrite: () =>
            `${deepSeekBasePath || ""}/chat/completions`.replace(/^\/\//, "/"),
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq) => {
              if (!deepSeekApiKey) return;
              proxyReq.setHeader("Authorization", `Bearer ${deepSeekApiKey}`);
              proxyReq.setHeader("Content-Type", "application/json");
            });
          },
        },
      },
    },
  };
});
