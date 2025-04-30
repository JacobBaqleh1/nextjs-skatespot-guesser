'use client';

/// <reference types="google.maps" />

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function StreetView() {
    const streetViewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!, // Store your API key in .env
            version: 'weekly',
        });

        loader.load().then(() => {
            if (!streetViewRef.current) return;

            const panorama = new google.maps.StreetViewPanorama(streetViewRef.current, {
                position: { lat: 37.86926, lng: -122.254811 }, // Default location
                pov: { heading: 165, pitch: 0 },
                zoom: 1,
                addressControl: false,
            });
        }).catch((error) => {
            console.error('Error loading Google Maps API:', error);
        });
    }, []);

    return <div className="relative w-full h-screen">
        {/* Street View Container */}
        <div ref={streetViewRef} className="w-full h-full" />

        {/* Button with SVG */}
        <button
            className="z-1 absolute bottom-4 left-12 bg-lime-500 p-6 rounded-full shadow-md hover:bg-gray-200 "
            onClick={() => console.log('Map button clicked!')}
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
}