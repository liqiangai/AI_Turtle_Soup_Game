/**
 * API 通用类型定义
 * - 与后端统一响应结构保持一致（见 PRD/TECH_DESIGN）
 */
export type TApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  requestId: string;
};
