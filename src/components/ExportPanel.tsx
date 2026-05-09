import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CATEGORIES, STATUSES, type Item, type ItemCategory, type ItemStatus } from "@/lib/items";
import { X, FileSpreadsheet, FileText } from "lucide-react";

const COLS = ["No", "Nama Alat", "Kategori", "Merek/Model", "Nomor Seri", "Lokasi", "Kondisi", "Tanggal Masuk", "Keterangan"];

export function ExportPanel({ items, onClose }: { items: Item[]; onClose: () => void }) {
  const [kategori, setKategori] = useState<ItemCategory | "">("");
  const [statuses, setStatuses] = useState<Set<ItemStatus>>(new Set(STATUSES));

  const filtered = useMemo(() => items.filter((it) =>
    (!kategori || it.kategori === kategori) && statuses.has(it.status)
  ), [items, kategori, statuses]);

  const rows = filtered.map((it, i) => [
    i + 1,
    it.nama,
    it.kategori,
    [it.merek, it.model].filter(Boolean).join(" / "),
    it.serial_number ?? "-",
    it.lokasi ?? "-",
    it.status,
    it.tanggal_pembelian ?? "-",
    it.catatan ?? "-",
  ]);

  const tanggal = new Date().toISOString().slice(0, 10);

  const exportXlsx = () => {
    const ws = XLSX.utils.aoa_to_sheet([COLS, ...rows]);
    ws["!cols"] = COLS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventaris");
    XLSX.writeFile(wb, `Inventaris_Diskominfo_Pekanbaru_${tanggal}.xlsx`);
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(12); doc.setFont("helvetica", "bold");
    doc.text("DINAS KOMUNIKASI DAN INFORMATIKA KOTA PEKANBARU", 148, 14, { align: "center" });
    doc.setFontSize(14);
    doc.text("LAPORAN INVENTARIS ALAT ELEKTRONIK", 148, 22, { align: "center" });
    doc.setFontSize(9); doc.setFont("helvetica", "normal");
    doc.text(`Tanggal cetak: ${new Date().toLocaleDateString("id-ID")}`, 148, 28, { align: "center" });

    autoTable(doc, {
      head: [COLS],
      body: rows.map(r => r.map(String)),
      startY: 34,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [20, 60, 60], textColor: 255 },
    });

    const counts = { Bagus: 0, "Dalam Perbaikan": 0, Rusak: 0 } as Record<ItemStatus, number>;
    filtered.forEach((it) => { counts[it.status]++; });
    const finalY = (doc as any).lastAutoTable?.finalY ?? 40;
    doc.setFontSize(10); doc.setFont("helvetica", "bold");
    doc.text(`Total: ${filtered.length} alat  |  Bagus: ${counts.Bagus}  |  Dalam Perbaikan: ${counts["Dalam Perbaikan"]}  |  Rusak: ${counts.Rusak}`, 14, finalY + 10);

    doc.save(`Inventaris_Diskominfo_Pekanbaru_${tanggal}.pdf`);
  };

  const toggleStatus = (s: ItemStatus) => {
    const n = new Set(statuses);
    n.has(s) ? n.delete(s) : n.add(s);
    setStatuses(n);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 backdrop-blur" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border-2 border-foreground bg-card p-6 shadow-paper">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-accent">§ Ekspor laporan</p>
            <h2 className="mt-1 font-display text-3xl font-black">Unduh data.</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-foreground/10"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-6 space-y-5">
          <div>
            <label className="mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Kategori</label>
            <select value={kategori} onChange={(e) => setKategori(e.target.value as any)} className="w-full rounded-lg border-2 border-foreground/20 bg-background px-3 py-2.5 text-sm">
              <option value="">Semua kategori</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <label key={s} className="inline-flex cursor-pointer items-center gap-2 rounded-full border-2 border-foreground/20 bg-background px-3 py-1.5 text-sm">
                  <input type="checkbox" checked={statuses.has(s)} onChange={() => toggleStatus(s)} />
                  {s}
                </label>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} alat akan diekspor.</p>
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button onClick={exportXlsx} disabled={!filtered.length} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-status-good px-5 py-3 text-sm font-medium text-background disabled:opacity-50">
            <FileSpreadsheet className="h-4 w-4" /> Unduh Excel
          </button>
          <button onClick={exportPdf} disabled={!filtered.length} className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background disabled:opacity-50">
            <FileText className="h-4 w-4" /> Unduh PDF
          </button>
        </div>
      </div>
    </div>
  );
}
