"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { completeGoogleProfile } from "@/lib/auth";
import { useAuth } from "@/lib/auth-context";
import { LoadingSkeleton } from "@/components/RequireAuth";
import { BATCH_OPTIONS, type Batch } from "@/types/user";

const AVATAR_OPTIONS = ["🧠", "🔬", "🧬", "⚡", "🌱", "🦋"];

export default function CompleteProfilePage() {
  const router = useRouter();
  const { user, loading, refreshUserDoc } = useAuth();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [batch, setBatch] = useState<Batch>(BATCH_OPTIONS[0]);
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <LoadingSkeleton />;

  if (!user) {
    router.replace("/login");
    return <LoadingSkeleton />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setSubmitting(true);
    try {
      await completeGoogleProfile(user.uid, {
        displayName: displayName || user.displayName || "Student",
        batch,
        avatarEmoji,
      });
      await refreshUserDoc();
      router.push("/");
    } catch {
      setError("Couldn't save your profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#150C2B] px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-space-grotesk)] mb-2 text-center text-2xl text-white">
          Complete your profile
        </h1>
        <p className="mb-8 text-center text-sm text-white/50">
          Just a few details before you get started.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Display name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/30"
          />

          <select
            value={batch}
            onChange={(e) => setBatch(e.target.value as Batch)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white outline-none focus:border-white/30"
          >
            {BATCH_OPTIONS.map((option) => (
              <option key={option} value={option} className="bg-[#150C2B]">
                Batch {option}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            {AVATAR_OPTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => setAvatarEmoji(emoji)}
                className={`h-10 w-10 rounded-full text-lg transition ${
                  avatarEmoji === emoji
                    ? "bg-white/90"
                    : "bg-white/5 hover:bg-white/10"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-white/90 py-2.5 font-medium text-[#150C2B] transition hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Saving…" : "Continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
