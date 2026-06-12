import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Check, Feather, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import toast from "react-hot-toast";
import { format } from "date-fns";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { analyzeAnswer } from "@/lib/ai.functions";
import { categoryLabels, getDailyEntry, saveDailyAnswer, type Category } from "@/lib/historian";
import { queueAnswer, takePendingAnswers } from "@/lib/offline";

export const Route = createFileRoute("/daily")({
  component: DailyRoute,
  head: () => ({
    meta: [
      { title: "Today’s Reflection — Personal Historian" },
      { name: "description", content: "Capture today’s memory with one thoughtful question." },
    ],
  }),
});
function DailyRoute() {
  return (
    <RouteGuard>
      <AppShell>
        <DailyPage />
      </AppShell>
    </RouteGuard>
  );
}

function DailyPage() {
  const queryClient = useQueryClient();
  const analyze = useServerFn(analyzeAnswer);
  const entry = useQuery({ queryKey: ["daily-entry"], queryFn: getDailyEntry });
  const [text, setText] = useState("");
  useEffect(() => {
    if (entry.data?.answer?.answer_text) setText(entry.data.answer.answer_text);
  }, [entry.data]);
  useEffect(() => {
    const sync = async () => {
      const pending = await takePendingAnswers();
      for (const item of pending) await saveDailyAnswer(item.questionId, item.answerText);
      if (pending.length) {
        toast.success("Your offline memory was saved.");
        queryClient.invalidateQueries({ queryKey: ["daily-entry"] });
      }
    };
    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [queryClient]);
  const mutation = useMutation({
    mutationFn: async () => {
      if (!entry.data?.question) throw new Error("Question unavailable.");
      if (!navigator.onLine) {
        await queueAnswer(entry.data.question.id, text);
        return { offline: true as const };
      }
      const first = !entry.data.answer;
      const answer = await saveDailyAnswer(entry.data.question.id, text);
      analyze({
        data: { answerId: answer.id, question: entry.data.question.text, answer: text },
      }).catch(() => undefined);
      return { offline: false as const, first };
    },
    onSuccess: async (result) => {
      if (result.offline) toast.success("Saved offline. It will sync when you reconnect.");
      else {
        toast.success("Your memory is safely preserved.");
        if (result.first) {
          const confetti = (await import("canvas-confetti")).default;
          confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
        }
      }
      queryClient.invalidateQueries({ queryKey: ["daily-entry"] });
    },
    onError: (error) => toast.error(error.message),
  });
  if (entry.isLoading)
    return (
      <div className="mx-auto max-w-3xl animate-pulse">
        <div className="h-8 w-40 rounded bg-muted" />
        <div className="mt-12 h-52 rounded-3xl bg-muted" />
      </div>
    );
  if (entry.error || !entry.data?.question)
    return (
      <p className="text-destructive">
        {entry.error?.message ?? "Today’s question is unavailable."}
      </p>
    );
  const question = entry.data.question;
  const valid = text.trim().length >= 10;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <CalendarDays className="size-4" />
            {format(new Date(), "EEEE, MMMM d")}
          </p>
          <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">Today’s reflection</h1>
        </div>
        <Badge variant="outline" className="rounded-full px-3 py-1">
          {categoryLabels[question.category as Category]}
        </Badge>
      </div>
      <section className="relative overflow-hidden rounded-[2rem] border bg-card p-6 shadow-sm sm:p-10">
        <Sparkles className="absolute right-7 top-7 size-6 text-primary/30" />
        <div className="mb-6 grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Feather />
        </div>
        <h2 className="max-w-2xl font-serif text-3xl leading-snug sm:text-4xl">{question.text}</h2>
        <p className="mt-3 text-sm italic text-muted-foreground">
          Take your time. Specific details are often where the story lives.
        </p>
        <div className="mt-8">
          <label htmlFor="answer" className="sr-only">
            Your memory
          </label>
          <Textarea
            id="answer"
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="min-h-56 resize-y border-0 bg-muted/50 p-5 text-base leading-relaxed shadow-none focus-visible:ring-primary"
            placeholder="I remember…"
            maxLength={20000}
          />
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {text.trim().length < 10
                ? `${10 - text.trim().length} more characters to save`
                : "Ready to preserve"}
            </span>
            <span>{text.length.toLocaleString()} / 20,000</span>
          </div>
        </div>
        <Button
          className="mt-7 h-11 rounded-full px-6"
          disabled={!valid || mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {entry.data.answer ? <Check /> : <Feather />}
          {mutation.isPending
            ? "Preserving…"
            : entry.data.answer
              ? "Update memory"
              : "Preserve this memory"}
        </Button>
      </section>
    </div>
  );
}
