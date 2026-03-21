/**
 * HTTP 客户端（轻量封装）
 * - 统一响应结构：code/message/data/requestId（见 PRD/TECH_DESIGN）
 * - 后续可在此处扩展：鉴权注入、错误码转换、超时与重试策略
 */
export type TApiResponse<T> = {
  code: number;
  message: string;
  data: T;
  requestId: string;
};

/**
 * GET JSON 工具方法
 * - 目前仅用于快速打通前后端联调
 * - 后续按需要扩展为更完整的 httpClient（含POST/PUT/PATCH等）
 */
export async function getJson<T>(input: RequestInfo | URL, init?: RequestInit) {
  const res = await fetch(input, init);
  const json = (await res.json()) as TApiResponse<T>;
  return json;
}
