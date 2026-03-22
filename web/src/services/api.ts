import type { TStory } from "../data/stories";

type TAiAskResponse = {
  error?: {
    message?: string;
  };
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
};

export async function askAI(question: string, story: TStory): Promise<string> {
  const q = question.trim();
  if (!q) {
    throw new Error("请输入你的问题");
  }

  if (q.length > 200) {
    throw new Error("问题太长了（最多 200 字），请简化后重试");
  }

  const systemPrompt = `你是海龟汤主持人，必须严格依据“本局汤底”判定，绝对不得新增设定。

【汤面】
${story.surface}

【汤底】
${story.bottom}

规则（非常重要）：
1) 你只能输出以下三个词之一，且必须完全一致：是 / 否 / 无关
2) 不要输出任何标点、解释、换行、引导语、附加文本

示例：
Q: 他死了吗？\nA: 是
Q: 他是自杀吗？\nA: 无关
Q: 他是女人吗？\nA: 否`;

  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: q },
      ],
      temperature: 0,
      max_tokens: 8,
    }),
  });

  const json = (await res.json().catch(() => null)) as TAiAskResponse | null;
  if (!res.ok) {
    const msg = json?.error?.message ?? `AI 服务异常（${res.status}）`;
    throw new Error(msg);
  }

  const content =
    typeof json?.choices?.[0]?.message?.content === "string"
      ? json.choices[0].message.content.trim()
      : "";

  const allowed = new Set(["是", "否", "无关"]);
  if (!allowed.has(content)) {
    throw new Error(
      "AI 刚才没有按规范回答（只允许：是/否/无关）。请你换个方式重新提问，例如补充主体或动作。",
    );
  }

  return content;
}
