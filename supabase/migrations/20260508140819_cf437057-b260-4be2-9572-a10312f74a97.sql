CREATE TYPE public.item_category AS ENUM ('Komputer & Laptop', 'Jaringan', 'Audio/Video', 'Peripheral');
CREATE TYPE public.item_status AS ENUM ('Bagus', 'Rusak', 'Dalam Perbaikan');

CREATE TABLE public.items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nama TEXT NOT NULL,
  kategori public.item_category NOT NULL,
  status public.item_status NOT NULL DEFAULT 'Bagus',
  merek TEXT,
  model TEXT,
  serial_number TEXT,
  lokasi TEXT,
  tanggal_pembelian DATE,
  jumlah INTEGER NOT NULL DEFAULT 1,
  catatan TEXT,
  gambar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view items" ON public.items FOR SELECT USING (true);
CREATE POLICY "Public can insert items" ON public.items FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update items" ON public.items FOR UPDATE USING (true);
CREATE POLICY "Public can delete items" ON public.items FOR DELETE USING (true);

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER items_set_updated_at BEFORE UPDATE ON public.items
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX items_kategori_idx ON public.items(kategori);
CREATE INDEX items_status_idx ON public.items(status);