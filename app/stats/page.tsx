'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { getUserStats, GameStats } from '@/app/utils/firestoreStats';

export default function StatsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [stats, setStats] = useState<GameStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (user) {
                try {
                    const userStats = await getUserStats(user.uid);
                    setStats(userStats);
                } catch (error) {
                    console.error('Error fetching stats:', error);
                } finally {
                    setLoading(false);
                }
            } else if (!authLoading) {
                setLoading(false);
            }
        };

        fetchStats();
    }, [user, authLoading]);

    if (authLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-black text-white">
                <div className="text-center">
                    <div className="text-2xl mb-4">Loading stats...</div>
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lime-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
                <h1 className="text-2xl mb-4">Please Sign In</h1>
                <p className="text-gray-300 mb-6">You need to be signed in to view your stats</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
                >
                    Go Home
                </button>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white px-4">
                <h1 className="text-2xl mb-4">No Stats Yet</h1>
                <p className="text-gray-300 mb-6">Play some games to see your stats!</p>
                <button
                    onClick={() => router.push('/')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded"
                >
                    Start Playing
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold mb-8 text-center">📊 Your Stats</h1>

                {/* Main Stats Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-lime-400">{stats.totalGames}</div>
                        <div className="text-gray-300">Games Played</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-green-400">
                            {stats.totalScore.toLocaleString()}
                        </div>
                        <div className="text-gray-300">Total Score</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-yellow-400">
                            {stats.averageDistance.toFixed(1)}mi
                        </div>
                        <div className="text-gray-300">Avg Distance</div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6 text-center">
                        <div className="text-3xl font-bold text-orange-400">{stats.streakCount}</div>
                        <div className="text-gray-300">Current Streak</div>
                    </div>
                </div>

                {/* Best Records */}
                <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">🏆 Best Score</h3>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                                {stats.bestScore.toLocaleString()} points
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-800 rounded-lg p-6">
                        <h3 className="text-xl font-bold mb-4 text-center">🎯 Best Distance</h3>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                                {stats.bestDistance === Infinity ? 'N/A' : `${stats.bestDistance.toFixed(1)} miles`}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Games */}
                <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-bold mb-4">📈 Recent Games</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats.gamesHistory.slice(-10).reverse().map((game, index) => (
                            <div key={index} className="bg-gray-700 rounded p-3 flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">{game.date}</div>
                                    <div className="text-sm text-gray-300">Spot: {game.spotId}</div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-green-400">
                                        {game.score.toLocaleString()} pts
                                    </div>
                                    <div className="text-sm text-yellow-400">
                                        {game.distance.toFixed(1)} miles
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => router.push('/')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
}