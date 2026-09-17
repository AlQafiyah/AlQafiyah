const SUPABASE_URL =
    'https://ekbujmlujjkgfbwaupef.supabase.co';

const SUPABASE_PUBLISHABLE_KEY =
    'sb_publishable_OcSUq8xqEc6nyezkbC2xqA_E0_ivoEC';

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_PUBLISHABLE_KEY
    );

window.supabaseClient = supabaseClient;


/* ============================================================
   تحميل نظام المحتوى تلقائيًا
   ============================================================ */

(function loadQafiyahContent() {

    if (window.__QAFIYAH_CONTENT_LOADER_STARTED__) {
        return;
    }

    window.__QAFIYAH_CONTENT_LOADER_STARTED__ = true;


    const currentPage =
        window.location.pathname
            .split('/')
            .pop()
            .toLowerCase() || 'index.html';


    const contentPages = new Set([
        'poems.html',
        'poets.html',
        'articles.html',
        'poem.html',
        'poet.html',
        'article.html'
    ]);


    if (!contentPages.has(currentPage)) {
        return;
    }


    const script =
        document.createElement('script');


    script.src =
        'content.js?v=20260917-3';


    script.async = false;


    script.dataset.qafiyahContentLoader =
        'true';


    script.onerror =
        function () {

            console.error(
                'القافية: تعذر تحميل content.js'
            );

        };


    document.head.appendChild(
        script
    );

})();