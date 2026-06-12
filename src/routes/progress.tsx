import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { eachDayOfInterval, format, subDays } from "date-fns";
import { CalendarDays, Flame, Heart, Library } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/app-shell";
import { RouteGuard } from "@/components/route-guard";
import { loadStoryData, calculateStreak } from "@/lib/historian";
import { Card, CardContent } from "@/components/ui/card";
export const Route = createFileRoute("/progress")({
  component: () => (
    <RouteGuard>
      <AppShell>
        <ProgressPage />
      </AppShell>
    </RouteGuard>
  ),
  head: () => ({
    meta: [
      { title: "Your Progress — Personal Historian" },
      {
        name: "description",
        content: "See your writing streak, memory calendar, and emotional themes.",
      },
    ],
  }),
});
function ProgressPage() {
  const query = useQuery({ queryKey: ["story-data"], queryFn: loadStoryData });
  if (query.isLoading) return <div className="h-80 animate-pulse rounded-3xl bg-muted" />;
  const data = query.data ?? { answers: [], analyses: [], topics: [], writing: [] };
  const dates = data.answers.map((a) => a.assigned_date);
  const emotionMap = new Map<string, number>();
  data.analyses.forEach((a) =>
    a.emotions.forEach((emotion) => emotionMap.set(emotion, (emotionMap.get(emotion) ?? 0) + 1)),
  );
  const emotions = [...emotionMap]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([emotion, count]) => ({ emotion, count }));
  const days = eachDayOfInterval({ start: subDays(new Date(), 119), end: new Date() });
  const answered = new Set(dates);
  return (
    <div>
      <p className="text-sm font-semibold uppercase tracking-[.15em] text-primary">Your archive</p>
      <h1 className="mt-2 font-serif text-4xl font-semibold sm:text-5xl">
        A life, one memory at a time
      </h1>
      <p className="mt-3 max-w-2xl text-muted-foreground">
        Every reflection is another thread in the story only you can tell.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat icon={Library} label="Memories preserved" value={data.answers.length} />
        <Stat icon={Flame} label="Current streak" value={`${calculateStreak(dates)} days`} />
        <Stat icon={Heart} label="Recurring themes" value={data.topics.length} />
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
        <section className="rounded-3xl border bg-card p-6">
          <div className="flex items-center gap-2">
            <CalendarDays className="text-primary" />
            <h2 className="font-serif text-2xl font-semibold">Writing rhythm</h2>
          </div>
          <div className="mt-7 grid grid-flow-col grid-rows-7 gap-1.5 overflow-x-auto pb-2">
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              return (
                <div
                  key={key}
                  title={`${format(day, "MMM d")}${answered.has(key) ? ": memory saved" : ""}`}
                  className={`size-4 rounded-sm ${answered.has(key) ? "bg-primary" : "bg-muted"}`}
                />
              );
            })}
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            The last 120 days of your writing journey
          </p>
        </section>
        <section className="rounded-3xl border bg-card p-6">
          <h2 className="font-serif text-2xl font-semibold">Emotional landscape</h2>
          {emotions.length ? (
            <div className="mt-5 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emotions} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="emotion" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--primary)" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="mt-8 text-sm text-muted-foreground">
              Your emotional themes will appear after your memories are analyzed.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Library;
  label: string;
  value: string | number;
}) {
  return (
    <Card className="shadow-none">
      <CardContent className="flex items-center gap-4 p-6">
        <div className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary">
          <Icon />
        </div>
        <div>
          <p className="text-2xl font-semibold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
