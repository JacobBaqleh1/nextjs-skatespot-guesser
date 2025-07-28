"use client";

import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { signInWithGoogle, signOutUser } from "@/app/utils/auth";

export default function Navbar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  if (pathname === "/dashboard/game") {
    return null;
  }
  const handleSignIn = async () => {
    await signInWithGoogle();
    router.refresh(); // Soft refresh to trigger all effects and UI updates
  };
  const handleSignOut = async () => {
    try {
      await signOutUser();
    } catch (error: any) {
      console.error("Sign-out failed:", error.message);
      alert("Failed to sign out");
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
                  onClick={() => router.push("/")}
                  className="flex items-center gap-2 text-lg font-semibold text-lime-400 hover:text-white px-4 py-1 rounded-full bg-gray-800 hover:bg-lime-500/20 shadow transition-all duration-200 cursor-pointer"
                >
                  Home
                </button>
                <div className="text-sm text-gray-300">
                  Welcome, {user.displayName || user.email}!
                </div>
                <button
                  onClick={handleSignOut}
                  className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="text-sm text-gray-400 cursor-pointer">
                <button onClick={handleSignIn}>Log In</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
