import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

function Welcome() {
  const [greeting, setGreeting] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setGreeting("Good Morning");
      } else if (hour >= 12 && hour < 18) {
        setGreeting("Good Afternoon");
      } else if (hour >= 18 && hour < 22) {
        setGreeting("Good Evening");
      } else {
        setGreeting("Good Night");
      }
    };

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString());
    };

    updateGreeting();
    updateTime();

    const interval = setInterval(() => {
      updateGreeting();
      updateTime();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center text-white px-6 min-h-[60vh]">
      {/* Time and Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mb-8 text-center"
      >
        <h2 className="text-2xl font-light text-emerald-400 mb-2">
          {currentTime}
        </h2>
        <h3 className="text-3xl font-medium text-gray-300">{greeting}!</h3>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        className="text-center max-w-2xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 p-10 rounded-3xl shadow-2xl backdrop-blur-lg border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300"
      >
        <motion.h1
          className="text-6xl font-bold mb-8"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-lg">
            Welcome to Codekori!
          </span>
          <br />
          <span className="text-emerald-400 text-2xl">Ramadan Mubarak!🌙</span>
        </motion.h1>
        <p className="text-gray-300 text-xl leading-relaxed font-light">
          Ask anything, explore knowledge, and get insights in real-time.
        </p>
        <div className="mt-8 w-24 h-1 bg-gradient-to-r from-emerald-400 to-blue-500 mx-auto rounded-full opacity-70"></div>
      </motion.div>

      {/* Bottom Message */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute bottom-8 text-center space-y-2"
      >
        <p className="text-yellow-400/80 text-sm font-medium flex items-center justify-center gap-2">
          <span>⚠️</span>
          <span>Codekori can make mistakes.</span>
        </p>
        <p className="text-blue-400/80 text-sm font-medium flex items-center justify-center gap-2">
          <span>💡</span>
          <span>For low-budget servers, responses might take time.</span>
        </p>
      </motion.div>
    </div>
  );
}

export default Welcome;
