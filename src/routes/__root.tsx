import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, useAuth } from "@/lib/auth";
import { LogIn, LogOut } from "lucide-react";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="font-mono text-sm tracking-widest text-accent uppercase">Error 404</p>
        <h1 className="mt-3 font-display text-7xl font-black text-foreground">Hilang dari rak.</h1>
        <p className="mt-4 text-muted-foreground">
          Halaman yang kamu cari tidak terdaftar di inventaris kami.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Kembali ke beranda
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl font-bold">Terjadi gangguan teknis</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-sm text-primary-foreground"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Inventaris Elektronik — Diskominfo Pekanbaru" },
      { name: "description", content: "Sistem pendataan dan pemantauan alat elektronik internal Diskominfo Pekanbaru." },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const router = useRouter();

  const baseLinks = [
    { to: "/", label: "Beranda" },
    { to: "/inventaris", label: "Inventaris" },
    { to: "/tentang", label: "Tentang" },
  ];
  const links = isAdmin ? [...baseLinks, { to: "/admin/riwayat", label: "Riwayat" }] : baseLinks;

  const handleLogout = async () => {
    await signOut();
    router.navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
        <Link to="/" className="group flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground font-display font-black">K</span>
          <div className="leading-tight">
            <p className="font-display text-lg font-bold">Kominfo<span className="text-accent">.</span>Inv</p>
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Pekanbaru — sejak 2026</p>
          </div>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              activeProps={{ className: "bg-foreground text-background hover:!bg-accent hover:!text-accent-foreground" }}
              className="nav-lift rounded-full px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          {user && isAdmin && (
            <span className="hidden rounded-full bg-accent px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest text-accent-foreground sm:inline-block">
              ● Admin
            </span>
          )}
          {user ? (
            <button
              onClick={handleLogout}
              title={user.email ?? ""}
              className="inline-flex items-center gap-1.5 rounded-full border border-foreground/20 px-3 py-2 text-sm font-medium hover:bg-foreground/5"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Keluar</span>
            </button>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-foreground px-3 py-2 text-sm font-medium hover:bg-foreground hover:text-background"
            >
              <LogIn className="h-4 w-4" /> <span className="hidden sm:inline">Masuk Admin</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-foreground/10 bg-foreground text-background">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-display text-3xl font-black">Inventaris yang tidak dilupakan.</p>
          <p className="mt-3 text-sm opacity-70">
            Catat sekali, lacak selamanya. Sistem internal Diskominfo Kota Pekanbaru.
          </p>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest opacity-60">Navigasi</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/" className="hover:underline">Beranda</Link></li>
            <li><Link to="/inventaris" className="hover:underline">Daftar Inventaris</Link></li>
            <li><Link to="/tentang" className="hover:underline">Tentang</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-widest opacity-60">Kontak</p>
          <p className="mt-3 text-sm opacity-80">Dinas Komunikasi & Informatika<br />Kota Pekanbaru, Riau</p>
        </div>
      </div>
      <div className="border-t border-background/10 px-6 py-4 text-center font-mono text-xs opacity-50">
        © {new Date().getFullYear()} Diskominfo Pekanbaru
      </div>
    </footer>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1"><Outlet /></main>
          <SiteFooter />
        </div>
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
