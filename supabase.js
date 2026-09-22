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

// Google OAuth callback recovery.
// This is intentionally limited to Google sign-in and does not alter email/OTP flows.
(function recoverQafiyahGoogleOAuth() {
    const PENDING_KEY = "qafiyah_google_oauth_pending";
    const MAX_AGE_MS = 15 * 60 * 1000;

    function readPending() {
        try {
            const value = Number(localStorage.getItem(PENDING_KEY) || 0);
            if (!value || Date.now() - value > MAX_AGE_MS) {
                localStorage.removeItem(PENDING_KEY);
                return false;
            }
            return true;
        } catch (_) {
            return false;
        }
    }

    function clearPending() {
        try {
            localStorage.removeItem(PENDING_KEY);
        } catch (_) {}
    }

    function cleanOAuthUrl() {
        try {
            const url = new URL(window.location.href);
            [
                "code",
                "state",
                "error",
                "error_code",
                "error_description"
            ].forEach(function (key) {
                url.searchParams.delete(key);
            });
            url.hash = "";
            history.replaceState(
                history.state,
                document.title,
                url.pathname + (url.search ? url.search : "")
            );
        } catch (_) {}
    }

    async function recover() {
        if (!readPending() || !window.supabaseClient?.auth) {
            return;
        }

        try {
            // Let Supabase's normal browser initialization handle the callback first.
            const current = await window.supabaseClient.auth.getSession();
            if (current?.data?.session) {
                clearPending();
                cleanOAuthUrl();
                return;
            }

            const url = new URL(window.location.href);
            const code = url.searchParams.get("code");

            // PKCE/auth-code fallback in case automatic URL detection did not complete.
            if (code) {
                const result = await window.supabaseClient.auth.exchangeCodeForSession(code);
                if (!result?.error && result?.data?.session) {
                    clearPending();
                    cleanOAuthUrl();
                    return;
                }
            }

            // Implicit-flow fallback. Normally Supabase handles this automatically.
            const hash = new URLSearchParams(
                String(window.location.hash || "").replace(/^#/, "")
            );
            const accessToken = hash.get("access_token");
            const refreshToken = hash.get("refresh_token");

            if (accessToken && refreshToken) {
                const result = await window.supabaseClient.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                });
                if (!result?.error && result?.data?.session) {
                    clearPending();
                    cleanOAuthUrl();
                }
            }
        } catch (_) {
            // Keep the callback URL and pending flag so the normal Supabase flow can retry.
        }
    }

    // Run after the client's own auto-initialization has had a chance to process the URL.
    setTimeout(recover, 0);
    setTimeout(recover, 600);
})();

