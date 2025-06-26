'use client';

/// <reference types="google.maps" />

import { useEffect, useRef } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

export default function StreetView() {
    const streetViewRef = useRef<HTMLDivElement>(null);
    let hasRendered = false;

    useEffect(() => {
        if (hasRendered) return;
        hasRendered = true;
        console.log('Loading Google Maps...');

        const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
            version: 'weekly',
        });

        loader.load().then(() => {
            console.log('Google Maps API loaded');

            if (!streetViewRef.current) {
                console.warn('Street View ref is null');
                return;
            }

            const svService = new google.maps.StreetViewService();
            const targetLocation = {
                lat: 45.522182, lng: -122.669530
            };

            console.log('Fetching panorama for:', targetLocation);

            svService.getPanorama(
                { location: targetLocation, radius: 100 },
                (data, status) => {
                    console.log('Panorama status:', status);

                    if (status === google.maps.StreetViewStatus.OK) {
                        console.log('Panorama data:', data);

                        new google.maps.StreetViewPanorama(streetViewRef.current!, {
                            position: data?.location?.latLng,
                            pov: { heading: 165, pitch: 0 },
                            zoom: 1,
                            addressControl: false,
                        });
                    } else {
                        console.warn('No Street View available at this location.');
                    }
                }
            );
        }).catch((error) => {
            console.error('Error loading Google Maps API:', error);
        });
    }, []);

    return <div className="relative w-full h-screen">
        {/* Street View Container */}
        <div ref={streetViewRef} className="w-full h-full" />


    </div>
}