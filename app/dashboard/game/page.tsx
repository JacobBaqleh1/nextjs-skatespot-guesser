"use client";


import dynamic from "next/dynamic";
import StreetView from "@/app/components/StreetView";
import { useState } from "react";
import SpotFootage from "@/app/components/SpotFootage";


// Dynamically import map (client-only)
const MapViewComponent = dynamic(() => import("@/app/ui/game/mapview"), {
    ssr: false,
    loading: () => <p>Loading map...</p>,
});
export default function Page() {
    const [view, setView] = useState<"streetview" | "footage">("streetview");
    const [isMapVisible, setIsMapVisible] = useState(false);

    return (
        <div className="min-h-screen ">

            {/* Top menu */}
            <div className="absolute top-0 left-0 w-full flex justify-center z-20 bg-white/80 py-2">
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

            {/* Main content */}
            <div className="w-full h-screen">
                {view === "streetview" ? <StreetView /> : <SpotFootage />}
            </div>
            <div className={`absolute bottom-0 left-0 w-full h-[75%] bg-white z-10 transition-transform duration-700 ${isMapVisible ? "translate-y-0" : "translate-y-full"
                }`}
                style={{
                    transitionTimingFunction: "cubic-bezier(0.68, -0.55, 0.27, 1.55)", // Bouncy effect
                }}>
                <MapViewComponent onClose={() => setIsMapVisible(!isMapVisible)} />
            </div>
            {/* Button with SVG */}
            <button
                className="z-1 absolute bottom-4 left-12 bg-lime-500 p-6 rounded-full shadow-md hover:bg-gray-200 "
                onClick={() => setIsMapVisible(!isMapVisible)}
            >
                {/* SVG of a map */}
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









{/* <h1 className="hidden sm:block">need to be in mobile view</h1> */ }
{/* Mobile View */ }
{/* <section className="sm:hidden">
                <p className="text-center font-semibold mt-4">Mobile Game Page</p> */}

{/* Spot image */ }
{/* <div className="w-full flex justify-center p-4">
                    <Image alt="spot" src={spot} className="max-w-full h-auto" />
                </div> */}

{/* Map View */ }
{/* <div className="w-full h-[500px] relative">
                    <MapViewComponent />
                </div>
            </section> */}