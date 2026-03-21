/**
 * UI 本地状态（占位）
 * - 本项目计划使用 Zustand 承载纯前端 UI 状态
 * - 示例：主题、弹窗开关、提示面板展开状态等
 */
export type TUiState = {
  theme: "dark";
};

export const DEFAULT_UI_STATE: TUiState = {
  theme: "dark",
};
