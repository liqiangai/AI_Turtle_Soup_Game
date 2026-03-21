import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import { AuthPage } from "../pages/AuthPage";
import { GamePage } from "../pages/GamePage";
import { LobbyPage } from "../pages/LobbyPage";
import { ResultPage } from "../pages/ResultPage";

/**
 * 路由配置
 * - 当前为 MVP 占位路由，用于打通导航与页面骨架
 * - 后续可扩展：路由守卫（需要登录）、404/错误边界、懒加载等
 */
export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LobbyPage /> },
      { path: "game", element: <GamePage /> },
      { path: "result", element: <ResultPage /> },
      { path: "auth", element: <AuthPage /> },
    ],
  },
]);
