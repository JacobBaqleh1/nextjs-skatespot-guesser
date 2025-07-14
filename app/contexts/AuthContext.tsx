"use client";

import { onAuthStateChanged, User } from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../utils/firebase";
import { getTodayGameResult } from "../utils/localGameStorage";
import {
  getTodayGameFromFirestore,
  saveGameToFirestore,
} from "../utils/firestoreStats";
import { useRouter } from "next/navigation";
interface AuthContextType {
  user: User | null;
  loading: boolean;
  migrationComplete: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  migrationComplete: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [migrationComplete, setMigrationComplete] = useState(false);
  const router = useRouter();
  useEffect(() => {
    async function migrateLocalResult() {
      if (user) {
        const localResult = getTodayGameResult();
        if (localResult && localResult.hasPlayed) {
          const firestoreGame = await getTodayGameFromFirestore(user.uid);
          if (!firestoreGame) {
            await saveGameToFirestore(
              user.uid,
              localResult.distance,
              localResult.score,
              localResult.spotId,
              localResult.guessCoordinates,
              localResult.correctCoordinates,
            );
            setMigrationComplete(true);
          }
        }
      }
    }
    migrateLocalResult();
  }, [user]);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, migrationComplete }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
