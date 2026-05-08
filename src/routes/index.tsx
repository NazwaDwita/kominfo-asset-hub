import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroCollage from "@/assets/hero-collage.jpg";
import { listItems, CATEGORIES, CATEGORY_EMOJI } from "@/lib/items";
import { ArrowUpRight, Boxes, ShieldCheck, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inventaris Elektronik — Diskominfo Pekanbaru" },
      { name: "description", content: "Pendataan, pencarian, dan pemantauan status alat elektronik milik Diskominfo Pekanbaru." },
      { property: "og:title", content: "Inventaris Elektronik — Diskominfo Pekanbaru" },
      { property: "og:description", content: "Catat sekali, lacak selamanya. Semua alat di satu tempat." },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: items = [] } = useQuery({ queryKey: ["items"], queryFn: listItems });

  const total = items.length;
  const bagus = items.filter((i) => i.status === "Bagus").length;
  const rusak = items.filter((i) => i.status === "Rusak").length;
  const perbaikan = items.filter((i) => i.status === "Dalam Perbaikan").length;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 pt-12 pb-20 lg:grid-cols-12 lg:gap-12 lg:pt-20">
          <div className="lg:col-span-7">
            <p className="font-mono text-xs uppercase tracking-[0.25em] text-accent animate-fade-up">
              Edisi 01 / Kominfo Pekanbaru
            </p>
            <h1 className="mt-4 font-display text-5xl font-black leading-[0.95] tracking-tight md:text-7xl lg:text-[5.5rem] animate-fade-up stagger-1">
              Setiap kabel,<br />
              <span className="italic text-primary">setiap layar,</span><br />
              tercatat rapi.
            </h1>
            <p className="mt-6 max-w-xl text-base text-muted-foreground md:text-lg animate-fade-up stagger-2">
              Sistem inventaris alat elektronik internal — dari router yang kelelahan,
              proyektor yang masih perkasa, sampai laptop yang baru tiba kemarin.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 animate-fade-up stagger-3">
              <Link
                to="/inventaris"
                className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:bg-primary"
              >
                Jelajahi inventaris
                <ArrowUpRight className="h-4 w-4 transition group-hover:rotate-45" />
              </Link>
              <Link
                to="/inventaris/baru"
                className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium hover:bg-foreground/5"
              >
                Daftarkan alat baru
              </Link>
            </div>

            <dl className="mt-12 grid grid-cols-2 gap-6 border-t border-foreground/10 pt-6 sm:grid-cols-4 animate-fade-up stagger-4">
              {[
                { k: "Total alat", v: total },
                { k: "Bagus", v: bagus },
                { k: "Perbaikan", v: perbaikan },
                { k: "Rusak", v: rusak },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{s.k}</dt>
                  <dd className="mt-1 font-display text-4xl font-black">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="relative lg:col-span-5">
            <div className="absolute -left-6 -top-6 h-32 w-32 rounded-full bg-mustard/40 blur-2xl" />
            <div className="absolute -right-8 bottom-10 h-40 w-40 rounded-full bg-rust/20 blur-3xl" />
            <div className="relative animate-float">
              <div className="absolute -inset-3 rotate-[-2deg] rounded-2xl bg-accent" />
              <img
                src={heroCollage}
                alt="Kolase peralatan elektronik gaya editorial"
                width={1600}
                height={1200}
                className="relative z-10 w-full rounded-xl border-4 border-foreground shadow-paper"
              />
              <div className="absolute -bottom-5 -right-5 z-20 rotate-3 rounded-lg border-2 border-foreground bg-cream px-4 py-2 font-mono text-xs uppercase tracking-widest shadow-paper">
                vol. 01 — alat & arsip
              </div>
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y-2 border-foreground bg-foreground py-4 text-background overflow-hidden">
          <div className="marquee gap-12 font-display text-2xl font-bold whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-12">
                {["Catat", "Lacak", "Rawat", "Pulihkan", "Arsipkan", "Audit", "Catat", "Lacak", "Rawat", "Pulihkan"].map((w, j) => (
                  <span key={j} className="flex items-center gap-12">
                    {w}<span className="text-accent">●</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">§ 02</p>
            <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">Kategori inventaris.</h2>
          </div>
          <Link to="/inventaris" className="hidden text-sm font-medium underline-offset-4 hover:underline md:inline">
            Lihat semua →
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const count = items.filter((it) => it.kategori === c).length;
            return (
              <Link
                key={c}
                to="/inventaris"
                search={{ kategori: c }}
                className="group relative overflow-hidden rounded-xl border-2 border-foreground bg-card p-6 transition hover:-translate-y-1 hover:shadow-paper"
              >
                <div className="text-5xl">{CATEGORY_EMOJI[c]}</div>
                <h3 className="mt-4 font-display text-xl font-bold leading-tight">{c}</h3>
                <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {count} alat tercatat
                </p>
                <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 opacity-0 transition group-hover:opacity-100" />
                <div
                  className="absolute -bottom-12 -right-12 h-32 w-32 rounded-full opacity-30 transition group-hover:scale-150"
                  style={{ background: `var(--${["teal-deep","rust","mustard","sage"][i % 4]})` }}
                />
              </Link>
            );
          })}
        </div>
      </section>

      {/* FEATURES */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-8 md:grid-cols-3">
          {[
            { icon: Boxes, t: "CRUD lengkap", d: "Tambah, ubah, hapus alat dengan halaman detail per item." },
            { icon: Sparkles, t: "Cari & sortir", d: "Filter berdasarkan kategori, status, lokasi, atau nama." },
            { icon: ShieldCheck, t: "Tersimpan aman", d: "Data tersimpan di basis data terkelola dengan kontrol akses." },
          ].map((f, i) => (
            <div key={i} className="rounded-xl border border-foreground/15 bg-card p-6 shadow-soft">
              <f.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 font-display text-2xl font-bold">{f.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
