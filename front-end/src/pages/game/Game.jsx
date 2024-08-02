import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Error500 from "../error/Error500";
import { getTGUser } from "../../utlis/tg";
import { setSession } from "../../utlis/localstorage";
import LoadingScreen from "../../components/taptap/LoadingScreen";

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const query_params = new URLSearchParams(location.search);
  const referral_by = query_params.get("tgWebAppStartParam");
  const [error, setError] = useState(false);
  const [isTg, setIsTg] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let unmounted = false;
    let tg_user = getTGUser();
    setIsTg(tg_user !== false);

    if (tg_user !== false) {
      tg_user["referral_by"] = referral_by;
      axios.post("https://taptap-production.up.railway.app/api/tg/auth/", tg_user)
        .then((res) => {
          const data = res.data;
          if (data.sync_data) {
            setSession(data.sync_data);
            setIsLoading(false);
            navigate("/earn");
          } else {
            console.error("Sync data is not found in response"); // Log if sync_data is missing
            throw new Error("Sync data is not found");
          }
        })
        .catch((err) => {
          console.error("API Error:", err); // Log the error
          if (!unmounted) {
            if (err.response?.status === 403) {
              setIsTg(false);
            } else {
              setError(true);
            }
            setIsLoading(false);
          }
        });
    } else {
      setIsLoading(false);
    }

    return () => {
      unmounted = true;
    };
  }, [navigate, referral_by]);

  return (
    <>
      {isLoading && <LoadingScreen isloaded={isLoading} reURL="" />}
      {!isLoading && error && <Error500 />}
      {!isLoading && !error && !isTg && (
        <h1 className="text-7xl text-white font-sfSemi text-center">
          Please open in TG
        </h1>
      )}
    </>
  );
}

export default Game;
