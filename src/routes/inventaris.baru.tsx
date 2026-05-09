import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CATEGORIES, STATUSES, createItem, type ItemInsert } from "@/lib/items";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  nama: z.string().trim().min(1, "Nama wajib").max(120),
  kategori: z.enum(["Komputer & Laptop", "Jaringan", "Audio/Video", "Peripheral"]),
  status: z.enum(["Bagus", "Rusak", "Dalam Perbaikan"]),
  jumlah: z.coerce.number().int().min(1).max(9999),
  merek: z.string().trim().max(80).optional().or(z.literal("")),
  model: z.string().trim().max(80).optional().or(z.literal("")),
  serial_number: z.string().trim().max(120).optional().or(z.literal("")),
  lokasi: z.string().trim().max(120).optional().or(z.literal("")),
  tanggal_pembelian: z.string().optional().or(z.literal("")),
  gambar_url: z.string().trim().url("URL tidak valid").max(500).optional().or(z.literal("")),
  catatan: z.string().trim().max(1000).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/inventaris/baru")({
  head: () => ({ meta: [{ title: "Daftarkan Alat — Inventaris Kominfo" }] }),
  component: NewItemPage,
});

function NewItemPage() {
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Bagus", jumlah: 1, kategori: "Komputer & Laptop" },
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.navigate({ to: "/login", search: { redirect: "/inventaris/baru" } });
    }
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) return <p className="mx-auto max-w-3xl px-6 py-20 text-center">Memuat…</p>;

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload: ItemInsert = {
        nama: data.nama,
        kategori: data.kategori,
        status: data.status,
        jumlah: data.jumlah,
        merek: data.merek || null,
        model: data.model || null,
        serial_number: data.serial_number || null,
        lokasi: data.lokasi || null,
        tanggal_pembelian: data.tanggal_pembelian || null,
        gambar_url: data.gambar_url || null,
        catatan: data.catatan || null,
      };
      const created = await createItem(payload);
      toast.success("Alat berhasil ditambahkan");
      router.navigate({ to: "/inventaris/$id", params: { id: created.id } });
    } catch (e: any) {
      toast.error("Gagal menyimpan: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/inventaris" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke daftar
      </Link>
      <h1 className="mt-4 font-display text-5xl font-black">Alat baru.</h1>
      <p className="text-muted-foreground">Lengkapi data berikut untuk menambahkan alat ke arsip.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6 rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper md:p-8">
        <Field label="Nama alat *" error={errors.nama?.message}>
          <input {...register("nama")} className={inputCls} placeholder="cth: Laptop ASUS Ruang Sekretariat" />
        </Field>

        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Kategori *" error={errors.kategori?.message}>
            <select {...register("kategori")} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Status *" error={errors.status?.message}>
            <select {...register("status")} className={inputCls}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Jumlah *" error={errors.jumlah?.message}>
            <input type="number" min={1} {...register("jumlah")} className={inputCls} />
          </Field>
          <Field label="Lokasi" error={errors.lokasi?.message}>
            <input {...register("lokasi")} className={inputCls} placeholder="cth: Ruang Server Lt. 2" />
          </Field>
          <Field label="Merek" error={errors.merek?.message}>
            <input {...register("merek")} className={inputCls} placeholder="cth: Cisco" />
          </Field>
          <Field label="Model" error={errors.model?.message}>
            <input {...register("model")} className={inputCls} placeholder="cth: Catalyst 2960" />
          </Field>
          <Field label="Serial Number" error={errors.serial_number?.message}>
            <input {...register("serial_number")} className={inputCls} />
          </Field>
          <Field label="Tanggal pembelian" error={errors.tanggal_pembelian?.message}>
            <input type="date" {...register("tanggal_pembelian")} className={inputCls} />
          </Field>
        </div>

        <Field label="URL gambar (opsional)" error={errors.gambar_url?.message}>
          <input {...register("gambar_url")} className={inputCls} placeholder="https://..." />
        </Field>

        <Field label="Catatan" error={errors.catatan?.message}>
          <textarea rows={4} {...register("catatan")} className={inputCls + " resize-y"} placeholder="Riwayat perawatan, kondisi tambahan, dll." />
        </Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary disabled:opacity-50"
          >
            {submitting ? "Menyimpan…" : "Simpan ke arsip"}
          </button>
          <Link to="/inventaris" className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium hover:bg-foreground/5">
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}

const inputCls = "w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  );
}
