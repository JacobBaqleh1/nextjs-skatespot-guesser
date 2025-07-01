"use client";
import { useSearchParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { getTodayGameResult, saveGameResult } from "@/app/utils/localGameStorage";
import { calculateScore, getScoreRating } from "@/app/utils/scoreCalc";
import { useAuth } from "@/app/contexts/AuthContext";
import { signInWithGoogle, signOutUser } from '@/app/utils/auth'
import { saveGameToFirestore } from "@/app/utils/firestore";
// ✅ Fixed Haversine formula
function getDistanceInMiles(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 3959; // Earth radius in MILES (not km!)

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

    return Math.round(distance * 10) / 10;
}

// Dynamically import ResultMap to avoid SSR issues with leaflet
const ResultMap = dynamic(() => import("@/app/components/ResultMap"), { ssr: false });

export default function ResultPage() {
    const params = useSearchParams();
    const router = useRouter();
    const [gameData, setGameData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showAuthPrompt, setShowAuthPrompt] = useState(false);
    const [authLoading, setAuthLoading] = useState(false);
    const [savingToCloud, setSavingToCloud] = useState(false);
    const { user, loading: authContextLoading } = useAuth();

    useEffect(() => {
        const saveToFirestore = async () => {
            if (user && gameData && gameData.isFromUrl && !savingToCloud) {
                setSavingToCloud(true);
                try {
                    await saveGameToFirestore(
                        user.uid,
                        gameData.distance,
                        gameData.score,
                        gameData.spotId,
                        [gameData.lat, gameData.lng],
                        [gameData.correctLat, gameData.correctLng]
                    );
                    console.log('game result save to firestore')
                } catch (error) {
                    console.error('failed to save to firestore', error)
                } finally {
                    setSavingToCloud(false);
                }
            }
        }
        saveToFirestore();
    }, [user, gameData, savingToCloud]);

    useEffect(() => {
        const urlLat = params.get("lat");
        const urlLng = params.get("lng");
        const urlCorrectLat = params.get("correctLat");
        const urlCorrectLng = params.get("correctLng");

        if (urlLat && urlLng && urlCorrectLat && urlCorrectLng) {
            const lat = parseFloat(urlLat);
            const lng = parseFloat(urlLng);
            const correctLat = parseFloat(urlCorrectLat);
            const correctLng = parseFloat(urlCorrectLng);
            const spotId = params.get("spotId") || "unknown";

            const distance = getDistanceInMiles(lat, lng, correctLat, correctLng);
            const score = calculateScore(distance);

            const data = {
                lat, lng, correctLat, correctLng, spotId, distance, score, rating: getScoreRating(score), isFromUrl: true
            }

            setGameData(data);

            saveGameResult(distance, score, spotId, [lat, lng], [correctLat, correctLng]);
            setTimeout(() => setShowAuthPrompt(true), 2000)
            setLoading(false)

        } else {
            const savedResult = getTodayGameResult();

            if (savedResult) {
                const data = {
                    lat: savedResult.guessCoordinates[0],
                    lng: savedResult.guessCoordinates[1],
                    correctLat: savedResult.correctCoordinates[0],
                    correctLng: savedResult.correctCoordinates[1],
                    spotId: savedResult.spotId,
                    distance: savedResult.distance,
                    score: savedResult.score,
                    rating: getScoreRating(savedResult.score),
                    isFromUrl: false
                }

                setGameData(data);
                setLoading(false)
            } else {
                router.push('/');
                return;
            }

        }

    }, [params, router]);

    const handleGoogleSignIn = async () => {
        setAuthLoading(true);
        try {
            const user = await signInWithGoogle();
            if (user) {
                console.log('signed in successfully:', user.displayName);
                setShowAuthPrompt(false);
                // optionally save the game result to Firestore here
            }
        } catch (error: any) {
            console.error('sign-in failed:', error.message)
            alert(error.message)
        } finally {
            setAuthLoading(false);
        }
    }

    const handleSignOut = async () => {
        try {
            await signOutUser();
        } catch (error: any) {
            alert('failed to sign out');
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <div className="text-2xl mb-4">Loading result...</div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    // ✅ Show error only if no data was loaded
    if (!gameData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white">
                <h1 className="text-2xl mb-4">No Result Found</h1>
                <p className="mb-4">No game result available</p>
                <button
                    onClick={() => router.push("/")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded shadow text-lg transition"
                >
                    Go Home
                </button>
            </div>
        );
    }

    return (
        <>

            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">

                <h1 className="text-3xl font-bold mb-6">🎯 Game Result</h1>

                <ResultMap
                    guess={[gameData.lat, gameData.lng]}
                    correctCoords={[gameData.correctLat, gameData.correctLng]}
                />

                {/* Score Display */}
                <div className="text-center mb-8">
                    <p className="text-xl mb-2">
                        You were <span className="font-bold text-yellow-400">{gameData.distance} miles</span> from the skate spot
                    </p>
                    <p className="text-2xl font-bold text-green-400 mb-2">
                        Your score: {gameData.score.toLocaleString()} points!
                    </p>
                    <p className="text-lg text-gray-300">{gameData.rating}</p>
                    {/* Show save status */}
                    {user && (
                        <div className="mt-2">
                            {savingToCloud ? (
                                <p className="text-sm text-yellow-400">
                                    💾 Saving to your account...
                                </p>
                            ) : (
                                <p className="text-sm text-lime-400">
                                    ✅ Saved to your account
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <button
                    onClick={() => router.push("/")}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg shadow text-lg transition font-semibold mb-8"
                >
                    Back to Home
                </button>

                {/* Auth Prompt - only show for fresh results */}
                {showAuthPrompt && gameData.isFromUrl && !user && (
                    <div className="bg-gray-800 rounded-lg p-6 mb-6 max-w-md w-full text-center border border-gray-600">
                        <h3 className="text-xl font-bold mb-4">Want to save your progress?</h3>
                        <p className="text-gray-300 mb-4">Create a free account to track your points and stats</p>

                        <div className="space-y-3">
                            <button
                                onClick={handleGoogleSignIn}
                                disabled={authLoading}
                                className="w-full bg-white text-black px-4 py-3 rounded font-semibold hover:bg-gray-100 transition flex items-center justify-center"

                            >
                                {authLoading ? (
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin mr-2" />)
                                    :
                                    (<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                    </svg>)
                                }

                                {authLoading ? 'Signing in...' : 'Continue with Google'}
                            </button>

                            <button className="w-full bg-gray-700 text-white px-4 py-3 rounded font-semibold hover:bg-gray-600 transition">
                                Other signup options
                            </button>

                            <button
                                onClick={() => setShowAuthPrompt(false)}
                                className="w-full text-gray-400 hover:text-white transition"
                            >
                                Maybe later
                            </button>
                        </div>
                    </div>
                )}
                {/* Success message for signed-in users */}
                {user && gameData.isFromUrl && (
                    <div className="bg-green-800 rounded-lg p-4 mb-6 max-w-md w-full text-center border border-green-600">
                        <h3 className="text-lg font-bold mb-2">Great job, {user.displayName}! 🎉</h3>
                        <p className="text-green-300 text-sm">Your stats have been updated</p>
                    </div>
                )}

            </div>
        </>
    );
}