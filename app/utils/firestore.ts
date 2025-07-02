import { collection, getDocs, doc, setDoc, updateDoc, increment, arrayUnion, Timestamp, getDoc } from "firebase/firestore";
import { db } from "./firebase";

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

export interface SkateSpot {
  id: number;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  media: string[];
}

export async function createUserStats(uid: string): Promise<void> {
  const userStatsRef = doc(db, 'userStats', uid);
  const initialStats: GameStats = {
    uid,
    totalGames: 0,
    totalScore: 0,
    averageDistance: 0,
    bestScore: 0,
    bestDistance: Infinity,
    gamesHistory: [],
    streakCount: 0,
    lastPlayedDate: '',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };

  await setDoc(userStatsRef, initialStats)
}

export async function getUserStats(uid: string): Promise<GameStats | null> {
  try {
    const userStatsRef = doc(db, 'userStats', uid);
    const docSnap = await getDoc(userStatsRef);

    if (docSnap.exists()) {
      return docSnap.data() as GameStats;
    } else {
      await createUserStats(uid);
      return await getUserStats(uid);
    }

  } catch (error) {
    console.error(error)
    return null
  }
}

export async function saveGameToFirestore(
  uid: string,
  distance: number,
  score: number,
  spotId: string,
  guessCoords: [number, number],
  correctCoords: [number, number]
): Promise<void> {
  try {
    const userStatsRef = doc(db, 'userStats', uid);
    const currentStats = await getUserStats(uid);

    if (!currentStats) {
      throw new Error('could not retrieve user stats')
    }

    const gameRecord: GameRecord = {
      date: new Date().toISOString().split('T')[0],
      spotId,
      distance,
      score,
      guessCoordinates: guessCoords,
      correctCoordinates: correctCoords,
      playedAt: Timestamp.now()
    };

    //Calculate new averages
    const newTotalGames = currentStats.totalGames + 1;
    const newTotalScore = currentStats.totalScore + score;
    const newAverageDistance = ((currentStats.averageDistance * currentStats.totalGames) + distance / newTotalGames);

    // Check for new records
    const newBestScore = Math.max(currentStats.bestScore, score);
    const newBestDistance = Math.min(currentStats.bestDistance, distance);

    //Check streak (played yesterday or today)
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const newStreakCount = (currentStats.lastPlayedDate === yesterday) ? currentStats.streakCount + 1 : 1;

    await updateDoc(userStatsRef, {
      totalGames: newTotalGames,
      totalScore: newTotalScore,
      averageDistance: newAverageDistance,
      bestScore: newBestScore,
      bestDistance: newBestDistance,
      gamesHistory: arrayUnion(gameRecord),
      streakCount: newStreakCount,
      lastPlayedDate: today,
      updatedAt: Timestamp.now()
    })
    console.log('game saved to firestore successfully')





  } catch (error) {
    console.error('error', error);
    throw error;
  }
}

export async function getTodayGameFromFirestore(uid: string): Promise<GameRecord | null> {
  try {
    const stats = await getUserStats(uid);
    if (!stats) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayGame = stats.gamesHistory.find(game => game.date === today);

    return todayGame || null;
  } catch (error) {
    console.error('error', error);
    return null;
  }
}

// Get today's spot based on sequential ID rotation
// ✅ UPDATED: More robust date calculation
export function getTodaysSpotId(totalSpots: number): number {
  const today = new Date();

  // Use UTC to avoid timezone issues
  const year = today.getFullYear();
  const month = today.getMonth(); // 0-indexed (Jan = 0)
  const day = today.getDate();    // 1-indexed (1st = 1)

  // Calculate day of year more reliably
  const startOfYear = new Date(year, 0, 1); // Jan 1st of current year
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));

  const spotId = (dayOfYear % totalSpots) + 1;

  console.log(`Today (${today.toDateString()}) is day ${dayOfYear} of the year, showing spot ${spotId}`);
  return spotId;
}

