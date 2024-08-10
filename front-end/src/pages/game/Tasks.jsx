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
        setIsCheckin(res.data.checkin?.dailycheckin || false); // Set initial check-in status
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
        setIsCheckin(true); // Set isCheckin to true on successful check-in
        handleSuccess(res.data.data.rewardPoints || 5000);
      } else {
        alert("Check-in failed");
        setIsCheckin(false);
        navigate("/earn");
      }
    } catch (error) {
      alert("Error during check-in");
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

  useEffect(() => {
    alert(isCheckin);
  }, []);

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
            buttonDisabled={!isCheckin} // Disable button if check-in is true
            onButtonClick={() => {
              if (!isCheckin) CheckIn(); // Call CheckIn if isCheckin is false
            }}
          />

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
