-- القافية V20: إظهار وإخفاء الصفحات القانونية (نفّذ مرة واحدة)
ALTER TABLE public.site_settings ADD COLUMN IF NOT EXISTS is_visible boolean NOT NULL DEFAULT true;
UPDATE public.site_settings SET is_visible=true WHERE key IN ('privacy','terms') AND is_visible IS NULL;
-- لا نحذف السياسات الحالية ولا نغيّر صلاحيات بقية الموقع.
