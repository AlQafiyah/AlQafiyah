-- Qafiyah Fix 2
-- بيانات المستخدمين العاديين في لوحة الإدارة: للمالك فقط.
-- شغّل هذا الملف مرة واحدة بعد التحديث الحالي.

alter table public.profiles enable row level security;
drop policy if exists "qafiyah_admins_read_profiles" on public.profiles;
drop policy if exists "qafiyah_roles_read_profiles" on public.profiles;
create policy "qafiyah_roles_read_profiles" on public.profiles
for select to authenticated
using (public.qafiyah_my_role()='owner');

drop function if exists public.get_users_count();
create or replace function public.get_users_count()
returns bigint
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if public.qafiyah_my_role() <> 'owner' then
    raise exception 'not authorized';
  end if;
  return (select count(*)::bigint from auth.users);
end;
$$;
revoke all on function public.get_users_count() from public, anon;
grant execute on function public.get_users_count() to authenticated;

drop function if exists public.get_admin_users();
create or replace function public.get_admin_users()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  result jsonb;
begin
  if public.qafiyah_my_role() <> 'owner' then
    raise exception 'not authorized';
  end if;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'user_id', u.id,
        'display_name', trim(concat_ws(' ', p.first_name, p.last_name)),
        'email', u.email,
        'phone', coalesce(p.phone, u.phone),
        'birth_day', p.birth_day,
        'birth_month', p.birth_month,
        'birth_year', p.birth_year,
        'gender', p.gender,
        'provider', u.raw_app_meta_data ->> 'provider',
        'created_at', u.created_at
      ) order by u.created_at desc
    ),
    '[]'::jsonb
  ) into result
  from auth.users u
  left join public.profiles p on p.id = u.id;

  return result;
end;
$$;
revoke all on function public.get_admin_users() from public, anon;
grant execute on function public.get_admin_users() to authenticated;

select 'Qafiyah Fix 2 applied' as status;
