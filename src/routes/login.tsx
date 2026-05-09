import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({ redirect: z.string().optional() });

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Masuk Admin — Inventaris Kominfo" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, user, loading } = useAuth();
  const router = useRouter();
  const search = Route.useSearch();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.navigate({ to: search.redirect || "/inventaris" });
    }
  }, [user, loading, router, search.redirect]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await signIn(email, password);
        toast.success("Selamat datang kembali, admin");
      } else {
        await signUp(email, password);
        toast.success("Akun admin dibuat. Silakan masuk.");
        setMode("login");
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← Kembali</Link>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-accent">§ Akses terbatas</p>
      <h1 className="mt-2 font-display text-5xl font-black">{mode === "login" ? "Masuk." : "Daftar."}</h1>
      <p className="mt-2 text-muted-foreground">
        {mode === "login" ? "Khusus admin Diskominfotik Pekanbaru." : "Buat akun admin baru."}
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Email</span>
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={cls} autoComplete="email" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Kata sandi</span>
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className={cls} autoComplete={mode === "login" ? "current-password" : "new-password"} />
        </label>
        <button type="submit" disabled={busy} className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary disabled:opacity-50">
          {busy ? "Memproses…" : mode === "login" ? "Masuk" : "Daftar"}
        </button>
        <button type="button" onClick={() => setMode(mode === "login" ? "register" : "login")} className="w-full text-center text-xs text-muted-foreground hover:text-foreground">
          {mode === "login" ? "Belum punya akun admin? Daftar" : "Sudah punya akun? Masuk"}
        </button>
      </form>
    </div>
  );
}

const cls = "w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
