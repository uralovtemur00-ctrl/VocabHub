
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
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-5 text-white">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-slate-900 p-8">
        <h1 className="text-3xl font-black">
          Vocab<span className="text-emerald-400">Hub.</span>
        </h1>

        <h2 className="mt-8 text-2xl font-bold">
          {isSignUp ? "Create your account" : "Welcome back"}
        </h2>

        <p className="mt-2 text-slate-400">
          {isSignUp
            ? "Start your English learning journey."
            : "Sign in to continue learning."}
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-4 outline-none focus:border-emerald-400"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Password (at least 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-950 p-4 outline-none focus:border-emerald-400"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-emerald-400 p-4 font-bold text-slate-950"
          >
            {loading
              ? "Please wait..."
              : isSignUp
              ? "Create account"
              : "Sign in"}
          </button>
        </form>

        <div className="my-5 text-center text-slate-500">OR</div>

        <button
          onClick={handleGoogle}
          className="w-full rounded-xl border border-white/20 p-4 font-semibold hover:bg-slate-800"
        >
          Continue with Google
        </button>

        {message && (
          <p className="mt-5 text-center text-sm text-emerald-400">
            {message}
          </p>
        )}

        <p className="mt-8 text-center text-sm text-slate-400">
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
