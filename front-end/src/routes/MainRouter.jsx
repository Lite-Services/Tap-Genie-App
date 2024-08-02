import { BrowserRouter, Routes, Route } from "react-router-dom";
import Error404 from "../pages/error/Error404";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import Game from "../pages/game/Game";
import Earn from "../pages/game/Earn";
import Friends from "../pages/game/Friends";
import Reward from "../pages/game/Reward";
import Tasks from "../pages/game/Tasks";
import Leaderboard from "../pages/game/Leaderboard";
import LoadingScreen from "../pages/game/LoadingScreen";

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
          <Route path="/" element={<Game />} />
          <Route path="/loadingScreen" element={<LoadingScreen />} />
          <Route path="/earn" element={<Earn />} />
          <Route path="/friends" element={<Friends />} />
          <Route path="/reward" element={<Reward />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}

export default MainRouter;
