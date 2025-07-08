"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { hasPlayedToday, getTodayGameResult } from "@/app/utils/localGameStorage";
import { getScoreRating } from "@/app/utils/scoreCalc";
import { useAuth } from "./contexts/AuthContext";
import { getTodayGameFromFirestore } from "./utils/firestoreStats";
import { signInWithGoogle } from "./utils/auth";
import CountdownTimer from "./components/CountdownTimer";

export default function Home() {
  const router = useRouter();
  const [hasLocalUserPlayedToday, setHasLocalUserPlayedToday] = useState(false);
  const [hasUserPlayedToday, setHasUserPlayedToday] = useState(false)
  const [todayResult, setTodayResult] = useState<any>(null);
  const [mounted, setMounted] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const { user, migrationComplete } = useAuth();
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
  }, [user, migrationComplete])


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
          🛹 Spotta
        </h1>

        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
          Can you identify famous skate spots from Street View and footage?
        </p>
      </div>

      {/* Show result if played today, otherwise show play button */}
      {(user ? hasUserPlayedToday && firestoreTodayResult : hasLocalUserPlayedToday && todayResult) ? (
        <div className="backdrop-blur-md bg-white/10 border border-gray-700 shadow-2xl rounded-2xl p-8 max-w-md w-full text-center flex flex-col items-center">
          <CountdownTimer />
          <h2 className="text-2xl font-bold mb-4 text-blue-200 drop-shadow">Today's Result 🎯</h2>
          <div className="space-y-3 mb-6 w-full">
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <div className="flex flex-col items-center bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-black/80 rounded-xl p-4 border border-gray-700 shadow">
                <span className="text-xs text-gray-400 mb-1">Distance</span>
                <span className="text-lg font-bold text-yellow-400">
                  {(user ? firestoreTodayResult.distance : todayResult.distance)} miles
                </span>
              </div>
              <div className="flex flex-col items-center bg-gradient-to-br from-gray-900/80 via-gray-800/80 to-black/80 rounded-xl p-4 border border-gray-700 shadow">
                <span className="text-xs text-gray-400 mb-1">Score</span>
                <span className="text-xl font-bold text-green-400">
                  {(user ? firestoreTodayResult.score : todayResult.score.toLocaleString())}
                </span>
              </div>
            </div>
            <p className="text-gray-300 text-sm mt-2">
              {getScoreRating(user ? firestoreTodayResult.score : todayResult.score)}
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard/game/result")}
            className="w-full bg-blue-600/90 hover:bg-blue-700/90 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            View Full Result
          </button>
          <p className="text-sm text-gray-400 mt-3">
            Come back tomorrow for a new spot! 🕐
          </p>
          <div className="backdrop-blur-md bg-white/10 border border-gray-700 rounded-2xl p-6 mb-6 max-w-md w-full text-center shadow-lg mt-6">
            <h3 className="text-xl font-bold mb-4 text-lime-300 drop-shadow">Want to save your progress?</h3>
            <p className="text-gray-300 mb-4">Create a free account to track your points and stats</p>
            <button
              onClick={() => signInWithGoogle()}
              disabled={authLoading}
              className="w-full bg-white text-black px-4 py-3 rounded font-semibold hover:bg-gray-100 transition flex items-center justify-center"
            >
              {authLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />)
                :
                (<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>)
              }
              {authLoading ? 'Signing in...' : 'Continue with Google'}
            </button>
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