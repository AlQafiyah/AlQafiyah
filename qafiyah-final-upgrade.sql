-- =====================================================================
-- قافية — الترقية النهائية الموحّدة 2026
-- شغّل هذا الملف وحده بعد أخذ نسخة احتياطية من قاعدة البيانات.
-- =====================================================================

-- ============================================================
-- قافية: أساس التوسع الكبير + فهرسة الشعراء والبحث
-- شغّل هذا الملف مرة واحدة في Supabase > SQL Editor قبل رفع النسخة الجديدة.
-- لا يحذف أي محتوى ولا يغير تصميم الموقع.
-- ============================================================

-- تمهيد مستقل للأدوار: يغني عن تشغيل admin-security.sql القديم لهذه الترقية.
create extension if not exists pgcrypto;
create table if not exists public.admin_users (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null unique references auth.users(id) on delete cascade,
    role text not null default 'writer',
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.admin_users au where au.user_id=auth.uid() and au.is_active=true and au.role in ('admin','super_admin','owner','manager','supervisor','writer'));
$$;
revoke all on function public.is_admin() from public,anon;
grant execute on function public.is_admin() to authenticated;

create extension if not exists pg_trgm;

create or replace function public.qafiyah_normalize_arabic(input text)
returns text
language sql
immutable
parallel safe
set search_path = public
as $$
    select lower(
        trim(
            regexp_replace(
                translate(
                    translate(coalesce(input,''), 'ًٌٍَُِّْٰـ', ''),
                    'أإآٱىؤئة',
                    'اااايويه'
                ),
                '\s+', ' ', 'g'
            )
        )
    );
$$;

-- ---------- الشعراء: هوية موسوعية + تحقق + بحث ----------
alter table public.poets add column if not exists catalog_id text;
alter table public.poets add column if not exists aliases text[] not null default '{}'::text[];
alter table public.poets add column if not exists source_refs jsonb not null default '[]'::jsonb;
alter table public.poets add column if not exists verification_status text not null default 'verified';
alter table public.poets add column if not exists poem_count bigint not null default 0;
alter table public.poets add column if not exists search_text text not null default '';
alter table public.poets add column if not exists updated_at timestamptz not null default now();

update public.poets
set catalog_id = 'legacy:' || id::text
where catalog_id is null or btrim(catalog_id) = '';

alter table public.poets alter column catalog_id set default ('manual:' || gen_random_uuid()::text);
alter table public.poets alter column catalog_id set not null;

create unique index if not exists poets_catalog_id_uidx on public.poets(catalog_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'poets_verification_status_check'
          AND conrelid = 'public.poets'::regclass
    ) THEN
        ALTER TABLE public.poets
        ADD CONSTRAINT poets_verification_status_check
        CHECK (verification_status in ('verified','review','disputed'));
    END IF;
END $$;

create or replace function public.qafiyah_sync_poet_search()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.search_text := public.qafiyah_normalize_arabic(
        concat_ws(' ', new.name, new.nickname, new.era, new.bio, array_to_string(new.aliases,' '))
    );
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists qafiyah_sync_poet_search_trg on public.poets;
create trigger qafiyah_sync_poet_search_trg
before insert or update on public.poets
for each row execute function public.qafiyah_sync_poet_search();

update public.poets
set search_text = public.qafiyah_normalize_arabic(
    concat_ws(' ', name, nickname, era, bio, array_to_string(aliases,' '))
);

-- عدد القصائد محفوظ داخل سجل الشاعر بدل تحميل كل القصائد لعدّها في المتصفح.
update public.poets p
set poem_count = x.cnt
from (
    select poet_id, count(*)::bigint as cnt
    from public.poems
    where poet_id is not null
    group by poet_id
) x
where p.id = x.poet_id;

update public.poets p
set poem_count = 0
where not exists (select 1 from public.poems x where x.poet_id = p.id);

create or replace function public.qafiyah_adjust_poet_count()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        if new.poet_id is not null then
            update public.poets set poem_count = poem_count + 1 where id = new.poet_id;
        end if;
        return new;
    elsif tg_op = 'DELETE' then
        if old.poet_id is not null then
            update public.poets set poem_count = greatest(poem_count - 1, 0) where id = old.poet_id;
        end if;
        return old;
    elsif tg_op = 'UPDATE' then
        if old.poet_id is distinct from new.poet_id then
            if old.poet_id is not null then
                update public.poets set poem_count = greatest(poem_count - 1, 0) where id = old.poet_id;
            end if;
            if new.poet_id is not null then
                update public.poets set poem_count = poem_count + 1 where id = new.poet_id;
            end if;
        end if;
        return new;
    end if;
    return null;
end;
$$;

drop trigger if exists qafiyah_adjust_poet_count_trg on public.poems;
create trigger qafiyah_adjust_poet_count_trg
after insert or delete or update of poet_id on public.poems
for each row execute function public.qafiyah_adjust_poet_count();

-- ---------- القصائد: هوية موسوعية + تحقق + استيراد ضخم ----------
alter table public.poems add column if not exists catalog_id text;
alter table public.poems add column if not exists source_refs jsonb not null default '[]'::jsonb;
alter table public.poems add column if not exists verification_status text not null default 'verified';
alter table public.poems add column if not exists updated_at timestamptz not null default now();

update public.poems
set catalog_id = 'legacy:poem:' || id::text
where catalog_id is null or btrim(catalog_id) = '';

alter table public.poems alter column catalog_id set default ('manual:poem:' || gen_random_uuid()::text);
alter table public.poems alter column catalog_id set not null;
create unique index if not exists poems_catalog_id_uidx on public.poems(catalog_id);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'poems_verification_status_check'
          AND conrelid = 'public.poems'::regclass
    ) THEN
        ALTER TABLE public.poems
        ADD CONSTRAINT poems_verification_status_check
        CHECK (verification_status in ('verified','review','disputed'));
    END IF;
