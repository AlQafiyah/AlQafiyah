-- إظهار حالة الإخفاء للموقع العام حتى لا يعيد إظهار العناصر المخفية.
-- إعدادات الروابط ليست أسرارًا؛ لا تستخدم هذا الجدول لتخزين بيانات خاصة.
BEGIN;
DROP POLICY IF EXISTS v21_social_public ON public.qafiyah_social_links;
CREATE POLICY v21_social_public ON public.qafiyah_social_links FOR SELECT TO anon,authenticated USING (true);
COMMIT;
