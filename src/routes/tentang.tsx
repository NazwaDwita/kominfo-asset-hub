import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/tentang")({
  head: () => ({
    meta: [
      { title: "Tentang — Inventaris Kominfo Pekanbaru" },
      { name: "description", content: "Sistem inventaris internal Diskominfo Pekanbaru." },
    ],
  }),
  component: TentangPage,
});

function TentangPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20">
      <p className="font-mono text-xs uppercase tracking-widest text-accent">§ Tentang</p>
      <h1 className="mt-2 font-display text-6xl font-black">Sistem internal,<br /><span className="italic text-primary">untuk arsip yang hidup.</span></h1>
      <div className="mt-8 space-y-4 text-lg leading-relaxed text-muted-foreground">
        <p>
          Inventaris Kominfo Pekanbaru adalah sistem pendataan alat elektronik milik
          Dinas Komunikasi dan Informatika Kota Pekanbaru.
        </p>
        <p>
          Setiap perangkat — dari komputer kerja, perangkat jaringan, peralatan audio/video,
          hingga peripheral pendukung — tercatat dengan status terkini: <strong>Bagus</strong>,{" "}
          <strong>Rusak</strong>, atau <strong>Dalam Perbaikan</strong>.
        </p>
        <p>
          Tujuannya sederhana: tidak ada lagi alat yang hilang dalam ingatan,
          tidak ada lagi audit yang berakhir kacau.
        </p>
      </div>
    </div>
  );
}
