import { Route } from "react-router-dom";

import Game from "../pages/game/Game";
import Earn from "../pages/game/Earn";
import Friends from "../pages/game/Friends";
import Reward from "../pages/game/Reward";
import Tasks from "../pages/game/Tasks";
import Leaderboard from "../pages/game/Leaderboard";

import Waitlist from "../pages/game/Waitlist";
import LoadingScreen from "../pages/game/LoadingScreen";


const GameRouter = [

  <Route key="game" path="/" element={<Game />} />,
  <Route key="LoadingScreen" path="/loadingScreen" element={<LoadingScreen />} />,
  <Route key="earn" path="/earn" element={<Earn />} />,
  <Route key="friends" path="/friends" element={<Friends />} />,
  <Route key="reward" path="/reward" element={<Reward />} />,
  <Route key="tasks" path="/tasks" element={<Tasks />} />,
  <Route key="leaderboard" path="/leaderboard" element={<Leaderboard />} />,

];
export default GameRouter;
