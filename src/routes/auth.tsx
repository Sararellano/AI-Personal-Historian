import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookOpen, Eye, EyeOff, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth-context";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in — Personal Historian" },
      {
        name: "description",
        content: "Sign in or create your private Personal Historian account.",
      },
    ],
  }),
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) navigate({ to: "/daily", replace: true });
  }, [navigate, user]);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/daily`,
            data: { display_name: displayName.trim() || null },
          },
        });
        if (error) throw error;
        if (data.user)
          await supabase
            .from("profiles")
            .upsert({ id: data.user.id, email, display_name: displayName.trim() || null });
        toast.success(
          data.session ? "Welcome to your story." : "Check your email to confirm your account.",
        );
        if (data.session) await navigate({ to: "/daily" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await navigate({ to: "/daily" });
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-primary p-14 text-primary-foreground lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-2 font-serif text-xl">
          <Sparkles className="size-5" />
          Personal Historian
        </div>
        <div className="relative z-10 max-w-lg">
          <BookOpen className="mb-8 size-10 opacity-80" />
          <blockquote className="font-serif text-5xl leading-tight">
            “We tell ourselves stories in order to live.”
          </blockquote>
          <p className="mt-5 opacity-75">— Joan Didion</p>
        </div>
        <p className="text-sm opacity-70">Your memories remain private and belong to you.</p>
      </section>
      <section className="flex items-center justify-center px-5 py-14">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <span className="font-serif text-xl font-semibold">Personal Historian</span>
          </div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-primary">
            {mode === "signin" ? "Welcome back" : "Begin your archive"}
          </p>
          <h1 className="mt-3 font-serif text-4xl font-semibold">
            {mode === "signin" ? "Continue your story" : "Create your account"}
          </h1>
          <p className="mt-3 text-muted-foreground">
            {mode === "signin"
              ? "Your next reflection is waiting."
              : "A quiet, private place to remember your life."}
          </p>
          <form onSubmit={submit} className="mt-9 space-y-5">
            {mode === "signup" && (
              <div className="space-y-2">
                <Label htmlFor="name">
                  Display name <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={80}
                  autoComplete="name"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={show ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShow((value) => !value)}
                  aria-label={show ? "Hide password" : "Show password"}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </div>
            <Button className="h-11 w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
          </form>
          <p className="mt-7 text-center text-sm text-muted-foreground">
            {mode === "signin" ? "New here?" : "Already have an account?"}{" "}
            <button
              className="font-semibold text-primary hover:underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin" ? "Create an account" : "Sign in"}
            </button>
          </p>
        </div>
      </section>
    </main>
  );
}
