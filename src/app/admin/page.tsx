
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { user }, error: authError } =
        await supabase.auth.getUser();

      if (authError || !user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        setIsAdmin(false);
      } else {
        setIsAdmin(true);
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Tekshirilmoqda...
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-3 text-slate-400">
          Sizda admin huquqi yo‘q.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-5 rounded-xl bg-emerald-500 px-5 py-3 font-semibold text-white"
        >
          Bosh sahifaga qaytish
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <h1 className="text-3xl font-bold text-emerald-400">
        VocabHub Admin
      </h1>

      <p className="mt-2 text-slate-400">
        Welcome to your admin dashboard.
      </p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
       <Link
  href="/admin/users"
  className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-400"
>
  <h2 className="text-xl font-bold">Users</h2>
  <p className="mt-2 text-sm text-slate-400">
    Manage platform users.
  </p>
</Link>

       <Link
  href="/admin/vocabulary"
  className="block rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-emerald-400"
>
  <h2 className="text-xl font-bold">Vocabulary</h2>
  <p className="mt-2 text-sm text-slate-400">
    Manage English words.
  </p>
</Link>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-bold">Quizzes</h2>
          <p className="mt-2 text-sm text-slate-400">
            Manage vocabulary quizzes.
          </p>
        </div>
      </div>
    </main>
  );
}
