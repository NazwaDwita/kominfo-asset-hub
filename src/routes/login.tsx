import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";

const searchSchema = z.object({ redirect: z.string().optional() });

const ADMIN_EMAIL = "admin@kominfo.local";

export const Route = createFileRoute("/login")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({ meta: [{ title: "Masuk Admin — Inventaris Kominfo" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, user, loading } = useAuth();
  const router = useRouter();
  const search = Route.useSearch();
  const [username, setUsername] = useState("admin");
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
      // Map username -> internal email. Only "admin" is recognised.
      const email = username.trim().toLowerCase() === "admin"
        ? ADMIN_EMAIL
        : `${username.trim().toLowerCase()}@kominfo.local`;
      await signIn(email, password);
      toast.success("Selamat datang, admin");
    } catch (err: any) {
      toast.error("Username atau kata sandi salah");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-12">
      <Link to="/" className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground">← Kembali</Link>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-accent">§ Akses terbatas</p>
      <h1 className="mt-2 font-display text-5xl font-black">Masuk Admin.</h1>
      <p className="mt-2 text-muted-foreground">
        Khusus admin Diskominfotik Pekanbaru. Pendaftaran admin baru dinonaktifkan.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5 rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Username</span>
          <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} className={cls} autoComplete="username" />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Kata sandi</span>
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={cls} autoComplete="current-password" />
        </label>
        <button type="submit" disabled={busy} className="w-full rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary disabled:opacity-50">
          {busy ? "Memproses…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}

const cls = "w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
