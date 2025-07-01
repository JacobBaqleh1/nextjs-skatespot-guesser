'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import { signInWithGoogle, signOutUser } from '@/app/utils/auth';

export default function Navbar() {
    const { user } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOutUser();
            console.log('User signed out successfully');
        } catch (error: any) {
            console.error('Sign-out failed:', error.message);
            alert('Failed to sign out');
        }
    };

    return (
        <nav className="w-full bg-gradient-to-br from-gray-900 to-black  z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex  items-center justify-end h-16">


                    {/* User Section */}
                    <div className="flex items-center space-x-4">
                        {user ? (
                            <>
                                <button
                                    onClick={() => router.push('/stats')}
                                    className="text-sm text-gray-300 hover:text-white transition"
                                >
                                    📊 Stats
                                </button>
                                <div className="text-sm text-gray-300">
                                    Welcome, {user.displayName || user.email}!
                                </div>
                                <button
                                    onClick={handleSignOut}
                                    className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="text-sm text-gray-400">
                                <button
                                    onClick={signInWithGoogle}
                                >Sign In / Sign Up</button>

                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}