"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function QuizzesAdmin() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [question, setQuestion] = useState("");
const [optionA, setOptionA] = useState("");
const [optionB, setOptionB] = useState("");
const [optionC, setOptionC] = useState("");
const [optionD, setOptionD] = useState("");
const [correctAnswer, setCorrectAnswer] = useState("A");
const [message, setMessage] = useState("");
const [quizzes, setQuizzes] = useState<any[]>([]);
const [editQuizId, setEditQuizId] = useState<number | null>(null);
const [searchTerm, setSearchTerm] = useState("");


async function addQuiz(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setMessage("");

  const { error } = await supabase.from("quizzes").insert({
    question,
    option_a: optionA,
    option_b: optionB,
    option_c: optionC,
    option_d: optionD,
    correct_answer: correctAnswer,
  });

  if (error) {
    setMessage(error.message);
    return;
  }

  setQuestion("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswer("A");

  setMessage("Quiz added successfully!");
  await loadQuizzes();
}
async function loadQuizzes() {    
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("id", { ascending: false });

  if (error) {
    setMessage(error.message);
    return;
  }

  setQuizzes(data || []);
}
async function deleteQuiz(id: number) {
  const confirmed = window.confirm("Are you sure you want to delete this quiz?");

  if (!confirmed) return;

  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id);

  if (error) {
    setMessage(error.message);
    return;
  }

  setMessage("Quiz deleted successfully!");
  await loadQuizzes();
}




function startEditQuiz(quiz: any) {

  setEditQuizId(quiz.id);
  setQuestion(quiz.question);
  setOptionA(quiz.option_a);
  setOptionB(quiz.option_b);
  setOptionC(quiz.option_c);
  setOptionD(quiz.option_d);
  setCorrectAnswer(quiz.correct_answer);
}
async function updateQuiz(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();

  if (editQuizId === null) return;

  const { error } = await supabase
    .from("quizzes")
    .update({
      question,
      option_a: optionA,
      option_b: optionB,
      option_c: optionC,
      option_d: optionD,
      correct_answer: correctAnswer,
    })
    .eq("id", editQuizId);

  if (error) {
    setMessage(error.message);
    return;
  }

  setEditQuizId(null);
  setQuestion("");
  setOptionA("");
  setOptionB("");
  setOptionC("");
  setOptionD("");
  setCorrectAnswer("A");

  setMessage("Quiz updated successfully!");
  await loadQuizzes();
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

      const { data } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!data) {
        router.replace("/");
        return;
      }
setIsAdmin(true);
await loadQuizzes();
setLoading(false);
    }

    checkAdmin();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 p-8 text-white">
        Loading...
      </div>
    );
  }

  if (!isAdmin) return null;
  const filteredQuizzes = quizzes.filter((quiz) =>
  quiz.question.toLowerCase().includes(searchTerm.toLowerCase())
);

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white sm:p-8">
      <button
        onClick={() => router.push("/admin")}
        className="mb-6 text-emerald-400"
      >
        ← Back to Admin
      </button>

      <h1 className="mb-2 text-3xl font-bold text-emerald-400">
        Quizzes Management
      </h1>

      <p className="mb-8 text-slate-400">
        Create and manage vocabulary quizzes.
      </p>

<form
  onSubmit={editQuizId !== null ? updateQuiz : addQuiz}
  className="max-w-2xl space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6"
>
  <h2 className="text-xl font-bold">
    {editQuizId !== null ? "Edit Quiz" : "Add New Quiz"}
  </h2>

  <p className="text-sm text-slate-400">
    Quiz savoli va javoblarini kiriting.
  </p>
  <input
  required
  value={question}
  onChange={(e) => setQuestion(e.target.value)}
  placeholder="Quiz question"
  
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
/>
<input
  required
  value={optionA}
  onChange={(e) => setOptionA(e.target.value)}
  placeholder="Option A"
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
/>
<input
  required
  value={optionB}
  onChange={(e) => setOptionB(e.target.value)}
  placeholder="Option B"
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
/>
<input
  required
  value={optionC}
  onChange={(e) => setOptionC(e.target.value)}
  placeholder="Option C"
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
/>
<input
  required
  value={optionD}
  onChange={(e) => setOptionD(e.target.value)}
  placeholder="Option D"
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
/>
<select
  value={correctAnswer}
  onChange={(e) => setCorrectAnswer(e.target.value)}
  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white"
>
  <option value="A">Option A</option>
  <option value="B">Option B</option>
  <option value="C">Option C</option>
  <option value="D">Option D</option>
</select>
<button
  type="submit"
  className="w-full rounded-xl bg-emerald-500 p-3 font-bold text-white transition hover:bg-emerald-600"
>
  {editQuizId !== null ? "Update Quiz" : "Add Quiz"}
</button>
{editQuizId !== null && (
  <button
    type="button"
    onClick={() => {
      setEditQuizId(null);
      setQuestion("");
      setOptionA("");
      setOptionB("");
      setOptionC("");
      setOptionD("");
      setCorrectAnswer("A");
    }}
    className="w-full rounded-xl bg-slate-700 p-3 font-bold text-white hover:bg-slate-600"
  >
    Cancel Edit
  </button>
)}

{message && (
  <p className="text-sm text-emerald-400">
    {message}
  </p>
)}
</form>
<input
  type="text"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  placeholder="Search quizzes..."
  className="mt-8 w-full max-w-2xl rounded-xl border border-slate-700 bg-slate-900 p-3 text-white outline-none focus:border-emerald-400"
/>
<div className="mt-8 max-w-2xl space-y-4">
  <h2 className="text-2xl font-bold">
    All Quizzes ({filteredQuizzes.length})
  </h2>
{quizzes.length > 0 && filteredQuizzes.length === 0 && (
  <p className="rounded-xl bg-slate-900 p-4 text-slate-400">
    No quizzes found.
  </p>
)}

  {filteredQuizzes.map((quiz) => (
    
    <div
      key={quiz.id}
      className="rounded-xl border border-slate-800 bg-slate-900 p-5"
    >
      <h3 className="font-bold text-emerald-400">
        {quiz.question}
      </h3>

      <p className="mt-2 text-slate-300">A: {quiz.option_a}</p>
      <p className="text-slate-300">B: {quiz.option_b}</p>
      <p className="text-slate-300">C: {quiz.option_c}</p>
      <p className="text-slate-300">D: {quiz.option_d}</p>

      <p className="mt-3 text-sm text-emerald-400">
        Correct answer: {quiz.correct_answer}
      </p>
      <button
  type="button"
  onClick={() => startEditQuiz(quiz)}
  className="mt-4 mr-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
>
  Edit Quiz
</button>
      <button
  onClick={() => deleteQuiz(quiz.id)}
  className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
>
  Delete Quiz
</button>
    </div>
  ))}
</div>
    </main>
  );
}