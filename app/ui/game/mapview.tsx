"use client";

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMapEvents,
} from "react-leaflet";
import { useState } from "react";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useRouter } from "next/navigation";

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth radius in MILES (not km!)

    // Convert degrees to radians
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1Rad) * Math.cos(lat2Rad) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

const GuessMarker = ({
    onMapClick,
}: {
    onMapClick: (latlng: LatLngExpression) => void;
}) => {
    useMapEvents({
        click(e) {
            onMapClick(e.latlng);
        },
    });

    return null;
};

export default function MapView({
    onClose,
    correctCoords,
    spotId
}: {
    onClose: () => void;
    correctCoords: [number, number];
    spotId: string;
}) {
    const [guessCoords, setGuessCoords] = useState<LatLngExpression | null>(null);
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);
    const [distance, setDistance] = useState<number | null>(null);

    const correctCoordsLatLng: LatLngExpression = [correctCoords[0], correctCoords[1]];

    const handleMapClick = (latlng: LatLngExpression) => {
        setGuessCoords(latlng);
        setSubmitted(false);
        setDistance(null);
    };

    const handleSubmit = () => {
        if (guessCoords) {
            const point = L.latLng(guessCoords);
            router.push(
                `/dashboard/game/result?lat=${point.lat}&lng=${point.lng}&correctLat=${correctCoords[0]}&correctLng=${correctCoords[1]}&spotId=${spotId}`
            );
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-red-600 z-[1000] cursor-pointer"
            >
                X
            </button>
            <MapContainer
                center={[39.8283, -98.5795]} // Center of the US
                zoom={4}
                className="w-full h-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <GuessMarker onMapClick={handleMapClick} />

                {/* Guess marker */}
                {guessCoords && <Marker position={guessCoords} />}

                {/* Correct location marker + polyline */}
                {submitted && (
                    <>
                        <Marker position={correctCoordsLatLng} />
                        {guessCoords && (
                            <Polyline positions={[guessCoords, correctCoordsLatLng]} color="red" />
                        )}
                    </>
                )}
            </MapContainer>

            {/* Submit button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                <button
                    onClick={handleSubmit}
                    disabled={!guessCoords}
                    className={`px-4 py-2 rounded shadow text-white ${guessCoords
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-blue-400 cursor-not-allowed"
                        }`}
                >
                    {guessCoords ? "Submit Guess" : "Place your pin on the map"}
                </button>
            </div>

            {/* Distance Display */}
            {submitted && distance !== null && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-black p-2 rounded shadow">
                    You were {distance} miles away!
                </div>
            )}
        </div>
    );
}
