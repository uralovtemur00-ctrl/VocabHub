
"use client";

import { useState, useEffect } from "react";
import { loadWordProgress, saveWordProgress } from "@/lib/words";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
const words = [
  { word: "Beautiful", pronunciation: "/ˈbjuːtɪfəl/", meaning: "Chiroyli, go‘zal", level: "A2" },
  { word: "Improve", pronunciation: "/ɪmˈpruːv/", meaning: "Yaxshilamoq", level: "B1" },
  { word: "Knowledge", pronunciation: "/ˈnɒlɪdʒ/", meaning: "Bilim", level: "B1" },
  { word: "Important", pronunciation: "/ɪmˈpɔːtənt/", meaning: "Muhim", level: "A2" },
  { word: "Journey", pronunciation: "/ˈdʒɜːni/", meaning: "Sayohat", level: "B1" },
  { word: "Confidence", pronunciation: "/ˈkɒnfɪdəns/", meaning: "O‘ziga ishonch", level: "B1" },
  { word: "Amazing", pronunciation: "/əˈmeɪzɪŋ/", meaning: "Ajoyib", level: "A2" },
  { word: "Achieve", pronunciation: "/əˈtʃiːv/", meaning: "Erishmoq", level: "B1" },
  { word: "Believe", pronunciation: "/bɪˈliːv/", meaning: "Ishonmoq", level: "A2" },
  { word: "Challenge", pronunciation: "/ˈtʃælɪndʒ/", meaning: "Qiyinchilik", level: "B1" },
  { word: "Discover", pronunciation: "/dɪˈskʌvə/", meaning: "Kashf qilmoq", level: "B1" },
  { word: "Education", pronunciation: "/ˌedʒuˈkeɪʃən/", meaning: "Ta'lim", level: "A2" },
  { word: "Experience", pronunciation: "/ɪkˈspɪəriəns/", meaning: "Tajriba", level: "B1" },
  { word: "Friendly", pronunciation: "/ˈfrendli/", meaning: "Do‘stona", level: "A2" },
  { word: "Generous", pronunciation: "/ˈdʒenərəs/", meaning: "Saxiy", level: "B1" },
  { word: "Healthy", pronunciation: "/ˈhelθi/", meaning: "Sog‘lom", level: "A2" },
  { word: "Imagine", pronunciation: "/ɪˈmædʒɪn/", meaning: "Tasavvur qilmoq", level: "B1" },
  { word: "Knowledgeable", pronunciation: "/ˈnɒlɪdʒəbəl/", meaning: "Bilimli", level: "B1" },
  { word: "Language", pronunciation: "/ˈlæŋɡwɪdʒ/", meaning: "Til", level: "A2" },
  { word: "Motivation", pronunciation: "/ˌməʊtɪˈveɪʃən/", meaning: "Motivatsiya", level: "B1" },
  { word: "Necessary", pronunciation: "/ˈnesəsəri/", meaning: "Zarur", level: "B1" },
  { word: "Opportunity", pronunciation: "/ˌɒpəˈtjuːnəti/", meaning: "Imkoniyat", level: "B1" },
  { word: "Patient", pronunciation: "/ˈpeɪʃənt/", meaning: "Sabrli", level: "A2" },
  { word: "Quality", pronunciation: "/ˈkwɒləti/", meaning: "Sifat", level: "B1" },
  { word: "Remember", pronunciation: "/rɪˈmembə/", meaning: "Eslamoq", level: "A2" },
  { word: "Successful", pronunciation: "/səkˈsesfəl/", meaning: "Muvaffaqiyatli", level: "B1" },
  { word: "Understand", pronunciation: "/ˌʌndəˈstænd/", meaning: "Tushunmoq", level: "A2" },
  { word: "Valuable", pronunciation: "/ˈvæljuəbəl/", meaning: "Qimmatli", level: "B1" },
  { word: "Wonderful", pronunciation: "/ˈwʌndəfəl/", meaning: "Ajoyib", level: "A2" },
  { word: "Yesterday", pronunciation: "/ˈjestədeɪ/", meaning: "Kecha", level: "A2" },
];

export default function Home() {
  const router = useRouter();
  async function handleLogout() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Logout error:", error);
    return;
  }

  router.push("/login");
}
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState("All");
  const [filterMode, setFilterMode] = useState("all");
  const [learned, setLearned] = useState<string[]>([]);

  const progress = Math.round((learned.length / words.length) * 100);

useEffect(() => {
  async function checkUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      router.replace("/login");
      return;
    }

    try {
      const progress = await loadWordProgress();

      setFavorites(progress.favorites);
      setLearned(progress.learned);
    } catch (error) {
      console.error("Loading error:", error);
    }
  }

  checkUser();
}, [router]);
 function toggleLearned(word: string) {
  const isLearned = !learned.includes(word);

  const updated = isLearned
    ? [...learned, word]
    : learned.filter((item) => item !== word);

  setLearned(updated);

  localStorage.setItem(
    "vocabhub-learned",
    JSON.stringify(updated)
  );

  void saveWordProgress(
    word,
    favorites.includes(word),
    isLearned
  ).catch((error) => console.error("Save error:", error));
}

  const filteredWords = words.filter((item) => {
    const matchesSearch =
      item.word.toLowerCase().includes(search.toLowerCase()) ||
      item.meaning.toLowerCase().includes(search.toLowerCase());

    const matchesLevel =
      selected === "All" || item.level === selected;

const matchesLearned =
  filterMode === "all" ||
  filterMode === "favorites" ||
  (filterMode === "learned" && learned.includes(item.word)) ||
  (filterMode === "unlearned" && !learned.includes(item.word));
    const matchesFavorite =
      filterMode !== "favorites" || favorites.includes(item.word);

    return matchesSearch && matchesLevel && matchesLearned && matchesFavorite;
  });
  function speak(word: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const voice = new SpeechSynthesisUtterance(word);
      voice.lang = "en-US";
      voice.rate = 0.85;
      window.speechSynthesis.speak(voice);
    }
  }



