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
        SUPABASE_PUBLISHABLE_KEY,
        {
            auth: {
                autoRefreshToken: true,
                persistSession: true,
                detectSessionInUrl: true
            }
        }
    );

// إتاحته لجميع ملفات الموقع
window.supabaseClient = supabaseClient;

// ضع هنا Cloudflare Turnstile Site Key العام (ليس Secret Key).
window.QAFIYAH_TURNSTILE_SITE_KEY = window.QAFIYAH_TURNSTILE_SITE_KEY || "";
