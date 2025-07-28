import React, { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";

function getTimeUntilMidnight() {
  const now = new Date();
  const nextMidnightUTC = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
  );
  const diff = nextMidnightUTC - now.getTime();

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return { hours, minutes, seconds };
}

export default function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState(getTimeUntilMidnight());

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeUntilMidnight());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = timeLeft;

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-900/80 via-gray-800/90 to-gray-900/80 rounded-xl shadow-lg text-white font-mono text-lg border border-blue-800/40 mt-4">
      <ClockIcon className="w-5 h-5 text-blue-400 animate-pulse" />
      <span className="font-semibold text-lg text-lime-400">Next spot in:</span>
      <span className="tracking-widest text-2xl font-semibold text-blue-200">{`${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`}</span>
    </div>
  );
}
