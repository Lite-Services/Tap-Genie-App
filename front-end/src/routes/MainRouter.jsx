import { BrowserRouter, Routes, Route } from "react-router-dom";
import Game from "../pages/game/Game";
import GameRouter from "./GameRouer";
import Error404 from "../pages/error/Error404";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import GameLayout from "../pages/layout/GameLayout";
function MainRouter() {
  return (
    <TonConnectUIProvider
      manifestUrl="https://app.taptap.bot/manifest.json"
      actionsConfiguration={{
        twaReturnUrl: "https://t.me/taptapcore_bot",
      }}
    >
      <BrowserRouter basename="/">
        <Routes>
          {GameRouter}
          <Route path="*" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}

export default MainRouter;