END $$;

-- ---------- بحث القصائد والمقالات من الخادم دون إرسال النص الكامل للقوائم ----------
alter table public.poems add column if not exists search_text text not null default '';
alter table public.articles add column if not exists search_text text not null default '';

create or replace function public.qafiyah_sync_poem_search()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.search_text := public.qafiyah_normalize_arabic(
        concat_ws(' ', new.title, new.poet, new.era, new.category, new.content)
    );
    new.updated_at := now();
    return new;
end;
$$;

drop trigger if exists qafiyah_sync_poem_search_trg on public.poems;
create trigger qafiyah_sync_poem_search_trg
before insert or update on public.poems
for each row execute function public.qafiyah_sync_poem_search();

create or replace function public.qafiyah_sync_article_search()
returns trigger
language plpgsql
set search_path = public
as $$
begin
    new.search_text := public.qafiyah_normalize_arabic(
        concat_ws(' ', new.title, new.author, new.category, new.summary, new.content)
    );
    return new;
end;
$$;

drop trigger if exists qafiyah_sync_article_search_trg on public.articles;
create trigger qafiyah_sync_article_search_trg
before insert or update of title, author, category, summary, content on public.articles
for each row execute function public.qafiyah_sync_article_search();

update public.poems
set search_text = public.qafiyah_normalize_arabic(concat_ws(' ', title, poet, era, category, content));

update public.articles
set search_text = public.qafiyah_normalize_arabic(concat_ws(' ', title, author, category, summary, content));

-- ---------- الفهارس ----------
create index if not exists poets_search_trgm_idx on public.poets using gin (search_text gin_trgm_ops);
create index if not exists poets_era_idx on public.poets(era);
create index if not exists poets_featured_name_idx on public.poets(is_featured desc, name);
create index if not exists poems_poet_id_idx on public.poems(poet_id);
create index if not exists poems_search_trgm_idx on public.poems using gin (search_text gin_trgm_ops);
create index if not exists poems_era_idx on public.poems(era);
create index if not exists poems_category_idx on public.poems(category);
create index if not exists poems_featured_created_idx on public.poems(is_featured desc, created_at desc);
create index if not exists articles_search_trgm_idx on public.articles using gin (search_text gin_trgm_ops);
create index if not exists articles_category_idx on public.articles(category);
create index if not exists articles_featured_created_idx on public.articles(is_featured desc, created_at desc);

-- ---------- سجل مراجعات بيانات الشعراء ----------
create table if not exists public.poet_revisions (
    id bigint generated by default as identity primary key,
    poet_id text not null,
    action text not null check (action in ('update','delete')),
    snapshot jsonb not null,
    changed_by uuid default auth.uid(),
    changed_at timestamptz not null default now()
);

create index if not exists poet_revisions_poet_idx on public.poet_revisions(poet_id, changed_at desc);
alter table public.poet_revisions enable row level security;

drop policy if exists "qafiyah_admins_read_poet_revisions" on public.poet_revisions;
create policy "qafiyah_admins_read_poet_revisions"
on public.poet_revisions for select to authenticated
using (public.is_admin());

create or replace function public.qafiyah_log_poet_revision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'DELETE' then
        insert into public.poet_revisions(poet_id,action,snapshot)
        values(old.id::text,'delete',to_jsonb(old));
        return old;
    end if;

    if old.name is distinct from new.name
       or old.nickname is distinct from new.nickname
       or old.era is distinct from new.era
       or old.bio is distinct from new.bio
       or old.image_url is distinct from new.image_url
       or old.catalog_id is distinct from new.catalog_id
       or old.aliases is distinct from new.aliases
       or old.source_refs is distinct from new.source_refs
       or old.verification_status is distinct from new.verification_status
       or old.is_featured is distinct from new.is_featured
    then
        insert into public.poet_revisions(poet_id,action,snapshot)
        values(old.id::text,'update',to_jsonb(old));
    end if;
    return new;
end;
$$;

drop trigger if exists qafiyah_log_poet_revision_trg on public.poets;
create trigger qafiyah_log_poet_revision_trg
before update or delete on public.poets
for each row execute function public.qafiyah_log_poet_revision();

analyze public.poets;
analyze public.poems;
analyze public.articles;

-- فحص سريع بعد التنفيذ
select
    (select count(*) from public.poets) as poets,
    (select count(*) from public.poems) as poems,
    (select count(*) from public.articles) as articles;


-- ---------------------------------------------------------------------
-- 2) الأدوار: owner / manager / supervisor / writer
--    ترحيل تلقائي من النظام القديم:
--    super_admin => owner
--    admin       => manager
-- ---------------------------------------------------------------------
alter table public.admin_users add column if not exists updated_at timestamptz not null default now();

DO $$
DECLARE c record;
BEGIN
  FOR c IN
    SELECT conname
    FROM pg_constraint
    WHERE conrelid = 'public.admin_users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ilike '%role%'
  LOOP
    EXECUTE format('alter table public.admin_users drop constraint if exists %I', c.conname);
  END LOOP;
END $$;

update public.admin_users set role='owner', updated_at=now() where role='super_admin';
update public.admin_users set role='manager', updated_at=now() where role='admin';

alter table public.admin_users
  alter column role set default 'writer';

alter table public.admin_users
  add constraint admin_users_role_check
  check (role in ('owner','manager','supervisor','writer'));

create or replace function public.qafiyah_my_role()
returns text
language sql
stable
security definer
set search_path=public
as $$
  select au.role
  from public.admin_users au
  where au.user_id=auth.uid() and au.is_active=true
  limit 1;
$$;

create or replace function public.get_my_admin_role()
returns table(role text,is_active boolean)
language sql
stable
security definer
set search_path=public
as $$
  select au.role,au.is_active
  from public.admin_users au
  where au.user_id=auth.uid()
  limit 1;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select coalesce(public.qafiyah_my_role() in ('owner','manager','supervisor','writer'),false);
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path=public
as $$ select coalesce(public.qafiyah_my_role()='owner',false); $$;

