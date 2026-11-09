"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

type User = {
  id: string;
  email: string | undefined;
  created_at: string;
  last_sign_in_at: string | null;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  useEffect(() => {
    async function loadUsers() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setError("Avval tizimga kiring.");
          return;
        }

        const response = await fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Users yuklanmadi.");
        }

        setUsers(result.users);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Xatolik yuz berdi."
        );
      } finally {
        setLoading(false);
      }
    }

    loadUsers();
  }, []);
  const filteredUsers = users.filter((user) =>
  user.email?.toLowerCase().includes(search.toLowerCase())
);
const sortedUsers = [...filteredUsers].sort((a, b) => {
  const dateA = new Date(a.created_at).getTime();
  const dateB = new Date(b.created_at).getTime();

  return sortOrder === "newest"
    ? dateB - dateA
    : dateA - dateB;
});

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <Link
        href="/admin"
        className="text-emerald-400 hover:underline"
      >
        ← Admin Dashboard
      </Link>

      <h1 className="mt-6 text-3xl font-bold text-emerald-400">
        Users
      </h1>
      <button
  onClick={() => window.location.reload()}
  className="mt-4 rounded-xl bg-emerald-500 px-5 py-2 font-semibold text-white transition hover:bg-emerald-600"
>
  ↻ Refresh Users
</button>

      <p className="mt-2 text-slate-400">
        Registered platform users
      </p>

      {loading ? (
        <p className="mt-8 text-slate-400">Loading users...</p>
      ) : error ? (
        <p className="mt-8 text-red-400">{error}</p>
      ) : (
        <>
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-5">
            <p className="text-sm text-slate-400">Total users</p>
           <p className="mt-2 text-3xl font-bold">
  {users.length}
</p>

<p className="mt-1 text-xs text-slate-500">
  All registered accounts
</p>
          </div>
          <input
  type="text"
  placeholder="Search users by email..."
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white outline-none focus:border-emerald-400"
/>
{search && (
  <button
    onClick={() => setSearch("")}
    className="mb-4 ml-2 rounded-lg bg-slate-800 px-4 py-2 text-sm text-white hover:bg-slate-700"
  >
    Clear search
  </button>
)}
<p className="mb-4 text-sm text-slate-400">
  Showing {filteredUsers.length} of {users.length} users
</p>
<select
  value={sortOrder}
  onChange={(e) => setSortOrder(e.target.value)}
  className="mb-4 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-white"
>
  <option value="newest">Newest first</option>
  <option value="oldest">Oldest first</option>
</select>

          <div className="mt-6 space-y-3">
            {filteredUsers.length === 0 && (
  <p className="py-8 text-center text-slate-400">
    No users found.
  </p>
)}
        {sortedUsers.map((user) => (
              <div
                key={user.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4"
              >
                <p className="font-semibold">
                  {user.email || "No email"}
                </p>
               <div className="mt-2 flex flex-wrap items-center gap-2">
  <p className="break-all text-xs text-slate-500">
    ID: {user.id}
  </p>

  <button
    onClick={() => navigator.clipboard.writeText(user.id)}
    className="rounded-lg bg-slate-800 px-3 py-1 text-xs text-emerald-400 hover:bg-slate-700"
  >
    Copy ID
  </button>
</div>

                <p className="mt-2 text-sm text-slate-400">
                  Registered:{" "}
                  {new Date(user.created_at).toLocaleDateString()}
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Last login:{" "}
                  {user.last_sign_in_at
                    ? new Date(user.last_sign_in_at).toLocaleDateString()
                    : "Never"}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}