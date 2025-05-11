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

const NYC_COORDS: LatLngExpression = [40.7128, -74.006]; // New York

function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    const distanceMiles = distanceKm * 0.621371;

    return Math.round(distanceMiles * 10) / 10; // Round to 1 decimal
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

export default function MapView({ onClose }: { onClose: () => void }) {
    const [guessCoords, setGuessCoords] = useState<LatLngExpression | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [distance, setDistance] = useState<number | null>(null);

    const handleMapClick = (latlng: LatLngExpression) => {
        setGuessCoords(latlng);
        setSubmitted(false);
        setDistance(null);
    };

    const handleSubmit = () => {
        setSubmitted(true);
        if (guessCoords) {
            const point = L.latLng(guessCoords);
            const lat1 = point.lat;
            const lon1 = point.lng;
            const [lat2, lon2] = NYC_COORDS as [number, number];
            const dist = getDistanceInMiles(lat1, lon1, lat2, lon2);
            setDistance(dist);
        }
    };

    return (
        <div className="relative w-full h-full">
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full shadow-md hover:bg-red-600 z-[1000]"
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

                {/* NYC marker + polyline */}
                {submitted && (
                    <>
                        <Marker position={NYC_COORDS} />
                        {guessCoords && (
                            <Polyline positions={[guessCoords, NYC_COORDS]} color="red" />
                        )}
                    </>
                )}
            </MapContainer>

            {/* Submit button */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[1000]">
                <button
                    onClick={handleSubmit}
                    disabled={!guessCoords} // Disable button if no pin is placed
                    className={`px-4 py-2 rounded shadow text-white  ${guessCoords
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