// Get all spots from Firestore
export async function getAllSpots(): Promise<SkateSpot[]> {
  try {
    const spotsCollection = collection(db, 'spot');
    const spotsSnapshot = await getDocs(spotsCollection);

    const spots: SkateSpot[] = [];
    spotsSnapshot.forEach((doc) => {
      const data = doc.data();

      let latitude: number = 0;
      let longitude: number = 0;

      if (data.coordinates) {
        // If coordinates is an array with a GeoPoint object
        if (Array.isArray(data.coordinates) && data.coordinates.length > 0) {
          const geo = data.coordinates[0];
          if (geo && typeof geo.latitude === "function" && typeof geo.longitude === "function") {
            // Firestore GeoPoint methods
            latitude = geo.latitude();
            longitude = geo.longitude();
          } else if (typeof geo._lat === "number" && typeof geo._long === "number") {
            // Internal GeoPoint properties
            latitude = geo._lat;
            longitude = geo._long;
          }
        }
        // If coordinates is a GeoPoint object directly
        else if (typeof data.coordinates.latitude === "function" && typeof data.coordinates.longitude === "function") {
          latitude = data.coordinates.latitude();
          longitude = data.coordinates.longitude();
        } else if (typeof data.coordinates._lat === "number" && typeof data.coordinates._long === "number") {
          latitude = data.coordinates._lat;
          longitude = data.coordinates._long;
        }
        // If coordinates is an object with number properties
        else if (typeof data.coordinates.latitude === "number" && typeof data.coordinates.longitude === "number") {
          latitude = data.coordinates.latitude;
          longitude = data.coordinates.longitude;
        }
      }

      spots.push({
        id: data.id,
        coordinates: { latitude, longitude },
        media: data.media || []
      });
    });

    spots.sort((a, b) => a.id - b.id);
    console.log(`Loaded ${spots.length} spots from Firestore`);

    return spots;
  } catch (error) {
    console.error('Error fetching spots:', error);
    return [];
  }

}

// Get today's specific spot
export async function getTodaysSpot(totalSpots: number) {
  return 1;
  // try {
  //   const allSpots = await getAllSpots();

  //   if (allSpots.length === 0) {
  //     console.error('No spots found in Firestore');
  //     return null;
  //   }

  //   const todaysSpotId = getTodaysSpotId(allSpots.length);
  //   const todaysSpot = allSpots.find(spot => spot.id === todaysSpotId);

  //   if (!todaysSpot) {
  //     console.error(`Spot with ID ${todaysSpotId} not found`);
  //     return allSpots[0]; // Fallback to first spot
  //   }

  //   console.log(`Today's spot: ID ${todaysSpot.id}`, todaysSpot);
  //   return todaysSpot;
  // } catch (error) {
  //   console.error('Error getting today\'s spot:', error);
  //   return null;
  // }
}

// Cache spots in localStorage to reduce Firestore calls
export async function getCachedSpotsOrFetch(): Promise<SkateSpot[]> {
  const cached = localStorage.getItem('cached_spots');
  const cacheTimestamp = localStorage.getItem('spots_cache_timestamp');
  const now = Date.now();
  const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

  if (cached && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
    console.log('Using cached spots');
    return JSON.parse(cached);
  }

  console.log('Fetching fresh spots from Firestore');
  const spots = await getAllSpots();

  localStorage.setItem('cached_spots', JSON.stringify(spots));
  localStorage.setItem('spots_cache_timestamp', now.toString());

  return spots;
}

// Test function for rotation
// ✅ UPDATED: More robust test function
export function testSpotRotation(dateString: string, totalSpots: number): number {
  // Parse the date more explicitly
  const parts = dateString.split('-');
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]) - 1; // Convert to 0-indexed
  const day = parseInt(parts[2]);

  const testDate = new Date(year, month, day);
  const startOfYear = new Date(year, 0, 1);

  const dayOfYear = Math.floor((testDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
  const spotId = (dayOfYear % totalSpots) + 1;

  console.log(`${dateString} (${testDate.toDateString()}) → Day ${dayOfYear} → Spot ${spotId}`);
  return spotId;
}

