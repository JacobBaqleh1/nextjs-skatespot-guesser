import {
  doc,
  setDoc,
  updateDoc,
  increment,
  arrayUnion,
  Timestamp,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { useRouter } from "next/navigation";

export interface GameStats {
  uid: string;
  totalGames: number;
  totalScore: number;
  averageDistance: number;
  bestScore: number;
  bestDistance: number;
  gamesHistory: GameRecord[];
  streakCount: number;
  lastPlayedDate: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
export interface GameRecord {
  date: string;
  spotId: string;
  distance: number;
  score: number;
  guessCoordinates: [number, number];
  correctCoordinates: [number, number];
  playedAt: Timestamp;
}

function getTodayLocalDate(): string {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function createUserStats(uid: string): Promise<void> {
  const userStatsRef = doc(db, "userStats", uid);
  const initialStats: GameStats = {
    uid,
    totalGames: 0,
    totalScore: 0,
    averageDistance: 0,
    bestScore: 0,
    bestDistance: Infinity,
    gamesHistory: [],
    streakCount: 0,
    lastPlayedDate: "",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  await setDoc(userStatsRef, initialStats);
}

export async function getUserStats(uid: string): Promise<GameStats | null> {
  try {
    const userStatsRef = doc(db, "userStats", uid);
    const docSnap = await getDoc(userStatsRef);

    if (docSnap.exists()) {
      return docSnap.data() as GameStats;
    } else {
      await createUserStats(uid);
      return await getUserStats(uid);
    }
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function saveGameToFirestore(
  uid: string,
  distance: number,
  score: number,
  spotId: string,
  guessCoords: [number, number],
  correctCoords: [number, number],
): Promise<void> {
  try {
    const userStatsRef = doc(db, "userStats", uid);
    const currentStats = await getUserStats(uid);

    if (!currentStats) {
      throw new Error("could not retrieve user stats");
    }
    const today = getTodayLocalDate();
    const alreadyPlayed = currentStats.gamesHistory.some(
      (game) => game.date === today && game.spotId === spotId,
    );
    if (alreadyPlayed) {
      return;
    }
    const gameRecord: GameRecord = {
      date: getTodayLocalDate(),
      spotId,
      distance,
      score,
      guessCoordinates: guessCoords,
      correctCoordinates: correctCoords,
      playedAt: Timestamp.now(),
    };

    //Calculate new averages
    const newTotalGames = currentStats.totalGames + 1;
    const newTotalScore = currentStats.totalScore + score;
    const newAverageDistance =
      currentStats.averageDistance * currentStats.totalGames +
      distance / newTotalGames;

    // Check for new records
    const newBestScore = Math.max(currentStats.bestScore, score);
    const newBestDistance = Math.min(currentStats.bestDistance, distance);

    //Check streak (played yesterday or today)

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const newStreakCount =
      currentStats.lastPlayedDate === yesterday
        ? currentStats.streakCount + 1
        : 1;

    await updateDoc(userStatsRef, {
      totalGames: newTotalGames,
      totalScore: newTotalScore,
      averageDistance: newAverageDistance,
      bestScore: newBestScore,
      bestDistance: newBestDistance,
      gamesHistory: arrayUnion(gameRecord),
      streakCount: newStreakCount,
      lastPlayedDate: today,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}

export async function getTodayGameFromFirestore(
  uid: string,
): Promise<GameRecord | null> {
  try {
    const stats = await getUserStats(uid);
    if (!stats) return null;

    const today = getTodayLocalDate();
    const todayGame = stats.gamesHistory.find((game) => game.date === today);

    return todayGame || null;
  } catch (error) {
    console.error("error", error);
    return null;
  }
}
