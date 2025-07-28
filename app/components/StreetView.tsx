"use client";

/// <reference types="google.maps" />

import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";
interface StreetViewProps {
  coordinates: {
    lat: number;
    lng: number;
  };
}
export default function StreetView({ coordinates }: StreetViewProps) {
  const streetViewRef = useRef<HTMLDivElement>(null);
  const hasRendered = useRef(false); // ✅ Fixed the rate limiting issue
  const panoramaRef = useRef<google.maps.StreetViewPanorama | null>(null);

  useEffect(() => {
    if (hasRendered.current) return;
    hasRendered.current = true;

    const loader = new Loader({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
      version: "weekly",
    });

    loader
      .load()
      .then(() => {
        if (!streetViewRef.current) {
          console.warn("Street View ref is null");
          return;
        }

        const svService = new google.maps.StreetViewService();
        const targetLocation = {
          lat: coordinates.lat,
          lng: coordinates.lng,
        };

        svService.getPanorama(
          { location: targetLocation, radius: 100 },
          (data, status) => {
            if (status === google.maps.StreetViewStatus.OK) {
              panoramaRef.current = new google.maps.StreetViewPanorama(
                streetViewRef.current!,
                {
                  position: data?.location?.latLng,
                  pov: { heading: 165, pitch: 0 },
                  zoom: 1,
                  addressControl: false,
                },
              );
            } else {
              console.warn("No Street View available at this location.");
            }
          },
        );
      })
      .catch((error) => {
        console.error("Error loading Google Maps API:", error);
      });

    // Cleanup function
    return () => {
      if (panoramaRef.current) {
        panoramaRef.current = null;
      }
    };
  }, [coordinates]);

  return (
    <div className="relative w-full h-screen">
      <div ref={streetViewRef} className="w-full h-full" />
    </div>
  );
}
