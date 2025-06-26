"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getLastScore, getLastPlayed } from "@/app/utils/localGameStorage";

function getNext7amPST() {
  const now = new Date();
  // PST is UTC-8, but for simplicity, we'll use UTC-8 (not handling DST here)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const pstNow = new Date(utc - 8 * 3600000);
  let next = new Date(pstNow);
  next.setHours(7, 0, 0, 0);
  if (pstNow.getHours() >= 7) {
    next.setDate(next.getDate() + 1);
  }
  // Convert back to local time
  return new Date(next.getTime() + 8 * 3600000);
}

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, "0");
  const seconds = String(totalSeconds % 60).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
}

export default function Home() {
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [lastPlayed, setLastPlayed] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<string>("");

  useEffect(() => {
    setLastScore(getLastScore());
    setLastPlayed(getLastPlayed());
  }, []);

  useEffect(() => {
    if (!lastPlayed) return;
    const next7am = getNext7amPST();
    const interval = setInterval(() => {
      setCountdown(formatCountdown(next7am.getTime() - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastPlayed]);

  return (
    <div className="h-screen justify-center items-center flex flex-col">
      <Link href='/dashboard/game' className="text-lime-500 text-4xl border-2 border-lime-500 p-10 mb-8">
        PLAY
      </Link>
      {lastScore !== null && lastPlayed !== null && (
        <div className="flex flex-col items-center mt-4">
          <div className="mb-2">
            <span className="font-semibold">Your miles score from previous game:</span>{" "}
            <span className="text-blue-400">{lastScore}</span>
          </div>
          <div>
            <span className="font-semibold">Next game in: </span>
            <span className="text-green-400">{countdown}</span>
          </div>
        </div>
      )}
    </div>
  );
}