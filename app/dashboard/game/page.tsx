"use client";

import dynamic from "next/dynamic";
import StreetView from "@/app/components/StreetView";
import { useState, useEffect } from "react";
import SpotFootage from "@/app/components/SpotFootage";
import { getTodaysSpot, SkateSpot } from "@/app/utils/firestore";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { getTodayGameFromFirestore } from "@/app/utils/firestoreStats";
import { hasPlayedToday } from "@/app/utils/localGameStorage";

// Dynamically import map (client-only)
const MapViewComponent = dynamic(() => import("@/app/ui/game/mapview"), {
  ssr: false,
  loading: () => <p>Loading map...</p>,
});

export default function Page() {
  const [view, setView] = useState<"streetview" | "footage">("streetview");
  const [isMapVisible, setIsMapVisible] = useState(false);
  const [currentSpot, setCurrentSpot] = useState<SkateSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
const [showIntro, setShowIntro] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  //Redirect if already played today
  useEffect(() => {
    async function checkPlayed() {
      if (user) {
        const todayGame = await getTodayGameFromFirestore(user.uid);
        if (todayGame) {
          router.replace("/dashboard/game/result");
        }
      } else {
        if (hasPlayedToday()) {
          router.replace("/dashboard/game/result");
        }
      }
    }
    checkPlayed();
  }, [user, router]);
  // ✅ Ensure client-side only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load today's spot from Firestore
  useEffect(() => {
    if (!mounted) return;

    async function loadTodaysSpot() {
      try {
        console.log("🎯 Loading today's spot...");
        const todaysSpot = await getTodaysSpot();

        if (todaysSpot) {
          setCurrentSpot(todaysSpot);
          console.log("✅ Today's spot loaded:", todaysSpot);
        } else {
          console.error("❌ Failed to load today's spot");
        }
      } catch (error) {
        console.error("Error loading spots:", error);
      } finally {
        setLoading(false);
      }
    }

    loadTodaysSpot();
  }, [mounted]);

  // ✅ Show loading until mounted and data loaded
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-2xl mb-4">Loading today's spot...</div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!currentSpot) {
    return (
      <div className="flex items-center justify-center h-screen bg-black text-white">
        <div className="text-center">
          <div className="text-2xl mb-4">No spots available</div>
          <div className="text-gray-400">Please try again later</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
{showIntro ? (
<>
<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-900">How To Play</h2>
            <p className="mb-6 text-gray-700">
              Guess the spot by clicking on the map
              <img src="/map.svg" alt="map" className="w-8 h-8 inline-block align-middle mx-1" />
              and placing your pin📍. Click <span className="text-lime-900 font-bold">Spot Footage</span> for skateboarding media. Good luck!
            </p>
            <button
              onClick={() => setShowIntro(false)}
              className="bg-lime-500 hover:bg-lime-600 text-black font-semibold px-6 py-2 rounded-full shadow transition cursor-pointer"
            >
              Got it!
            </button>
          </div>
        </div>
</>
):
null
}

      {/* Main content */}
      <div className="w-full h-screen">
        {view === "streetview" ? (
          <StreetView
            coordinates={{
              lat: currentSpot.coordinates.latitude,
              lng: currentSpot.coordinates.longitude,
            }}
          />
        ) : (
          <SpotFootage spot={currentSpot} />
        )}
      </div>

      {/* Combined Card for Map Button, View Buttons, and Legend (vertical layout) */}
      <div className="z-10 absolute bottom-4 sm:right-14">
        <div className="flex flex-row sm:flex-col items-start gap-4 bg-white rounded-2xl shadow-xl px-5 py-4 border border-gray-200 sm:w-56">
          {/* Map button */}
          <button
            className="hover:bg-lime-400 transition p-4 rounded-full shadow flex items-center justify-center self-center"
            onClick={() => setIsMapVisible(!isMapVisible)}
            aria-label="Show Map"
          >
            <img src="/map.svg" alt="map" className="w-16 h-16"/>
          </button>
          {/* View buttons */}
          <div className="flex flex-row sm:flex-col w-full gap-2 mt-2">
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base shadow transition
                ${
                  view === "streetview"
                    ? "bg-blue-600 text-white scale-105 ring-2 ring-blue-300"
                    : "bg-white text-blue-700 border border-blue-200 hover:bg-blue-50 hover:scale-105"
                }`}
              onClick={() => setView("streetview")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 20v-6m0 0V4m0 10l3-3m-3 3l-3-3"
                />
              </svg>
              Street View
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-base shadow transition
                ${
                  view === "footage"
                    ? "bg-green-600 text-white scale-105 ring-2 ring-green-300"
                    : "bg-white text-green-700 border border-green-200 hover:bg-green-50 hover:scale-105"
                }`}
              onClick={() => setView("footage")}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <rect x="3" y="7" width="18" height="10" rx="2" />
                <path d="M15 11l4-2v6l-4-2" />
              </svg>
              Spot Footage
            </button>
          </div>
          {/* Legend */}
          <div className="hidden sm:flex flex-col gap-2 mt-2">
            <span className="flex items-center gap-2">
              <span className="flex items-center justify-center">
                            <img src="/map.svg" alt="map" className="w-6 h-6"/>

              </span>
              <span className="text-xs text-gray-700">Map</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-blue-600 rounded-full p-1 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 20v-6m0 0V4m0 10l3-3m-3 3l-3-3"
                  />
                </svg>
              </span>
              <span className="text-xs text-gray-700">Street View</span>
            </span>
            <span className="flex items-center gap-2">
              <span className="bg-green-600 rounded-full p-1 flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="7" width="18" height="10" rx="2" />
                  <path d="M15 11l4-2v6l-4-2" />
                </svg>
              </span>
              <span className="text-xs text-gray-700">Footage</span>
            </span>
          </div>
          <div className="hidden sm:block mt-2 text-xs text-gray-500">
            <span className="font-semibold">How to play:</span> Click the map <img src="/map.svg" alt="map" className="w-6 h-6"/>, place your pin and submit your guess!
          </div>
        </div>
      </div>

      {/* Map overlay */}
      {isMapVisible && (
        <div
          className={`absolute bottom-0 left-0 w-full h-[50%] sm:w-1/2 bg-white z-10 transition-transform duration-700 ${
            isMapVisible ? "translate-y-0" : "translate-y-full"
          }`}
          style={{
            transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
          }}
        >
          <MapViewComponent
            onClose={() => setIsMapVisible(false)}
            correctCoords={[
              currentSpot.coordinates.latitude,
              currentSpot.coordinates.longitude,
            ]}
            spotId={currentSpot.id.toString()}
          />
        </div>
      )}
    </div>
  );
}
