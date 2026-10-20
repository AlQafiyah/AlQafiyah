-- القافية | إصلاح حفظ طريقة عرض المقالات
-- نفّذ هذا الملف في Supabase > SQL Editor > Run.
-- لا يغير بيانات المقالات أو إعدادات بقية أقسام الموقع.

-- إنشاء سجل الإعداد الافتراضي إذا لم يكن موجوداً.
insert into public.site_settings (key, title, content)
values ('articles_list_feature_mode', 'طريقة إبراز المقالات', 'latest')
on conflict (key) do nothing;

-- تفعيل RLS (إن كانت مفعلة من قبل فلن يتغير سلوكها).
alter table public.site_settings enable row level security;

-- السماح بقراءة هذا الإعداد فقط للجميع حتى تستطيع واجهة المقالات تطبيق الخيار.
-- يُنشأ هذا النهج فقط إن لم يكن موجوداً بالفعل.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings'
      and policyname = 'qafiyah_articles_display_read'
  ) then
    create policy qafiyah_articles_display_read on public.site_settings
      for select to anon, authenticated
      using (key = 'articles_list_feature_mode');
  end if;
end $$;

-- السماح للمالك والمدير فقط بتعديل هذا السجل.
-- يعتمد على دالة الصلاحيات الموجودة مسبقاً في مشروع القافية.
do $$
begin
  if not exists (
    select 1 from pg_proc
    where pronamespace = 'public'::regnamespace
      and proname = 'qafiyah_can_manage_site_settings'
  ) then
    raise exception 'دالة الصلاحيات qafiyah_can_manage_site_settings غير موجودة. نفّذ QAFIYAH-FINAL-UPGRADE.sql أولاً.';
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'site_settings'
      and policyname = 'qafiyah_articles_display_write'
  ) then
    create policy qafiyah_articles_display_write on public.site_settings
      for all to authenticated
      using (key = 'articles_list_feature_mode' and public.qafiyah_can_manage_site_settings())
      with check (key = 'articles_list_feature_mode' and public.qafiyah_can_manage_site_settings());
  end if;
end $$;

-- السماح لمفاتيح Supabase المعتادة بالوصول إلى الجدول (RLS يبقى المسؤول عن تقييد الصفوف).
grant select on public.site_settings to anon;
grant select, insert, update on public.site_settings to authenticated;

-- التحقق من السجل بعد تنفيذ الملف.
select key, title, content from public.site_settings
where key = 'articles_list_feature_mode';