create or replace function public.qafiyah_can_manage_all_content()
returns boolean
language sql
stable
security definer
set search_path=public
as $$ select coalesce(public.qafiyah_my_role() in ('owner','manager','supervisor'),false); $$;

create or replace function public.qafiyah_can_manage_site_settings()
returns boolean
language sql
stable
security definer
set search_path=public
as $$ select coalesce(public.qafiyah_my_role() in ('owner','manager'),false); $$;

create or replace function public.qafiyah_can_manage_role(target_role text)
returns boolean
language sql
stable
security definer
set search_path=public
as $$
  select case public.qafiyah_my_role()
    when 'owner' then target_role in ('owner','manager','supervisor','writer')
    when 'manager' then target_role in ('supervisor','writer')
    when 'supervisor' then target_role='writer'
    else false
  end;
$$;

revoke all on function public.qafiyah_my_role() from public,anon;
revoke all on function public.get_my_admin_role() from public,anon;
revoke all on function public.is_admin() from public,anon;
revoke all on function public.is_super_admin() from public,anon;
revoke all on function public.qafiyah_can_manage_all_content() from public,anon;
revoke all on function public.qafiyah_can_manage_site_settings() from public,anon;
revoke all on function public.qafiyah_can_manage_role(text) from public,anon;
grant execute on function public.qafiyah_my_role() to authenticated;
grant execute on function public.get_my_admin_role() to authenticated;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.is_super_admin() to authenticated;
grant execute on function public.qafiyah_can_manage_all_content() to authenticated;
grant execute on function public.qafiyah_can_manage_site_settings() to authenticated;
grant execute on function public.qafiyah_can_manage_role(text) to authenticated;

-- RLS للمديرين والصلاحيات
alter table public.admin_users enable row level security;
drop policy if exists "qafiyah_super_admin_read_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_add_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_update_admins" on public.admin_users;
drop policy if exists "qafiyah_super_admin_delete_admins" on public.admin_users;
drop policy if exists "qafiyah_roles_read_admins" on public.admin_users;
drop policy if exists "qafiyah_roles_add_admins" on public.admin_users;
drop policy if exists "qafiyah_roles_update_admins" on public.admin_users;
drop policy if exists "qafiyah_roles_delete_admins" on public.admin_users;

create policy "qafiyah_roles_read_admins" on public.admin_users
for select to authenticated
using (
  user_id=auth.uid()
  or public.qafiyah_my_role()='owner'
  or (public.qafiyah_my_role()='manager' and role<>'owner')
  or (public.qafiyah_my_role()='supervisor' and role='writer')
);

create policy "qafiyah_roles_add_admins" on public.admin_users
for insert to authenticated
with check (public.qafiyah_can_manage_role(role));

create policy "qafiyah_roles_update_admins" on public.admin_users
for update to authenticated
using (public.qafiyah_can_manage_role(role))
with check (public.qafiyah_can_manage_role(role));

create policy "qafiyah_roles_delete_admins" on public.admin_users
for delete to authenticated
using (public.qafiyah_can_manage_role(role) and user_id<>auth.uid());

-- ---------------------------------------------------------------------
-- 3) ملكية المحتوى، لمنع الكاتب من تعديل محتوى الآخرين
-- ---------------------------------------------------------------------
alter table public.poets add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.poems add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.articles add column if not exists created_by uuid references auth.users(id) on delete set null;
alter table public.videos add column if not exists created_by uuid references auth.users(id) on delete set null;

alter table public.poets alter column created_by set default auth.uid();
alter table public.poems alter column created_by set default auth.uid();
alter table public.articles alter column created_by set default auth.uid();
alter table public.videos alter column created_by set default auth.uid();

-- هوية موسوعية للمقالات للاستيراد الذكي
alter table public.articles add column if not exists catalog_id text;
alter table public.articles add column if not exists updated_at timestamptz not null default now();
update public.articles set catalog_id='legacy:article:'||id::text where catalog_id is null or btrim(catalog_id)='';
alter table public.articles alter column catalog_id set default ('manual:article:'||gen_random_uuid()::text);
create unique index if not exists articles_catalog_id_uidx on public.articles(catalog_id);

-- سياسات إدارة المحتوى. سياسات القراءة العامة الموجودة تبقى كما هي.
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY['poets','poems','articles','videos'] LOOP
    EXECUTE format('alter table public.%I enable row level security',t);
    EXECUTE format('drop policy if exists "qafiyah_admins_manage_%s" on public.%I',t,t);
    EXECUTE format('drop policy if exists "qafiyah_roles_insert_%s" on public.%I',t,t);
    EXECUTE format('drop policy if exists "qafiyah_roles_update_%s" on public.%I',t,t);
    EXECUTE format('drop policy if exists "qafiyah_roles_delete_%s" on public.%I',t,t);
    EXECUTE format(
      'create policy "qafiyah_roles_insert_%s" on public.%I for insert to authenticated with check (public.is_admin() and (public.qafiyah_my_role()<>''writer'' or created_by=auth.uid()))',t,t);
    EXECUTE format(
      'create policy "qafiyah_roles_update_%s" on public.%I for update to authenticated using (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()=''writer'' and created_by=auth.uid())) with check (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()=''writer'' and created_by=auth.uid()))',t,t);
    EXECUTE format(
      'create policy "qafiyah_roles_delete_%s" on public.%I for delete to authenticated using (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()=''writer'' and created_by=auth.uid()))',t,t);
  END LOOP;
END $$;

