import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookHeart, Feather, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Personal Historian — Your Story, Remembered" },
      { name: "description", content: "Answer one thoughtful question each day and turn your memories into a meaningful personal biography." },
      { property: "og:title", content: "Personal Historian" },
      { property: "og:description", content: "One thoughtful question a day. One extraordinary life story." },
    ],
  }),
  component: Index,
});

// IMPORTANT: Replace this placeholder. See ./README.md for routing conventions.
function Index() {
  return <div className="min-h-screen overflow-hidden bg-background">
    <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8"><div className="flex items-center gap-2 font-serif text-lg font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>Personal Historian</div><div className="flex items-center gap-2"><ThemeToggle /><Button asChild variant="ghost"><Link to="/auth">Sign in</Link></Button></div></header>
    <main>
      <section className="relative mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[1.1fr_.9fr] lg:py-24">
        <div className="relative z-10"><div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground"><Feather className="size-3.5 text-primary" />A private place for your memories</div><h1 className="max-w-3xl font-serif text-5xl font-semibold leading-[1.05] tracking-tight sm:text-7xl">Your life is a story worth <em className="font-normal text-primary">remembering.</em></h1><p className="mt-7 max-w-xl text-lg leading-relaxed text-muted-foreground">Answer one thoughtful question each day. Over time, Personal Historian helps reveal the people, lessons, and turning points that made you who you are.</p><div className="mt-9 flex flex-wrap gap-3"><Button asChild size="lg" className="rounded-full px-6"><Link to="/auth">Begin your story <ArrowRight /></Link></Button><Button asChild size="lg" variant="outline" className="rounded-full px-6"><Link to="/auth">I already have an account</Link></Button></div><div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" />Private by design</span><span>No pressure. Just one question.</span></div></div>
        <div className="relative mx-auto w-full max-w-md"><div className="absolute -inset-16 rounded-full bg-primary/10 blur-3xl" /><div className="relative rotate-2 rounded-[2rem] border bg-card p-8 shadow-2xl shadow-primary/10"><div className="mb-10 flex items-center justify-between"><span className="font-serif text-sm italic text-muted-foreground">Today’s reflection</span><span className="text-xs uppercase tracking-widest text-muted-foreground">Day 1</span></div><BookHeart className="mb-6 size-8 text-primary" /><p className="font-serif text-3xl leading-snug">Who made you feel safest when you were young, and how?</p><div className="mt-10 h-px bg-border" /><p className="mt-5 text-sm italic text-muted-foreground">There is no right way to remember.</p></div></div>
      </section>
    </main>
  </div>;
}
