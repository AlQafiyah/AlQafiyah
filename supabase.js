// ============================================================
// قافية | Qafiyah
// Supabase Connection
// ============================================================


// ============================================================
// إعدادات مشروع Supabase
// ============================================================

const SUPABASE_URL =
    'https://ekbujmlujjkgfbwaupef.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_OcSUq8xqEc6nyezkbC2xqA_E0_ivoEC';


// ============================================================
// إنشاء اتصال Supabase
// ============================================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ============================================================
// التحقق من جاهزية الاتصال
// ============================================================

if (supabaseClient) {

    console.log(
        'قافية: تم الاتصال بـ Supabase بنجاح'
    );

} else {

    console.error(
        'قافية: تعذر إنشاء اتصال Supabase'
    );

}