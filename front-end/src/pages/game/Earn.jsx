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
  const [localEnergy, setLocalEnergy] = useState(2000);
  const [localPoints, setLocalPoints] = useState(0);
  const [restoreTime, setRestoreTime] = useState(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(null);
  const [isActive, setIsActive] = useState(true);
  const [user, setUser] = useState();
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

  const robotlevel = {
    0: "LVL 1",
    1: "LVL 1",
    2: "LVL 2",
    3: "LVL 3",
    4: "LVL 4",
    5: "LVL 5"
  };

  const checkTime = (time) => {
    const localTime = moment(time, 'YYYY-MM-DD HH:mm:ss');
    const utcTime = localTime.utc();
    const currentUtcTime = moment.utc();
    return utcTime.isBefore(currentUtcTime) ? utcTime.format('YYYY-MM-DD HH:mm:ss') : '';
  };

  useEffect(() => {
    console.log("Effect test", isActive, localEnergy, localPoints, user, restoreTime);
  }, []);

  useEffect(() => {
    const initAudio = async () => {
      try {
        await initializeAudio(tapaudio);
      } catch (error) {
        console.error("Error initializing audio:", error);
      }
    };
    initAudio();
    return () => {
      stopAudio();
    };
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = getAuth();
        const response = await axios.get('https://taptap-production.up.railway.app/api/earn/getscore', {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data.data;
        if (!userData) {
          setIsLoading(false);
          return;
        }

        setUser(userData);

        let storedEnergy = localStorage.getItem('energy') || defaultEnergyLevel;
        let storedPoints = parseInt(localStorage.getItem('score'), 10) || userData.points;

        if (storedPoints === 0) {
          storedPoints = userData.points;
          updateLocalStorage(storedEnergy, storedPoints);
        }

        const lastSyncTime = localStorage.getItem('lastSyncTime');
        const now = Date.now();

        if (!lastSyncTime || now - lastSyncTime > 2000) {
          await syncWithServer(storedEnergy, storedPoints, userData.restore_time);
          updateLocalStorage(storedEnergy, storedPoints);
        }

        if (storedEnergy && storedPoints) {
          setLocalEnergy(storedEnergy);
          setLocalPoints(storedPoints);
        } else {
          setLocalEnergy(userData.energy > 0 ? userData.energy : defaultEnergyLevel);
          setLocalPoints(userData.points);
        }

        const storedRestoreTime = localStorage.getItem('restoreTime');
        if (storedRestoreTime) {
          const result = checkTime(storedRestoreTime);
          if (result) {
            setRestoreTime(result);
            const remainingTime = moment.duration(moment(storedRestoreTime).diff(moment.utc())).asSeconds();
            setElapsedSeconds(remainingTime);
          }
        } else if (userData.restore_time) {
          const result = checkTime(userData.restore_time);
          if (result) {
            setRestoreTime(result);
            if (userData.energy === 0) {
              const duration = moment.duration(moment.utc().diff(moment(userData.restore_time))).asSeconds();
              setElapsedSeconds(duration);
            }
            setLocalEnergy(userData.energy);
          }
        } else {
          setRestoreTime('');
          setElapsedSeconds(null);
          setLocalEnergy(defaultEnergyLevel);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const updateLocalStorage = (energy, points) => {
    localStorage.setItem('energy', energy);
    localStorage.setItem('score', points);
  };

  const syncWithServer = async (energy, points, restore_time) => {
    const token = getAuth();
    if (user) {
      if (points > 0) {
        await axios.post(
          `https://taptap-production.up.railway.app/api/game/upscore`,
          {
            score: points,
            energy_remaning: energy,
            restore_time: moment.utc().format("YYYY-MM-DD HH:mm:ss"),
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        localStorage.setItem("lastSyncTime", Date.now());
        console.log("Reset");
      } else {
        localStorage.setItem("score", user.points > 0 ? user.points : localPoints);
      }
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedSeconds((prevSeconds) => {
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
    console.log("Tab test", isActive, localEnergy, localPoints, user, restoreTime);

    if (localEnergy > 0) {
      const newEnergy = parseInt(localEnergy) - parseInt(tapcount);
      const newPoints = parseInt(localPoints, 10) + parseInt(tapcount, 10);

      setLocalEnergy(newEnergy);
      setLocalPoints(newPoints);
      setNewsCount(newPoints);
      updateLocalStorage(newEnergy, newPoints);

      const currentUtcTime = moment.utc();
      const futureUtcTime = currentUtcTime.add(1, 'hours');
      const restoreTimeStr = futureUtcTime.format("YYYY-MM-DD HH:mm:ss");
      localStorage.setItem("restoreTime", restoreTimeStr);

      if (newPoints === 0) {
        setRestoreTime(restoreTimeStr);
        setElapsedSeconds(3600);
      }

      setIsActive(true);
      playAudio();
    } else {
      stopAudio();
    }
    console.log("Effect test done", isActive, localEnergy, localPoints, user, restoreTime);
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')} hr`;
    } else if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, '0')} mins`;
    } else {
      return `${secs} secs`;
    }
  };

  useEffect(() => {
    if (localEnergy === 0 && restoreTime && elapsedSeconds === null) {
      const interval = setInterval(() => {
        const now = moment.utc().format("YYYY-MM-DD HH:mm:ss");
        const remainingTime = moment.duration(moment(restoreTime).diff(moment(now))).asSeconds();
        if (remainingTime <= 0) {
          setLocalEnergy(defaultEnergyLevel);
          setElapsedSeconds(0);
          setRestoreTime('');
          clearInterval(interval);
        } else {
          setElapsedSeconds(remainingTime);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [localEnergy, restoreTime, elapsedSeconds]);


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
