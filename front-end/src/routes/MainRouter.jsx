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
        <Route path="/" element={<Game />} />
          {GameRouter}
          <Route path="*" element={<Error404 />} />
        </Routes>
      </BrowserRouter>
    </TonConnectUIProvider>
  );
}

export default MainRouter;
