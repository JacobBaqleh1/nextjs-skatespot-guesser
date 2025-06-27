import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "./firebase";

// Define TypeScript interface for your actual spot data structure
export interface SkateSpot {
  id: string; // UUID from Firestore
  coordinates: [number, number]; // GeoPoint converted to array
  media: string[]; // Array of Cloudinary URLs
}

// Collection reference for skate spots
const skateSpotsCollection = collection(db, "spot");

// One-time fetch for all spots
export async function getSkateSpotsOnce(): Promise<SkateSpot[]> {
  const q = query(skateSpotsCollection); // Remove orderBy since no name field
  const querySnapshot = await getDocs(q);
  
  const spots: SkateSpot[] = [];
  querySnapshot.forEach((doc) => {
    const data = doc.data();
    
    // Convert Firestore GeoPoint to coordinate array
    const coordinates = data.coordinates 
      ? [data.coordinates.latitude, data.coordinates.longitude] 
      : [0, 0];

    spots.push({
      id: doc.id,
      coordinates: coordinates as [number, number],
      media: data.media || []
    });
  });
  
  return spots;
}

// Get today's spot based on date
export function getTodaysSpot(spots: SkateSpot[]): SkateSpot | null {
  if (spots.length === 0) return null;
  
  // Daily rotation based on date
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);
  const spotIndex = dayOfYear % spots.length;
  
  return spots[spotIndex];
}

// Cache spots in localStorage to reduce Firebase calls
const SPOTS_CACHE_KEY = 'cached_skate_spots';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export async function getCachedSpotsOrFetch(): Promise<SkateSpot[]> {
  if (typeof window === 'undefined') return [];
  
  const cached = localStorage.getItem(SPOTS_CACHE_KEY);
  if (cached) {
    const { spots, timestamp } = JSON.parse(cached);
    const isExpired = Date.now() - timestamp > CACHE_DURATION;
    
    if (!isExpired) {
      console.log('Using cached spots');
      return spots;
    }
  }
  
  console.log('Fetching fresh spots from Firestore');
  const spots = await getSkateSpotsOnce();
  
  // Cache the results
  localStorage.setItem(SPOTS_CACHE_KEY, JSON.stringify({
    spots,
    timestamp: Date.now()
  }));
  
  return spots;
}