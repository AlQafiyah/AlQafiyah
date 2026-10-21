-- القافية V23 - ترقية إضافية بعد تنفيذ SQL V21. احتفظ بنسخة احتياطية.
BEGIN;
ALTER TABLE public.qafiyah_social_links ADD COLUMN IF NOT EXISTS placement text NOT NULL DEFAULT 'footer';
CREATE INDEX IF NOT EXISTS qafiyah_social_placement_idx ON public.qafiyah_social_links(placement,platform);

-- معلومات إدارية مقيدة بالأدوار، ولا تمنح الوصول إلى auth.users مباشرة.
CREATE OR REPLACE FUNCTION public.qafiyah_v23_admin_details()
RETURNS TABLE(user_id uuid,display_name text,email text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path=public,auth,pg_temp AS $$
BEGIN
 IF public.qafiyah_my_role() NOT IN ('owner','manager','supervisor') THEN RAISE EXCEPTION 'غير مصرح'; END IF;
 RETURN QUERY SELECT a.user_id,coalesce(nullif(trim(concat_ws(' ',p.first_name,p.last_name)),''),u.email::text),u.email::text
 FROM public.admin_users a JOIN auth.users u ON u.id=a.user_id LEFT JOIN public.profiles p ON p.id=u.id;
END $$;
REVOKE ALL ON FUNCTION public.qafiyah_v23_admin_details() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.qafiyah_v23_admin_details() TO authenticated;

-- رفع ملفات الإعلانات إلى مخزن منفصل مع حماية الكتابة على مستوى التخزين.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('qafiyah-ad-media','qafiyah-ad-media',true,31457280,ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
ON CONFLICT(id) DO NOTHING;
DROP POLICY IF EXISTS qafiyah_v23_ad_media_read ON storage.objects;
CREATE POLICY qafiyah_v23_ad_media_read ON storage.objects FOR SELECT TO anon,authenticated
USING(bucket_id='qafiyah-ad-media');
DROP POLICY IF EXISTS qafiyah_v23_ad_media_insert ON storage.objects;
CREATE POLICY qafiyah_v23_ad_media_insert ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='qafiyah-ad-media' AND public.qafiyah_my_role() IN ('owner','manager'));
DROP POLICY IF EXISTS qafiyah_v23_ad_media_update ON storage.objects;
CREATE POLICY qafiyah_v23_ad_media_update ON storage.objects FOR UPDATE TO authenticated
USING(bucket_id='qafiyah-ad-media' AND public.qafiyah_my_role() IN ('owner','manager'))
WITH CHECK(bucket_id='qafiyah-ad-media' AND public.qafiyah_my_role() IN ('owner','manager'));
COMMIT;
