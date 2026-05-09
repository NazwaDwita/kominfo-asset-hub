import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getItem, deleteItem, STATUS_STYLES, CATEGORY_EMOJI } from "@/lib/items";
import { ArrowLeft, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/inventaris/$id/")({
  head: ({ params }) => ({
    meta: [{ title: `Detail alat — ${params.id.slice(0, 8)}` }],
  }),
  component: DetailPage,
});

function DetailPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { data: item, isLoading } = useQuery({ queryKey: ["item", id], queryFn: () => getItem(id) });

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Hapus "${item.nama}"?`)) return;
    try {
      await deleteItem(id);
      toast.success("Alat dihapus");
      router.navigate({ to: "/inventaris" });
    } catch (e: any) {
      toast.error("Gagal: " + e.message);
    }
  };

  if (isLoading) return <p className="mx-auto max-w-4xl px-6 py-20 text-center">Memuat…</p>;

  if (!item) {
    return (
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        <p className="font-display text-3xl font-bold">Alat tidak ditemukan</p>
        <Link to="/inventaris" className="mt-4 inline-block underline">Kembali ke daftar</Link>
      </div>
    );
  }

  const meta: Array<[string, string | number | null]> = [
    ["Kategori", item.kategori],
    ["Merek", item.merek],
    ["Model", item.model],
    ["Serial Number", item.serial_number],
    ["Lokasi", item.lokasi],
    ["Jumlah", item.jumlah],
    ["Tanggal pembelian", item.tanggal_pembelian],
    ["Ditambahkan", new Date(item.created_at).toLocaleString("id-ID")],
    ["Diperbarui", new Date(item.updated_at).toLocaleString("id-ID")],
  ];

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link to="/inventaris" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_1fr]">
        {/* LEFT */}
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-accent">{item.kategori}</p>
          <h1 className="mt-2 font-display text-5xl font-black leading-tight md:text-6xl">{item.nama}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className={`rounded-full border px-3 py-1 text-xs font-medium ${STATUS_STYLES[item.status]}`}>
              ● {item.status}
            </span>
            <span className="rounded-full border border-foreground/20 px-3 py-1 text-xs font-medium">
              {CATEGORY_EMOJI[item.kategori]} {item.kategori}
            </span>
          </div>

          {item.catatan && (
            <div className="mt-8 rounded-xl border-l-4 border-accent bg-card p-5">
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Catatan</p>
              <p className="mt-2 whitespace-pre-wrap text-sm">{item.catatan}</p>
            </div>
          )}

          <dl className="mt-8 divide-y divide-foreground/10 rounded-xl border-2 border-foreground bg-card">
            {meta.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 px-5 py-3 text-sm">
                <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{k}</dt>
                <dd className="font-medium">{v ?? <span className="text-muted-foreground">—</span>}</dd>
              </div>
            ))}
          </dl>

          {isAdmin && (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/inventaris/$id/edit"
                params={{ id: item.id }}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background"
              >
                <Pencil className="h-4 w-4" /> Ubah data
              </Link>
              <button
                onClick={handleDelete}
                className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-5 py-2.5 text-sm font-medium text-destructive hover:bg-destructive hover:text-destructive-foreground"
              >
                <Trash2 className="h-4 w-4" /> Hapus
              </button>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div>
          <div className="sticky top-24">
            <div className="relative">
              <div className="absolute -inset-2 rotate-2 rounded-xl bg-mustard" />
              {item.gambar_url ? (
                <img
                  src={item.gambar_url}
                  alt={item.nama}
                  className="relative z-10 aspect-square w-full rounded-xl border-4 border-foreground object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              ) : (
                <div className="relative z-10 grid aspect-square w-full place-items-center rounded-xl border-4 border-foreground bg-card text-9xl">
                  {CATEGORY_EMOJI[item.kategori]}
                </div>
              )}
              <div className="absolute -bottom-3 -right-3 z-20 rotate-3 rounded-lg border-2 border-foreground bg-cream px-3 py-1 font-mono text-[10px] uppercase tracking-widest">
                ID · {item.id.slice(0, 8)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
