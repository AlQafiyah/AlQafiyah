-- قافية: صلاحيات جدول الكتب فقط
-- آمن للتشغيل أكثر من مرة.

alter table public.books enable row level security;

grant select on table public.books to anon, authenticated;
grant insert, update, delete on table public.books to authenticated;

-- السماح بعرض الكتب للعامة.
drop policy if exists "qafiyah_public_read_books" on public.books;
create policy "qafiyah_public_read_books"
on public.books
for select
to anon, authenticated
using (true);

-- فحص حالة جدول الكتب والـ bucket فقط (لا يعدّل ملفات Storage).
select
  has_table_privilege('anon', 'public.books', 'SELECT') as anon_can_read_books,
  has_table_privilege('authenticated', 'public.books', 'SELECT') as authenticated_can_read_books,
  has_table_privilege('authenticated', 'public.books', 'INSERT') as authenticated_has_insert_grant;

select
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
from storage.buckets
where id = 'qafiyah-media';