-- البحور والقوافي لا يديرها الكاتب
alter table public.meters enable row level security;
alter table public.rhymes enable row level security;
drop policy if exists "qafiyah_admins_manage_meters" on public.meters;
drop policy if exists "qafiyah_admins_manage_rhymes" on public.rhymes;
drop policy if exists "qafiyah_roles_manage_meters" on public.meters;
drop policy if exists "qafiyah_roles_manage_rhymes" on public.rhymes;
create policy "qafiyah_roles_manage_meters" on public.meters for all to authenticated
using (public.qafiyah_can_manage_all_content()) with check (public.qafiyah_can_manage_all_content());
create policy "qafiyah_roles_manage_rhymes" on public.rhymes for all to authenticated
using (public.qafiyah_can_manage_all_content()) with check (public.qafiyah_can_manage_all_content());

-- الإشعارات: المشرف فأعلى يديرها، والقراءة العامة تبقى للموقع
alter table public.notifications enable row level security;
drop policy if exists "qafiyah_admins_manage_notifications" on public.notifications;
drop policy if exists "qafiyah_roles_manage_notifications" on public.notifications;
create policy "qafiyah_roles_manage_notifications" on public.notifications for all to authenticated
using (public.qafiyah_can_manage_all_content()) with check (public.qafiyah_can_manage_all_content());

-- قراءة الإشعارات للعامة (حالة القراءة محفوظة محليًا في المتصفح).
drop policy if exists "qafiyah_public_read_notifications" on public.notifications;
create policy "qafiyah_public_read_notifications" on public.notifications
for select to anon,authenticated using (true);

-- قراءة ملفات المستخدمين من لوحة الإدارة للأدوار الإدارية الفعالة.
alter table public.profiles enable row level security;
drop policy if exists "qafiyah_admins_read_profiles" on public.profiles;
drop policy if exists "qafiyah_roles_read_profiles" on public.profiles;
create policy "qafiyah_roles_read_profiles" on public.profiles
for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 4) الكتب
-- ---------------------------------------------------------------------
create table if not exists public.books (
  id bigint generated by default as identity primary key,
  catalog_id text not null default ('manual:book:'||gen_random_uuid()::text),
  title text not null,
  author text,
  era text,
  literary_category text,
  description text,
  cover_url text,
  file_url text not null,
  is_featured boolean not null default false,
  search_text text not null default '',
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists books_catalog_id_uidx on public.books(catalog_id);
create index if not exists books_era_idx on public.books(era);
create index if not exists books_category_idx on public.books(literary_category);
create index if not exists books_featured_created_idx on public.books(is_featured desc,created_at desc);

create or replace function public.qafiyah_sync_book_search()
returns trigger language plpgsql set search_path=public as $$
begin
  new.search_text:=public.qafiyah_normalize_arabic(concat_ws(' ',new.title,new.author,new.era,new.literary_category,new.description));
  new.updated_at:=now();
  return new;
end $$;
drop trigger if exists qafiyah_sync_book_search_trg on public.books;
create trigger qafiyah_sync_book_search_trg before insert or update on public.books
for each row execute function public.qafiyah_sync_book_search();
update public.books set search_text=public.qafiyah_normalize_arabic(concat_ws(' ',title,author,era,literary_category,description));
create index if not exists books_search_trgm_idx on public.books using gin(search_text gin_trgm_ops);

alter table public.books enable row level security;
drop policy if exists "qafiyah_public_read_books" on public.books;
drop policy if exists "qafiyah_roles_insert_books" on public.books;
drop policy if exists "qafiyah_roles_update_books" on public.books;
drop policy if exists "qafiyah_roles_delete_books" on public.books;
create policy "qafiyah_public_read_books" on public.books for select to anon,authenticated using(true);
create policy "qafiyah_roles_insert_books" on public.books for insert to authenticated
with check(public.is_admin() and (public.qafiyah_my_role()<>'writer' or created_by=auth.uid()));
create policy "qafiyah_roles_update_books" on public.books for update to authenticated
using(public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and created_by=auth.uid()))
with check(public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and created_by=auth.uid()));
create policy "qafiyah_roles_delete_books" on public.books for delete to authenticated
using(public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and created_by=auth.uid()));

-- ---------------------------------------------------------------------
-- 5) تسجيلات صوتية متعددة لكل قصيدة
-- ---------------------------------------------------------------------
create table if not exists public.poem_audio (
  id bigint generated by default as identity primary key,
  poem_id bigint not null references public.poems(id) on delete cascade,
  audio_url text not null,
  reader_name text,
  sort_order integer not null default 0,
  created_by uuid references auth.users(id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);
create index if not exists poem_audio_poem_idx on public.poem_audio(poem_id,sort_order,id);
alter table public.poem_audio enable row level security;
drop policy if exists "qafiyah_public_read_poem_audio" on public.poem_audio;
drop policy if exists "qafiyah_roles_insert_poem_audio" on public.poem_audio;
drop policy if exists "qafiyah_roles_update_poem_audio" on public.poem_audio;
drop policy if exists "qafiyah_roles_delete_poem_audio" on public.poem_audio;
create policy "qafiyah_public_read_poem_audio" on public.poem_audio for select to anon,authenticated using(true);
create policy "qafiyah_roles_insert_poem_audio" on public.poem_audio for insert to authenticated
with check(
  public.qafiyah_can_manage_all_content()
  or exists(select 1 from public.poems p where p.id=poem_id and p.created_by=auth.uid() and public.qafiyah_my_role()='writer')
);
create policy "qafiyah_roles_update_poem_audio" on public.poem_audio for update to authenticated
using(
  public.qafiyah_can_manage_all_content()
  or exists(select 1 from public.poems p where p.id=poem_id and p.created_by=auth.uid() and public.qafiyah_my_role()='writer')
)
with check(
  public.qafiyah_can_manage_all_content()
  or exists(select 1 from public.poems p where p.id=poem_id and p.created_by=auth.uid() and public.qafiyah_my_role()='writer')
);
create policy "qafiyah_roles_delete_poem_audio" on public.poem_audio for delete to authenticated
using(
  public.qafiyah_can_manage_all_content()
  or exists(select 1 from public.poems p where p.id=poem_id and p.created_by=auth.uid() and public.qafiyah_my_role()='writer')
);

-- نقل التسجيل القديم إلى الجدول الجديد مرة واحدة إن وجد
insert into public.poem_audio(poem_id,audio_url,sort_order)
select p.id,p.audio_url,0
from public.poems p
where nullif(btrim(p.audio_url),'') is not null
and not exists(select 1 from public.poem_audio a where a.poem_id=p.id and a.audio_url=p.audio_url);

-- ---------------------------------------------------------------------
-- 6) إعدادات عامة قابلة للتحرير من المالك والمدير فقط
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  key text primary key,
  title text not null,
  content text not null default '',
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now()
);
insert into public.site_settings(key,title,content) values
('copyright','حقوق الطبع والنشر',''),
('privacy','سياسة الخصوصية','')
on conflict(key) do nothing;

