-- ============================================================
-- القافية: إعداد صلاحيات الإدارة
-- شغّل هذا الملف كاملًا مرة واحدة من Supabase > SQL Editor.
-- حساب وليد أدناه سيصبح super_admin.
-- ============================================================

create table if not exists public.admin_users (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    role text not null default 'admin' check (role in ('admin', 'super_admin')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

alter table public.admin_users
add column if not exists updated_at timestamptz not null default now();


alter table public.admin_users enable row level security;

create or replace function public.get_my_admin_role()
returns table (role text, is_active boolean)
language sql
stable
security definer
set search_path = public
as $$
    select au.role, au.is_active
    from public.admin_users as au
    where au.user_id = auth.uid()
    limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users as au
        where au.user_id = auth.uid()
          and au.is_active = true
          and au.role in ('admin', 'super_admin')
    );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.admin_users as au
        where au.user_id = auth.uid()
          and au.is_active = true
          and au.role = 'super_admin'
    );
$$;

revoke all on function public.get_my_admin_role() from public, anon;
revoke all on function public.is_admin() from public, anon;
revoke all on function public.is_super_admin() from public, anon;

grant execute on function public.get_my_admin_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;

drop policy if exists "qafiyah_super_admin_read_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_add_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_update_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_delete_admins" on public.admin_users;

create policy "qafiyah_super_admin_read_admins"
on public.admin_users for select
to authenticated
using (public.is_super_admin());

create policy "qafiyah_super_admin_add_admins"
on public.admin_users for insert
to authenticated
with check (public.is_super_admin());

create policy "qafiyah_super_admin_update_admins"
on public.admin_users for update
to authenticated
using (public.is_super_admin())
with check (public.is_super_admin());

create policy "qafiyah_super_admin_delete_admins"
on public.admin_users for delete
to authenticated
using (public.is_super_admin());

-- قراءة المستخدمين من لوحة الإدارة دون تغيير سياسات حساباتهم الحالية.
alter table public.profiles enable row level security;
drop policy if exists "qafiyah_admins_read_profiles" on public.profiles;
create policy "qafiyah_admins_read_profiles"
on public.profiles for select
to authenticated
using (public.is_admin());

-- إدارة محتوى القافية. لا تحذف هذه الأوامر سياسات القراءة العامة الحالية.
alter table public.poets enable row level security;
drop policy if exists "qafiyah_admins_manage_poets" on public.poets;
create policy "qafiyah_admins_manage_poets"
on public.poets for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.poems enable row level security;
drop policy if exists "qafiyah_admins_manage_poems" on public.poems;
create policy "qafiyah_admins_manage_poems"
on public.poems for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.articles enable row level security;
drop policy if exists "qafiyah_admins_manage_articles" on public.articles;
create policy "qafiyah_admins_manage_articles"
on public.articles for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.meters enable row level security;
drop policy if exists "qafiyah_admins_manage_meters" on public.meters;
create policy "qafiyah_admins_manage_meters"
on public.meters for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.rhymes enable row level security;
drop policy if exists "qafiyah_admins_manage_rhymes" on public.rhymes;
create policy "qafiyah_admins_manage_rhymes"
on public.rhymes for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.videos enable row level security;
drop policy if exists "qafiyah_admins_manage_videos" on public.videos;
create policy "qafiyah_admins_manage_videos"
on public.videos for all to authenticated
using (public.is_admin()) with check (public.is_admin());

alter table public.notifications enable row level security;
drop policy if exists "qafiyah_admins_manage_notifications" on public.notifications;
create policy "qafiyah_admins_manage_notifications"
on public.notifications for all to authenticated
using (public.is_admin()) with check (public.is_admin());

-- ملفات الصور والفيديو الخاصة بلوحة الإدارة.
insert into storage.buckets (id, name, public)
values ('qafiyah-media', 'qafiyah-media', true)
on conflict (id) do update set public = true;

drop policy if exists "qafiyah_admins_read_media" on storage.objects;
drop policy if exists "qafiyah_admins_add_media" on storage.objects;
drop policy if exists "qafiyah_admins_update_media" on storage.objects;
drop policy if exists "qafiyah_admins_delete_media" on storage.objects;

create policy "qafiyah_admins_read_media"
on storage.objects for select to authenticated
using (bucket_id = 'qafiyah-media' and public.is_admin());

create policy "qafiyah_admins_add_media"
on storage.objects for insert to authenticated
with check (bucket_id = 'qafiyah-media' and public.is_admin());

create policy "qafiyah_admins_update_media"
on storage.objects for update to authenticated
using (bucket_id = 'qafiyah-media' and public.is_admin())
with check (bucket_id = 'qafiyah-media' and public.is_admin());

create policy "qafiyah_admins_delete_media"
on storage.objects for delete to authenticated
using (bucket_id = 'qafiyah-media' and public.is_admin());

-- تعيين حساب وليد مديرًا رئيسيًا.
insert into public.admin_users (user_id, role, is_active)
values ('ff4ad88c-4f68-4a1d-9074-d60354d8b4cd'::uuid, 'super_admin', true)
on conflict (user_id)
do update set
    role = excluded.role,
    is_active = excluded.is_active,
    updated_at = now();

-- يجب أن تظهر نتيجة واحدة بدور super_admin وحالة true.
select user_id, role, is_active, created_at
from public.admin_users
where user_id = 'ff4ad88c-4f68-4a1d-9074-d60354d8b4cd'::uuid;

-- ============================================================
-- قراءة إشعارات الموقع للزوار والمستخدمين
-- حالة "مقروء" تحفظ محلياً لكل متصفح، لذلك نحتاج SELECT فقط هنا.
-- ============================================================
drop policy if exists "qafiyah_public_read_notifications" on public.notifications;
create policy "qafiyah_public_read_notifications"
on public.notifications for select
to anon, authenticated
using (true);
