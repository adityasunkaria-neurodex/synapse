"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  signInWithEmail,
  signInWithGooglePopup,
  friendlyAuthError,
} from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleEmailLogin(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithEmail(email, password);
      router.push("/");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
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
    <main className="flex min-h-screen items-center justify-center bg-[#150C2B] px-4">
      <div className="w-full max-w-sm">
        <h1 className="font-[family-name:var(--font-space-grotesk)] mb-8 text-center text-2xl text-white">
          Sign in to Synapse
        </h1>

        <form onSubmit={handleEmailLogin} className="flex flex-col gap-4">
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
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-white/30"
          />

          {error && <p className="text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-white/90 py-2.5 font-medium text-[#150C2B] transition hover:bg-white disabled:opacity-50"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-white/30">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs">or</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={submitting}
          className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-white underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
