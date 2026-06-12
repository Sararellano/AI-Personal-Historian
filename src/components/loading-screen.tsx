import { BookOpen } from "lucide-react";

export function LoadingScreen() {
  return <div className="flex min-h-[50vh] items-center justify-center" role="status"><BookOpen className="size-7 animate-pulse text-primary" /><span className="sr-only">Loading</span></div>;
}