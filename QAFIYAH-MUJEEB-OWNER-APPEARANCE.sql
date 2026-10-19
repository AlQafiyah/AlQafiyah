-- القافية | تخصيص مظهر مُجيب: نسخة إضافة بعد SQL مُجيب ومِضمار الأساسي.
-- نفّذ مرة واحدة في Supabase SQL Editor بعد أخذ نسخة احتياطية.
-- يحفظ إعدادات الموقع الحالية ويغيّر صلاحيات مُجيب فقط إلى المالك، ولا يلمس «مِضمار».
BEGIN;

ALTER TABLE public.qafiyah_mujeeb_settings
  ADD COLUMN IF NOT EXISTS short_description text NOT NULL DEFAULT 'مساعد القافية الأدبي',
  ADD COLUMN IF NOT EXISTS avatar_url text,
  ADD COLUMN IF NOT EXISTS background_dark_url text,
  ADD COLUMN IF NOT EXISTS background_light_url text;

-- المالك: مستخدم نشط في جدول admin_users بدور owner فقط.
CREATE OR REPLACE FUNCTION public.qafiyah_is_owner()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path=public
AS $$ SELECT EXISTS (
  SELECT 1 FROM public.admin_users
  WHERE user_id=auth.uid() AND is_active IS TRUE AND role='owner'
); $$;
REVOKE ALL ON FUNCTION public.qafiyah_is_owner() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.qafiyah_is_owner() TO authenticated;

-- كان المدير مخوّلاً بتعديل مُجيب؛ هذا الإصدار يسحب منه هذه الصلاحية.
DO $$
DECLARE pol record;
BEGIN
  -- Any old manager/editor write policy would override owner-only RLS because policies are OR-ed.
  FOR pol IN SELECT policyname FROM pg_policies
    WHERE schemaname='public' AND tablename='qafiyah_mujeeb_settings'
      AND policyname <> 'mujeeb settings public read'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.qafiyah_mujeeb_settings',pol.policyname);
  END LOOP;
END $$;
CREATE POLICY "mujeeb settings owner edit"
ON public.qafiyah_mujeeb_settings FOR ALL TO authenticated
USING (public.qafiyah_is_owner()) WITH CHECK (public.qafiyah_is_owner());
-- تبقى قراءة الاسم والصورة والخلفيات عامة حتى تظهر للزوار.

-- مخزن صور مخصص: عام للقراءة، محمي للكتابة من المالك فقط.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('mujeeb-assets','mujeeb-assets',true,6291456,ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT(id) DO UPDATE SET public=true,file_size_limit=6291456,
 allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp'];

DROP POLICY IF EXISTS "mujeeb assets public view" ON storage.objects;
CREATE POLICY "mujeeb assets public view" ON storage.objects FOR SELECT
TO anon,authenticated USING(bucket_id='mujeeb-assets');
DROP POLICY IF EXISTS "mujeeb assets owner insert" ON storage.objects;
CREATE POLICY "mujeeb assets owner insert" ON storage.objects FOR INSERT
TO authenticated WITH CHECK(bucket_id='mujeeb-assets' AND public.qafiyah_is_owner());
DROP POLICY IF EXISTS "mujeeb assets owner update" ON storage.objects;
CREATE POLICY "mujeeb assets owner update" ON storage.objects FOR UPDATE
TO authenticated USING(bucket_id='mujeeb-assets' AND public.qafiyah_is_owner())
WITH CHECK(bucket_id='mujeeb-assets' AND public.qafiyah_is_owner());
DROP POLICY IF EXISTS "mujeeb assets owner delete" ON storage.objects;
CREATE POLICY "mujeeb assets owner delete" ON storage.objects FOR DELETE
TO authenticated USING(bucket_id='mujeeb-assets' AND public.qafiyah_is_owner());

COMMIT;
