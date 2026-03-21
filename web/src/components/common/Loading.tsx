/**
 * 通用加载态组件
 * - 用于接口请求/页面加载的统一占位
 */
export function Loading() {
  return (
    <div className="flex items-center justify-center p-6 text-sm text-slate-200">
      加载中…
    </div>
  );
}
