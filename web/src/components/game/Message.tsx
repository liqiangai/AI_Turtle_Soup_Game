import type { TChatMessage } from "../../types/domain";

export function Message(props: { message: TChatMessage }) {
  const { message } = props;
  const isUser = message.role === "user";

  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={
          isUser
            ? "flex max-w-[85%] flex-row-reverse items-end gap-2"
            : "flex max-w-[85%] items-end gap-2"
        }
      >
        <div
          className={
            isUser
              ? "flex h-8 w-8 items-center justify-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-200"
              : "flex h-8 w-8 items-center justify-center rounded-full border border-slate-700 bg-slate-800/60 text-slate-200"
          }
          aria-hidden="true"
        >
          {isUser ? (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Z"
                fill="currentColor"
              />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M8 10h8M8 14h5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M7 6h10a3 3 0 0 1 3 3v4a3 3 0 0 1-3 3h-4l-3 2v-2H7a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <div
          className={
            isUser
              ? "rounded-2xl rounded-br-md border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-slate-100 shadow-lg"
              : "rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800/50 px-4 py-3 text-sm text-slate-100 shadow-lg"
          }
        >
          <div className="whitespace-pre-wrap leading-relaxed">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
}

