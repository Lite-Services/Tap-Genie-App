import { BrowserRouter, Routes, Route } from "react-router-dom";
import GameRouter from "./GameRouer";
import Error404 from "../pages/error/Error404";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import Game from "../pages/game/Game";
function MainRouter() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://app.taptap.bot/manifest.json"
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/snowtapcoin_bot",
      }}
    >
      <BrowserRouter basename="/">
        <Routes>
        <Route key="game" path="/" element={<Game />} />,
        <Route key="LoadingScreen" path="/loadingScreen" element={<LoadingScreen />} />,
        <Route key="earn" path="/earn" element={<Earn />} />,
        <Route key="friends" path="/friends" element={<Friends />} />,
        <Route key="reward" path="/reward" element={<Reward />} />,
        <Route key="tasks" path="/tasks" element={<Tasks />} />,
        <Route key="leaderboard" path="/leaderboard" element={<Leaderboard />} />,
        <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}

export default MainRouter;
