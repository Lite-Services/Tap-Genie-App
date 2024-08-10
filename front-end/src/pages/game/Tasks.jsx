import axios from "axios";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import GameLayout from "../layout/GameLayout";
import FriendsListItem from "../../components/taptap/FriendsListItem";
import Drawer from "../../components/taptap/Drawer";
import logo from "../../assets/img/coin.png";
import { getTGUser } from "../../utlis/tg";
import { getAuth } from "../../utlis/localstorage";
import LoadingScreen from "../../components/taptap/LoadingScreen";
import { motion } from "framer-motion";

function Tasks() {
  const [isCheckin, setIsCheckin] = useState(false);
  const [checkinDetails, setCheckinDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskList, setTaskList] = useState([]);

  const navigate = useNavigate();
  const effectRan = useRef(false);

  const postAjaxCall = async (endpoint, data) => {
    const token = getAuth();
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: data,
      });
      return response.data;
    } catch (error) {
      console.error("Error in endpoint:", error);
      throw error;
    }
  };

  const getUserData = async (tgData) => {
    if (!tgData) return;

    try {
      const res = await postAjaxCall("https://taptap-production.up.railway.app/api/task/list", { tid: tgData.id });
      console.log("res=>", res);

      if (res.message === 'Success') {
        setTaskList(res.data.tasklist || []);
        setCheckinDetails(res.data.checkin || {});
        setIsCheckin(res.data.checkin?.dailycheckin || false);
      } else {
        console.error("Error: Unexpected response message");
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!effectRan.current) {
      const tgData = getTGUser();
      getUserData(tgData);
      effectRan.current = true;
    }
  }, []);

  const handleSuccess = (rewardPoints) => {
    const pointsInLocalStorage = localStorage.getItem("score") || 0;
    localStorage.setItem("score", parseInt(pointsInLocalStorage) + rewardPoints);
    setOpen(true);
    setTimeout(() => setOpen(false), 3000);
  };

  const CheckIn = async () => {
    try {
      const token = getAuth();
      const res = await axios.post("https://taptap-production.up.railway.app/api/task/checkin", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.message === 'Success' && res.data.data.dailycheckin) {
        setIsCheckin(true);
        handleSuccess(res.data.data.rewardPoints || 5000);
      } else {
        setIsCheckin(false);
        navigate("/earn");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setIsCheckin(false);
      navigate("/earn");
    }
  };

  const Claim = async (taskId, taskUrl, taskPoints) => {
    try {
      const token = getAuth();
      const res = await axios.post("https://taptap-production.up.railway.app/api/task/claim", {
        taskID: taskId,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.message === 'Success') {
        setTaskList(prevList =>
          prevList.map(task =>
            task.id === taskId
              ? { ...task, isClaimed: 'Y' }
              : task
          )
        );

        if (taskUrl) {
          window.Telegram.WebApp.openLink(taskUrl);
        }

        const pointsInLocalStorage = localStorage.getItem("score") || 0;
        localStorage.setItem("score", parseInt(pointsInLocalStorage) + taskPoints);
        setOpen(true);
        setTimeout(() => setOpen(false), 3000);
      } else {
        setIsCheckin(false);
        navigate("/earn");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setIsCheckin(false);
      navigate("/earn");
    }
  };

  const formatNumber = (value) => {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(1).replace(/\.0$/, "") + "B";
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1).replace(/\.0$/, "") + "M";
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(1).replace(/\.0$/, "") + "K";
    } else {
      return value;
    }
  };

  return (
    <GameLayout>
      {isLoading ? (
        <LoadingScreen isloaded={isLoading} reURL={''} />
      ) : (
        <>
          <Drawer open={open} setOpen={setOpen}>
            <h1 className="text-white font-sfSemi text-2xl">
              Claimed Successfully
            </h1>
          </Drawer>

          {/* Daily Check-in Task */}
          <FriendsListItem
            key="dailyCheckin"
            profile={logo}
            name={`Day ${checkinDetails.rewardDay}`}
            level={`+ ${formatNumber(checkinDetails.rewardPoints) !== "0" ? formatNumber(checkinDetails.rewardPoints) : formatNumber(checkinDetails.rewardDay !== "" ? parseInt(checkinDetails.rewardDay) * 5000 : 5000)}`}
            icon={logo}
            displayType="checkin"
            buttonDisabled={!isCheckin}
            onButtonClick={isCheckin ? undefined : CheckIn}
          />

          {/* Check-In Button */}
          <div
            className="flex items-center justify-center w-[95%] bg-[#3396FF] rounded-2xl py-2 mt-2 shadow-[0_0_24px_-6px_#6ABE6A] px-4 mx-auto"
            onClick={isCheckin ? undefined : CheckIn}
          >
            <img
              src={logo}
              className="w-12 h-12 m-1 border-2 border-[#0B2113] rounded-full basis-[10%]"
              alt="Profile"
            />
            <div className="flex flex-col basis-[90%] text-left ml-2">
              <p className="text-[#0B0B0B] text-[15px] font-sfSemi">{`Day ${checkinDetails.rewardDay}`}</p>
              <p className="text-[#0B0B0B] text-base font-sfSemi flex-row flex items-center justify-start gap-1">
                <img src={logo} className="w-4 h-4" alt="Leader Icon" />
              </p>
              <p className="text-[#0B0B0B] text-[15px] font-">
                {`+ ${formatNumber(checkinDetails.rewardPoints) !== "0" ? formatNumber(checkinDetails.rewardPoints) : formatNumber(checkinDetails.rewardDay !== "" ? parseInt(checkinDetails.rewardDay) * 5000 : 5000)}`}
              </p>
            </div>
            {!isCheckin ? (
              <motion.button
                onClick={CheckIn}
                whileTap={{ scale: 0.95 }}
                whileHover={{
                  boxShadow: "0px 0px 8px rgb(0, 0, 0)",
                  backgroundColor: "rgba(11, 11, 11, 0.5)",
                  backdropFilter: "blur(8px)",
                }}
                className="ml-2 p-4 text-sm rounded-lg shadow-md transition duration-300 bg-[#0b0b0b] text-white hover:bg-[#0b0b0b5e] hover:backdrop-blur-md active:grayscale"
              >
                Claim
              </motion.button>
            ) : (
              <span className="text-white">Claimed</span>
            )}
          </div>

          {/* Dynamic Task List */}
          {taskList.map((task) => (
            <FriendsListItem
              key={task.id}
              profile={logo}
              name={task.title}
              level={`+${task.points}`}
              icon={logo}
              displayType="checkin"
              buttonDisabled={task.isClaimed === 'Y'}
              onButtonClick={task.isClaimed === 'N' ? () => Claim(task.id, task.url, task.points) : undefined}
            />
          ))}
        </>
      )}
    </GameLayout>
  );
}

export default Tasks;
