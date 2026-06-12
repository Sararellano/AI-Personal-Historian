import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { BarChart3, BookHeart, BookOpen, Feather, Menu, Sparkles, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const links = [
  { to: "/daily", label: "Today", icon: Feather },
  { to: "/progress", label: "Progress", icon: BarChart3 },
  { to: "/biography", label: "Biography", icon: BookOpen },
  { to: "/memories", label: "Memories", icon: BookHeart },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const signOut = async () => {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  };
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link to="/daily" className="flex items-center gap-2 font-serif text-lg font-semibold"><span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground"><Sparkles className="size-4" /></span>Personal Historian</Link>
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground", location.pathname === to && "bg-accent text-foreground")}><Icon className="size-4" />{label}</Link>)}
          </nav>
          <div className="flex items-center gap-1"><ThemeToggle /><Button variant="ghost" size="sm" className="hidden sm:inline-flex" onClick={signOut}>Sign out</Button><Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)} aria-label="Toggle menu">{open ? <X /> : <Menu />}</Button></div>
        </div>
        {open && <nav className="border-t px-4 py-3 lg:hidden" aria-label="Mobile navigation">{links.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium"><Icon className="size-4" />{label}</Link>)}<Button variant="ghost" className="w-full justify-start" onClick={signOut}>Sign out</Button></nav>}
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">{children}</main>
    </div>
  );
}