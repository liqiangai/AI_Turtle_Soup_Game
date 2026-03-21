import type { ReactNode } from "react";

/**
 * 全局 Providers 聚合入口
 * - 统一挂载：React Query Provider、Zustand 中间件、主题/国际化等
 * - 目前保持最小实现，后续随功能引入再逐步扩展
 */
export function AppProviders(props: { children: ReactNode }) {
  return <>{props.children}</>;
}
