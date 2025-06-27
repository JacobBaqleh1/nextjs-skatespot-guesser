"use client";

import dynamic from "next/dynamic";
import StreetView from "@/app/components/StreetView";
import { useState, useEffect } from "react";
import SpotFootage from "@/app/components/SpotFootage";
import { getCachedSpotsOrFetch, getTodaysSpot, SkateSpot } from "@/app/utils/firestore";

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
    const [mounted, setMounted] = useState(false); // ✅ Add this

    // ✅ Ensure client-side only
    useEffect(() => {
        setMounted(true);
    }, []);

    // Load today's spot from Firestore
    useEffect(() => {
        if (!mounted) return; // ✅ Only run after mount

        async function loadTodaysSpot() {
            try {
                const spots = await getCachedSpotsOrFetch();
                const todaysSpot = getTodaysSpot(spots);
                setCurrentSpot(todaysSpot);
            } catch (error) {
                console.error('Error loading spots:', error);
            } finally {
                setLoading(false);
            }
        }

        loadTodaysSpot();
    }, [mounted]); // ✅ Depend on mounted

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
            {/* Top menu */}
            <div className="absolute top-0 left-0 w-full flex justify-center z-20 py-2">
                <button
                    className={`mx-2 px-4 py-2 rounded ${view === "streetview" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setView("streetview")}
                >
                    Street View
                </button>
                <button
                    className={`mx-2 px-4 py-2 rounded ${view === "footage" ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                    onClick={() => setView("footage")}
                >
                    Spot Footage
                </button>
            </div>

            {/* Main content - now uses dynamic spot data */}
            <div className="w-full h-screen">
                {view === "streetview"
                    ? <StreetView coordinates={currentSpot.coordinates} />
                    : <SpotFootage spot={currentSpot} />
                }
            </div>

            {/* Map overlay */}
            {isMapVisible && (
                <div
                    className={`absolute bottom-0 left-0 w-full h-[75%] bg-white z-10 transition-transform duration-700 ${isMapVisible ? "translate-y-0" : "translate-y-full"
                        }`}
                    style={{
                        transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
                    }}
                >
                    <MapViewComponent
                        onClose={() => setIsMapVisible(false)}
                        correctCoords={currentSpot.coordinates}
                    />
                </div>
            )}

            {/* Map button */}
            <button
                className="z-1 absolute bottom-4 left-12 bg-lime-500 p-6 rounded-full shadow-md hover:bg-gray-200"
                onClick={() => setIsMapVisible(!isMapVisible)}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-16 h-16"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9 9l10.5-4.5m0 0L15 15m4.5-10.5V15m0 0L9 19.5M15 15l-6 4.5M9 9v10.5m0 0L3 15V4.5l6 4.5z"
                    />
                </svg>
            </button>
        </div>
    );
}