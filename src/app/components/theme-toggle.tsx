"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="h-10 w-28" />;

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium transition hover:bg-slate-200 dark:border-slate-600 dark:hover:bg-slate-800"
    >
      {isDark ? "☀️ Light" : "🌙 Dark"}
    </button>
  );
}