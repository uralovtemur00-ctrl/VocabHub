
"use client";

import { useState, useEffect } from "react";
import { loadWordProgress, saveWordProgress } from "@/lib/words";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Word = {
  id: number;
  word: string;
  pronunciation: string | null;
  meaning: string;
  level: string;
};

type QuizOption = {
  key: string;
  text: string;
};

type QuizQuestion = {
  id: number;
  question: string;
  options: QuizOption[];
  correctAnswer: string;
};

const answerKeys = ["A", "B", "C", "D"];

function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

export default function Home() {
  const router = useRouter();

  const [words, setWords] = useState<Word[]>([]);
  const [wordsLoading, setWordsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selected, setSelected] = useState("All");
  const [filterMode, setFilterMode] = useState("all");
  const [learned, setLearned] = useState<string[]>([]);

  // Automatic quiz states
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizLevel, setQuizLevel] = useState("All");
  const [quizError, setQuizError] = useState("");

  const [quizStarted, setQuizStarted] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [quizAnswer, setQuizAnswer] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");

  const progress =
    words.length === 0
      ? 0
      : Math.round((learned.length / words.length) * 100);

  async function loadVocabulary() {
    const { data, error } = await supabase
      .from("vocabulary")
      .select("id, word, pronunciation, meaning, level")
      .order("id", { ascending: true });

    if (error) {
      console.error("Vocabulary loading error:", error.message);
      setWords([]);
    } else {
      setWords(data ?? []);
    }

    setWordsLoading(false);
  }

  useEffect(() => {
    async function checkUser() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.replace("/login");
        return;
      }

      try {
        const savedProgress = await loadWordProgress();

        setFavorites(savedProgress.favorites);
        setLearned(savedProgress.learned);

        await loadVocabulary();
      } catch (error) {
        console.error("Loading error:", error);
        setWordsLoading(false);
      }
    }

    checkUser();
  }, [router]);

  // Generate quiz automatically from vocabulary
  function startQuiz() {
    const availableWords =
      quizLevel === "All"
        ? words
        : words.filter(
            (item) =>
              item.level.toUpperCase() === quizLevel.toUpperCase()
          );

    const uniqueWords = availableWords.filter(
      (item, index, array) =>
        item.word.trim() &&
        item.meaning.trim() &&
        array.findIndex(
          (other) =>
            other.meaning.trim().toLowerCase() ===
            item.meaning.trim().toLowerCase()
        ) === index
    );

    if (uniqueWords.length < 4) {
      setQuizError(
        "This level needs at least 4 words with different meanings. Please add more vocabulary."
      );
      return;
    }

    const selectedWords = shuffle(uniqueWords).slice(0, 10);

    const generatedQuestions: QuizQuestion[] = selectedWords.map(
      (word) => {
        const wrongAnswers = shuffle(
          uniqueWords.filter(
            (item) =>
              item.id !== word.id &&
              item.meaning.trim().toLowerCase() !==
                word.meaning.trim().toLowerCase()
          )
        )
          .slice(0, 3)
          .map((item) => item.meaning);

        const allOptions = shuffle([
          word.meaning,
          ...wrongAnswers,
        ]);

        const options = allOptions.map((text, index) => ({
          key: answerKeys[index],
          text,
        }));

        const correctOption = options.find(
          (option) => option.text === word.meaning
        );

        return {
          id: word.id,
          question: `What is the meaning of "${word.word}"?`,
          options,
          correctAnswer: correctOption?.key ?? "A",
        };
      }
    );

    setQuizQuestions(generatedQuestions);
    setQuizIndex(0);
    setQuizScore(0);
    setQuizAnswer("");
    setCorrectAnswer("");
    setQuizError("");
    setQuizFinished(false);
    setQuizStarted(true);
  }

  // Check answer locally
  function handleQuizAnswer(answer: string) {
    if (quizAnswer !== "" || !quizQuestions[quizIndex]) {
      return;
    }

    const currentQuestion = quizQuestions[quizIndex];

    setQuizAnswer(answer);
    setCorrectAnswer(currentQuestion.correctAnswer);

    if (answer === currentQuestion.correctAnswer) {
      setQuizScore((score) => score + 1);
    }
  }

  function nextQuizQuestion() {
    if (quizIndex === quizQuestions.length - 1) {
      setQuizFinished(true);
    } else {
      setQuizIndex((index) => index + 1);
    }

    setQuizAnswer("");
    setCorrectAnswer("");
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error);
      return;
    }

    router.push("/login");
  }

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

  function speak(word: string) {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();

      const voice = new SpeechSynthesisUtterance(word);
      voice.lang = "en-US";
      voice.rate = 0.85;

      window.speechSynthesis.speak(voice);
    }
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

    return (
      matchesSearch &&
      matchesLevel &&
      matchesLearned &&
      matchesFavorite
    );
  });

  const currentQuiz = quizQuestions[quizIndex];

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <h1 className="text-2xl font-black tracking-tight">
            Vocab<span className="text-emerald-400">Hub.</span>
          </h1>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-emerald-400/30 px-3 py-2 text-xs text-emerald-400 sm:text-sm">
              English learning platform
            </span>

            <button
              onClick={() => router.push("/profile")}
              className="rounded-full border border-white/20 px-3 py-2 text-sm font-semibold hover:bg-white/10"
            >
              My Profile
            </button>

            <button
              onClick={handleLogout}
              className="rounded-full bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-semibold text-emerald-400">
            YOUR ENGLISH JOURNEY STARTS HERE
          </p>

          <h2 className="text-4xl font-black leading-tight sm:text-5xl md:text-6xl">
            Learn English.
            <br />
            <span className="text-emerald-400">
              One word at a time.
            </span>
          </h2>

          <p className="mt-5 text-base text-slate-400 sm:mt-6 sm:text-lg">
            Discover new words, listen to pronunciation and
            improve your English vocabulary every day.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-6">
            <p className="text-sm text-slate-400">Available words</p>
            <p className="mt-2 text-3xl font-bold">{words.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-6">
            <p className="text-sm text-slate-400">Your favorites</p>
            <p className="mt-2 text-3xl font-bold">{favorites.length}</p>
          </div>

          <div className="rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-6">
            <p className="text-sm text-slate-400">Your level</p>
            <p className="mt-2 text-3xl font-bold">A2 – B1</p>
          </div>
        </div>

        <section className="mt-10 sm:mt-16">
          <div className="mb-8 rounded-xl border border-white/10 bg-slate-900 p-4 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold sm:text-xl">
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

          {/* AUTOMATIC QUIZ */}
          <div className="mb-8 rounded-2xl border border-emerald-400/20 bg-slate-900 p-5 sm:p-8">
            <div className="mb-5">
              <span className="text-sm font-semibold text-emerald-400">
                TEST YOUR KNOWLEDGE
              </span>

              <h3 className="mt-2 text-2xl font-bold">
                Automatic Vocabulary Quiz
              </h3>

              <p className="mt-2 text-sm text-slate-400">
                New random questions are generated from your vocabulary.
              </p>
            </div>

            {wordsLoading ? (
              <p className="text-slate-400">
                Loading vocabulary...
              </p>
            ) : !quizStarted ? (
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-300">
                  Choose your level
                </label>

                <select
                  value={quizLevel}
                  onChange={(e) => setQuizLevel(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-white outline-none focus:border-emerald-400 sm:max-w-xs"
                >
                  <option value="All">All levels</option>
                  <option value="A1">A1 - Beginner</option>
                  <option value="A2">A2 - Elementary</option>
                  <option value="B1">B1 - Intermediate</option>
                  <option value="B2">B2 - Upper Intermediate</option>
                </select>

                {quizError && (
                  <p className="mt-4 text-sm text-red-400">
                    {quizError}
                  </p>
                )}

                <button
                  onClick={startQuiz}
                  disabled={words.length < 4}
                  className="mt-5 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Generate New Quiz
                </button>

                <p className="mt-3 text-xs text-slate-500">
                  Up to 10 random questions will be generated.
                </p>
              </div>
            ) : quizFinished ? (
              <div>
                <p className="text-xl font-bold">
                  Quiz completed!
                </p>

                <p className="mt-2 text-slate-300">
                  Your score: {quizScore} / {quizQuestions.length}
                </p>

                <p className="mt-2 text-sm text-emerald-400">
                  {Math.round(
                    (quizScore / quizQuestions.length) * 100
                  )}% correct answers
                </p>

                <button
                  onClick={startQuiz}
                  className="mt-5 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-300"
                >
                  Generate Another Quiz
                </button>

                <button
                  onClick={() => {
                    setQuizStarted(false);
                    setQuizFinished(false);
                    setQuizQuestions([]);
                    setQuizError("");
                  }}
                  className="ml-2 mt-5 rounded-xl border border-white/20 px-6 py-3 font-semibold hover:bg-white/10"
                >
                  Change Level
                </button>
              </div>
            ) : currentQuiz ? (
              <div>
                <div className="mb-4 flex justify-between text-sm text-slate-400">
                  <span>
                    Question {quizIndex + 1} / {quizQuestions.length}
                  </span>

                  <span>Score: {quizScore}</span>
                </div>

                <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-emerald-400 transition-all"
                    style={{
                      width: `${
                        ((quizIndex + 1) / quizQuestions.length) * 100
                      }%`,
                    }}
                  />
                </div>

                <h4 className="mb-5 text-2xl font-bold">
                  {currentQuiz.question}
                </h4>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {currentQuiz.options.map((option) => (
                    <button
                      key={option.key}
                      disabled={quizAnswer !== ""}
                      onClick={() => handleQuizAnswer(option.key)}
                      className={`rounded-xl border p-4 text-left text-sm transition ${
                        quizAnswer === option.key
                          ? option.key === correctAnswer
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                            : "border-red-400 bg-red-400/20 text-red-300"
                          : quizAnswer !== "" &&
                              option.key === correctAnswer
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                            : "border-white/10 bg-slate-800 hover:border-emerald-400"
                      }`}
                    >
                      <span className="font-bold">
                        {option.key}.
                      </span>{" "}
                      {option.text}
                    </button>
                  ))}
                </div>

                {quizAnswer !== "" && (
                  <div className="mt-5">
                    <p className="font-semibold">
                      {quizAnswer === correctAnswer
                        ? "Correct! 🎉"
                        : `Incorrect. Correct answer: ${
                            currentQuiz.options.find(
                              (option) => option.key === correctAnswer
                            )?.text ?? correctAnswer
                          }`}
                    </p>

                    <button
                      onClick={nextQuizQuestion}
                      className="mt-4 rounded-xl bg-emerald-400 px-6 py-3 font-bold text-slate-950 hover:bg-emerald-300"
                    >
                      {quizIndex === quizQuestions.length - 1
                        ? "See Results"
                        : "Next Question"}
                    </button>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* VOCABULARY SECTION */}
          <div>
            <h3 className="text-2xl font-bold sm:text-3xl">
              Vocabulary
            </h3>

            <p className="mt-2 text-sm text-slate-400 sm:text-base">
              Learn new English words and their meanings.
            </p>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search English words or translations..."
            className="mt-6 w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-emerald-400 sm:mt-8 sm:px-5 sm:py-4 sm:text-base"
          />

          <div className="mt-4 flex gap-2 sm:mt-5 sm:gap-3">
            {["All", "A2", "B1"].map((level) => (
              <button
                key={level}
                onClick={() => setSelected(level)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  selected === level
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
              >
                {level}
              </button>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 sm:gap-3">
            {[
              { label: "All words", value: "all" },
              { label: "❤️ Favorites", value: "favorites" },
              { label: "✓ Learned", value: "learned" },
              { label: "Unlearned", value: "unlearned" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setFilterMode(filter.value)}
                className={`rounded-full px-4 py-2 text-xs font-semibold sm:px-5 sm:text-sm ${
                  filterMode === filter.value
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-slate-800 text-white"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            {wordsLoading ? (
              <p className="col-span-full rounded-xl bg-slate-900 p-6 text-center text-slate-400">
                Loading vocabulary...
              </p>
            ) : filteredWords.length === 0 ? (
              <p className="col-span-full rounded-xl border border-white/10 bg-slate-900 p-6 text-center text-sm text-slate-400">
                No words found.
              </p>
            ) : (
              filteredWords.map((item, index) => (
                <div
                  key={`${item.word}-${index}`}
                  className="rounded-xl border border-white/10 bg-slate-900 p-4 transition hover:border-emerald-400/50 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="inline-block rounded-full bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-400">
                        {item.level}
                      </span>

                      <h4 className="mt-2 break-words text-xl font-bold tracking-tight sm:text-2xl">
                        {item.word}
                      </h4>

                      <p className="mt-1 text-sm text-slate-400">
                        {item.pronunciation}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-200 sm:text-base">
                        {item.meaning}
                      </p>
                    </div>

                    <button
                      onClick={() => toggleFavorite(item.word)}
                      className="shrink-0 text-2xl text-emerald-400"
                      aria-label="Toggle favorite"
                    >
                      {favorites.includes(item.word) ? "♥" : "♡"}
                    </button>
                  </div>

                  <button
                    onClick={() => speak(item.word)}
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-emerald-300"
                  >
                    🔊 Listen to pronunciation
                  </button>

                  <button
                    onClick={() => toggleLearned(item.word)}
                    className="mt-2 w-full rounded-xl border border-emerald-400 py-2.5 text-sm font-semibold text-emerald-400 transition hover:bg-emerald-400/10"
                  >
                    {learned.includes(item.word)
                      ? "✓ Learned"
                      : "Mark as learned"}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
