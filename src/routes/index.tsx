import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import heroCollage from "@/assets/hero-collage.jpg";
import { listItems, CATEGORIES, CATEGORY_EMOJI } from "@/lib/items";
import { ArrowUpRight, Radio, Wrench, Building2, Cpu, Server, Camera } from "lucide-react";
import { Reveal, Typewriter } from "@/components/Reveal";
import { useAuth } from "@/lib/auth";

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
  const { isAdmin } = useAuth();

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
              {isAdmin && (
                <Link
                  to="/inventaris/baru"
                  className="inline-flex items-center gap-2 rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium hover:bg-foreground/5"
                >
                  Daftarkan alat baru
                </Link>
              )}
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
        <Reveal variant="slide-left">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">§ 02</p>
          <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">Kategori inventaris.</h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c, i) => {
            const count = items.filter((it) => it.kategori === c).length;
            const variants = ["fade-up", "zoom", "card-flip", "blur"] as const;
            return (
              <Reveal key={c} variant={variants[i % variants.length]} delay={i * 90}>
                <Link
                  to="/inventaris"
                  search={{ kategori: c }}
                  className="group relative block overflow-hidden rounded-xl border-2 border-foreground bg-card p-6 transition hover:-translate-y-1 hover:shadow-paper"
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
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* TENTANG INSTANSI — typewriter + manifesto */}
      <section className="border-y-2 border-foreground bg-foreground/[0.02]">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-20 md:grid-cols-12 md:gap-16">
          <Reveal variant="slide-left" className="md:col-span-5">
            <p className="font-mono text-xs uppercase tracking-widest text-accent">§ 03 — Tentang Instansi</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-tight md:text-5xl">
              <Typewriter text="Diskominfotik Pekanbaru — penjaga sinyal kota." />
            </h2>
          </Reveal>
          <Reveal variant="slide-right" delay={150} className="md:col-span-7">
            <p className="text-lg leading-relaxed text-muted-foreground">
              Dinas Komunikasi, Informatika, dan Statistik Kota Pekanbaru bertugas
              menjaga arus informasi publik, membangun infrastruktur jaringan
              pemerintah daerah, serta mengelola layanan digital warga.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Di balik setiap siaran pers, formulir online, dan rapat virtual —
              ada router yang berdengung, server yang berdetak, dan kamera yang
              merekam. Sistem ini mendata mereka semua.
            </p>
          </Reveal>
        </div>
      </section>

      {/* PERAN TIAP ALAT — vertical timeline with mixed reveal */}
      <section className="mx-auto max-w-7xl px-6 py-20">
        <Reveal variant="fade-up">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">§ 04</p>
          <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">
            Setiap alat punya peran.
          </h2>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            Alat-alat elektronik di Diskominfotik bukan sekadar inventaris di gudang —
            mereka tulang punggung pelayanan publik kota.
          </p>
        </Reveal>

        <div className="mt-12 space-y-6">
          {[
            {
              icon: Server,
              title: "Server & jaringan inti",
              desc: "Router, switch, dan access point menyalakan sistem informasi pemerintahan, layanan publik daring, hingga koneksi internet kantor lintas bidang.",
              variant: "slide-left" as const,
              tone: "teal-deep",
            },
            {
              icon: Cpu,
              title: "Komputer & laptop kerja",
              desc: "Perangkat harian ASN untuk mengolah data, mempersiapkan kebijakan, dan menyajikan layanan digital ke masyarakat Pekanbaru.",
              variant: "slide-right" as const,
              tone: "rust",
            },
            {
              icon: Camera,
              title: "Audio/Video & dokumentasi",
              desc: "Kamera, proyektor, dan sound system untuk liputan kegiatan walikota, rapat lintas OPD, dan diseminasi informasi publik.",
              variant: "slide-left" as const,
              tone: "mustard",
            },
            {
              icon: Radio,
              title: "Peripheral pendukung",
              desc: "Printer, UPS, scanner, dan perangkat pendukung lain yang menjaga arsip tetap rapi dan layanan tidak terhenti saat listrik padam.",
              variant: "slide-right" as const,
              tone: "sage",
            },
          ].map((row, i) => (
            <Reveal key={i} variant={row.variant} delay={i * 80}>
              <div className="grid items-center gap-6 rounded-2xl border-2 border-foreground bg-card p-6 md:grid-cols-[auto_1fr_auto] md:p-8">
                <div
                  className="grid h-16 w-16 place-items-center rounded-xl border-2 border-foreground"
                  style={{ background: `var(--${row.tone})`, color: "var(--cream)" }}
                >
                  <row.icon className="h-7 w-7" strokeWidth={2.2} />
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                    0{i + 1} / 04
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold md:text-3xl">{row.title}</h3>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{row.desc}</p>
                </div>
                <div className="hidden font-display text-6xl font-black opacity-10 md:block">
                  0{i + 1}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* SIKLUS PERAWATAN */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <Reveal variant="fade-up">
          <p className="font-mono text-xs uppercase tracking-widest text-accent">§ 05</p>
          <h2 className="mt-2 font-display text-4xl font-black md:text-5xl">
            Siklus perawatan, terlacak rapi.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            { num: "01", t: "Bagus", d: "Beroperasi normal, siap pakai harian.", v: "zoom" as const, color: "var(--status-good)" },
            { num: "02", t: "Dalam Perbaikan", d: "Sedang diservis teknisi atau menunggu sparepart.", v: "fade-up" as const, color: "var(--status-repair)" },
            { num: "03", t: "Rusak", d: "Tidak dapat dipakai — menunggu penghapusan aset.", v: "blur" as const, color: "var(--status-broken)" },
          ].map((s, i) => (
            <Reveal key={s.t} variant={s.v} delay={i * 120} className="h-full">
              <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border-2 border-foreground bg-card p-8 shadow-paper">
                <span
                  className="absolute right-4 top-4 h-3 w-3 rounded-full"
                  style={{ background: s.color, boxShadow: `0 0 0 4px ${s.color}33` }}
                />
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{s.num}</p>
                <h3 className="mt-3 font-display text-3xl font-black">{s.t}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{s.d}</p>
                <Wrench className="absolute -bottom-4 -right-4 h-24 w-24 opacity-[0.06]" strokeWidth={1.2} />
              </div>
            </Reveal>
          ))}
        </div>

        {isAdmin && (
          <Reveal variant="fade-up" delay={200}>
            <div className="mt-16 flex flex-col items-start gap-6 rounded-3xl border-2 border-foreground bg-foreground p-10 text-background md:flex-row md:items-center md:justify-between md:p-14">
              <div className="flex items-center gap-4">
                <Building2 className="h-10 w-10 text-accent" />
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-accent">Diskominfotik Pekanbaru</p>
                  <p className="mt-1 font-display text-3xl font-black md:text-4xl">Mulai catat hari ini.</p>
                </div>
              </div>
              <Link
                to="/inventaris/baru"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-sm font-medium text-accent-foreground transition hover:translate-y-[-2px]"
              >
                + Daftarkan alat baru
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        )}
      </section>
    </>
  );
}

