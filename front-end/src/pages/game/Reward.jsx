import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import moment from "moment";

import TGAuth from "../../components/taptap/TGAuth";
import Drawer from "../../components/taptap/Drawer";

import { getAuth } from "../../utlis/localstorage";

import minerbg from "../../assets/img/mine-bg.png";
import stars from "../../assets/img/stars-robo.svg";
import energy from "../../assets/img/energy.svg";
import clock from "../../assets/img/clock.svg";
import upgrade from "../../assets/img/upgrade.svg";
import robot_1 from "../../assets/img/robot-1.png";
import robot_2 from "../../assets/img/robot-2.png";
import robot_3 from "../../assets/img/robot-3.png";
import robot_4 from "../../assets/img/robot-4.png";

// Utility Functions
const getCurrentDateFormatted = () => {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = (now.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = now.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getSecondOfDayUTC = (date_time = null) => {
  const now = date_time ? new Date(date_time) : new Date();
  const { hours, minutes, seconds } = now;
  return hours * 3600 + minutes * 60 + seconds;
};

const findBatch = (date_time = null) => {
  const total_seconds_in_day = 24 * 3600;
  const number_of_batches = 8;
  const seconds_per_batch = total_seconds_in_day / number_of_batches;
  const seconds_of_day = getSecondOfDayUTC(date_time);
  return Math.floor(seconds_of_day / seconds_per_batch) + 1;
};

const convertSecondsToTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining_seconds = seconds % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(remaining_seconds).padStart(2, "0")}`;
};

const getRemainingSeconds = () => {
  const total_seconds_in_day = 24 * 3600;
  const number_of_batches = 8;
  const seconds_per_batch = total_seconds_in_day / number_of_batches;
  const seconds_of_day = getSecondOfDayUTC();
  const batch = findBatch();
  const end_of_batch_second = batch * seconds_per_batch;
  return end_of_batch_second - seconds_of_day;
};

// Main Component
function RoboMine() {
  const navigate = useNavigate();
  const [isClaim, setIsClaim] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");

  const robot = [robot_1, robot_1, robot_2, robot_3, robot_4, robot_4];
  const miner_level = parseInt(localStorage.getItem("miner_level")) || 0;
  const last_mine_date = localStorage.getItem("last_mine_date");
  const last_mine_batch = last_mine_date ? findBatch(last_mine_date) : 0;
  const current_batch = findBatch();

  useEffect(() => {
    const checkClaimStatus = () => {
      if (miner_level > 0) {
        const last_date = last_mine_date ? moment.utc(last_mine_date).format("YYYY-MM-DD") : null;
        const current_date = getCurrentDateFormatted();

        if (!last_date || current_date > last_date || (current_date === last_date && last_mine_batch < current_batch)) {
          setIsClaim(true);
        }
      }
    };

    checkClaimStatus();
    const updateCountdown = () => {
      setCountDown(getRemainingSeconds());
      const intervalId = setInterval(() => {
        setCountDown((prevCountDown) => {
          if (prevCountDown <= 0) {
            setIsClaim(false);
            return getRemainingSeconds();
          }
          return prevCountDown - 1;
        });
      }, 1000);

      return () => clearInterval(intervalId);
    };

    updateCountdown();
  }, [last_mine_date, miner_level, last_mine_batch, current_batch]);

  const handleClaim = async () => {
    try {
      const token = getAuth();
      const { data } = await axios.get("https://taptap-production.up.railway.app/api/reward/claim", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("last_mine_date", data.last_mine_date);
      localStorage.setItem("score", data.score);
      setIsClaim(false);
      setContent(`${getClaimScore(miner_level)[1]} claimed`);
      setOpen(true);
    } catch (err) {
      alert("Something went wrong!");
      if (err.response?.status === 401) {
        navigate("/");
      }
    }
  };

  const handleUpgrade = async () => {
    try {
      const score = parseInt(localStorage.getItem("score")) || 0;
      const nextMinerLevel = miner_level + 1;
      if (nextMinerLevel > 5) {
        setContent("You Exceed max upgrade");
        setOpen(true);
        return;
      }
      const [required_score, score_in_text] = getRequiredScore(nextMinerLevel);
      if (score < required_score) {
        setContent(`Insufficient coins (${score_in_text} coins required)`);
        setOpen(true);
        return;
      }
      const token = getAuth();
      const { data } = await axios.get("https://taptap-production.up.railway.app/api/reward/upgrade", {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem("miner_level", data.miner_level);
      localStorage.setItem("score", data.score);
      setContent(`Upgraded to level ${nextMinerLevel}`);
      setOpen(true);
    } catch (err) {
      alert("Something went wrong!");
      if (err.response?.status === 401) {
        navigate("/");
      }
    }
  };

  useEffect(() => {
    const tg = window.Telegram.WebApp;
    tg.expand();
    tg.BackButton.show();
    tg.BackButton.onClick(() => {
      navigate(-1);
      tg.BackButton.hide();
    });
  }, [navigate]);

  return (
    <TGAuth>
      <Drawer open={open} setOpen={setOpen}>
        <div className="flex flex-col items-center justify-center px-4 gap-2">
          <h2 className="text-white font-sfSemi text-2xl">{content}</h2>
        </div>
      </Drawer>
      <div className="RoboMine relative h-screen bg-black bg-cover bg-no-repeat flex items-center justify-center px-2 flex-col py-4 bg-top pt-10">
        <h1 className="font-bold text-4xl text-white">SNOW MINER</h1>
        <p className="text-xl text-white">Upgrade your Snowball</p>
        <div className="robotcontainer relative flex">
          <img
            src={robot[miner_level] || robot_1}
            className="h-80 w-auto z-20 small:h-60 small:w-60"
            alt=""
          />
          <motion.img
            src={stars}
            className="absolute h-80 w-80 small:h-60 small:w-60"
            alt=""
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            initial={{ rotate: 0 }}
          />
          <motion.img
            src={stars}
            className="absolute h-80 w-80 small:h-60 small:w-60"
            alt=""
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
            initial={{ rotate: 0 }}
          />
          <div className="h-52 w-52 bg-[#39ff9571] rounded-full absolute top-1/2 -translate-y-1/2 z-0 blur-2xl left-1/2 -translate-x-1/2"></div>
        </div>
        <div className="stats w-full h-full bg-[#0b0b0b4f] backdrop-blur-md border-[1px] border-[#313131] rounded-3xl flex flex-col items-center justify-center gap-2">
          <div className="flex flex-row items-center w-5/6 justify-between gap-4">
            <img src={energy} className="w-6 h-6" alt="" />
            <div className="flex flex-col items-center justify-center w-full gap-1">
              <div className="flex flex-row items-center justify-between w-full">
                <h1 className="text-white font-bold text-sm">Energy</h1>
                <h1 className="text-white font-bold text-sm">{miner_level}</h1>
              </div>
              <div className="progressbar w-full rounded-full relative h-3 bg-[#050F08] border-[#45D470] border-[1px]">
                <div
                  className="absolute h-full bg-gradient-to-r from-[#3396FF] to-[#6ABE6A] bottom-0 rounded-full"
                  style={{ width: `${miner_level * 20}%` }}
                ></div>
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center justify-center gap-4">
            {miner_level === 0 && (
              <button
                onClick={handleUpgrade}
                className="claim bg-[#3396FF] flex flex-row items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl text-xl font-bold"
              >
                Unlock 20k
              </button>
            )}
            {miner_level > 0 && (
              <>
                {isClaim ? (
                  <>
                    <button
                      onClick={handleUpgrade}
                      className="claim bg-[#3396FF] flex flex-row items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl text-xl font-bold"
                    >
                      <img src={upgrade} className="h-6 w-6" alt="" />
                      Upgrade
                    </button>
                    <button
                      onClick={handleClaim}
                      className="claim bg-[#3396FF] flex flex-row items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl text-xl font-bold"
                    >
                      Claim
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleUpgrade}
                      className="claim bg-[#3396FF] flex flex-row items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl text-xl font-bold"
                    >
                      <img src={upgrade} className="h-6 w-6" alt="" />
                      Upgrade
                    </button>
                    <button className="claim bg-[#3396FF] flex flex-row items-center justify-center gap-2 px-6 py-4 mt-2 rounded-2xl text-xl font-bold">
                      <img src={clock} className="h-6 w-6" alt="" />
                      {convertSecondsToTime(countDown)}
                    </button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </TGAuth>
  );
}

export default RoboMine;
