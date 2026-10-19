-- القافية | تخصيص صور سِجال وبيانات البطاقات (ترقية صغيرة آمنة).
-- نفّذ بعد QAFIYAH-SIJAL-UPGRADE.sql في SQL Editor بمشروع Supabase نفسه.
-- لا يحذف أو يغيّر بيانات القصائد أو مجيب أو الفرق.
begin;
alter table public.qafiyah_challenges
 add column if not exists card_image_url text,
 add column if not exists card_count_text text;
alter table public.qafiyah_sijal_settings
 add column if not exists hero_background_url text,
 add column if not exists hero_logo_url text;
-- ضبط طول النص المخصص. حقول الصور تقبل https فقط أو NULL.
alter table public.qafiyah_challenges drop constraint if exists qafiyah_sijal_card_count_text_length;
alter table public.qafiyah_challenges add constraint qafiyah_sijal_card_count_text_length
 check(card_count_text is null or char_length(card_count_text)<=60);
alter table public.qafiyah_challenges drop constraint if exists qafiyah_sijal_card_image_https;
alter table public.qafiyah_challenges add constraint qafiyah_sijal_card_image_https
 check(card_image_url is null or left(card_image_url,8)='https://');
alter table public.qafiyah_sijal_settings drop constraint if exists qafiyah_sijal_hero_image_https;
alter table public.qafiyah_sijal_settings add constraint qafiyah_sijal_hero_image_https
 check((hero_background_url is null or left(hero_background_url,8)='https://')
   and (hero_logo_url is null or left(hero_logo_url,8)='https://'));
-- السياسات الموجودة مسبقاً في ترقية سِجال تحدد الكتابة للمالك والمدير.
-- التخزين: الصور ترفع إلى sijal-media وفق سياسة المدير/المالك الموجودة.
commit;
