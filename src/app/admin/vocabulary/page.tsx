"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Word = {
  id: number;
  word: string;
  pronunciation: string | null;
  meaning: string;
  level: string;
};

export default function VocabularyAdmin() {
  const router = useRouter();

  const [words, setWords] = useState<Word[]>([]);
  const [word, setWord] = useState("");
  const [pronunciation, setPronunciation] = useState("");
  const [meaning, setMeaning] = useState("");
  const [level, setLevel] = useState("A2");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadWords() {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      setMessage(error.message);
    } else {
      setWords(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error || !data) {
        router.replace("/");
        return;
      }

      await loadWords();
    }

    checkAdmin();
  }, [router]);

  async function addWord(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    const { error } = await supabase.from("vocabulary").insert({
      word,
      pronunciation,
      meaning,
      level,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setWord("");
    setPronunciation("");
    setMeaning("");
    setLevel("A2");
    setMessage("Word added successfully!");

    await loadWords();
  }

async function deleteWord(id: number) {
  const confirmed = window.confirm("Delete this word?");
  if (!confirmed) return;

  const { error } = await supabase
    .from("vocabulary")
    .delete()
    .eq("id", id);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Word deleted successfully!");
  await loadWords();
}

function editWord(item: Word) {
  setEditingId(item.id);
  setWord(item.word);
  setPronunciation(item.pronunciation || "");
  setMeaning(item.meaning);
  setLevel(item.level);

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function updateWord(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (editingId === null) return;

  setMessage("");

  const { error } = await supabase
    .from("vocabulary")
    .update({ word, pronunciation, meaning, level })
    .eq("id", editingId);

  if (error) {
    setMessage(error.message);
    return;
  }

  setEditingId(null);
  setWord("");
  setPronunciation("");
  setMeaning("");
  setLevel("A2");
  setMessage("Word updated successfully!");

  await loadWords();
}

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <button
        onClick={() => router.push("/admin")}
        className="mb-6 text-emerald-400"
      >
        ← Back to Admin
      </button>

      <h1 className="mb-2 text-3xl font-bold text-emerald-400">
        Vocabulary Management
      </h1>

      <p className="mb-8 text-slate-400">
        Add and manage English vocabulary.
      </p>

 <form
 onSubmit={editingId !== null ? updateWord : addWord}
        className="mb-10 max-w-2xl space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
      >
       <h2 className="text-xl font-bold">
  {editingId !== null ? "Edit Word" : "Add New Word"}
</h2>

        <input
          required
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="English word"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
        />

        <input
          value={pronunciation}
          onChange={(e) => setPronunciation(e.target.value)}
          placeholder="Pronunciation"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
        />

        <input
          required
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="Uzbek meaning"
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
        />

        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
        >
          <option value="A1">A1</option>
          <option value="A2">A2</option>
          <option value="B1">B1</option>
          <option value="B2">B2</option>
          <option value="C1">C1</option>
        </select>

        <button
          type="submit"
          className="w-full rounded-xl bg-emerald-500 p-3 font-bold text-white"
        >
{editingId !== null ? "Update Word" : "Add Word"}
        </button>
        {editingId !== null && (
  <button
    type="button"
    onClick={() => {
      setEditingId(null);
      setWord("");
      setPronunciation("");
      setMeaning("");
      setLevel("A2");
      setMessage("");
    }}
    className="w-full rounded-xl bg-slate-700 p-3 font-bold text-white"
  >
    Cancel Edit
  </button>
)}

        {message && (
          <p className="text-sm text-emerald-400">{message}</p>
        )}
      </form>

      <h2 className="mb-4 text-xl font-bold">
        All Words ({words.length})
      </h2>

      <div className="space-y-3">
        {words.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-slate-800 bg-slate-900 p-4"
          >
            <div>
              <h3 className="font-bold">{item.word}</h3>
              <p className="text-sm text-slate-400">{item.meaning}</p>
              <p className="text-xs text-emerald-400">{item.level}</p>
            </div>

<div className="flex gap-2">
  <button
    onClick={() => editWord(item)}
    className="rounded-lg bg-emerald-500/10 px-4 py-2 text-emerald-400"
  >
    Edit
  </button>

  <button
    onClick={() => deleteWord(item.id)}
    className="rounded-lg bg-red-500/10 px-4 py-2 text-red-400"
  >
    Delete
  </button>
</div>
          </div>
        ))}
      </div>
    </main>
  );
}