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

    const router = useRouter();
    const { user } = useAuth();

    //Redirect if already played today
    useEffect(() => {
        async function checkPlayed() {
            if (user) {
                const todayGame = await getTodayGameFromFirestore(user.uid);
                if (todayGame) {
                    router.replace('/dashboard/game/result')
                }
            } else {
                if (hasPlayedToday()) {
                    router.replace('/dashboard/game/result')
                }
            }
        }
        checkPlayed();
    }, [user, router])
    // ✅ Ensure client-side only
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load today's spot from Firestore
    useEffect(() => {
        if (!mounted) return;

        async function loadTodaysSpot() {
            try {
                console.log('🎯 Loading today\'s spot...');
                const todaysSpot = await getTodaysSpot();

                if (todaysSpot) {
                    setCurrentSpot(todaysSpot);
                    console.log('✅ Today\'s spot loaded:', todaysSpot);
                } else {
                    console.error('❌ Failed to load today\'s spot');
                }
            } catch (error) {
                console.error('Error loading spots:', error);
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
            {/* Main content */}
            <div className="w-full h-screen">
                {view === "streetview"
                    ? <StreetView coordinates={{
                        lat: currentSpot.coordinates.latitude,
                        lng: currentSpot.coordinates.longitude
                    }} />
                    : <SpotFootage spot={currentSpot} />
                }
            </div>

            {/* Map and View Buttons - bottom left */}
            <div className="z-10 absolute bottom-4 left-12 flex items-center space-x-4">
                {/* Map button */}
                <button
                    className="bg-lime-500 p-6 rounded-full shadow-md hover:bg-lime-400 flex items-center justify-center cursor-pointer"
                    onClick={() => setIsMapVisible(!isMapVisible)}
                    aria-label="Show Map"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-8 h-8"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 9l10.5-4.5m0 0L15 15m4.5-10.5V15m0 0L9 19.5M15 15l-6 4.5M9 9v10.5m0 0L3 15V4.5l6 4.5z"
                        />
                    </svg>
                </button>
                {/* View buttons as a segmented control */}
                <div className="flex flex-col sm:flex-row bg-gray-100 rounded-full shadow-inner overflow-hidden border border-gray-300">
                    <button
                        className={`flex items-center gap-2 px-5 py-2 font-semibold transition 
                ${view === "streetview"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-transparent text-gray-700 hover:bg-blue-100"
                            }`}
                        onClick={() => setView("streetview")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 20v-6m0 0V4m0 10l3-3m-3 3l-3-3" />
                        </svg>
                        Street View
                    </button>
                    <button
                        className={`flex items-center gap-2 px-5 py-2 font-semibold transition 
                ${view === "footage"
                                ? "bg-blue-600 text-white shadow"
                                : "bg-transparent text-gray-700 hover:bg-blue-100"
                            }`}
                        onClick={() => setView("footage")}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <rect x="3" y="7" width="18" height="10" rx="2" />
                            <path d="M15 11l4-2v6l-4-2" />
                        </svg>
                        Spot Footage
                    </button>
                </div>
            </div>

            {/* Map overlay */}
            {isMapVisible && (
                <div
                    className={`absolute bottom-0 left-0 w-full h-[50%] sm:w-1/2 bg-white z-10 transition-transform duration-700 ${isMapVisible ? "translate-y-0" : "translate-y-full"
                        }`}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
                    }}
                >
                    <MapViewComponent
                        onClose={() => setIsMapVisible(false)}
                        correctCoords={[
                            currentSpot.coordinates.latitude,
                            currentSpot.coordinates.longitude
                        ]}
                        spotId={currentSpot.id.toString()}
                    />
                </div>
            )}
        </div>
    );
}