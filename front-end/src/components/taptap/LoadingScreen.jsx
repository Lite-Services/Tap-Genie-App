import React, { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function LoadingScreen({ isloaded, reURL = '' }) {
  const words = ["Winter", "is", "coming", "...."];
  const [currentWord, setCurrentWord] = useState(words[0]);

  const navigate = useNavigate();
  const duration = 100; // Duration for word change

  const startAnimation = useCallback(() => {
    setCurrentWord(prev => {
      const nextIndex = (words.indexOf(prev) + 1) % words.length;
      return words[nextIndex];
    });
  }, [words]);

  useEffect(() => {
    if (isloaded) {
      const wordChangeInterval = setInterval(startAnimation, duration);
      const redirectTimeout = setTimeout(() => {
        if (reURL) navigate(reURL);
      }, 2000);

      return () => {
        clearInterval(wordChangeInterval);
        clearTimeout(redirectTimeout);
      };
    }
  }, [isloaded, navigate, reURL, startAnimation, duration]);

  if (!isloaded) {
    return null;
  }

  return (
    <div className="flex bg-black h-screen w-full flex-col items-center justify-center">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, ease: "easeInOut" }}
          exit={{
            opacity: 0,
            y: -40,
            filter: "blur(8px)",
            scale: 2,
            position: "absolute",
          }}
          className="z-10 inline-block relative text-left text-[#3396FF] text-4xl font-sfSemi px-2"
          key={currentWord}
        >
          {currentWord.split("").map((letter, index) => (
            <motion.span
              key={currentWord + index}
              initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ delay: index * 0.08, duration: 0.4 }}
              className="inline-block"
            >
              {letter}
            </motion.span>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default LoadingScreen;
