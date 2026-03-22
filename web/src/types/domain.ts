/**
 * 业务领域类型定义（前端）
 * - 这些类型用于页面/组件渲染与请求响应绑定
 * - 后续会与后端 DTO 做更严格的对齐
 */
export type TPuzzleDifficulty = "easy" | "medium" | "hard";

export type TChatRole = "user" | "ai";

export type TChatMessage = {
  role: TChatRole;
  content: string;
};

export type TGameStatus = "in_progress" | "ended";

export type TEndReason = "abandoned_by_user" | "reveal_bottom" | "unknown";

export type TPuzzle = {
  id: string;
  title: string;
  difficulty: TPuzzleDifficulty;
  tags: string[];
  contentWarning: string | null;
  surface: string;
};
