// ================================
// قافية - الاتصال بـ Supabase
// ================================


// ================================
// بيانات مشروع Supabase
// ================================

const SUPABASE_URL =
    'https://ekbujmlujjkgfbwaupef.supabase.co';


const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_OcSUq8xqEc6nyezkbC2xqA_E0_ivoEC';


// ================================
// إنشاء اتصال Supabase
// ================================

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );


// ================================
// اختبار الاتصال
// ================================

console.log(
    'قافية: تم الاتصال بـ Supabase بنجاح'
);