import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CATEGORIES, STATUSES, getItem, updateItem, type ItemInsert } from "@/lib/items";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/lib/auth";

const schema = z.object({
  nama: z.string().trim().min(1).max(120),
  kategori: z.enum(["Komputer & Laptop", "Jaringan", "Audio/Video", "Peripheral"]),
  status: z.enum(["Bagus", "Rusak", "Dalam Perbaikan"]),
  jumlah: z.coerce.number().int().min(1).max(9999),
  merek: z.string().trim().max(80).optional().or(z.literal("")),
  model: z.string().trim().max(80).optional().or(z.literal("")),
  serial_number: z.string().trim().max(120).optional().or(z.literal("")),
  lokasi: z.string().trim().max(120).optional().or(z.literal("")),
  tanggal_pembelian: z.string().optional().or(z.literal("")),
  gambar_url: z.string().trim().url().max(500).optional().or(z.literal("")),
  catatan: z.string().trim().max(1000).optional().or(z.literal("")),
});
type FormData = z.infer<typeof schema>;

export const Route = createFileRoute("/inventaris/$id/edit")({
  head: () => ({ meta: [{ title: "Ubah alat — Inventaris Kominfo" }] }),
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const router = useRouter();
  const { user, isAdmin, loading } = useAuth();
  const { data: item, isLoading } = useQuery({ queryKey: ["item", id], queryFn: () => getItem(id), enabled: !!user && isAdmin });
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.navigate({ to: "/login", search: { redirect: `/inventaris/${id}/edit` } });
    }
  }, [loading, user, isAdmin, router, id]);

  useEffect(() => {
    if (item) reset({
      nama: item.nama,
      kategori: item.kategori,
      status: item.status,
      jumlah: item.jumlah,
      merek: item.merek ?? "",
      model: item.model ?? "",
      serial_number: item.serial_number ?? "",
      lokasi: item.lokasi ?? "",
      tanggal_pembelian: item.tanggal_pembelian ?? "",
      gambar_url: item.gambar_url ?? "",
      catatan: item.catatan ?? "",
    });
  }, [item, reset]);

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const payload: Partial<ItemInsert> = {
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
      await updateItem(id, payload);
      toast.success("Perubahan disimpan");
      router.navigate({ to: "/inventaris/$id", params: { id } });
    } catch (e: any) {
      toast.error("Gagal: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) return <p className="mx-auto max-w-3xl px-6 py-20 text-center">Memuat…</p>;
  if (!item) return <p className="mx-auto max-w-3xl px-6 py-20 text-center">Alat tidak ditemukan</p>;

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link to="/inventaris/$id" params={{ id }} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Kembali ke detail
      </Link>
      <h1 className="mt-4 font-display text-5xl font-black">Ubah data.</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-6 rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper md:p-8">
        <Field label="Nama alat *" error={errors.nama?.message}>
          <input {...register("nama")} className={inputCls} />
        </Field>
        <div className="grid gap-6 md:grid-cols-2">
          <Field label="Kategori *"><select {...register("kategori")} className={inputCls}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></Field>
          <Field label="Status *"><select {...register("status")} className={inputCls}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select></Field>
          <Field label="Jumlah *"><input type="number" min={1} {...register("jumlah")} className={inputCls} /></Field>
          <Field label="Lokasi"><input {...register("lokasi")} className={inputCls} /></Field>
          <Field label="Merek"><input {...register("merek")} className={inputCls} /></Field>
          <Field label="Model"><input {...register("model")} className={inputCls} /></Field>
          <Field label="Serial Number"><input {...register("serial_number")} className={inputCls} /></Field>
          <Field label="Tanggal pembelian"><input type="date" {...register("tanggal_pembelian")} className={inputCls} /></Field>
        </div>
        <Field label="URL gambar" error={errors.gambar_url?.message}>
          <input {...register("gambar_url")} className={inputCls} />
        </Field>
        <Field label="Catatan"><textarea rows={4} {...register("catatan")} className={inputCls + " resize-y"} /></Field>

        <div className="flex flex-wrap gap-3 pt-2">
          <button type="submit" disabled={submitting} className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background hover:bg-primary disabled:opacity-50">
            {submitting ? "Menyimpan…" : "Simpan perubahan"}
          </button>
          <Link to="/inventaris/$id" params={{ id }} className="rounded-full border border-foreground/20 px-6 py-3 text-sm font-medium hover:bg-foreground/5">
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
