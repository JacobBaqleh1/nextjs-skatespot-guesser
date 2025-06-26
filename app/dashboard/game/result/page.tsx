"use client";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect } from "react";
import { saveGameResult } from "@/app/utils/localGameStorage";

const NYC_COORDS = [40.7128, -74.006];

function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lat2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMiles = distanceKm * 0.621371;

    return Math.round(distanceMiles); // Round to whole number
}

// Dynamically import ResultMap to avoid SSR issues with leaflet
const ResultMap = dynamic(() => import("@/app/components/ResultMap"), { ssr: false });

export default function ResultPage() {
    const params = useSearchParams();
    const router = useRouter();
    const lat = parseFloat(params.get("lat") || "0");
    const lng = parseFloat(params.get("lng") || "0");
    const [nycLat, nycLng] = NYC_COORDS;
    const distance = getDistanceInMiles(lat, lng, nycLat, nycLng);

    useEffect(() => {
        saveGameResult(distance);
    }, [distance]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-2">
            <h1 className="text-2xl mb-4">Result</h1>
            <ResultMap guess={[lat, lng]} />
            <p className="text-xl font-bold mb-8">
                Your guess was {distance} miles from the correct location
            </p>
            <button
                onClick={() => router.push("/")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow text-lg transition"
            >
                Finish Game
            </button>
        </div>
    );
}