import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/admin/riwayat")({
  head: () => ({ meta: [{ title: "Riwayat Perubahan — Admin" }] }),
  component: RiwayatPage,
});

type LogRow = {
  id: string; alat_id: string | null; alat_nama: string; aksi: string;
  perubahan: Record<string, { from: any; to: any }> | null;
  dilakukan_oleh: string | null; waktu: string;
};

const FIELD_LABELS: Record<string, string> = {
  nama: "Nama", kategori: "Kategori", status: "Status", merek: "Merek",
  model: "Model", serial_number: "Serial Number", lokasi: "Lokasi",
  jumlah: "Jumlah", tanggal_pembelian: "Tgl. Pembelian", catatan: "Catatan",
};

function RiwayatPage() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.navigate({ to: "/login", search: { redirect: "/admin/riwayat" } });
    }
  }, [loading, user, isAdmin, router]);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["activity_log"],
    enabled: !!user && isAdmin,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activity_log").select("*").order("waktu", { ascending: false }).limit(500);
      if (error) throw error;
      return data as LogRow[];
    },
  });

  if (loading || !user || !isAdmin) return <p className="mx-auto max-w-4xl px-6 py-20 text-center">Memuat…</p>;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Link to="/inventaris" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Link>
      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-accent">§ Jejak admin</p>
      <h1 className="font-display text-5xl font-black md:text-6xl">Riwayat perubahan.</h1>
      <p className="mt-2 text-muted-foreground">Catatan setiap penambahan, perubahan, dan penghapusan alat.</p>

      <div className="mt-10 overflow-hidden rounded-2xl border-2 border-foreground bg-card">
        {isLoading ? (
          <p className="py-20 text-center text-muted-foreground">Memuat…</p>
        ) : logs.length === 0 ? (
          <p className="py-20 text-center text-muted-foreground">Belum ada aktivitas.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-foreground text-background">
              <tr>
                <Th>Waktu</Th><Th>Alat</Th><Th>Aksi</Th><Th>Diubah oleh</Th><Th>Detail</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foreground/10">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-foreground/5">
                  <td className="px-4 py-3 font-mono text-xs">{new Date(l.waktu).toLocaleString("id-ID")}</td>
                  <td className="px-4 py-3 font-medium">{l.alat_nama}</td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${aksiCls(l.aksi)}`}>
                      {l.aksi}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{l.dilakukan_oleh ?? "—"}</td>
                  <td className="px-4 py-3 text-xs">
                    {l.aksi === "edit" && l.perubahan ? (
                      <ul className="space-y-0.5">
                        {Object.entries(l.perubahan).map(([k, v]) => (
                          <li key={k}>
                            <span className="font-mono text-[10px] uppercase text-muted-foreground">{FIELD_LABELS[k] ?? k}:</span>{" "}
                            <span className="text-destructive line-through">{String(v.from ?? "—")}</span>{" → "}
                            <span className="text-status-good">{String(v.to ?? "—")}</span>
                          </li>
                        ))}
                        {Object.keys(l.perubahan).length === 0 && <span className="text-muted-foreground">Tidak ada perubahan</span>}
                      </ul>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="px-4 py-3 text-left font-mono text-[10px] uppercase tracking-widest">{children}</th>
);

function aksiCls(a: string) {
  if (a === "tambah") return "bg-status-good/15 text-status-good border-status-good/30";
  if (a === "edit") return "bg-status-repair/15 text-status-repair border-status-repair/30";
  return "bg-status-broken/15 text-status-broken border-status-broken/30";
}
