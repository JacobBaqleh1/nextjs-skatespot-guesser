"use client";
import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap,
} from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const CorrectCoords: LatLngExpression = [45.522182, -122.669530];

function FitBounds({ points }: { points: LatLngExpression[] }) {
    const map = useMap();
    if (points.length === 2) {
        const bounds = L.latLngBounds(points[0], points[1]);
        map.fitBounds(bounds, { padding: [50, 50] });
    }
    return null;
}

export default function ResultMap({ guess }: { guess: LatLngExpression }) {
    return (
        <MapContainer
            center={CorrectCoords}
            zoom={4}
            className="w-full h-[50vh] rounded shadow mb-6"
            scrollWheelZoom={false}
            dragging={false}
            doubleClickZoom={false}
            zoomControl={false}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FitBounds points={[guess, CorrectCoords]} />
            <Marker position={guess} />
            <Marker position={CorrectCoords} />
            <Polyline positions={[guess, CorrectCoords]} color="red" />
        </MapContainer>
    );
}