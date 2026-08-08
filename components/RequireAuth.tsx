"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#150C2B]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
        <p className="font-[family-name:var(--font-manrope)] text-sm text-white/50">
          Loading…
        </p>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return <LoadingSkeleton />;
  }

  return <>{children}</>;
}
