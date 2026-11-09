import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

const validAnswers = ["A", "B", "C", "D"];

async function authenticateUser(request: Request) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.slice(7).trim();

  if (!token) {
    return null;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

// GET: Foydalanuvchiga quiz savollarini yuborish
// To'g'ri javoblar bu yerda yuborilmaydi.
export async function GET(request: Request) {
  try {
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("quizzes")
      .select(
        "id, question, option_a, option_b, option_c, option_d"
      )
      .order("id", { ascending: true })
      .limit(10);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    const quizzes = (data ?? []).map((quiz) => ({
      id: quiz.id,
      question: quiz.question,
      options: [
        { key: "A", text: quiz.option_a },
        { key: "B", text: quiz.option_b },
        { key: "C", text: quiz.option_c },
        { key: "D", text: quiz.option_d },
      ],
    }));

    return NextResponse.json({ quizzes });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}

// POST: Foydalanuvchi javobini tekshirish
export async function POST(request: Request) {
  try {
    const user = await authenticateUser(request);

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let body: { quizId?: number; answer?: string };

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const quizId = Number(body.quizId);
    const answer = String(body.answer ?? "").trim().toUpperCase();

    if (!Number.isSafeInteger(quizId) || quizId <= 0) {
      return NextResponse.json(
        { error: "Invalid quiz ID" },
        { status: 400 }
      );
    }

    if (!validAnswers.includes(answer)) {
      return NextResponse.json(
        { error: "Invalid answer" },
        { status: 400 }
      );
    }

    const { data: quiz, error } = await supabaseAdmin
      .from("quizzes")
      .select("id, correct_answer")
      .eq("id", quizId)
      .maybeSingle();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!quiz) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    const correctAnswer = String(quiz.correct_answer)
      .trim()
      .toUpperCase();

    if (!validAnswers.includes(correctAnswer)) {
      return NextResponse.json(
        { error: "Invalid correct answer in database" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      isCorrect: answer === correctAnswer,
      correctAnswer,
    });
  } catch {
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}