function toggleFavorite(word: string) {
  const isFavorite = !favorites.includes(word);

  const updated = isFavorite
    ? [...favorites, word]
    : favorites.filter((item) => item !== word);

  setFavorites(updated);

  localStorage.setItem(
    "vocabhub-favorites",
    JSON.stringify(updated)
  );

  void saveWordProgress(
    word,
    isFavorite,
    learned.includes(word)
  ).catch((error) => console.error("Save error:", error));

}
    return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
<div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="text-2xl font-black tracking-tight">
            Vocab<span className="text-emerald-400">Hub.</span>
          </h1>
<div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:gap-3">
  <span className="rounded-full border border-emerald-400/30 px-4 py-2 text-sm text-emerald-400">
    English learning platform
  </span>

  <button
    onClick={() => router.push("/profile")}
    className="rounded-full border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10"
  >
    My Profile
  </button>

  <button
    onClick={handleLogout}
    className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
  >
    Logout
  </button>
</div>
        </div>
      </header>

    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="mb-4 font-semibold text-emerald-400">
            YOUR ENGLISH JOURNEY STARTS HERE
          </p>

<h2 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Learn English.
            <br />
            <span className="text-emerald-400">One word at a time.</span>
          </h2>

          <p className="mt-6 text-lg text-slate-400">
            Discover new words, listen to pronunciation and
            improve your English vocabulary every day.
          </p>
        </div>

<div className="mt-8 grid grid-cols-1 gap-4 sm:mt-12 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Available words</p>
            <p className="mt-2 text-3xl font-bold">{words.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Your favorites</p>
            <p className="mt-2 text-3xl font-bold">{favorites.length}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Your level</p>
            <p className="mt-2 text-3xl font-bold">A2 – B1</p>
          </div>
        </div>
<section className="mt-16">
  <div className="mb-8 rounded-2xl border border-white/10 bg-slate-900 p-4 sm:p-6">
    <div className="flex justify-between">
      <h3 className="text-xl font-bold">
        Your learning progress
      </h3>
      <span className="font-bold text-emerald-400">
        {progress}%
      </span>
    </div>

    <p className="mt-2 text-sm text-slate-400">
      {learned.length} / {words.length} words learned
    </p>

    <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-emerald-400 transition-all"
        style={{ width: `${progress}%` }}
      />
    </div>
  </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
     <h3 className="text-2xl font-bold sm:text-3xl">Vocabulary</h3>            <p className="mt-2 text-slate-400">
                Learn new English words and their meanings.
              </p>
            </div>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search English words or translations..."
            className="mt-8 w-full rounded-xl border border-white/10 bg-slate-900 px-5 py-4 text-white outline-none placeholder:text-slate-500 focus:border-emerald-400"
          />

          <div className="mt-5 flex gap-3">
            {["All", "A2", "B1"].map((level) => (
              <button
                key={level}
                onClick={() => setSelected(level)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition ${
                  selected === level
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
          
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              { label: "All words", value: "all" },
              { label: "❤️ Favorites", value: "favorites" },
              { label: "✓ Learned", value: "learned" },
              { label: "Unlearned", value: "unlearned" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterMode(filter.value)}
                className={`rounded-full px-5 py-2 ${
                  filterMode === filter.value
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {filteredWords.map((item, index) => (
              <div
             key={`${item.word}-${index}`}
                className="rounded-2xl border border-white/10 bg-slate-900 p-6 transition hover:border-emerald-400/50"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs text-emerald-400">
                      {item.level}
                    </span>
                    <h4 className="mt-4 text-2xl font-bold">
                      {item.word}
                    </h4>
                    <p className="mt-1 text-sm text-slate-400">
                      {item.pronunciation}
                    </p>
                    <p className="mt-4 text-lg text-slate-200">
                      {item.meaning}
                    </p>
                  </div>

                  <button
                    onClick={() => toggleFavorite(item.word)}
                    className="text-2xl text-emerald-400"
                    aria-label="Toggle favorite"
                  >
                    {favorites.includes(item.word) ? "♥" : "♡"}
                  </button>
                </div>

                <button
                  onClick={() => speak(item.word)}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-3 font-bold text-slate-950 transition hover:bg-emerald-300"
                >
                  🔊 Listen to pronunciation
                </button>
                <button
  onClick={() => toggleLearned(item.word)}
  className="mt-5 w-full rounded-xl border border-emerald-400 py-3 font-semibold text-emerald-400"
>
  {learned.includes(item.word) ? "✓ Learned" : "Mark as learned"}
</button>
              </div>
            ))}
          </div>

          {filteredWords.length === 0 && (
            <p className="mt-8 text-center text-slate-400">
              No words found. Try another search.
            </p>
          )}
        </section>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-slate-500">
        © 2026 VocabHub. Learn English with confidence.
      </footer>
    </main>
  );
}