alter table public.site_settings enable row level security;
drop policy if exists "qafiyah_public_read_site_settings" on public.site_settings;
drop policy if exists "qafiyah_manage_site_settings" on public.site_settings;
create policy "qafiyah_public_read_site_settings" on public.site_settings for select to anon,authenticated using(true);
create policy "qafiyah_manage_site_settings" on public.site_settings for all to authenticated
using(public.qafiyah_can_manage_site_settings()) with check(public.qafiyah_can_manage_site_settings());

-- ---------------------------------------------------------------------
-- 7) إحصائيات الزيارات والأجهزة والحسابات والمستخدمين النشطين
--    لا نخزن IP ولا بيانات جهاز حساسة؛ فقط معرف عشوائي محلي في المتصفح.
-- ---------------------------------------------------------------------
create table if not exists public.qafiyah_visits (
  id bigint generated by default as identity primary key,
  device_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  visited_at timestamptz not null default now()
);
create index if not exists qafiyah_visits_time_idx on public.qafiyah_visits(visited_at desc);
create index if not exists qafiyah_visits_device_idx on public.qafiyah_visits(device_id);
create index if not exists qafiyah_visits_user_idx on public.qafiyah_visits(user_id) where user_id is not null;

create table if not exists public.qafiyah_active_sessions (
  device_id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  last_seen timestamptz not null default now()
);
create index if not exists qafiyah_active_last_seen_idx on public.qafiyah_active_sessions(last_seen desc);

alter table public.qafiyah_visits enable row level security;
alter table public.qafiyah_active_sessions enable row level security;
-- لا سياسات مباشرة: الكتابة/القراءة تتم عبر RPC محددة فقط.

-- دوال التتبع والتحليلات الموحّدة معرفة في نهاية الملف بعد إنشاء سجل الحسابات التاريخي.

