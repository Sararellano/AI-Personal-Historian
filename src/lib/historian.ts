import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

export type Category = "infancia" | "adolescencia" | "adulto" | "curiosa";
export const categoryLabels: Record<Category, string> = {
  infancia: "Childhood",
  adolescencia: "Adolescence",
  adulto: "Adulthood",
  curiosa: "Curious",
};

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Please sign in to continue.");
  return data.user;
}

export async function getDailyEntry() {
  const user = await getCurrentUser();
  const date = format(new Date(), "yyyy-MM-dd");
  const existing = await supabase.from("answers").select("*, questions(*)").eq("user_id", user.id).eq("assigned_date", date).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data) return { question: existing.data.questions, answer: existing.data };
  const questions = await supabase.from("questions").select("*").eq("active", true).order("id");
  if (questions.error || !questions.data?.length) throw new Error("No questions are available yet.");
  const epoch = Math.floor(new Date(`${date}T00:00:00`).getTime() / 86400000);
  return { question: questions.data[Math.abs(epoch) % questions.data.length], answer: null };
}

export async function saveDailyAnswer(questionId: number, answerText: string) {
  const user = await getCurrentUser();
  const assignedDate = format(new Date(), "yyyy-MM-dd");
  const result = await supabase.from("answers").upsert({ user_id: user.id, question_id: questionId, answer_text: answerText.trim(), assigned_date: assignedDate }, { onConflict: "user_id,assigned_date" }).select().single();
  if (result.error) throw result.error;
  return result.data;
}

export async function loadStoryData() {
  const user = await getCurrentUser();
  const [answers, analyses, topics, writing] = await Promise.all([
    supabase.from("answers").select("*, questions(*)").eq("user_id", user.id).order("assigned_date", { ascending: false }),
    supabase.from("answer_analysis").select("*, answers!inner(user_id)").eq("answers.user_id", user.id),
    supabase.from("recurring_topics").select("*").eq("user_id", user.id).order("frequency", { ascending: false }),
    supabase.from("generated_writing").select("*").eq("user_id", user.id).order("updated_at", { ascending: false }),
  ]);
  const error = answers.error ?? analyses.error ?? topics.error ?? writing.error;
  if (error) throw error;
  return { answers: answers.data ?? [], analyses: analyses.data ?? [], topics: topics.data ?? [], writing: writing.data ?? [] };
}

export function calculateStreak(dates: string[]) {
  const unique = new Set(dates);
  let cursor = new Date();
  if (!unique.has(format(cursor, "yyyy-MM-dd"))) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (unique.has(format(cursor, "yyyy-MM-dd"))) { count += 1; cursor.setDate(cursor.getDate() - 1); }
  return count;
}

export function answerDateLabel(date: string) {
  return format(parseISO(date), "MMMM d, yyyy");
}