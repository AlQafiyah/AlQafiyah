-- شغّل هذا الملف مرة واحدة فقط في Supabase SQL Editor.
-- يضيف حقل التسجيل الصوتي الاختياري للقصائد الحالية والجديدة.

alter table public.poems
add column if not exists audio_url text;
