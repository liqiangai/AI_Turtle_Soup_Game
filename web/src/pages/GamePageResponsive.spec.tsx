import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

vi.mock("../data/stories", async () => {
  const mod = await vi.importActual<typeof import("../data/stories")>("../data/stories");
  return {
    ...mod,
    stories: [
      ...mod.stories,
      {
        id: "s_006_long_text_layout",
        title:
          "极长标题布局回归：当标题特别特别特别特别特别特别特别特别特别特别特别长时也不应该在窄屏下被裁切或溢出",
        difficulty: "easy",
        surface:
          "用于移动端窄屏回归：这段汤面会包含很长的连续字符以验证换行与不裁切——AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA。\n同时也包含正常中文长句，确认 line-clamp 与展开/收起在窄屏下稳定。",
        bottom:
          "这是一个仅用于前端布局回归的示例故事：重点在标题/汤面/消息气泡的换行与截断表现，不涉及真实推理。",
        keyPoints: ["用于窄屏回归", "标题不裁切", "汤面可换行", "消息气泡不溢出"],
        solutionKeywords: ["回归", "布局"],
      },
    ],
  };
});

describe("GamePage (responsive contracts)", () => {
  it("窄屏关键文案具备避免裁切的基础样式（标题/汤面/消息）", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new Error("network"))),
    );

    const { GamePage } = await import("./GamePage");

    render(
      <MemoryRouter initialEntries={["/game/s_006_long_text_layout"]}>
        <Routes>
          <Route path="/game/:id" element={<GamePage />} />
        </Routes>
      </MemoryRouter>,
    );

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("ui-title-clamp");
    expect(heading).toHaveClass("min-w-0");
    expect(heading).toHaveClass("leading-tight");

    const surface = screen.getByTestId("story-surface");
    const surfaceClamp = surface.querySelector(".line-clamp-2.text-wrap-anywhere");
    expect(surfaceClamp).not.toBeNull();

    const longMessage =
      "用于窄屏消息回归：BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    fireEvent.change(screen.getByTestId("chat-input"), { target: { value: longMessage } });
    fireEvent.click(screen.getByTestId("chat-send"));

    const textNodes = await waitFor(() => {
      const nodes = Array.from(
        document.querySelectorAll<HTMLElement>(".text-wrap-anywhere.break-words"),
      );
      if (nodes.length < 2) throw new Error("missing wrapped text nodes");
      return nodes;
    });
    expect(textNodes.some((node) => node.textContent?.includes("用于窄屏消息回归"))).toBe(true);
  });
});
