import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

import Error500 from "../error/Error500";
import { getTGUser } from "../../utlis/tg";
import { setSession, setAuth } from "../../utlis/localstorage";
import LoadingScreen from "../../components/taptap/LoadingScreen";

function Game() {
  const navigate = useNavigate();
  const location = useLocation();
  const query_params = new URLSearchParams(location.search);
  const referral_by = query_params.get("tgWebAppStartParam");
  //let startParam = window.Telegram.WebApp.initDataUnsafe.start_param;

  const [error, setError] = useState(false);
  const [isTg, setIsTg] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    //alert(referral_by);
    const authenticateUser = async () => {
      try {
        const tg_user = getTGUser();
        if (tg_user) {
          tg_user.referral_by = referral_by;
          //console.log(referral_by);
          const response = await axios.post("https://taptap-production.up.railway.app/api/tg/auth/", tg_user);
          const { sync_data } = response.data;

          if (sync_data) {
            setSession(sync_data);
            setAuth(sync_data.auth_token);
            if (isMounted) {
              setIsLoading(false);
              navigate("/earn");
            }
          } else {
            throw new Error("Sync data is not found");
          }``
        } else {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("API Error:", err); 
        if (isMounted) {
          if (err.response?.status === 403) {
            setIsTg(false);
          } else {
            setError(true);
          }
          setIsLoading(false);
        }
      }
    };

    authenticateUser();

    return () => {
      isMounted = false;
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
