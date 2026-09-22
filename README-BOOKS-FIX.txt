QAFIYAH - BOOKS FIX

1) استبدل books.js الحالي بالملف books.js الموجود في هذه الحزمة.

2) في Supabase > SQL Editor شغّل qafiyah-books-access-fix.sql مرة واحدة.

3) في Supabase > Storage > qafiyah-media > Settings:
   - اجعل Bucket = Public.
   - Allowed MIME Types: أضف application/pdf و application/epub+zip.
     إذا كانت القائمة مقيدة ولا تحتاج هذا التقييد، يمكنك إزالة تقييد MIME بالكامل.
   - تأكد أن الحد الأقصى للحجم مناسب لملفات الكتب التي سترفعها.

4) الكتاب الذي فشل سابقًا:
   - من لوحة الإدارة افتحه للتعديل.
   - أعد رفع ملف PDF/EPUB بعد تعديل إعدادات Storage.
   - احفظ الكتاب من جديد، حتى يتم تخزين file_url عام وصحيح.

5) في الموقع العام:
   - PDF يفتح داخل قارئ قافية.
   - EPUB يفتح كرابط الملف العام في تبويب جديد.
   - أي فشل يظهر للزائر فقط: تعذر فتح الكتاب
   - أخطاء تحميل قائمة الكتب تظهر فقط: تعذر تحميل الكتب.

6) أوامر الترمينال من داخل مجلد Qafiyah:
   git status
   git add books.js
   git commit -m "Fix public book reader and error messages"
   git push origin main

إذا وضعت ملف SQL داخل المشروع أيضًا فلا حاجة لرفعه للموقع، لكنه لا يضر. يكفي تشغيله في Supabase.
