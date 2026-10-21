-- القافية V22: تحديث إضافي؛ يتطلب تنفيذ V21 SQL مسبقًا.
-- لا يعدل أو يحذف سياسات الصلاحيات الحالية.
BEGIN;
-- مساحة ملفات الإعلانات: قراءة عامة ورفع للمالك والمدير فقط.
INSERT INTO storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
VALUES('qafiyah-ads','qafiyah-ads',true,26214400,ARRAY['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm'])
ON CONFLICT (id) DO NOTHING;
DROP POLICY IF EXISTS qafiyah_v22_ads_upload ON storage.objects;
CREATE POLICY qafiyah_v22_ads_upload ON storage.objects FOR INSERT TO authenticated
WITH CHECK(bucket_id='qafiyah-ads' AND public.qafiyah_my_role() IN ('owner','manager'));
DROP POLICY IF EXISTS qafiyah_v22_ads_read ON storage.objects;
CREATE POLICY qafiyah_v22_ads_read ON storage.objects FOR SELECT TO anon,authenticated
USING(bucket_id='qafiyah-ads');
COMMIT;
