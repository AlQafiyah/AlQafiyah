-- شغّل هذا الملف مرة واحدة في Supabase SQL Editor.
-- يحسب جميع الحسابات الحقيقية الموجودة في Authentication > Users.
-- لا يسمح باستدعائه إلا لحساب أدمن مفعل.

create or replace function public.get_users_count()
returns bigint
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        raise exception 'غير مصرح';
    end if;

    return (
        select count(*)::bigint
        from auth.users
    );
end;
$$;

revoke all on function public.get_users_count() from public;
grant execute on function public.get_users_count() to authenticated;

-- يعرض جميع حسابات Authentication مع دمج بيانات profiles.
create or replace function public.get_admin_users()
returns table (
    id uuid,
    display_name text,
    email text,
    phone text,
    birth_day text,
    birth_month text,
    birth_year text,
    gender text,
    provider text,
    created_at timestamptz,
    last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
    if not public.is_admin() then
        raise exception 'غير مصرح';
    end if;

    return query
    select
        u.id,
        coalesce(
            nullif(trim(concat_ws(' ', p.first_name, p.last_name)), ''),
            nullif(u.raw_user_meta_data ->> 'full_name', ''),
            nullif(u.raw_user_meta_data ->> 'name', ''),
            nullif(u.raw_user_meta_data ->> 'given_name', ''),
            nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
            'مستخدم'
        )::text as display_name,
        u.email::text,
        coalesce(p.phone::text, u.phone::text)::text as phone,
        p.birth_day::text,
        p.birth_month::text,
        p.birth_year::text,
        p.gender::text,
        coalesce(u.raw_app_meta_data ->> 'provider', 'email')::text as provider,
        u.created_at,
        u.last_sign_in_at
    from auth.users as u
    left join public.profiles as p
        on p.id = u.id
    order by u.created_at desc;
end;
$$;

revoke all on function public.get_admin_users() from public;
grant execute on function public.get_admin_users() to authenticated;
