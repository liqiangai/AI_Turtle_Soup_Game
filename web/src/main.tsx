import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import "./index.css";
import { AppProviders } from "./app/providers";
import { router } from "./app/router";

/**
 * 应用入口
 * - 挂载全局 Providers 与路由
 * - Vite 默认入口文件，用于本地开发与生产构建
 */
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
);
