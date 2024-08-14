import React from "react";
import { motion } from "framer-motion";

const FriendsListItem = ({
  name = "Unknown",
  level = "N/A",
  icon = "https://via.placeholder.com/150",
  displayType = "",
  rank = "",
  balance = "",
  profile = "https://via.placeholder.com/150",
  onButtonClick = () => {},
  buttonDisabled = false,
}) => {
  return (
    <div className="flex items-center justify-center w-[95%] bg-[#3396FF] rounded-2xl py-2 mt-2 shadow-[0_0_24px_-6px_#6ABE6A] px-4 mx-auto">
      <h1 className="text-[#0B0B0B] text-2xl">{rank}</h1>
      <img
        src={profile}
        className="w-12 h-12 m-1 border-2 border-[#0B2113] rounded-full basis-[10%]"
        alt="Profile"
      />
      <div className="flex flex-col basis-[90%] text-left ml-2">
        <p className="text-[#0B0B0B] text-[15px] font-sfSemi">{name}</p>
        <p className="text-[#0B0B0B] text-base font-sfSemi flex-row flex items-center justify-start gap-1">
          {balance} <img src={icon} className="w-4 h-4" alt="Leader Icon" />
        </p>
        <p className="text-[#0B0B0B] text-[15px] font-">{level}</p>
      </div>
      {displayType === "leader" && (
        <div className="flex-col flex items-center justify-center min-w-10"></div>
      )}
      {displayType === "friend" && (
        !buttonDisabled ? (
            <motion.button
              onClick={onButtonClick}
              whileTap={{ scale: 0.95 }}
              whileHover={{ 
                boxShadow: "0px 0px 8px rgb(0, 0, 0)",
                backgroundColor: "rgba(11, 11, 11, 0.5)",
                backdropFilter: "blur(8px)",
              }}
              className={`ml-2 p-4 text-sm rounded-lg shadow-md transition duration-300 bg-[#0b0b0b] text-white hover:bg-[#0b0b0b5e] hover:backdrop-blur-md active:grayscale`}
            >
              Claim
            </motion.button>
           
          
        ) : (
          <span className="text-white">Claimed</span>
        )

       )}
      {displayType === "checkin" && (
        !buttonDisabled ? (
          <motion.button
            onClick={onButtonClick}
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
        )
      )}
    </div>
  );
};

export default FriendsListItem;
