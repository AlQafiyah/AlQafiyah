// ============================================================
// القافية - اتصال Supabase
// ============================================================

const SUPABASE_URL =
    "https://ekbujmlujjkgfbwaupef.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_OcSUq8xqEc6nyezkbC2xqA_E0_ivoEC";

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

// إتاحته لجميع ملفات الموقع
window.supabaseClient = supabaseClient;