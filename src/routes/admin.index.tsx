import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  LogOut,
  Search,
  Users,
  IndianRupee,
  TrendingUp,
  Loader2,
  RefreshCw,
  GraduationCap,
} from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminPanel,
  head: () => ({ meta: [{ title: "Admin Panel" }] }),
});

type Enrollment = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  education: string;
  program: string;
  amount: number;
  currency: string;
  payment_id: string | null;
  payment_status: string;
  created_at: string;
};

function AdminPanel() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) navigate({ to: "/admin/login" });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate({ to: "/admin/login" });
      } else {
        setAuthReady(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("enrollments")
      .select("*")
      .order("created_at", { ascending: false });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setRows(data as Enrollment[]);
  };

  useEffect(() => {
    if (!authReady) return;
    load();
    const channel = supabase
      .channel("enrollments-rt")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enrollments" },
        () => load(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authReady]);

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.full_name, r.email, r.phone, r.program, r.payment_id ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(s),
    );
  }, [rows, q]);

  const stats = useMemo(() => {
    const paid = rows.filter((r) => r.payment_status === "paid");
    const total = paid.reduce((s, r) => s + Number(r.amount), 0);
    return {
      enrollments: rows.length,
      paid: paid.length,
      revenue: total,
    };
  }, [rows]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/admin/login" });
  };

  if (!authReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background">
      <Toaster richColors position="top-center" />
      <div className="pointer-events-none fixed inset-0 bg-gradient-mesh opacity-60" />

      <header className="relative z-10 border-b bg-card/60 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-primary shadow-glow">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Admin Panel</h1>
              <p className="text-xs text-muted-foreground">Live enrollments</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              View site
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl space-y-6 px-6 py-8">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              label: "Total Enrollments",
              value: stats.enrollments,
              icon: Users,
            },
            {
              label: "Paid",
              value: stats.paid,
              icon: TrendingUp,
            },
            {
              label: "Revenue",
              value: `₹${stats.revenue.toLocaleString("en-IN")}`,
              icon: IndianRupee,
            },
          ].map((s, i) => (
            <div
              key={s.label}
              style={{ animationDelay: `${i * 80}ms` }}
              className="group animate-fade-in-up rounded-2xl border bg-card/80 p-5 shadow-elegant backdrop-blur transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-primary text-primary-foreground shadow-glow">
                  <s.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3 text-3xl font-bold tracking-tight">
                {s.value}
              </div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div className="animate-fade-in-up rounded-2xl border bg-card/80 shadow-elegant backdrop-blur [animation-delay:200ms]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search name, email, payment id..."
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Education</TableHead>
                  <TableHead>Program</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                    </TableCell>
                  </TableRow>
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      No enrollments yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((r, i) => (
                    <TableRow
                      key={r.id}
                      style={{ animationDelay: `${i * 30}ms` }}
                      className="animate-slide-in-right"
                    >
                      <TableCell className="font-medium">{r.full_name}</TableCell>
                      <TableCell className="text-muted-foreground">{r.email}</TableCell>
                      <TableCell>{r.phone}</TableCell>
                      <TableCell className="text-muted-foreground">{r.education}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-normal">
                          {r.program}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">
                        ₹{Number(r.amount).toLocaleString("en-IN")}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {r.payment_id ?? "—"}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={r.payment_status} />
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(r.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    paid: "bg-[oklch(0.65_0.18_150)]/15 text-[oklch(0.5_0.18_150)] border-[oklch(0.65_0.18_150)]/30",
    pending: "bg-warning/15 text-[oklch(0.55_0.16_75)] border-warning/30",
    failed: "bg-destructive/15 text-destructive border-destructive/30",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-muted text-muted-foreground"
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
