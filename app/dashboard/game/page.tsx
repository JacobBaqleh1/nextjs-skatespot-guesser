"use client";

import Image from "next/image";
import spot from "@/public/blubba.png";
import dynamic from "next/dynamic";
import StreetView from "@/app/components/StreetView";


// Dynamically import map (client-only)
const MapViewComponent = dynamic(() => import("@/app/ui/game/mapview"), {
    ssr: false,
    loading: () => <p>Loading map...</p>,
});
export default function Page() {
    return (
        <div className="min-h-screen ">
            <div className="bg-red-200 h-screen ">pop op window</div>
            <StreetView />








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