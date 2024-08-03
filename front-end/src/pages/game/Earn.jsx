import { easeInOut, motion } from "framer-motion";
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import GameLayout from "../layout/GameLayout";
import {
  getAuth,
  setLocalStorage,
  getLocalStorage,
} from "../../utlis/localstorage";
import { getTGUser } from "../../utlis/tg";
import {
  initializeAudio,
  playAudio,
  stopAudio,
} from "../../utlis/audioUtils";
import AnimatedCounter from "../../components/taptap/AnimatedCounter";
import PlayIcon from "../../assets/img/play-icon.svg";
import coinBackgroundImg from "../../assets/img/coin-background.png";
import heroBackgroundImg from "../../assets/img/background-hero.png";
import LogoImg from "../../assets/img/coin.png";
import RobotImg from "../../assets/img/robot-1.png";
import RobotImg4 from "../../assets/img/robot-4.png";
import CoinImg from "../../assets/img/coin.png";
import BoltIcon from "../../assets/img/bolt-icon.svg";
import tapaudio from "../../assets/sounds/mixkit-arcade-game-jump-coin-216.wav";

import robot_1 from "../../assets/img/robot-1.png";
import robot_2 from "../../assets/img/robot-2.png";
import robot_3 from "../../assets/img/robot-3.png";
import robot_4 from "../../assets/img/robot-4.png";

import LoadingScreen from "../../components/taptap/LoadingScreen";