-- ---------------------------------------------------------------------
-- 8) استيراد ذكي: يحدث المتكرر داخل السجل نفسه بدل إنشاء تكرار جديد
-- ---------------------------------------------------------------------
create or replace function public.qafiyah_import_poets(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  item jsonb; target_id bigint; inserted_count int:=0; updated_count int:=0; skipped_count int:=0;
  in_name text; in_nick text; in_catalog text; in_aliases text[]; in_era text;
begin
  if public.qafiyah_my_role() not in ('owner','manager','supervisor') then raise exception 'not authorized'; end if;
  if jsonb_typeof(payload)<>'array' then raise exception 'payload must be array'; end if;

  for item in select value from jsonb_array_elements(payload) loop
    in_name:=btrim(coalesce(item->>'name',''));
    in_nick:=nullif(btrim(coalesce(item->>'nickname','')),'');
    in_catalog:=nullif(btrim(coalesce(item->>'catalog_id','')),'');
    in_era:=btrim(coalesce(item->>'era',''));
    select coalesce(array_agg(x),array[]::text[]) into in_aliases
    from jsonb_array_elements_text(coalesce(item->'aliases','[]'::jsonb)) x;
    if in_name='' or in_era='' then skipped_count:=skipped_count+1; continue; end if;

    target_id:=null;
    if in_catalog is not null then select id into target_id from public.poets where catalog_id=in_catalog limit 1; end if;
    if target_id is null then
      select p.id into target_id
      from public.poets p
      where public.qafiyah_normalize_arabic(p.name)=public.qafiyah_normalize_arabic(in_name)
         or (in_nick is not null and public.qafiyah_normalize_arabic(p.name)=public.qafiyah_normalize_arabic(in_nick))
         or (p.nickname is not null and public.qafiyah_normalize_arabic(p.nickname)=public.qafiyah_normalize_arabic(in_name))
         or exists(select 1 from unnest(coalesce(p.aliases,array[]::text[])) a where public.qafiyah_normalize_arabic(a)=public.qafiyah_normalize_arabic(in_name))
         or exists(
              select 1 from unnest(coalesce(in_aliases,array[]::text[])) ia
              where public.qafiyah_normalize_arabic(ia)=public.qafiyah_normalize_arabic(p.name)
                 or (p.nickname is not null and public.qafiyah_normalize_arabic(ia)=public.qafiyah_normalize_arabic(p.nickname))
                 or exists(select 1 from unnest(coalesce(p.aliases,array[]::text[])) pa where public.qafiyah_normalize_arabic(pa)=public.qafiyah_normalize_arabic(ia))
         )
      order by p.id limit 1;
    end if;

    if target_id is null then
      insert into public.poets(catalog_id,name,nickname,era,bio,image_url,is_featured,aliases,source_refs,verification_status,created_by)
      values(
        coalesce(in_catalog,'qafiyah:poet:'||gen_random_uuid()::text),in_name,in_nick,in_era,nullif(item->>'bio',''),nullif(item->>'image_url',''),
        coalesce((item->>'is_featured')::boolean,false),in_aliases,coalesce(item->'source_refs','[]'::jsonb),
        case when item->>'verification_status' in ('verified','review','disputed') then item->>'verification_status' else 'verified' end,auth.uid()
      );
      inserted_count:=inserted_count+1;
    else
      update public.poets p set
        catalog_id=coalesce(in_catalog,p.catalog_id),
        name=in_name,nickname=in_nick,era=in_era,
        bio=coalesce(nullif(item->>'bio',''),p.bio),
        image_url=coalesce(nullif(item->>'image_url',''),p.image_url),
        is_featured=coalesce((item->>'is_featured')::boolean,p.is_featured),
        aliases=in_aliases,
        source_refs=case when jsonb_array_length(coalesce(item->'source_refs','[]'::jsonb))>0 then item->'source_refs' else p.source_refs end,
        verification_status=case when item->>'verification_status' in ('verified','review','disputed') then item->>'verification_status' else p.verification_status end
      where p.id=target_id;
      updated_count:=updated_count+1;
    end if;
  end loop;
  return jsonb_build_object('inserted',inserted_count,'updated',updated_count,'skipped',skipped_count);
end $$;

create or replace function public.qafiyah_import_poems(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare
  item jsonb; target_id bigint; p_id bigint; p_name text; p_era text; inserted_count int:=0; updated_count int:=0; skipped_count int:=0;
  in_title text; in_catalog text;
begin
  if public.qafiyah_my_role() not in ('owner','manager','supervisor') then raise exception 'not authorized'; end if;
  if jsonb_typeof(payload)<>'array' then raise exception 'payload must be array'; end if;
  for item in select value from jsonb_array_elements(payload) loop
    in_title:=btrim(coalesce(item->>'title','')); in_catalog:=nullif(btrim(coalesce(item->>'catalog_id','')),'');
    p_id:=null;
    if nullif(item->>'poet_id','') is not null then p_id:=(item->>'poet_id')::bigint; end if;
    if p_id is null and nullif(item->>'poet_catalog_id','') is not null then select id into p_id from public.poets where catalog_id=item->>'poet_catalog_id' limit 1; end if;
    if p_id is null and nullif(item->>'poet_name','') is not null then select id into p_id from public.poets where public.qafiyah_normalize_arabic(name)=public.qafiyah_normalize_arabic(item->>'poet_name') limit 1; end if;
    if p_id is null and nullif(item->>'poet','') is not null then select id into p_id from public.poets where public.qafiyah_normalize_arabic(name)=public.qafiyah_normalize_arabic(item->>'poet') limit 1; end if;
    if in_title='' or p_id is null or btrim(coalesce(item->>'content',item->>'full_text',''))='' then skipped_count:=skipped_count+1; continue; end if;
    select name,era into p_name,p_era from public.poets where id=p_id;

    target_id:=null;
    if in_catalog is not null then select id into target_id from public.poems where catalog_id=in_catalog limit 1; end if;
    if target_id is null then select id into target_id from public.poems where poet_id=p_id and public.qafiyah_normalize_arabic(title)=public.qafiyah_normalize_arabic(in_title) order by id limit 1; end if;

    if target_id is null then
      insert into public.poems(catalog_id,title,poet_id,poet,content,era,category,meter_id,rhyme_id,image_url,video_url,audio_url,is_featured,source_refs,verification_status,created_by)
      values(
        coalesce(in_catalog,'qafiyah:poem:'||gen_random_uuid()::text),in_title,p_id,p_name,coalesce(item->>'content',item->>'full_text'),
        coalesce(nullif(item->>'era',''),p_era),nullif(coalesce(item->>'category',item->>'theme'),'') ,nullif(item->>'meter_id','')::bigint,nullif(item->>'rhyme_id','')::bigint,
        nullif(item->>'image_url',''),nullif(item->>'video_url',''),nullif(item->>'audio_url',''),coalesce((item->>'is_featured')::boolean,false),
        coalesce(item->'source_refs','[]'::jsonb),case when item->>'verification_status' in ('verified','review','disputed') then item->>'verification_status' else 'verified' end,auth.uid()
      ) returning id into target_id;
      inserted_count:=inserted_count+1;
    else
      update public.poems p set
        catalog_id=coalesce(in_catalog,p.catalog_id),title=in_title,poet_id=p_id,poet=p_name,
        content=coalesce(item->>'content',item->>'full_text'),era=coalesce(nullif(item->>'era',''),p_era),category=nullif(coalesce(item->>'category',item->>'theme'),''),
        meter_id=coalesce(nullif(item->>'meter_id','')::bigint,p.meter_id),rhyme_id=coalesce(nullif(item->>'rhyme_id','')::bigint,p.rhyme_id),
        image_url=coalesce(nullif(item->>'image_url',''),p.image_url),video_url=coalesce(nullif(item->>'video_url',''),p.video_url),audio_url=coalesce(nullif(item->>'audio_url',''),p.audio_url),
        is_featured=coalesce((item->>'is_featured')::boolean,p.is_featured),source_refs=case when jsonb_array_length(coalesce(item->'source_refs','[]'::jsonb))>0 then item->'source_refs' else p.source_refs end,
        verification_status=case when item->>'verification_status' in ('verified','review','disputed') then item->>'verification_status' else p.verification_status end
      where p.id=target_id;
      updated_count:=updated_count+1;
    end if;

    if jsonb_typeof(item->'audio_readings')='array' then
      delete from public.poem_audio where poem_id=target_id;
      insert into public.poem_audio(poem_id,audio_url,reader_name,sort_order,created_by)
      select target_id,btrim(x->>'audio_url'),nullif(btrim(coalesce(x->>'reader_name','')),''),ord::int-1,auth.uid()
      from jsonb_array_elements(item->'audio_readings') with ordinality as a(x,ord)
      where btrim(coalesce(x->>'audio_url',''))<>'';
    end if;
  end loop;
  return jsonb_build_object('inserted',inserted_count,'updated',updated_count,'skipped',skipped_count);
end $$;

create or replace function public.qafiyah_import_articles(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare item jsonb; target_id bigint; inserted_count int:=0;updated_count int:=0;skipped_count int:=0; in_title text;in_author text;in_catalog text;
begin
  if public.qafiyah_my_role() not in ('owner','manager','supervisor') then raise exception 'not authorized'; end if;
  if jsonb_typeof(payload)<>'array' then raise exception 'payload must be array'; end if;
  for item in select value from jsonb_array_elements(payload) loop
    in_title:=btrim(coalesce(item->>'title',''));in_author:=btrim(coalesce(item->>'author',''));in_catalog:=nullif(btrim(coalesce(item->>'catalog_id','')),'');
    if in_title='' or btrim(coalesce(item->>'content',''))='' then skipped_count:=skipped_count+1;continue;end if;
    target_id:=null;
    if in_catalog is not null then select id into target_id from public.articles where catalog_id=in_catalog limit 1; end if;
    if target_id is null then select id into target_id from public.articles where public.qafiyah_normalize_arabic(title)=public.qafiyah_normalize_arabic(in_title) and public.qafiyah_normalize_arabic(coalesce(author,''))=public.qafiyah_normalize_arabic(in_author) order by id limit 1; end if;
    if target_id is null then
      insert into public.articles(catalog_id,title,author,summary,content,category,image_url,is_featured,created_by)
      values(coalesce(in_catalog,'qafiyah:article:'||gen_random_uuid()::text),in_title,nullif(in_author,''),nullif(item->>'summary',''),item->>'content',nullif(item->>'category',''),nullif(item->>'image_url',''),coalesce((item->>'is_featured')::boolean,false),auth.uid());
      inserted_count:=inserted_count+1;
    else
      update public.articles a set catalog_id=coalesce(in_catalog,a.catalog_id),title=in_title,author=nullif(in_author,''),summary=nullif(item->>'summary',''),content=item->>'content',category=nullif(item->>'category',''),image_url=coalesce(nullif(item->>'image_url',''),a.image_url),is_featured=coalesce((item->>'is_featured')::boolean,a.is_featured),updated_at=now() where a.id=target_id;
      updated_count:=updated_count+1;
    end if;
  end loop;
  return jsonb_build_object('inserted',inserted_count,'updated',updated_count,'skipped',skipped_count);
end $$;

create or replace function public.qafiyah_import_books(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path=public
as $$
declare item jsonb;target_id bigint;inserted_count int:=0;updated_count int:=0;skipped_count int:=0;in_title text;in_author text;in_catalog text;
begin
  if public.qafiyah_my_role() not in ('owner','manager','supervisor') then raise exception 'not authorized'; end if;
  if jsonb_typeof(payload)<>'array' then raise exception 'payload must be array'; end if;
  for item in select value from jsonb_array_elements(payload) loop
    in_title:=btrim(coalesce(item->>'title',''));in_author:=btrim(coalesce(item->>'author',''));in_catalog:=nullif(btrim(coalesce(item->>'catalog_id','')),'');
    if in_title='' or btrim(coalesce(item->>'file_url',''))='' then skipped_count:=skipped_count+1;continue;end if;
    target_id:=null;
    if in_catalog is not null then select id into target_id from public.books where catalog_id=in_catalog limit 1;end if;
    if target_id is null then select id into target_id from public.books where public.qafiyah_normalize_arabic(title)=public.qafiyah_normalize_arabic(in_title) and public.qafiyah_normalize_arabic(coalesce(author,''))=public.qafiyah_normalize_arabic(in_author) order by id limit 1;end if;
    if target_id is null then
      insert into public.books(catalog_id,title,author,era,literary_category,description,cover_url,file_url,is_featured,created_by)
      values(coalesce(in_catalog,'qafiyah:book:'||gen_random_uuid()::text),in_title,nullif(in_author,''),nullif(item->>'era',''),nullif(coalesce(item->>'literary_category',item->>'category'),''),nullif(item->>'description',''),nullif(item->>'cover_url',''),item->>'file_url',coalesce((item->>'is_featured')::boolean,false),auth.uid());
      inserted_count:=inserted_count+1;
    else
      update public.books b set catalog_id=coalesce(in_catalog,b.catalog_id),title=in_title,author=nullif(in_author,''),era=nullif(item->>'era',''),literary_category=nullif(coalesce(item->>'literary_category',item->>'category'),''),description=nullif(item->>'description',''),cover_url=coalesce(nullif(item->>'cover_url',''),b.cover_url),file_url=coalesce(nullif(item->>'file_url',''),b.file_url),is_featured=coalesce((item->>'is_featured')::boolean,b.is_featured),updated_at=now() where b.id=target_id;
      updated_count:=updated_count+1;
    end if;
  end loop;
  return jsonb_build_object('inserted',inserted_count,'updated',updated_count,'skipped',skipped_count);
end $$;

revoke all on function public.qafiyah_import_poets(jsonb) from public,anon;
revoke all on function public.qafiyah_import_poems(jsonb) from public,anon;
revoke all on function public.qafiyah_import_articles(jsonb) from public,anon;
revoke all on function public.qafiyah_import_books(jsonb) from public,anon;
grant execute on function public.qafiyah_import_poets(jsonb) to authenticated;
grant execute on function public.qafiyah_import_poems(jsonb) to authenticated;
grant execute on function public.qafiyah_import_articles(jsonb) to authenticated;
grant execute on function public.qafiyah_import_books(jsonb) to authenticated;

-- ---------------------------------------------------------------------
-- 9) التخزين: نفس bucket مع السماح لجميع أدوار الإدارة الفعالة
-- ---------------------------------------------------------------------
insert into storage.buckets(id,name,public) values('qafiyah-media','qafiyah-media',true)
on conflict(id) do update set public=true;

-- ---------------------------------------------------------------------
-- 10) تنظيف الجلسات القديمة آمن اختياريًا عند كل تشغيل للترقية
-- ---------------------------------------------------------------------
delete from public.qafiyah_active_sessions where last_seen<now()-interval '2 days';

analyze public.poets;
analyze public.poems;
analyze public.articles;
analyze public.books;
analyze public.poem_audio;
analyze public.qafiyah_visits;

-- فحص نهائي
select
  (select count(*) from public.poets) poets,
  (select count(*) from public.poems) poems,
  (select count(*) from public.articles) articles,
  (select count(*) from public.books) books,
  (select count(*) from public.admin_users where is_active) active_admin_accounts;



-- سجل الحسابات المختلفة تاريخيًا، مستقل عن الجهاز حتى لا يضيع حساب سابق عند تبديل الحساب على الجهاز نفسه.
create table if not exists public.qafiyah_seen_accounts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_seen timestamptz not null default now(),
  last_seen timestamptz not null default now()
);
alter table public.qafiyah_seen_accounts enable row level security;

create or replace function public.qafiyah_track_visit(p_device_id text,p_record_visit boolean default false)
returns void language plpgsql security definer set search_path=public as $$
declare d text:=left(btrim(coalesce(p_device_id,'')),120); u uuid:=auth.uid();
begin
  if length(d)<12 then return; end if;
  if p_record_visit then insert into public.qafiyah_visits(device_id,user_id) values(d,u); end if;
  if u is not null then
    insert into public.qafiyah_seen_accounts(user_id,first_seen,last_seen) values(u,now(),now())
    on conflict(user_id) do update set last_seen=now();
  end if;
  insert into public.qafiyah_active_sessions(device_id,user_id,last_seen) values(d,u,now())
  on conflict(device_id) do update set user_id=excluded.user_id,last_seen=now();
end $$;
revoke all on function public.qafiyah_track_visit(text,boolean) from public;
grant execute on function public.qafiyah_track_visit(text,boolean) to anon,authenticated;

create or replace function public.qafiyah_analytics_summary()
returns jsonb language plpgsql stable security definer set search_path=public as $$
declare result jsonb;
begin
  if public.qafiyah_my_role() not in ('owner','manager') then raise exception 'not authorized'; end if;
  select jsonb_build_object(
    'total_visits',(select count(*) from public.qafiyah_visits),
    'unique_devices',(select count(distinct device_id) from public.qafiyah_visits),
    'unique_accounts',(select count(*) from public.qafiyah_seen_accounts),
    'active_now',(select count(*) from public.qafiyah_active_sessions where last_seen>=now()-interval '3 minutes'),
    'today',(select count(*) from public.qafiyah_visits where visited_at>=date_trunc('day',now())),
    'last_7_days',(select count(*) from public.qafiyah_visits where visited_at>=now()-interval '7 days'),
    'last_30_days',(select count(*) from public.qafiyah_visits where visited_at>=now()-interval '30 days'),
    'this_month',(select count(*) from public.qafiyah_visits where visited_at>=date_trunc('month',now())),
    'last_365_days',(select count(*) from public.qafiyah_visits where visited_at>=now()-interval '365 days'),
    'this_year',(select count(*) from public.qafiyah_visits where visited_at>=date_trunc('year',now())),
    'years',coalesce((select jsonb_agg(jsonb_build_object('year',y,'visits',c) order by y) from (select extract(year from visited_at)::int y,count(*)::bigint c from public.qafiyah_visits group by 1)s),'[]'::jsonb),
    'months',coalesce((select jsonb_agg(jsonb_build_object('year',y,'month',m,'visits',c) order by y,m) from (select extract(year from visited_at)::int y,extract(month from visited_at)::int m,count(*)::bigint c from public.qafiyah_visits group by 1,2)s),'[]'::jsonb),
    'days',coalesce((select jsonb_agg(jsonb_build_object('date',d,'visits',c) order by d) from (select visited_at::date d,count(*)::bigint c from public.qafiyah_visits where visited_at>=current_date-interval '31 days' group by 1)s),'[]'::jsonb)
  ) into result; return result;
end $$;
revoke all on function public.qafiyah_analytics_summary() from public,anon;
grant execute on function public.qafiyah_analytics_summary() to authenticated;

-- سياسات التخزين: المالك/المدير/المشرف لجميع ملفات قافية، والكاتب لمساره الشخصي فقط.
drop policy if exists "qafiyah_admins_read_media" on storage.objects;
drop policy if exists "qafiyah_admins_add_media" on storage.objects;
drop policy if exists "qafiyah_admins_update_media" on storage.objects;
drop policy if exists "qafiyah_admins_delete_media" on storage.objects;
drop policy if exists "qafiyah_roles_read_media" on storage.objects;
drop policy if exists "qafiyah_roles_add_media" on storage.objects;
drop policy if exists "qafiyah_roles_update_media" on storage.objects;
drop policy if exists "qafiyah_roles_delete_media" on storage.objects;
create policy "qafiyah_roles_read_media" on storage.objects for select to authenticated
using(bucket_id='qafiyah-media' and public.is_admin());
create policy "qafiyah_roles_add_media" on storage.objects for insert to authenticated
with check(bucket_id='qafiyah-media' and (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and name like ('users/'||auth.uid()::text||'/%'))));
create policy "qafiyah_roles_update_media" on storage.objects for update to authenticated
using(bucket_id='qafiyah-media' and (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and name like ('users/'||auth.uid()::text||'/%'))))
with check(bucket_id='qafiyah-media' and (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and name like ('users/'||auth.uid()::text||'/%'))));
create policy "qafiyah_roles_delete_media" on storage.objects for delete to authenticated
using(bucket_id='qafiyah-media' and (public.qafiyah_can_manage_all_content() or (public.qafiyah_my_role()='writer' and name like ('users/'||auth.uid()::text||'/%'))));


-- نهاية ملف الترقية النهائية الموحّد
