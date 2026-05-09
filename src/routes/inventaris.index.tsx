import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { listItems, deleteItem, CATEGORIES, STATUSES, STATUS_STYLES, CATEGORY_EMOJI, type ItemCategory, type ItemStatus } from "@/lib/items";
import { Search, Trash2, Pencil, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { useAuth } from "@/lib/auth";
import { ExportPanel } from "@/components/ExportPanel";

const searchSchema = z.object({
  q: z.string().optional(),
  kategori: z.enum(["Komputer & Laptop", "Jaringan", "Audio/Video", "Peripheral"]).optional(),
  status: z.enum(["Bagus", "Rusak", "Dalam Perbaikan"]).optional(),
});

export const Route = createFileRoute("/inventaris/")({
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: "Daftar Inventaris — Kominfo Pekanbaru" },
      { name: "description", content: "Cari dan filter seluruh alat elektronik berdasarkan kategori dan status." },
    ],
  }),
  component: InventarisPage,
});

function InventarisPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [exportOpen, setExportOpen] = useState(false);
  const { data: items = [], isLoading, refetch } = useQuery({ queryKey: ["items"], queryFn: listItems });
  const [localQ, setLocalQ] = useState(search.q ?? "");

  const filtered = useMemo(() => {
    return items.filter((it) => {
      if (search.kategori && it.kategori !== search.kategori) return false;
      if (search.status && it.status !== search.status) return false;
      const q = (search.q ?? "").trim().toLowerCase();
      if (q) {
        const hay = [it.nama, it.merek, it.model, it.lokasi, it.serial_number].filter(Boolean).join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, search]);

  const setParam = <K extends keyof typeof search>(key: K, value: typeof search[K]) =>
    navigate({ search: (prev: typeof search) => ({ ...prev, [key]: value || undefined }) });

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Hapus "${nama}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      await deleteItem(id);
      toast.success("Alat berhasil dihapus");
      refetch();
      router.invalidate();
    } catch (e: any) {
      toast.error("Gagal menghapus: " + e.message);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-12">
      <div className="flex flex-col gap-2 border-b-2 border-foreground pb-6">
        <p className="font-mono text-xs uppercase tracking-widest text-accent">§ Arsip lengkap</p>
        <h1 className="font-display text-5xl font-black md:text-6xl">Inventaris.</h1>
        <p className="text-muted-foreground">Cari, sortir, dan kelola seluruh alat elektronik.</p>
      </div>

      {/* Filter bar */}
      <div className="mt-8 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={localQ}
            onChange={(e) => setLocalQ(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") setParam("q", localQ as any); }}
            onBlur={() => setParam("q", localQ as any)}
            placeholder="Cari nama, merek, lokasi…"
            className="w-full rounded-full border-2 border-foreground bg-card py-3 pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <select
          value={search.kategori ?? ""}
          onChange={(e) => setParam("kategori", (e.target.value || undefined) as ItemCategory | undefined)}
          className="rounded-full border-2 border-foreground bg-card px-4 py-3 text-sm font-medium outline-none"
        >
          <option value="">Semua kategori</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select
          value={search.status ?? ""}
          onChange={(e) => setParam("status", (e.target.value || undefined) as ItemStatus | undefined)}
          className="rounded-full border-2 border-foreground bg-card px-4 py-3 text-sm font-medium outline-none"
        >
          <option value="">Semua status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Link
          to="/inventaris/baru"
          className="inline-flex items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-foreground"
        >
          + Tambah
        </Link>
      </div>

      {/* Quick chip filters */}
      <div className="mt-4 flex flex-wrap gap-2">
        {(search.kategori || search.status || search.q) && (
          <button
            onClick={() => navigate({ search: {} })}
            className="rounded-full border border-foreground/20 bg-foreground px-3 py-1 text-xs text-background"
          >
            Reset filter ✕
          </button>
        )}
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setParam("status", search.status === s ? undefined : s)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              search.status === s ? STATUS_STYLES[s] + " font-bold" : "border-foreground/20 hover:bg-foreground/5"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="mt-8">
        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Memuat…</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-foreground/20 py-20 text-center">
            <p className="font-display text-2xl font-bold">Belum ada alat di sini.</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Coba ubah filter, atau{" "}
              <Link to="/inventaris/baru" className="underline">daftarkan alat baru</Link>.
            </p>
          </div>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((it, i) => (
              <li
                key={it.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border-2 border-foreground bg-card transition hover:-translate-y-1 hover:shadow-paper animate-fade-up"
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              >
                <div className="flex items-start justify-between gap-3 border-b-2 border-foreground/10 p-5">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                      {it.kategori}
                    </p>
                    <h3 className="mt-1 truncate font-display text-xl font-bold">{it.nama}</h3>
                    {(it.merek || it.model) && (
                      <p className="text-xs text-muted-foreground">{[it.merek, it.model].filter(Boolean).join(" · ")}</p>
                    )}
                  </div>
                  <span className="text-3xl">{CATEGORY_EMOJI[it.kategori]}</span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5 text-sm">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[it.status]}`}>
                      ● {it.status}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">×{it.jumlah}</span>
                  </div>
                  {it.lokasi && (
                    <p className="text-xs text-muted-foreground">📍 {it.lokasi}</p>
                  )}
                </div>
                <div className="flex divide-x divide-foreground/10 border-t-2 border-foreground/10">
                  <Link to="/inventaris/$id" params={{ id: it.id }} className="flex flex-1 items-center justify-center gap-1 py-3 text-xs font-medium hover:bg-foreground/5">
                    <Eye className="h-3.5 w-3.5" /> Detail
                  </Link>
                  <Link to="/inventaris/$id/edit" params={{ id: it.id }} className="flex flex-1 items-center justify-center gap-1 py-3 text-xs font-medium hover:bg-foreground/5">
                    <Pencil className="h-3.5 w-3.5" /> Ubah
                  </Link>
                  <button onClick={() => handleDelete(it.id, it.nama)} className="flex flex-1 items-center justify-center gap-1 py-3 text-xs font-medium text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" /> Hapus
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
