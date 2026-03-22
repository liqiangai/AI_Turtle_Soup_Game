import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, beforeEach } from "vitest";
import { GamePage } from "./GamePage";
import { ResultPage } from "./ResultPage";

function LobbyStub() {
  return <div>LOBBY</div>;
}

describe("ResultPage", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("直接访问 /result 时展示缺省提示且可返回大厅", () => {
    render(
      <MemoryRouter initialEntries={["/result"]}>
        <Routes>
          <Route path="/" element={<LobbyStub />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("未找到本局信息。")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "返回大厅" }));
    expect(screen.getByText("LOBBY")).toBeInTheDocument();
  });

  it("从 /game/:id 结束进入 /result 后可展示标题、汤底并可展开对话", () => {
    render(
      <MemoryRouter initialEntries={["/game/s_001_umbrella"]}>
        <Routes>
          <Route path="/" element={<LobbyStub />} />
          <Route path="/game/:id" element={<GamePage />} />
          <Route path="/result" element={<ResultPage />} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: "结束游戏" }));

    expect(screen.getByText("伞下的落汤鸡")).toBeInTheDocument();
    expect(screen.getByText("汤底揭晓")).toBeInTheDocument();
    expect(screen.getByText(/遮阳伞/)).toBeInTheDocument();

    expect(sessionStorage.getItem("lastStoryId")).toBe("s_001_umbrella");
    expect(sessionStorage.getItem("lastMessages")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "展开（1）" }));
    expect(screen.getByText(/欢迎来到 AI 海龟汤/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "再来一局" }));
    expect(screen.getAllByText("LOBBY").length).toBeGreaterThan(0);
    expect(sessionStorage.getItem("lastStoryId")).toBeNull();
    expect(sessionStorage.getItem("lastMessages")).toBeNull();
  });
});
