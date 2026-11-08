"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { loadWordProgress } from "@/lib/words";

export default function Profile() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
const [learned, setLearned] = useState<string[]>([]);
const progressPercent = Math.round((learned.length / 30) * 100);

  useEffect(() => {
    async function getProfile() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.replace("/login");
        return;
      }

      setEmail(data.user.email || "");
      setName(
        data.user.user_metadata?.full_name ||
        data.user.user_metadata?.name ||
        "VocabHub User"
      );
      const progress = await loadWordProgress();

setFavorites(progress.favorites);
setLearned(progress.learned);
    }
    getProfile();
  }, [router]);

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-white/10 bg-slate-900 p-8">
        <h1 className="text-3xl font-black">
          My Profile
        </h1>

        <p className="mt-8 text-slate-400">Name</p>
        <p className="text-xl font-bold">{name}</p>

        <p className="mt-6 text-slate-400">Email</p>
        <p className="text-lg">{email}</p>
        <div className="mt-8 grid grid-cols-2 gap-4">
  <div className="rounded-xl bg-slate-800 p-5">
    <p className="text-sm text-slate-400">Learned words</p>
    <p className="mt-2 text-3xl font-bold text-emerald-400">
      {learned.length}
    </p>
  </div>

  <div className="rounded-xl bg-slate-800 p-5">
    <p className="text-sm text-slate-400">Favorite words</p>
    <p className="mt-2 text-3xl font-bold text-emerald-400">
      {favorites.length}
    </p>
  </div>
</div>
<div className="mt-8 rounded-xl bg-slate-800 p-5">
  <div className="flex justify-between">
    <p className="font-semibold">Learning Progress</p>
    <p className="font-bold text-emerald-400">
      {progressPercent}%
    </p>
  </div>

  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-700">
    <div
      className="h-full rounded-full bg-emerald-400 transition-all"
      style={{ width: `${progressPercent}%` }}
    />
  </div>
</div>
<button
  onClick={handleLogout}
  className="mt-4 w-full rounded-xl border border-red-500 px-6 py-3 font-bold text-red-400 hover:bg-red-500/10"
>
  Logout
</button>
        <button
          onClick={() => router.push("/")}
          className="mt-8 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950"
        >
          Back to VocabHub
        </button>
      </div>
    </main>
  );
}