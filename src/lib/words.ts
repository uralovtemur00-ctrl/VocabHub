
import { supabase } from "./supabase";

export async function saveWordProgress(
  word: string,
  isFavorite: boolean,
  isLearned: boolean
) {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    throw new Error("Please sign in first.");
  }

  const { error } = await supabase
    .from("user_word_progress")
    .upsert(
      {
        user_id: user.id,
        word,
        is_favorite: isFavorite,
        is_learned: isLearned,
      },
      {
        onConflict: "user_id,word",
      }
    );

  if (error) throw error;
}

export async function loadWordProgress() {
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError) throw userError;

  if (!user) {
    return {
      favorites: [] as string[],
      learned: [] as string[],
    };
  }

  const { data, error } = await supabase
    .from("user_word_progress")
    .select("word, is_favorite, is_learned")
    .eq("user_id", user.id);

  if (error) throw error;

  return {
    favorites: data
      .filter((item) => item.is_favorite)
      .map((item) => item.word),

    learned: data
      .filter((item) => item.is_learned)
      .map((item) => item.word),
  };
}
