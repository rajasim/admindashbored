import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Admin Portal" },
      { name: "description", content: "Secure admin portal for enrollments." },
    ],
  }),
});

function Index() {
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 -right-40 h-96 w-96 rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:5s]" />

      <div className="relative z-10 max-w-xl text-center animate-fade-in-up">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border bg-card/60 px-3 py-1 text-xs font-medium backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Internal portal
        </div>
        <h1 className="mt-5 text-5xl font-bold tracking-tight md:text-6xl">
          <span className="text-gradient">Admin</span> Dashboard
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Manage your enrollments, payments and student data — all in one place.
        </p>
        <Link
          to="/admin/login"
          className="group mt-8 inline-flex h-12 items-center gap-2 rounded-xl bg-gradient-primary px-6 font-semibold text-primary-foreground shadow-glow transition-transform hover:scale-105"
        >
          <ShieldCheck className="h-5 w-5" />
          Enter Admin Panel
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </div>
  );
}
