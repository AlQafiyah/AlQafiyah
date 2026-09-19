-- ============================================================
-- قافية: أساس التوسع الكبير + فهرسة الشعراء والبحث
-- شغّل هذا الملف مرة واحدة في Supabase > SQL Editor قبل رفع النسخة الجديدة.
-- لا يحذف أي محتوى ولا يغير تصميم الموقع.
-- ============================================================

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
