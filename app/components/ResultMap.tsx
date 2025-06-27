"use client";

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap,
    Popup,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useEffect } from "react";
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

// Create custom icons to differentiate guess vs correct location
const guessIcon = new L.Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'guess-marker' // For custom styling
});

const correctIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    iconRetinaUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

function FitBounds({ points }: { points: LatLngExpression[] }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 12
        });
    }, [map, points]);

    return null;
}

export default function ResultMap({
    guess,
    correctCoords,
}: {
    guess: LatLngExpression;
    correctCoords: LatLngExpression;
}) {
    return (
        <div className="w-full">
            {/* Map Legend */}
            <div className="flex justify-center gap-6 mb-3 text-sm">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Your Guess</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Correct Location</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-0.5 bg-red-500"></div>
                    <span>Distance</span>
                </div>
            </div>

            <MapContainer
                center={correctCoords}
                zoom={4}
                className="w-full h-[60vh] rounded-lg shadow-lg mb-6 border border-gray-600"
                scrollWheelZoom={true}
                dragging={true}
                doubleClickZoom={true}
                zoomControl={true}
                touchZoom={true}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Fit bounds to show both markers */}
                <FitBounds points={[guess, correctCoords]} />

                {/* Your guess marker (blue/default) */}
                <Marker
                    position={guess}
                    icon={guessIcon}
                >

                </Marker>

                {/* Correct location marker (green) */}
                <Marker
                    position={correctCoords}
                    icon={correctIcon}
                >

                </Marker>

                {/* Distance line */}
                <Polyline
                    positions={[guess, correctCoords]}
                    color="red"
                    weight={3}
                    opacity={0.7}
                    dashArray="10, 10" // Dashed line for better visibility
                />
            </MapContainer>


        </div>
    );
}