function Earn() {
  const navigate = useNavigate();

  const [clicks, setClicks] = useState([]);
  const [scale, setScale] = useState(1);
  const [meteorStyles, setMeteorStyles] = useState([]);
  const [deductCount, setDeductCount] = useState(1);
  const [prePoint, setPrePoint] = useState(1);
  const [localEnergy, setLocalEnergy] = useState(2000);
  const [localPoints, setLocalPoints] = useState(0);
  const [restoreTime, setRestoreTime] = useState(null);
  const [newsCount, setNewsCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [user, setUser] = useState(null);
  const [gamelevel, setGamelevel] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const defaultEnergyLevel = 2000;

  const robot = {
    0: robot_1,
    1: robot_1,
    2: robot_2,
    3: robot_3,
    4: robot_4,
    5: robot_4,
  };

  const robotLevel = {
    0: "LVL 1",
    1: "LVL 1",
    2: "LVL 2",
    3: "LVL 3",
    4: "LVL 4",
    5: "LVL 5",
  };

  const checkTime = (time) => {
    const localTime = moment(time, 'YYYY-MM-DD HH:mm:ss');
    const utcTime = localTime.utc();
    const currentUtcTime = moment.utc();
    return utcTime.isBefore(currentUtcTime) ? utcTime.format('YYYY-MM-DD HH:mm:ss') : '';
  };

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio(tapaudio);
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    };
    initAudio();
    return () => stopAudio();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuth();
        const response = await axios.get('https://taptap-production.up.railway.app/api/earn/getscore', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const resdata = response.data.data;

        if (!resdata) {
          setIsLoading(false);
          return;
        }

        setUser(resdata);
        setGamelevel(resdata.game_level);
        
        const storedEnergy = localStorage.getItem("energy");
        let storedPoints = parseInt(localStorage.getItem("score"), 10) || 0;
        const lastSyncTime = localStorage.getItem("lastSyncTime");

        if (storedPoints === 0) {
          localStorage.setItem("score", resdata.points);
          storedPoints = resdata.points;
        }

        if (storedEnergy && storedPoints) {
          const now = Date.now();
          if (!lastSyncTime || (now - lastSyncTime > 2000)) {
            let tempLocalEn = localStorage.getItem("energy");
            let tempLocalPO = localStorage.getItem("score");
            await syncWithServer(tempLocalEn, tempLocalPO, resdata.restore_time);
            setLocalEnergy(tempLocalEn);
            setLocalPoints(tempLocalPO);
          } else {
            setLocalEnergy(storedEnergy <= 0 ? defaultEnergyLevel : storedEnergy);
            setLocalPoints(storedPoints);
          }
        } else {
          setLocalEnergy(resdata.energy <= 0 ? defaultEnergyLevel : resdata.energy);
          setLocalPoints(resdata.points);
        }

        const storedRestoreTime = localStorage.getItem("restoreTime");
        if (storedRestoreTime) {
          const result = checkTime(storedRestoreTime);
          if (result) {
            setRestoreTime(result);
            const currentTime = moment.utc().format("YYYY-MM-DD HH:mm:ss");
            const duration = moment.duration(moment(storedRestoreTime).diff(currentTime));
            setElapsedSeconds(duration.asSeconds());
            setLocalEnergy(storedEnergy > 0 ? storedEnergy : 0);
          } else {
            setRestoreTime('');
            setLocalEnergy(storedEnergy !== null ? storedEnergy : defaultEnergyLevel);
          }
        } else if (resdata.restore_time) {
          const result = checkTime(resdata.restore_time);
          if (result) {
            setRestoreTime(result);
            if (resdata.energy === 0) {
              const currentTime = moment.utc().format("YYYY-MM-DD HH:mm:ss");
              const duration = moment.duration(moment(currentTime).diff(moment(resdata.restore_time))).asSeconds();
              setElapsedSeconds(duration);
              setLocalEnergy(resdata.energy);
            } else {
              setLocalEnergy(resdata.energy);
              setElapsedSeconds(null);
            }
          } else {
            setRestoreTime('');
            setLocalEnergy(resdata.energy || defaultEnergyLevel);
          }
        } else {
          setRestoreTime('');
          setElapsedSeconds(null);
          setLocalEnergy(defaultEnergyLevel);
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [user]);

  const syncWithServer = async (energy, points, restore_time) => {
    try {
      const token = getAuth();
      if (user) {
        if (points > 0) {
          await axios.post('https://taptap-production.up.railway.app/api/game/upscore', {
            score: 10000,
            energy_remaning: 100,
            restore_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          localStorage.setItem("lastSyncTime", Date.now());
        } else {
          localStorage.setItem("score", user.points > 0 ? user.points : localPoints);
        }
      }
    } catch (error) {
      console.error("Error syncing with server:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds(prevSeconds => {
        if (prevSeconds > 0) {
          return prevSeconds - 1;
        } else {
          setLocalEnergy(defaultEnergyLevel);
          clearInterval(interval);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleTap = (tapcount = 1) => {
    if (localEnergy > 0) {
      const newEnergy = localEnergy - tapcount;
      const newPoints = localPoints + tapcount;

      setLocalEnergy(newEnergy);
      setLocalPoints(newPoints);
      setNewsCount(newPoints);
      setScale(1.2);
      
      // Play audio effect
      playAudio();
      
      if (newEnergy <= 0) {
        setLocalEnergy(0);
        setRestoreTime(moment.utc().add(30, 'minutes').format("YYYY-MM-DD HH:mm:ss"));
        localStorage.setItem("restoreTime", restoreTime);
      }

      // Log tap event
      setClicks([...clicks, { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }]);
    }
  };

  return (
    <GameLayout>
      <LoadingScreen isloaded={isLoading} reURL={''} />
      

      {!isLoading && (
        <>


<div
className={`coinsection w-full h-full bg-black flex flex-col items-center justify-center p-4 relative select-none mb-2 bg-center bg-no-repeat `}

>
<div className="topbar bg-black/35 backdrop-blur-sm border-[#3131316c] border-[1px] w-[90%] py-2 absolute top-0 z-20 rounded-3xl">
  <Link
    to="/reward"
    className="miner flex flex-col items-center justify-center absolute my-2 ml-4"
  >
    <img src={robot[`${gamelevel}`] ? robot[`${gamelevel}`] : robot_1}
    alt="" className="w-8 h-8" />
    <h1 className="font-sfSemi text-sm text-white">{robotlevel[gamelevel]}</h1>
  </Link>
  <div className="flex flex-col items-center justify-center gap-2">
    <h1 className="font-sfSemi text-sm text-white">YOU'VE EARNED</h1>
    <h1 className="font-sfSemi text-2xl text-white flex flex-row gap-2 items-center justify-center">
      <AnimatedCounter from={parseInt(prePoint)} to={parseInt(localPoints)} />
      <img src={LogoImg} className="w-8 h-8" />
    </h1>
  </div>
</div>

<div className="coin-display small:-mt-10">
  {[...meteorStyles].map((style, idx) => (
    <span
      key={idx}
      className={
        "pointer-events-none absolute left-1/2 top-1/2 h-0.5 w-0.5 rotate-[215deg] animate-meteor rounded-[9999px] bg-[#3396FF] shadow-[0_0_0_1px_#ffffff10]"
      }
      style={style}
    >
      <div className="pointer-events-none absolute top-1/2 -z-10 h-[1px] w-[50px] -translate-y-1/2 bg-gradient-to-r from-[#3396FF] to-transparent" />
    </span>
  ))}
  <div className="flex">
    <div className="relative flex">
      <motion.img
        animate={{ scale }}
        transition={{ duration: 0.1 }}
        src={CoinImg}
        alt="Coin"
        className="img-fluid animate__animated animate__bounce small:w-52 small:h-52 h-64 w-64 z-10 rounded-full select-none"
        onTouchStart={handleTouchStart}
      />
      {localEnergy
        ? clicks.map((click) => (
            <motion.div
              key={click.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -100 }}
              transition={{ duration: 1 }}
              className="absolute text-2xl font-sfSemi text-white z-20 flex"
              style={{ top: click.y - 300, left: click.x - 100 }}
            >
              +{deductCount || "5"}
            </motion.div>
          ))
        : ""}
      <div className="h-52 w-52 bg-[#0ff37969] rounded-full absolute top-1/2 -translate-y-1/2 z-0 blur-2xl left-1/2 -translate-x-1/2"></div>
    </div>
  </div>
</div>
<div className="rank flex flex-row gap-2 small:items-start items-center justify-center left-0 my-10 small:my-0">
  <div className="progressbar w-60 rounded-full relative h-3 bg-[#050F08]">
    <div
      className="absolute h-full bg-gradient-to-r from-[#3396FF] to-[#6ABE6A] bottom-0 rounded-full"
      style={{
        width: `${Math.min(Math.max((parseInt(localEnergy) / 2000) * 100, 0), 100)}%`,
      }}
    ></div>
  </div>
  <h1 className="text-sm text-[#3396FF] flex flex-row items-center gap-1">
    {restoreTime != null && restoreTime !== '' && localEnergy === 0 ? (
      !isNaN(parseInt(elapsedSeconds)) ? formatTime(elapsedSeconds) : `1h`
      // elapsedSeconds
    ) : (
      <>
        {localEnergy} <img src={BoltIcon} className="w-3 h-4" alt="Bolt Icon" />
      </>
    )}
  </h1>
</div>
</div>
</>

      )}
      
    </GameLayout>
  );
}

export default Earn;
