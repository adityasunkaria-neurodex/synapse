"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { auth } from "./firebase";
import { fetchUserDoc } from "./auth";
import type { SynapseUser } from "@/types/user";

interface AuthContextValue {
  user: User | null;
  userDoc: SynapseUser | null;
  /** True until BOTH auth state and the userDoc fetch have settled. */
  loading: boolean;
  /** Re-fetch userDoc, e.g. right after completing a profile or changing semester. */
  refreshUserDoc: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<SynapseUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (!firebaseUser) {
        setUserDoc(null);
        setLoading(false);
        return;
      }

      try {
        const doc = await fetchUserDoc(firebaseUser.uid);
        setUserDoc(doc);
      } catch {
        // A brand-new Google user has no users/{uid} doc yet (they're mid
        // /complete-profile) — that's expected, not an error state.
        setUserDoc(null);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  async function refreshUserDoc() {
    if (!user) return;
    const doc = await fetchUserDoc(user.uid);
    setUserDoc(doc);
  }

  return (
    <AuthContext.Provider value={{ user, userDoc, loading, refreshUserDoc }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
