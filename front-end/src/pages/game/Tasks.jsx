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

function Tasks() {
  const [isCheckin, setIsCheckin] = useState(false);
  const [checkinDetails, setCheckinDetails] = useState({});
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [taskList, setTaskList] = useState([]); // Initialize as an empty array
  const [cusText, setCusText] = useState('Claimed Successfully');

  const navigate = useNavigate();
  const effectRan = useRef(false);

  const postAjaxCall = async (endpoint, data) => {
    const token = getAuth();
    try {
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        params: data, // Pass parameters as query params
      });
      return response.data;
    } catch (error) {
      console.error("Error in endpoint:", error);
      throw new Error("Error in endpoint", error);
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
        setIsLoading(false);
      } else {
        console.error("Error: Unexpected response message");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!effectRan.current) {
      const tgData = getTGUser();
      getUserData(tgData);
      effectRan.current = true;
    }
  }, [navigate]);

  const CheckIn = async () => {
    try {
      const token = getAuth(); // Ensure you're retrieving the token correctly

      const res = await axios.post("https://taptap-production.up.railway.app/api/task/checkin", {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.message === 'Success' && res.data.data.dailycheckin) {
        setIsCheckin(true);
        const pointsInLocalStorage = localStorage.getItem("score") || 0;
        localStorage.setItem("score", parseInt(pointsInLocalStorage) + (res.data.data.rewardPoints || 5000));

        setOpen(true);
        setTimeout(() => setOpen(false), 3000);
      } else {
        setIsCheckin(false);
        setOpen(false);
        navigate("/earn");
      }
    } catch (error) {
      console.error("Error checking in:", error);
      setIsCheckin(false);
      setOpen(false);
      navigate("/earn");
    }
  };

  const Claim = async (taskId, taskUrl) => {
    try {
      const token = getAuth(); // Ensure you're retrieving the token correctly

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
        localStorage.setItem("score", parseInt(pointsInLocalStorage) + (checkinDetails.rewardPoints || 5000));

        setOpen(true);
        setTimeout(() => setOpen(false), 3000);
      } else {
        setIsCheckin(false);
        setOpen(false);
        navigate("/earn");
      }
    } catch (error) {
      console.error("Error claiming reward:", error);
      setIsCheckin(false);
      setOpen(false);
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
              {cusText}
            </h1>
          </Drawer>

          {/* Daily Check-in Task */}
          <FriendsListItem
            profile={logo}
            key="dailyCheckin"
            name={`Day ${checkinDetails.rewardDay}`}
            level={`+ ${formatNumber(checkinDetails.rewardPoints) !== "0" ? formatNumber(checkinDetails.rewardPoints) : formatNumber(checkinDetails.rewardDay !== "" ? parseInt(checkinDetails.rewardDay) * 5000 : 5000)}`}
            icon={logo}
            displayType="checkin"
            buttonDisabled={!isCheckin}
            onButtonClick={() => !isCheckin ? CheckIn() : null}
          />

          {/* Dynamic Task List */}
          {taskList.map((task) => (
            <FriendsListItem
              key={task.id}
              profile={logo}  // Replace with an appropriate icon or remove if not needed
              name={task.title}
              level={`+${task.points}`}
              icon={logo}
              displayType="checkin"
              buttonDisabled={task.isClaimed === 'Y'}
              onButtonClick={() => task.isClaimed === 'N' ? Claim(task.id, task.url) : null}
            />
          ))}
        </>
      )}
    </GameLayout>
  );
}

export default Tasks;
