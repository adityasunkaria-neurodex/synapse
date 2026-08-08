"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUpWithEmail, signInWithGooglePopup, friendlyAuthError } from "@/lib/auth";
import { BATCH_OPTIONS, type Batch } from "@/types/user";

const AVATAR_OPTIONS = ["🧠", "🔬", "🧬", "⚡", "🌱", "🦋"];

export default function SignupPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [batch, setBatch] = useState<Batch>(BATCH_OPTIONS[0]);
  const [avatarEmoji, setAvatarEmoji] = useState(AVATAR_OPTIONS[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailSignup(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signUpWithEmail(email, password, { displayName, batch, avatarEmoji });
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignup() {
    setError(null);
    setSubmitting(true);
    try {
      const { isNewUser } = await signInWithGooglePopup();
      router.push(isNewUser ? "/complete-profile" : "/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#150C2B] px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-space-grotesk)] mb-8 text-center text-2xl text-white">
          Create your Synapse account
        </h1>

        <form onSubmit={handleEmailSignup} className="flex flex-col gap-4">
          <input
            type="text"
            required
            placeholder="Full name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/30"
          />
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/30"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
            {submitting ? "Creating account…" : "Create account"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-white/30">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogleSignup}
          disabled={submitting}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-white underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
