import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { Lock, Loader2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  component: AdminLogin,
  head: () => ({ meta: [{ title: "Admin Login" }] }),
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin" });
    });
  }, [navigate]);

  const submit = async (mode: "login" | "signup") => {
    if (!email || password.length < 6) {
      toast.error("Enter email and 6+ char password");
      return;
    }
    setLoading(true);
    const fn =
      mode === "login"
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: window.location.origin + "/admin" },
          });
    const { error } = await fn;
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(mode === "login" ? "Welcome back!" : "Account created!");
    navigate({ to: "/admin" });
  };

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-4">
      <Toaster richColors position="top-center" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-mesh" />
      <div className="pointer-events-none absolute top-1/4 -left-32 h-80 w-80 rounded-full bg-primary/30 blur-3xl animate-blob" />
      <div className="pointer-events-none absolute bottom-0 -right-32 h-80 w-80 rounded-full bg-accent/30 blur-3xl animate-blob [animation-delay:5s]" />

      <div className="relative w-full max-w-md animate-scale-in">
        <Link
          to="/"
          className="mb-6 inline-block text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to site
        </Link>
        <div className="rounded-2xl border bg-card/80 p-8 shadow-elegant backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <ShieldCheck className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Admin Access</h1>
              <p className="text-xs text-muted-foreground">
                Sign in to manage enrollments
              </p>
            </div>
          </div>

          <Tabs defaultValue="login" className="mt-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Create admin</TabsTrigger>
            </TabsList>
            {(["login", "signup"] as const).map((mode) => (
              <TabsContent key={mode} value={mode} className="space-y-4 pt-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@yoursite.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <Button
                  onClick={() => submit(mode)}
                  disabled={loading}
                  className="h-11 w-full bg-gradient-primary shadow-glow"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      {mode === "login" ? "Sign in" : "Create account"}
                    </>
                  )}
                </Button>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
}
