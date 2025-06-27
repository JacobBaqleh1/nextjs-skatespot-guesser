"use client";

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline,
    useMap,
} from "react-leaflet";
import { LatLngExpression } from "leaflet";
import { useEffect } from "react";
import L from "leaflet";

function FitBounds({ points }: { points: LatLngExpression[] }) {
    const map = useMap();

    useEffect(() => {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [20, 20] });
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
        <MapContainer
            center={correctCoords}
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
            <FitBounds points={[guess, correctCoords]} />
            <Marker position={guess} />
            <Marker position={correctCoords} />
            <Polyline positions={[guess, correctCoords]} color="red" />
        </MapContainer>
    );
}