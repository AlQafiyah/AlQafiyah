-- قافية: ترقية الإشعارات للنسخة النهائية
-- شغّل هذا الملف مرة واحدة في Supabase > SQL Editor إذا سبق أن شغلت admin-security.sql قبل هذه النسخة.

alter table public.notifications enable row level security;

drop policy if exists "qafiyah_public_read_notifications" on public.notifications;
create policy "qafiyah_public_read_notifications"
on public.notifications for select
to anon, authenticated
using (true);
