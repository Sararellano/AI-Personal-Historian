import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createHistorianModel } from "./ai-gateway.server";

const analysisSchema = z.object({
  people: z.array(z.string()).max(15),
  emotions: z.array(z.string()).max(10),
  lesson: z.string(),
  is_milestone: z.boolean(),
});

function apiKey() {
  const value = process.env.LOVABLE_API_KEY;
  if (!value) throw new Error("The writing service is not configured.");
  return value;
}

export const analyzeAnswer = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      answerId: z.number().int().positive(),
      question: z.string().max(500),
      answer: z.string().min(10).max(20000),
    }),
  )
  .handler(async ({ data, context }) => {
    const result = await generateText({
      model: createHistorianModel(apiKey()),
      temperature: 0.15,
      output: Output.object({ schema: analysisSchema }),
      prompt: `Read this personal memory. Extract named people, core emotions, one concise life lesson, and whether it marks a major life milestone. Return only the requested structure.\nQuestion: ${data.question}\nMemory: ${data.answer}`,
    });
    const { error } = await context.supabase
      .from("answer_analysis")
      .upsert({ answer_id: data.answerId, ...result.output }, { onConflict: "answer_id" });
    if (error) throw error;
    return result.output;
  });

const generationInput = z.object({
  kind: z.enum(["chapter", "biography"]),
  category: z.enum(["infancia", "adolescencia", "adulto", "curiosa"]).optional(),
});
export const generateStory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(generationInput)
  .handler(async ({ data, context }) => {
    let query = context.supabase
      .from("answers")
      .select("answer_text, assigned_date, questions(text, category)")
      .eq("user_id", context.userId)
      .order("assigned_date");
    if (data.kind === "chapter" && data.category)
      query = query.eq("questions.category", data.category);
    const { data: answers, error } = await query;
    if (error) throw error;
    if (!answers?.length) throw new Error("Write at least one memory before creating this story.");
    const memories = answers
      .map(
        (entry) =>
          `Date: ${entry.assigned_date}\nQuestion: ${entry.questions?.text}\nAnswer: ${entry.answer_text}`,
      )
      .join("\n\n");
    const instruction =
      data.kind === "biography"
        ? "Write a cohesive first-person biography in evocative, honest prose. Use markdown headings. Preserve facts exactly, connect recurring themes, and never invent details."
        : `Write a first-person memoir chapter focused on ${data.category}. Use a meaningful title and markdown. Preserve facts exactly and never invent details.`;
    const result = await generateText({
      model: createHistorianModel(apiKey()),
      temperature: 0.15,
      prompt: `${instruction}\n\nSource memories:\n${memories}`,
    });
    const title =
      data.kind === "biography" ? "My Life, Remembered" : `${data.category} — A Chapter of My Life`;
    const saved = await context.supabase
      .from("generated_writing")
      .insert({
        user_id: context.userId,
        writing_type: data.kind,
        category: data.category ?? null,
        title,
        content: result.text,
      })
      .select()
      .single();
    if (saved.error) throw saved.error;
    return saved.data;
  });

export const detectTopics = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: analyses, error } = await context.supabase
      .from("answer_analysis")
      .select("people, answers!inner(user_id, assigned_date)")
      .eq("answers.user_id", context.userId);
    if (error) throw error;
    const topics = new Map<string, { count: number; date: string }>();
    analyses?.forEach((analysis) =>
      analysis.people.forEach((person) => {
        const name = person.trim();
        if (!name) return;
        const current = topics.get(name.toLowerCase());
        topics.set(name.toLowerCase(), {
          count: (current?.count ?? 0) + 1,
          date:
            analysis.answers.assigned_date > (current?.date ?? "")
              ? analysis.answers.assigned_date
              : (current?.date ?? analysis.answers.assigned_date),
        });
      }),
    );
    const rows = [...topics]
      .filter(([, value]) => value.count >= 3)
      .map(([name, value]) => ({
        user_id: context.userId,
        topic_name: name.replace(/\b\w/g, (letter) => letter.toUpperCase()),
        frequency: value.count,
        last_mentioned: value.date,
      }));
    if (rows.length) {
      const saved = await context.supabase
        .from("recurring_topics")
        .upsert(rows, { onConflict: "user_id,topic_name" });
      if (saved.error) throw saved.error;
    }
    return rows;
  });
