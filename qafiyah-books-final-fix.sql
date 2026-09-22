-- قافية: إصلاح نهائي لروابط ملفات الكتب في Supabase Storage
-- لا يحذف أي كتاب ولا أي ملف.

-- 1) تأكيد أن bucket القراءة العامة عام
update storage.buckets
set public = true
where id = 'qafiyah-media';

-- 2) توحيد روابط الكتب القديمة المخزنة كرابط signed/authenticated أو كمسار فقط
update public.books
set file_url =
  'https://ekbujmlujjkgfbwaupef.supabase.co/storage/v1/object/public/qafiyah-media/' ||
  regexp_replace(
    case
      when file_url like '%/qafiyah-media/%'
        then split_part(file_url, '/qafiyah-media/', 2)
      else regexp_replace(file_url, '^/?qafiyah-media/?', '')
    end,
    '\?.*$',
    ''
  )
where file_url is not null
  and btrim(file_url) <> ''
  and (
    file_url like 'books/files/%'
    or file_url like '/books/files/%'
    or file_url like 'qafiyah-media/books/files/%'
    or file_url like '%supabase.co/storage/v1/object/%/qafiyah-media/%'
    or file_url like '%storage.supabase.co/storage/v1/object/%/qafiyah-media/%'
  );

-- 3) إبقاء قراءة بيانات الكتب متاحة للموقع العام
 grant select on table public.books to anon, authenticated;

-- 4) نتيجة تحقق: كل كتاب + هل ملفه موجود فعلًا داخل Storage
with book_paths as (
  select
    b.id,
    b.title,
    b.file_url,
    case
      when b.file_url like '%/qafiyah-media/%'
        then regexp_replace(split_part(b.file_url, '/qafiyah-media/', 2), '\?.*$', '')
      when b.file_url like 'books/files/%'
        then regexp_replace(b.file_url, '\?.*$', '')
      else null
    end as object_path
  from public.books b
)
select
  bp.id,
  bp.title,
  bp.file_url,
  (o.name is not null) as storage_object_exists
from book_paths bp
left join storage.objects o
  on o.bucket_id = 'qafiyah-media'
 and o.name = bp.object_path
order by bp.id desc;
