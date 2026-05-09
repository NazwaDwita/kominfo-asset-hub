-- profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- helper function (security definer to avoid recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_uid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _uid AND role = 'admin');
$$;

CREATE POLICY "Users see own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- auto-create profile with admin role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role) VALUES (NEW.id, NEW.email, 'admin')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- activity_log
CREATE TABLE public.activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alat_id UUID,
  alat_nama TEXT NOT NULL,
  aksi TEXT NOT NULL,
  perubahan JSONB,
  dilakukan_oleh TEXT,
  waktu TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin read log" ON public.activity_log
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin insert log" ON public.activity_log
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));

-- update items RLS: public read; admin only for write
DROP POLICY IF EXISTS "Public can insert items" ON public.items;
DROP POLICY IF EXISTS "Public can update items" ON public.items;
DROP POLICY IF EXISTS "Public can delete items" ON public.items;

CREATE POLICY "Admin insert items" ON public.items
  FOR INSERT WITH CHECK (public.is_admin(auth.uid()));
CREATE POLICY "Admin update items" ON public.items
  FOR UPDATE USING (public.is_admin(auth.uid()));
CREATE POLICY "Admin delete items" ON public.items
  FOR DELETE USING (public.is_admin(auth.uid()));