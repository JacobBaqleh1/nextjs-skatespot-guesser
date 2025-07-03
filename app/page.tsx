"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { hasPlayedToday, getTodayGameResult } from "@/app/utils/localGameStorage";
import { getScoreRating } from "@/app/utils/scoreCalc";
import { useAuth } from "./contexts/AuthContext";
import { getTodayGameFromFirestore } from "./utils/firestoreStats";

export default function Home() {
  const router = useRouter();
  const [hasLocalUserPlayedToday, setHasLocalUserPlayedToday] = useState(false);
  const [hasUserPlayedToday, setHasUserPlayedToday] = useState(false)
  const [todayResult, setTodayResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const { user } = useAuth();
  const [firestoreTodayResult, setFirestoreTodayResult] = useState<any>(null);

  //checking if players local storage played today 
  useEffect(() => {
    setMounted(true);
    setHasLocalUserPlayedToday(hasPlayedToday());
    setTodayResult(getTodayGameResult());
  }, []);

  //checking if user in db played today
  useEffect(() => {
    async function checkIfPlayed() {
      if (user) {
        const todayGame = await getTodayGameFromFirestore(user.uid);
        setHasUserPlayedToday(!!todayGame);
        setFirestoreTodayResult(todayGame);
      } else {
        setHasUserPlayedToday(hasPlayedToday());
        setFirestoreTodayResult(null);
      }
    }
    checkIfPlayed();
  }, [user])


  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-lime-400 to-green-500 bg-clip-text text-transparent">
          🛹 SkateSpot Guesser
        </h1>
        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Can you identify famous skate spots from Street View and footage?
        </p>
      </div>

      {/* Show result if played today, otherwise show play button */}
      {(user ? hasUserPlayedToday && firestoreTodayResult : hasLocalUserPlayedToday && todayResult) ? (
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center border border-gray-600">
          <h2 className="text-2xl font-bold mb-4">Today's Result 🎯</h2>

          <div className="space-y-3 mb-6">
            <p className="text-lg">
              Distance: <span className="font-bold text-yellow-400">
                {(user ? firestoreTodayResult.distance : todayResult.distance)}
                miles</span>
            </p>
            <p className="text-xl font-bold text-green-400">
              Score: {(user ? firestoreTodayResult.score : todayResult.score.toLocaleString())} points
            </p>
            <p className="text-gray-300">
              {getScoreRating(user ? firestoreTodayResult.score : todayResult.score)}
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/dashboard/game/result")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
            >
              View Full Result
            </button>

            <p className="text-sm text-gray-400">
              Come back tomorrow for a new spot! 🕐
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <button
            onClick={() => router.push("/dashboard/game")}
            className="bg-lime-500 hover:bg-lime-600 text-black font-bold py-4 px-12 rounded-full text-2xl shadow-lg transition-all duration-300 hover:scale-105"
          >
            🎮 PLAY
          </button>

          <p className="text-center text-gray-400">
            One guess per day • New spot every 24 hours
          </p>
        </div>
      )}

      {/* How to play section */}
      <div className="mt-12 max-w-2xl text-center">
        <h3 className="text-xl font-semibold mb-4">How to Play</h3>
        <div className="grid md:grid-cols-3 gap-6 text-sm text-gray-300">
          <div>
            <div className="text-2xl mb-2">👀</div>
            <p>Study the Street View and spot footage</p>
          </div>
          <div>
            <div className="text-2xl mb-2">📍</div>
            <p>Place your pin on the world map</p>
          </div>
          <div>
            <div className="text-2xl mb-2">🏆</div>
            <p>Get points based on accuracy</p>
          </div>
        </div>
      </div>
    </div>
  );
}