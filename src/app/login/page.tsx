
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Check your email to confirm your account!");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
      } else {
        window.location.href = "/";
      }
    }

    setLoading(false);
  }

  async function handleGoogle() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) setMessage(error.message);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-5 text-white sm:px-5 sm:py-8">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-5 shadow-xl sm:rounded-3xl sm:p-8">
        <h1 className="text-2xl font-black sm:text-3xl">
          Vocab<span className="text-emerald-400">Hub.</span>
        </h1>

        <h2 className="mt-5 text-xl font-bold sm:mt-8 sm:text-2xl">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mt-1.5 text-sm text-slate-400 sm:mt-2 sm:text-base">
          {isSignUp
            ? "Start your English learning journey."
            : "Sign in to continue learning."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3 sm:mt-8 sm:space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-emerald-400 sm:p-4 sm:text-base"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (at least 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-3.5 text-sm outline-none transition focus:border-emerald-400 sm:p-4 sm:text-base"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-400 p-3.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-60 sm:p-4 sm:text-base"
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <div className="my-4 text-center text-xs text-slate-500 sm:my-5 sm:text-sm">
          OR
        </div>

        <button
          onClick={handleGoogle}
          className="w-full rounded-xl border border-white/20 p-3.5 text-sm font-semibold transition hover:bg-slate-800 sm:p-4 sm:text-base"
        >
          Continue with Google
        </button>

        {message && (
          <p className="mt-4 text-center text-sm text-emerald-400">
            {message}
          </p>
        )}

        <p className="mt-5 text-center text-xs text-slate-400 sm:mt-8 sm:text-sm">
          {isSignUp
            ? "Already have an account?"
            : "Don't have an account?"}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage("");
            }}
            className="ml-2 font-bold text-emerald-400"
          >
            {isSignUp ? "Sign in" : "Sign up"}
          </button>
        </p>
      </div>
    </main>
  );
}
