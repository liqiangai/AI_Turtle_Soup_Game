/**
 * 通用错误态组件
 * - 统一展示可读错误信息，避免散落在页面里重复实现
 */
export function ErrorState(props: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-100">
      {props.message}
    </div>
  );
}
