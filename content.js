// ============================================================
// القافية - نظام المحتوى العام النهائي
// القصائد + الشعراء + المقالات + صفحات التفاصيل
// ============================================================

(function () {

    "use strict";


    // ============================================================
    // منع التشغيل المكرر
    // ============================================================

    if (window.__QAFIYAH_CONTENT_STARTED__) {
        return;
    }

    window.__QAFIYAH_CONTENT_STARTED__ = true;


    // ============================================================
    // العصور
    // ============================================================

    const ERAS = [
        "قبل الإسلام",
        "صدر الإسلام",
        "الأموي",
        "العباسي",
        "الأندلسي",
        "المملوكي",
        "العثماني",
        "الحديث",
        "المعاصر"
    ];


    // ============================================================
    // بدء النظام
    // ============================================================

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initContent,
            {
                once: true
            }
        );

    } else {

        initContent();

    }


    // ============================================================
    // البداية الرئيسية
    // ============================================================

    async function initContent() {

        const db =
            window.supabaseClient;


        if (!db) {

            console.error(
                "القافية: تعذر العثور على Supabase."
            );

            showStartupError();

            return;
        }


        injectContentStyles();


        const page =
            getCurrentPage();


        const jobs =
            [];


        // ========================================================
        // صفحات القوائم
        // ========================================================

        if (
            document.getElementById(
                "articlesContainer"
            )
        ) {

            jobs.push(
                initArticlesList()
            );

        }


        if (
            document.getElementById(
                "poetsContainer"
            )
        ) {

            jobs.push(
                initPoetsList()
            );

        }


        if (
            document.getElementById(
                "Poems"
            ) &&
            !document.getElementById(
                "poemDetail"
            )
        ) {

            jobs.push(
                initPoemsList()
            );

        }


        // ========================================================
        // صفحات التفاصيل
        //
        // لا نعتمد فقط على اسم الرابط.
        // هذا مهم لأن Cloudflare قد يحول:
        //
        // poem.html
        //
        // إلى:
        //
        // /poem
        // أو
        // /poem/
        //
        // ========================================================

        if (
            document.getElementById(
                "articleDetail"
            ) ||
            page === "article.html"
        ) {

            jobs.push(
                initArticleDetail()
            );

        }


        if (
            document.getElementById(
                "poetDetail"
            ) ||
            page === "poet.html"
        ) {

            jobs.push(
                initPoetDetail()
            );

        }


        if (
            document.getElementById(
                "poemDetail"
            ) ||
            page === "poem.html"
        ) {

            jobs.push(
                initPoemDetail()
            );

        }


        const results =
            await Promise.allSettled(
                jobs
            );


        results.forEach(
            function (result) {

                if (
                    result.status ===
                    "rejected"
                ) {

                    console.error(
                        "القافية: خطأ في نظام المحتوى:",
                        result.reason
                    );

                }

            }
        );

    }


    // ============================================================
    // إظهار خطأ عند عدم تحميل Supabase
    // بدل بقاء جاري التحميل للأبد
    // ============================================================

    function showStartupError() {

        const detail =
            document.getElementById(
                "poemDetail"
            )
            ||
            document.getElementById(
                "poetDetail"
            )
            ||
            document.getElementById(
                "articleDetail"
            );


        if (!detail) {
            return;
        }


        detail.innerHTML = `
            <section class="qafiyah-detail-shell">

                <article
                    class="
                        content-card
                        qafiyah-detail-card
                        qafiyah-error-card
                    ">

                    <h1>
                        تعذر تحميل المحتوى
                    </h1>

                    <p>
                        حدث خطأ أثناء الاتصال بقاعدة البيانات.
                    </p>

                </article>

            </section>
        `;

    }


    // ============================================================
    // معرفة الصفحة الحالية
    //
    // تدعم:
    //
    // /poem.html
    // /poem
    // /poem/
    //
    // ============================================================

    function getCurrentPage() {

        let pathname =
            String(
                window.location.pathname ||
                ""
            );


        try {

            pathname =
                decodeURIComponent(
                    pathname
                );

        } catch {
            // لا شيء
        }


        pathname =
            pathname.replace(
                /\/+$/,
                ""
            );


        let page =
            pathname
                .split("/")
                .pop()
                .toLowerCase();


        if (!page) {

            return "index.html";

        }


        const aliases = {

            poem:
                "poem.html",

            poet:
                "poet.html",

            article:
                "article.html",

            poems:
                "poems.html",

            poets:
                "poets.html",

            articles:
                "articles.html"

        };


        if (
            aliases[page]
        ) {

            page =
                aliases[page];

        }


        return page;

    }


    // ============================================================
    // ID من الرابط
    // ============================================================

    function getIdFromUrl() {

        const params =
            new URLSearchParams(
                window.location.search
            );


        const raw =
            params.get(
                "id"
            );


        if (
            raw === null ||
            raw === ""
        ) {

            return null;

        }


        const numericId =
            Number(
                raw
            );


        if (
            Number.isInteger(
                numericId
            ) &&
            numericId > 0
        ) {

            return numericId;

        }


        // دعم UUID أو ID نصي مستقبلًا
        const stringId =
            String(
                raw
            )
                .trim();


        return (
            stringId ||
            null
        );

    }


    // ============================================================
    // حماية HTML
    // ============================================================

    function escapeHtml(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value ?? "";


        return div.innerHTML;

    }


    // ============================================================
    // تطبيع العربية
    // ============================================================

    function normalizeArabic(
        value
    ) {

        return String(
            value ||
            ""
        )

            .normalize(
                "NFKD"
            )

            .replace(
                /[\u064B-\u065F\u0670\u06D6-\u06ED]/g,
                ""
            )

            .replace(
                /ـ/g,
                ""
            )

            .replace(
                /[إأآٱ]/g,
                "ا"
            )

            .replace(
                /ى/g,
                "ي"
            )

            .replace(
                /ؤ/g,
                "و"
            )

            .replace(
                /ئ/g,
                "ي"
            )

            .replace(
                /ة/g,
                "ه"
            )

            .replace(
                /\s+/g,
                " "
            )

            .trim()

            .toLowerCase();

    }


    // ============================================================
    // اختصار النص
    // ============================================================

    function shortText(
        value,
        limit = 180
    ) {

        const text =
            String(
                value ||
                ""
            )

                .replace(
                    /\s+/g,
                    " "
                )

                .trim();


        if (
            text.length <=
            limit
        ) {

            return text;

        }


        return (
            text
                .slice(
                    0,
                    limit
                )
                .trim()
            +
            "…"
        );

    }


    // ============================================================
    // الرابط الآمن
    // ============================================================

    function safeUrl(
        value
    ) {

        if (!value) {

            return "";

        }


        try {

            const url =
                new URL(
                    String(value),
                    window.location.href
                );


            if (
                url.protocol !==
                    "http:"
                &&
                url.protocol !==
                    "https:"
            ) {

                return "";

            }


            return url.href;

        } catch {

            return "";

        }

    }


    // ============================================================
    // تنسيق النصوص الطويلة
    // ============================================================

    function formatLongText(
        value
    ) {

        const text =
            String(
                value ||
                ""
            )
                .trim();


        if (!text) {

            return "";

        }


        return text

            .split(
                /\n\s*\n/
            )

            .map(
                function (
                    paragraph
                ) {

                    return `
                        <p>
                            ${
                                escapeHtml(
                                    paragraph
                                )
                                    .replace(
                                        /\n/g,
                                        "<br>"
                                    )
                            }
                        </p>
                    `;

                }
            )

            .join("");

    }


    // ============================================================
    // تنسيق القصيدة
    // ============================================================

    function formatPoemLines(
        value
    ) {

        return String(
            value ||
            ""
        )

            .split(
                /\r?\n/
            )

            .map(
                function (
                    line
                ) {

                    const clean =
                        line.trim();


                    if (!clean) {

                        return `
                            <div
                                class="qafiyah-poem-gap"
                                aria-hidden="true">
                            </div>
                        `;

                    }


                    return `
                        <p>
                            ${
                                escapeHtml(
                                    clean
                                )
                            }
                        </p>
                    `;

                }
            )

            .join("");

    }


    // ============================================================
    // عنوان الصفحة
    // ============================================================

    function setDocumentTitle(
        title
    ) {

        if (!title) {
            return;
        }


        document.title =
            `${title} | القافية`;

    }


    // ============================================================
    // ترتيب القيم
    // ============================================================

    function uniqueSorted(
        values
    ) {

        const clean =
            Array.from(

                new Set(

                    values

                        .map(
                            function (
                                value
                            ) {

                                return String(
                                    value ||
                                    ""
                                )
                                    .trim();

                            }
                        )

                        .filter(
                            Boolean
                        )

                )

            );


        return clean.sort(
            function (
                a,
                b
            ) {

                const ai =
                    ERAS.indexOf(
                        a
                    );


                const bi =
                    ERAS.indexOf(
                        b
                    );


                if (
                    ai !== -1 ||
                    bi !== -1
                ) {

                    if (
                        ai === -1
                    ) {
                        return 1;
                    }


                    if (
                        bi === -1
                    ) {
                        return -1;
                    }


                    return (
                        ai -
                        bi
                    );

                }


                return a.localeCompare(
                    b,
                    "ar"
                );

            }
        );

    }


    // ============================================================
    // تعبئة القائمة المنسدلة
    // ============================================================

    function fillSelect(
        select,
        values,
        firstLabel
    ) {

        if (!select) {
            return;
        }


        const oldValue =
            select.value;


        const items =
            uniqueSorted(
                values
            );


        select.innerHTML = `

            <option value="">
                ${
                    escapeHtml(
                        firstLabel
                    )
                }
            </option>

            ${
                items

                    .map(
                        function (
                            value
                        ) {

                            return `

                                <option
                                    value="${
                                        escapeHtml(
                                            value
                                        )
                                    }">

                                    ${
                                        escapeHtml(
                                            value
                                        )
                                    }

                                </option>

                            `;

                        }
                    )

                    .join("")
            }

        `;


        if (
            items.includes(
                oldValue
            )
        ) {

            select.value =
                oldValue;

        }

    }


    // ============================================================
    // إظهار وإخفاء
    // ============================================================

    function showElement(
        element
    ) {

        if (element) {

            element.hidden =
                false;

        }

    }


    function hideElement(
        element
    ) {

        if (element) {

            element.hidden =
                true;

        }

    }


    // ============================================================
    // مكان صفحة التفاصيل
    // ============================================================

    function getDetailHost(
        preferredId
    ) {

        const explicit =
            document.getElementById(
                preferredId
            );


        if (explicit) {

            return explicit;

        }


        const generic =
            document.getElementById(
                "contentDetail"
            );


        if (generic) {

            return generic;

        }


        const main =
            document.querySelector(
                "main"
            );


        if (main) {

            main.innerHTML =
                "";


            main.classList.add(
                "qafiyah-detail-main"
            );


            return main;

        }


        const fallback =
            document.createElement(
                "main"
            );


        fallback.className =
            "qafiyah-detail-main";


        document.body.appendChild(
            fallback
        );


        return fallback;

    }


    // ============================================================
    // التحميل
    // ============================================================

    function renderLoading(
        host,
        text =
            "جاري التحميل..."
    ) {

        host.innerHTML = `

            <section
                class="qafiyah-detail-shell">

                <div
                    class="qafiyah-content-status">

                    ${
                        escapeHtml(
                            text
                        )
                    }

                </div>

            </section>

        `;

    }


    // ============================================================
    // الخطأ
    // ============================================================

    function renderError(
        host,
        title,
        message,
        backHref,
        backLabel
    ) {

        host.innerHTML = `

            <section
                class="qafiyah-detail-shell">

                <article
                    class="
                        content-card
                        qafiyah-detail-card
                        qafiyah-error-card
                    ">

                    <h1>
                        ${
                            escapeHtml(
                                title
                            )
                        }
                    </h1>

                    <p>
                        ${
                            escapeHtml(
                                message
                            )
                        }
                    </p>

                    <a
                        class="qafiyah-back-link"
                        href="${
                            escapeHtml(
                                backHref
                            )
                        }">

                        ${
                            escapeHtml(
                                backLabel
                            )
                        }

                    </a>

                </article>

            </section>

        `;

    }


    // ============================================================
    // الصورة
    // ============================================================

    function renderImage(
        url,
        alt,
        className =
            "qafiyah-detail-image"
    ) {

        const safe =
            safeUrl(
                url
            );


        if (!safe) {

            return "";

        }


        return `

            <img
                class="${
                    escapeHtml(
                        className
                    )
                }"

                src="${
                    escapeHtml(
                        safe
                    )
                }"

                alt="${
                    escapeHtml(
                        alt ||
                        ""
                    )
                }"

                loading="lazy"
                decoding="async"
            >

        `;

    }


    // ============================================================
    // YouTube
    // ============================================================

    function getYoutubeEmbed(
        value
    ) {

        const safe =
            safeUrl(
                value
            );


        if (!safe) {

            return "";

        }


        try {

            const url =
                new URL(
                    safe
                );


            const host =
                url.hostname
                    .replace(
                        /^www\./,
                        ""
                    );


            let id =
                "";


            if (
                host ===
                "youtu.be"
            ) {

                id =
                    url.pathname
                        .split("/")
                        .filter(
                            Boolean
                        )[0]
                    ||
                    "";

            } else if (
                host ===
                    "youtube.com"
                ||
                host ===
                    "m.youtube.com"
            ) {

                if (
                    url.pathname ===
                    "/watch"
                ) {

                    id =
                        url.searchParams
                            .get(
                                "v"
                            )
                        ||
                        "";

                } else {

                    const parts =
                        url.pathname
                            .split("/")
                            .filter(
                                Boolean
                            );


                    if (
                        [
                            "embed",
                            "shorts",
                            "live"
                        ]
                            .includes(
                                parts[0]
                            )
                    ) {

                        id =
                            parts[1] ||
                            "";

                    }

                }

            }


            if (
                !id ||
                !/^[A-Za-z0-9_-]{6,}$/
                    .test(
                        id
                    )
            ) {

                return "";

            }


            return (
                "https://www.youtube.com/embed/"
                +
                encodeURIComponent(
                    id
                )
            );

        } catch {

            return "";

        }

    }


    // ============================================================
    // الفيديو
    // ============================================================

    function renderVideo(
        value,
        title
    ) {

        const safe =
            safeUrl(
                value
            );


        if (!safe) {

            return "";

        }


        const youtube =
            getYoutubeEmbed(
                safe
            );


        if (youtube) {

            return `

                <div
                    class="
                        video-box
                        qafiyah-video-box
                    ">

                    <iframe
                        src="${
                            escapeHtml(
                                youtube
                            )
                        }"

                        title="${
                            escapeHtml(
                                title ||
                                "فيديو"
                            )
                        }"

                        loading="lazy"

                        allow="
                            accelerometer;
                            autoplay;
                            clipboard-write;
                            encrypted-media;
                            gyroscope;
                            picture-in-picture;
                            web-share
                        "

                        allowfullscreen>
                    </iframe>

                </div>

            `;

        }


        const pathname =
            new URL(
                safe
            )
                .pathname
                .toLowerCase();


        if (
            /\.(mp4|webm|ogg|mov|m4v)$/
                .test(
                    pathname
                )
        ) {

            return `

                <div
                    class="
                        video-box
                        qafiyah-video-box
                    ">

                    <video
                        controls
                        preload="metadata"

                        src="${
                            escapeHtml(
                                safe
                            )
                        }">

                        متصفحك لا يدعم تشغيل الفيديو.

                    </video>

                </div>

            `;

        }


        return `

            <p
                class="qafiyah-external-media">

                <a
                    href="${
                        escapeHtml(
                            safe
                        )
                    }"

                    target="_blank"
                    rel="noopener noreferrer">

                    فتح الفيديو

                </a>

            </p>

        `;

    }


    // ============================================================
    // التسجيل الصوتي للقصيدة
    // ============================================================

    function renderAudio(
        value,
        title
    ) {

        const safe =
            safeUrl(
                value
            );


        if (!safe) {

            return "";

        }


        return `

            <div class="qafiyah-audio-player">

                <button
                    class="qafiyah-audio-toggle"
                    type="button"
                    aria-pressed="false"
                    aria-label="تشغيل التسجيل الصوتي لقصيدة ${
                        escapeHtml(
                            title || ""
                        )
                    }">

                    <span
                        class="qafiyah-audio-icon"
                        aria-hidden="true">▶</span>

                    <span class="qafiyah-audio-label">
                        استمع إلى القصيدة
                    </span>

                </button>

                <audio
                    class="qafiyah-poem-audio"
                    preload="metadata"
                    src="${escapeHtml(safe)}">
                </audio>

            </div>

        `;

    }


    function bindAudioPlayers(
        root
    ) {

        root
            ?.querySelectorAll(
                ".qafiyah-audio-player"
            )
            .forEach(
                player => {

                    const button =
                        player.querySelector(
                            ".qafiyah-audio-toggle"
                        );

                    const audio =
                        player.querySelector(
                            ".qafiyah-poem-audio"
                        );

                    const icon =
                        player.querySelector(
                            ".qafiyah-audio-icon"
                        );

                    const label =
                        player.querySelector(
                            ".qafiyah-audio-label"
                        );


                    if (!button || !audio) return;


                    const setPlaying =
                        playing => {

                            button.setAttribute(
                                "aria-pressed",
                                String(playing)
                            );

                            button.classList.toggle(
                                "is-playing",
                                playing
                            );

                            if (icon) {
                                icon.textContent =
                                    playing ? "❚❚" : "▶";
                            }

                            if (label) {
                                label.textContent =
                                    playing
                                        ? "إيقاف مؤقت"
                                        : "استمع إلى القصيدة";
                            }

                        };


                    button.addEventListener(
                        "click",
                        async () => {

                            if (!audio.paused) {
                                audio.pause();
                                return;
                            }


                            document
                                .querySelectorAll(
                                    ".qafiyah-poem-audio"
                                )
                                .forEach(
                                    other => {
                                        if (other !== audio) {
                                            other.pause();
                                        }
                                    }
                                );


                            try {
                                await audio.play();
                            } catch (error) {
                                console.error(
                                    "القافية: تعذر تشغيل الصوت:",
                                    error
                                );
                            }

                        }
                    );


                    audio.addEventListener(
                        "play",
                        () => setPlaying(true)
                    );

                    audio.addEventListener(
                        "pause",
                        () => setPlaying(false)
                    );

                    audio.addEventListener(
                        "ended",
                        () => setPlaying(false)
                    );

                }
            );

    }


    // ============================================================
    // المقالات - القائمة
    // ============================================================

    async function initArticlesList() {

        const db =
            window.supabaseClient;


        const container =
            document.getElementById(
                "articlesContainer"
            );


        const loading =
            document.getElementById(
                "articlesLoading"
            );


        const empty =
            document.getElementById(
                "articlesEmpty"
            );


        const search =
            document.getElementById(
                "articleSearch"
            );


        const category =
            document.getElementById(
                "articleCategory"
            );


        if (!container) {

            return;

        }


        try {

            const {
                data,
                error
            } =
                await db

                    .from(
                        "articles"
                    )

                    .select(
                        "*"
                    )

                    .order(
                        "is_featured",
                        {
                            ascending:
                                false
                        }
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            const articles =
                data ||
                [];


            fillSelect(

                category,

                articles.map(
                    function (
                        article
                    ) {

                        return (
                            article.category
                        );

                    }
                ),

                "جميع التصنيفات"

            );


            function render() {

                const query =
                    normalizeArabic(
                        search?.value
                    );


                const selectedCategory =
                    String(
                        category?.value ||
                        ""
                    );


                const filtered =
                    articles.filter(

                        function (
                            article
                        ) {

                            const matchesSearch =

                                !query

                                ||

                                normalizeArabic(
                                    article.title
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    article.summary
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    article.content
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    article.author
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    article.category
                                )
                                    .includes(
                                        query
                                    );


                            const matchesCategory =

                                !selectedCategory

                                ||

                                article.category ===
                                    selectedCategory;


                            return (
                                matchesSearch
                                &&
                                matchesCategory
                            );

                        }

                    );


                hideElement(
                    loading
                );


                if (
                    !filtered.length
                ) {

                    container.innerHTML =
                        "";


                    showElement(
                        empty
                    );


                    return;

                }


                hideElement(
                    empty
                );


                container.classList.add(
                    "qafiyah-list-grid"
                );


                container.innerHTML =

                    filtered

                        .map(
                            function (
                                article
                            ) {

                                const summary =

                                    String(
                                        article.summary ||
                                        ""
                                    )
                                        .trim()

                                    ||

                                    shortText(
                                        article.content,
                                        190
                                    );


                                return `

                                    <article
                                        class="
                                            content-card
                                            qafiyah-content-card
                                        ">

                                        ${
                                            renderImage(
                                                article.image_url,
                                                article.title,
                                                "qafiyah-card-image"
                                            )
                                        }

                                        <div
                                            class="qafiyah-card-body">

                                            ${
                                                article.category

                                                    ? `
                                                        <span
                                                            class="section-label">

                                                            ${
                                                                escapeHtml(
                                                                    article.category
                                                                )
                                                            }

                                                        </span>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <h2
                                                class="qafiyah-card-title">

                                                <a
                                                    href="article.html?id=${
                                                        encodeURIComponent(
                                                            article.id
                                                        )
                                                    }">

                                                    ${
                                                        escapeHtml(
                                                            article.title ||
                                                            "بدون عنوان"
                                                        )
                                                    }

                                                </a>

                                            </h2>

                                            ${
                                                article.author

                                                    ? `
                                                        <p
                                                            class="qafiyah-card-meta">

                                                            بقلم
                                                            ${
                                                                escapeHtml(
                                                                    article.author
                                                                )
                                                            }

                                                        </p>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <p
                                                class="qafiyah-card-summary">

                                                ${
                                                    escapeHtml(
                                                        summary
                                                    )
                                                }

                                            </p>

                                            <a
                                                class="qafiyah-read-more"

                                                href="article.html?id=${
                                                    encodeURIComponent(
                                                        article.id
                                                    )
                                                }">

                                                قراءة المقال

                                            </a>

                                        </div>

                                    </article>

                                `;

                            }
                        )

                        .join("");

            }


            search?.addEventListener(
                "input",
                render
            );


            category?.addEventListener(
                "change",
                render
            );


            render();

        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل المقالات:",
                error
            );


            hideElement(
                loading
            );


            container.innerHTML = `

                <div
                    class="
                        qafiyah-content-status
                        qafiyah-content-error
                    ">

                    تعذر تحميل المقالات.

                </div>

            `;

        }

    }


    // ============================================================
    // الشعراء - القائمة
    // ============================================================

    async function initPoetsList() {

        const db =
            window.supabaseClient;


        const container =
            document.getElementById(
                "poetsContainer"
            );


        const loading =
            document.getElementById(
                "poetsLoading"
            );


        const empty =
            document.getElementById(
                "poetsEmpty"
            );


        const noResults =
            document.getElementById(
                "poetsNoResults"
            );


        const search =
            document.getElementById(
                "poetSearch"
            );


        const era =
            document.getElementById(
                "poetEra"
            );


        const oldCategory =
            document.getElementById(
                "poetCategory"
            );


        if (!container) {

            return;

        }


        if (
            oldCategory
        ) {

            const wrapper =
                oldCategory.closest(
                    ".articles-filter"
                );


            if (wrapper) {

                wrapper.hidden =
                    true;

            } else {

                oldCategory.hidden =
                    true;

            }

        }


        try {

            const [
                poetsResult,
                poemsResult
            ] =
                await Promise.all([

                    db
                        .from(
                            "poets"
                        )
                        .select(
                            "*"
                        )
                        .order(
                            "is_featured",
                            {
                                ascending:
                                    false
                            }
                        )
                        .order(
                            "name",
                            {
                                ascending:
                                    true
                            }
                        ),

                    db
                        .from(
                            "poems"
                        )
                        .select(
                            "poet_id"
                        )

                ]);


            if (
                poetsResult.error
            ) {

                throw (
                    poetsResult.error
                );

            }


            if (
                poemsResult.error
            ) {

                throw (
                    poemsResult.error
                );

            }


            const counts =
                new Map();


            (
                poemsResult.data ||
                []
            )
                .forEach(
                    function (
                        poem
                    ) {

                        if (
                            !poem.poet_id
                        ) {

                            return;

                        }


                        const key =
                            String(
                                poem.poet_id
                            );


                        counts.set(

                            key,

                            (
                                counts.get(
                                    key
                                )
                                ||
                                0
                            )
                            +
                            1

                        );

                    }
                );


            const poets =

                (
                    poetsResult.data ||
                    []
                )

                    .map(
                        function (
                            poet
                        ) {

                            return {

                                ...poet,

                                poem_count:
                                    counts.get(
                                        String(
                                            poet.id
                                        )
                                    )
                                    ||
                                    0

                            };

                        }
                    );


            fillSelect(

                era,

                poets.map(
                    function (
                        poet
                    ) {

                        return (
                            poet.era
                        );

                    }
                ),

                "جميع العصور"

            );


            function render() {

                const query =
                    normalizeArabic(
                        search?.value
                    );


                const selectedEra =
                    String(
                        era?.value ||
                        ""
                    );


                const filtered =
                    poets.filter(

                        function (
                            poet
                        ) {

                            const matchesSearch =

                                !query

                                ||

                                normalizeArabic(
                                    poet.name
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poet.nickname
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poet.bio
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poet.era
                                )
                                    .includes(
                                        query
                                    );


                            const matchesEra =

                                !selectedEra

                                ||

                                poet.era ===
                                    selectedEra;


                            return (
                                matchesSearch
                                &&
                                matchesEra
                            );

                        }

                    );


                hideElement(
                    loading
                );


                if (
                    !poets.length
                ) {

                    container.innerHTML =
                        "";


                    showElement(
                        empty
                    );


                    hideElement(
                        noResults
                    );


                    return;

                }


                hideElement(
                    empty
                );


                if (
                    !filtered.length
                ) {

                    container.innerHTML =
                        "";


                    showElement(
                        noResults
                    );


                    return;

                }


                hideElement(
                    noResults
                );


                container.classList.add(
                    "qafiyah-list-grid"
                );


                container.innerHTML =

                    filtered

                        .map(
                            function (
                                poet
                            ) {

                                return `

                                    <article
                                        class="
                                            content-card
                                            qafiyah-content-card
                                            qafiyah-poet-card
                                        ">

                                        ${
                                            renderImage(
                                                poet.image_url,
                                                poet.name,
                                                "qafiyah-poet-image"
                                            )
                                        }

                                        <div
                                            class="qafiyah-card-body">

                                            ${
                                                poet.era

                                                    ? `
                                                        <span
                                                            class="section-label">

                                                            ${
                                                                escapeHtml(
                                                                    poet.era
                                                                )
                                                            }

                                                        </span>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <h2
                                                class="qafiyah-card-title">

                                                <a
                                                    href="poet.html?id=${
                                                        encodeURIComponent(
                                                            poet.id
                                                        )
                                                    }">

                                                    ${
                                                        escapeHtml(
                                                            poet.name ||
                                                            "بدون اسم"
                                                        )
                                                    }

                                                </a>

                                            </h2>

                                            ${
                                                poet.nickname

                                                    ? `
                                                        <p
                                                            class="qafiyah-poet-nickname">

                                                            ${
                                                                escapeHtml(
                                                                    poet.nickname
                                                                )
                                                            }

                                                        </p>
                                                    `

                                                    :
                                                    ""
                                            }

                                            ${
                                                poet.bio

                                                    ? `
                                                        <p
                                                            class="qafiyah-card-summary">

                                                            ${
                                                                escapeHtml(
                                                                    shortText(
                                                                        poet.bio,
                                                                        170
                                                                    )
                                                                )
                                                            }

                                                        </p>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <p
                                                class="qafiyah-card-meta">

                                                ${
                                                    poet.poem_count
                                                }

                                                ${
                                                    poet.poem_count ===
                                                    1

                                                        ? "قصيدة"

                                                        :
                                                        "قصائد"
                                                }

                                            </p>

                                            <a
                                                class="qafiyah-read-more"

                                                href="poet.html?id=${
                                                    encodeURIComponent(
                                                        poet.id
                                                    )
                                                }">

                                                صفحة الشاعر

                                            </a>

                                        </div>

                                    </article>

                                `;

                            }
                        )

                        .join("");

            }


            search?.addEventListener(
                "input",
                render
            );


            era?.addEventListener(
                "change",
                render
            );


            render();

        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل الشعراء:",
                error
            );


            hideElement(
                loading
            );


            container.innerHTML = `

                <div
                    class="
                        qafiyah-content-status
                        qafiyah-content-error
                    ">

                    تعذر تحميل الشعراء.

                </div>

            `;

        }

    }


    // ============================================================
    // القصائد - القائمة
    // ============================================================

    async function initPoemsList() {

        const db =
            window.supabaseClient;


        const section =
            document.getElementById(
                "Poems"
            );


        if (!section) {

            return;

        }


        section.innerHTML = `

            <div
                class="qafiyah-poems-index">

                <section
                    class="
                        articles-toolbar
                        qafiyah-poems-toolbar
                    ">

                    <div
                        class="articles-search">

                        <label
                            for="poemSearch"
                            class="sr-only">

                            البحث في القصائد

                        </label>

                        <div
                            class="search-input-wrapper">

                            <input
                                type="search"
                                id="poemSearch"
                                placeholder="ابحث باسم القصيدة أو الشاعر أو جزء من الأبيات..."
                                autocomplete="off"
                            >

                        </div>

                    </div>

                    <div
                        class="articles-filter">

                        <select
                            id="poemEra">

                            <option value="">
                                جميع العصور
                            </option>

                        </select>

                    </div>

                    <div
                        class="articles-filter">

                        <select
                            id="poemTopic">

                            <option value="">
                                جميع الموضوعات
                            </option>

                        </select>

                    </div>

                </section>

                <div
                    id="poemsPublicContainer"
                    class="qafiyah-list-grid">
                </div>

                <div
                    id="poemsPublicStatus"
                    class="qafiyah-content-status">

                    جاري تحميل القصائد...

                </div>

            </div>

        `;


        const container =
            document.getElementById(
                "poemsPublicContainer"
            );


        const status =
            document.getElementById(
                "poemsPublicStatus"
            );


        const search =
            document.getElementById(
                "poemSearch"
            );


        const era =
            document.getElementById(
                "poemEra"
            );


        const topic =
            document.getElementById(
                "poemTopic"
            );


        try {

            const {
                data,
                error
            } =
                await db

                    .from(
                        "poems"
                    )

                    .select(
                        "*"
                    )

                    .order(
                        "is_featured",
                        {
                            ascending:
                                false
                        }
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (error) {

                throw error;

            }


            const poems =
                data ||
                [];


            fillSelect(

                era,

                poems.map(
                    function (
                        poem
                    ) {

                        return (
                            poem.era
                        );

                    }
                ),

                "جميع العصور"

            );


            fillSelect(

                topic,

                poems.map(
                    function (
                        poem
                    ) {

                        return (
                            poem.category
                        );

                    }
                ),

                "جميع الموضوعات"

            );


            function render() {

                const query =
                    normalizeArabic(
                        search?.value
                    );


                const selectedEra =
                    String(
                        era?.value ||
                        ""
                    );


                const selectedTopic =
                    String(
                        topic?.value ||
                        ""
                    );


                const filtered =
                    poems.filter(

                        function (
                            poem
                        ) {

                            const matchesSearch =

                                !query

                                ||

                                normalizeArabic(
                                    poem.title
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poem.poet
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poem.content
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poem.category
                                )
                                    .includes(
                                        query
                                    )

                                ||

                                normalizeArabic(
                                    poem.era
                                )
                                    .includes(
                                        query
                                    );


                            const matchesEra =

                                !selectedEra

                                ||

                                poem.era ===
                                    selectedEra;


                            const matchesTopic =

                                !selectedTopic

                                ||

                                poem.category ===
                                    selectedTopic;


                            return (
                                matchesSearch
                                &&
                                matchesEra
                                &&
                                matchesTopic
                            );

                        }

                    );


                if (
                    !filtered.length
                ) {

                    container.innerHTML =
                        "";


                    status.hidden =
                        false;


                    status.textContent =

                        poems.length

                            ? "لم نجد قصيدة مطابقة لبحثك."

                            :
                            "لا توجد قصائد حاليًا.";


                    return;

                }


                status.hidden =
                    true;


                container.innerHTML =

                    filtered

                        .map(
                            function (
                                poem
                            ) {

                                return `

                                    <article
                                        class="
                                            content-card
                                            qafiyah-content-card
                                            qafiyah-poem-index-card
                                        ">

                                        ${
                                            renderImage(
                                                poem.image_url,
                                                poem.title,
                                                "qafiyah-card-image"
                                            )
                                        }

                                        <div
                                            class="qafiyah-card-body">

                                            ${
                                                poem.category

                                                    ? `
                                                        <span
                                                            class="section-label">

                                                            ${
                                                                escapeHtml(
                                                                    poem.category
                                                                )
                                                            }

                                                        </span>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <h2
                                                class="qafiyah-card-title">

                                                <a
                                                    href="poem.html?id=${
                                                        encodeURIComponent(
                                                            poem.id
                                                        )
                                                    }">

                                                    ${
                                                        escapeHtml(
                                                            poem.title ||
                                                            "بدون عنوان"
                                                        )
                                                    }

                                                </a>

                                            </h2>

                                            ${
                                                poem.poet

                                                    ? `
                                                        <p
                                                            class="
                                                                poem-poet
                                                                qafiyah-card-meta
                                                            ">

                                                            ${
                                                                escapeHtml(
                                                                    poem.poet
                                                                )
                                                            }

                                                        </p>
                                                    `

                                                    :
                                                    ""
                                            }

                                            <p
                                                class="qafiyah-card-summary">

                                                ${
                                                    escapeHtml(
                                                        shortText(
                                                            poem.content,
                                                            190
                                                        )
                                                    )
                                                }

                                            </p>

                                            <a
                                                class="qafiyah-read-more"

                                                href="poem.html?id=${
                                                    encodeURIComponent(
                                                        poem.id
                                                    )
                                                }">

                                                قراءة القصيدة

                                            </a>

                                        </div>

                                    </article>

                                `;

                            }
                        )

                        .join("");

            }


            search?.addEventListener(
                "input",
                render
            );


            era?.addEventListener(
                "change",
                render
            );


            topic?.addEventListener(
                "change",
                render
            );


            render();

        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل القصائد:",
                error
            );


            container.innerHTML =
                "";


            status.hidden =
                false;


            status.textContent =
                "تعذر تحميل القصائد.";


            status.classList.add(
                "qafiyah-content-error"
            );

        }

    }


    // ============================================================
    // المقال - التفاصيل
    // ============================================================

    async function initArticleDetail() {

        const db =
            window.supabaseClient;


        const host =
            getDetailHost(
                "articleDetail"
            );


        const id =
            getIdFromUrl();


        renderLoading(
            host,
            "جاري تحميل المقال..."
        );


        if (!id) {

            renderError(
                host,
                "المقال غير موجود",
                "الرابط غير صحيح أو لا يحتوي على رقم المقال.",
                "articles.html",
                "العودة إلى المقالات"
            );


            return;

        }


        try {

            const {
                data: article,
                error
            } =
                await db

                    .from(
                        "articles"
                    )

                    .select(
                        "*"
                    )

                    .eq(
                        "id",
                        id
                    )

                    .maybeSingle();


            if (error) {

                throw error;

            }


            if (!article) {

                renderError(
                    host,
                    "المقال غير موجود",
                    "قد يكون المقال حُذف أو أن الرابط غير صحيح.",
                    "articles.html",
                    "العودة إلى المقالات"
                );


                return;

            }


            setDocumentTitle(
                article.title
            );


            host.innerHTML = `

                <section
                    class="qafiyah-detail-shell">

                    <a
                        class="qafiyah-back-link"
                        href="articles.html">

                        ← العودة إلى المقالات

                    </a>

                    <article
                        class="
                            content-card
                            qafiyah-detail-card
                        ">

                        ${
                            renderImage(
                                article.image_url,
                                article.title
                            )
                        }

                        <header
                            class="qafiyah-detail-header">

                            ${
                                article.category

                                    ? `
                                        <span
                                            class="section-label">

                                            ${
                                                escapeHtml(
                                                    article.category
                                                )
                                            }

                                        </span>
                                    `

                                    :
                                    ""
                            }

                            <h1>
                                ${
                                    escapeHtml(
                                        article.title ||
                                        "بدون عنوان"
                                    )
                                }
                            </h1>

                            ${
                                article.author

                                    ? `
                                        <p
                                            class="qafiyah-detail-meta">

                                            بقلم
                                            ${
                                                escapeHtml(
                                                    article.author
                                                )
                                            }

                                        </p>
                                    `

                                    :
                                    ""
                            }

                            ${
                                article.summary

                                    ? `
                                        <p
                                            class="qafiyah-detail-summary">

                                            ${
                                                escapeHtml(
                                                    article.summary
                                                )
                                            }

                                        </p>
                                    `

                                    :
                                    ""
                            }

                        </header>

                        <div
                            class="qafiyah-article-body">

                            ${
                                formatLongText(
                                    article.content
                                )
                            }

                        </div>

                    </article>

                </section>

            `;
        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل المقال:",
                error
            );


            renderError(
                host,
                "تعذر تحميل المقال",
                "حدث خطأ أثناء جلب المقال.",
                "articles.html",
                "العودة إلى المقالات"
            );

        }

    }


    // ============================================================
    // الشاعر - التفاصيل
    // ============================================================

    async function initPoetDetail() {

        const db =
            window.supabaseClient;


        const host =
            getDetailHost(
                "poetDetail"
            );


        const id =
            getIdFromUrl();


        renderLoading(
            host,
            "جاري تحميل الشاعر..."
        );


        if (!id) {

            renderError(
                host,
                "الشاعر غير موجود",
                "الرابط غير صحيح أو لا يحتوي على رقم الشاعر.",
                "poets.html",
                "العودة إلى الشعراء"
            );


            return;

        }


        try {

            const {
                data: poet,
                error: poetError
            } =
                await db

                    .from(
                        "poets"
                    )

                    .select(
                        "*"
                    )

                    .eq(
                        "id",
                        id
                    )

                    .maybeSingle();


            if (
                poetError
            ) {

                throw (
                    poetError
                );

            }


            if (!poet) {

                renderError(
                    host,
                    "الشاعر غير موجود",
                    "قد يكون الشاعر حُذف أو أن الرابط غير صحيح.",
                    "poets.html",
                    "العودة إلى الشعراء"
                );


                return;

            }


            let poems =
                [];


            const {
                data: linkedPoems,
                error: poemsError
            } =
                await db

                    .from(
                        "poems"
                    )

                    .select(
                        "*"
                    )

                    .eq(
                        "poet_id",
                        id
                    )

                    .order(
                        "created_at",
                        {
                            ascending:
                                false
                        }
                    );


            if (
                poemsError
            ) {

                console.warn(
                    "القافية: تعذر جلب القصائد المرتبطة بالـ poet_id:",
                    poemsError
                );

            } else {

                poems =
                    linkedPoems ||
                    [];

            }


            if (
                !poems.length &&
                poet.name
            ) {

                const {
                    data: legacyPoems,
                    error: legacyError
                } =
                    await db

                        .from(
                            "poems"
                        )

                        .select(
                            "*"
                        )

                        .eq(
                            "poet",
                            poet.name
                        )

                        .order(
                            "created_at",
                            {
                                ascending:
                                    false
                            }
                        );


                if (
                    !legacyError
                ) {

                    poems =
                        legacyPoems ||
                        [];

                }

            }


            setDocumentTitle(
                poet.nickname ||
                poet.name
            );


            host.innerHTML = `

                <section
                    class="qafiyah-detail-shell">

                    <a
                        class="qafiyah-back-link"
                        href="poets.html">

                        ← العودة إلى الشعراء

                    </a>

                    <article
                        class="
                            content-card
                            qafiyah-detail-card
                            qafiyah-poet-detail-card
                        ">

                        <div
                            class="qafiyah-poet-profile">

                            ${
                                renderImage(
                                    poet.image_url,
                                    poet.name,
                                    "qafiyah-poet-detail-image"
                                )
                            }

                            <div
                                class="qafiyah-poet-profile-text">

                                ${
                                    poet.era

                                        ? `
                                            <span
                                                class="section-label">

                                                ${
                                                    escapeHtml(
                                                        poet.era
                                                    )
                                                }

                                            </span>
                                        `

                                        :
                                        ""
                                }

                                <h1>
                                    ${
                                        escapeHtml(
                                            poet.name ||
                                            "بدون اسم"
                                        )
                                    }
                                </h1>

                                ${
                                    poet.nickname

                                        ? `
                                            <p
                                                class="qafiyah-detail-nickname">

                                                ${
                                                    escapeHtml(
                                                        poet.nickname
                                                    )
                                                }

                                            </p>
                                        `

                                        :
                                        ""
                                }

                                <p
                                    class="qafiyah-detail-meta">

                                    ${
                                        poems.length
                                    }

                                    ${
                                        poems.length ===
                                        1

                                            ? "قصيدة"

                                            :
                                            "قصائد"
                                    }

                                </p>

                            </div>

                        </div>

                        ${
                            poet.bio

                                ? `

                                    <section
                                        class="qafiyah-biography">

                                        <h2>
                                            سيرة الشاعر
                                        </h2>

                                        <div
                                            class="qafiyah-article-body">

                                            ${
                                                formatLongText(
                                                    poet.bio
                                                )
                                            }

                                        </div>

                                    </section>

                                `

                                :
                                ""
                        }

                    </article>

                    <section
                        class="qafiyah-related-section">

                        <div
                            class="qafiyah-related-heading">

                            <h2>
                                من أشعاره
                            </h2>

                            <span>
                                ${
                                    poems.length
                                }
                            </span>

                        </div>

                        ${
                            poems.length

                                ? `

                                    <div
                                        class="qafiyah-list-grid">

                                        ${
                                            poems

                                                .map(
                                                    function (
                                                        poem
                                                    ) {

                                                        return `

                                                            <article
                                                                class="
                                                                    content-card
                                                                    qafiyah-content-card
                                                                ">

                                                                <div
                                                                    class="qafiyah-card-body">

                                                                    ${
                                                                        poem.category

                                                                            ? `
                                                                                <span
                                                                                    class="section-label">

                                                                                    ${
                                                                                        escapeHtml(
                                                                                            poem.category
                                                                                        )
                                                                                    }

                                                                                </span>
                                                                            `

                                                                            :
                                                                            ""
                                                                    }

                                                                    <h3
                                                                        class="qafiyah-card-title">

                                                                        <a
                                                                            href="poem.html?id=${
                                                                                encodeURIComponent(
                                                                                    poem.id
                                                                                )
                                                                            }">

                                                                            ${
                                                                                escapeHtml(
                                                                                    poem.title ||
                                                                                    "بدون عنوان"
                                                                                )
                                                                            }

                                                                        </a>

                                                                    </h3>

                                                                    <p
                                                                        class="qafiyah-card-summary">

                                                                        ${
                                                                            escapeHtml(
                                                                                shortText(
                                                                                    poem.content,
                                                                                    150
                                                                                )
                                                                            )
                                                                        }

                                                                    </p>

                                                                    <a
                                                                        class="qafiyah-read-more"

                                                                        href="poem.html?id=${
                                                                            encodeURIComponent(
                                                                                poem.id
                                                                            )
                                                                        }">

                                                                        قراءة القصيدة

                                                                    </a>

                                                                </div>

                                                            </article>

                                                        `;

                                                    }
                                                )

                                                .join("")
                                        }

                                    </div>

                                `

                                : `

                                    <div
                                        class="qafiyah-content-status">

                                        لا توجد قصائد مرتبطة بهذا الشاعر حتى الآن.

                                    </div>

                                `
                        }

                    </section>

                </section>

            `;

        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل الشاعر:",
                error
            );


            renderError(
                host,
                "تعذر تحميل الشاعر",
                "حدث خطأ أثناء جلب بيانات الشاعر.",
                "poets.html",
                "العودة إلى الشعراء"
            );

        }

    }


    // ============================================================
    // القصيدة - التفاصيل
    // ============================================================

    async function initPoemDetail() {

        const db =
            window.supabaseClient;


        const host =
            getDetailHost(
                "poemDetail"
            );


        const id =
            getIdFromUrl();


        renderLoading(
            host,
            "جاري تحميل القصيدة..."
        );


        if (!id) {

            renderError(
                host,
                "القصيدة غير موجودة",
                "الرابط غير صحيح أو لا يحتوي على رقم القصيدة.",
                "Poems.html",
                "العودة إلى القصائد"
            );


            return;

        }


        try {

            const {
                data: poem,
                error: poemError
            } =
                await db

                    .from(
                        "poems"
                    )

                    .select(
                        "*"
                    )

                    .eq(
                        "id",
                        id
                    )

                    .maybeSingle();


            if (
                poemError
            ) {

                throw (
                    poemError
                );

            }


            if (!poem) {

                renderError(
                    host,
                    "القصيدة غير موجودة",
                    "قد تكون القصيدة حُذفت أو أن الرابط غير صحيح.",
                    "Poems.html",
                    "العودة إلى القصائد"
                );


                return;

            }


            let poet =
                null;


            if (
                poem.poet_id
            ) {

                const {
                    data: poetData,
                    error: poetError
                } =
                    await db

                        .from(
                            "poets"
                        )

                        .select(
                            "id,name,nickname,era,image_url"
                        )

                        .eq(
                            "id",
                            poem.poet_id
                        )

                        .maybeSingle();


                if (
                    !poetError
                ) {

                    poet =
                        poetData ||
                        null;

                }

            }


            setDocumentTitle(
                poem.title
            );


            const poetName =
                poet?.name
                ||
                poem.poet
                ||
                "";


            const poetHref =

                poet?.id

                    ? `poet.html?id=${
                        encodeURIComponent(
                            poet.id
                        )
                    }`

                    :
                    "";


            host.innerHTML = `

                <section
                    class="qafiyah-detail-shell">

                    <a
                        class="qafiyah-back-link"
                        href="Poems.html">

                        ← العودة إلى القصائد

                    </a>

                    <article
                        class="
                            content-card
                            poem-card
                            qafiyah-detail-card
                            qafiyah-poem-detail-card
                        ">

                        ${
                            renderImage(
                                poem.image_url,
                                poem.title
                            )
                        }

                        <header
                            class="
                                poem-card-header
                                qafiyah-detail-header
                            ">

                            <div>

                                ${
                                    poem.category

                                        ? `
                                            <span
                                                class="section-label">

                                                ${
                                                    escapeHtml(
                                                        poem.category
                                                    )
                                                }

                                            </span>
                                        `

                                        :
                                        ""
                                }

                                <h1>
                                    ${
                                        escapeHtml(
                                            poem.title ||
                                            "بدون عنوان"
                                        )
                                    }
                                </h1>

                                ${
                                    poetName

                                        ? `

                                            <p
                                                class="
                                                    poem-poet
                                                    qafiyah-detail-poet
                                                ">

                                                ${
                                                    poetHref

                                                        ? `
                                                            <a
                                                                href="${
                                                                    escapeHtml(
                                                                        poetHref
                                                                    )
                                                                }">

                                                                ${
                                                                    escapeHtml(
                                                                        poetName
                                                                    )
                                                                }

                                                            </a>
                                                        `

                                                        :
                                                        escapeHtml(
                                                            poetName
                                                        )
                                                }

                                                ${
                                                    poet?.nickname

                                                        ? `
                                                            <span>
                                                                —
                                                                ${
                                                                    escapeHtml(
                                                                        poet.nickname
                                                                    )
                                                                }
                                                            </span>
                                                        `

                                                        :
                                                        ""
                                                }

                                            </p>

                                        `

                                        :
                                        ""
                                }

                                <div
                                    class="qafiyah-meta-row">

                                    ${
                                        poem.era

                                            ? `
                                                <span>
                                                    ${
                                                        escapeHtml(
                                                            poem.era
                                                        )
                                                    }
                                                </span>
                                            `

                                            :
                                            ""
                                    }

                                    ${
                                        poem.category

                                            ? `
                                                <span>
                                                    ${
                                                        escapeHtml(
                                                            poem.category
                                                        )
                                                    }
                                                </span>
                                            `

                                            :
                                            ""
                                    }

                                </div>

                            </div>

                        </header>

                        ${
                            renderAudio(
                                poem.audio_url,
                                poem.title
                            )
                        }

                        <div
                            class="
                                poem-text
                                qafiyah-poem-lines
                            ">

                            ${
                                formatPoemLines(
                                    poem.content
                                )
                            }

                        </div>

                        ${
                            renderVideo(
                                poem.video_url,
                                poem.title
                            )
                        }

                    </article>

                </section>

            `;


            bindAudioPlayers(
                host
            );

        } catch (
            error
        ) {

            console.error(
                "القافية: تعذر تحميل القصيدة:",
                error
            );


            renderError(
                host,
                "تعذر تحميل القصيدة",
                "حدث خطأ أثناء جلب القصيدة.",
                "Poems.html",
                "العودة إلى القصائد"
            );

        }

    }


    // ============================================================
    // التنسيقات الإضافية
    // ============================================================

    function injectContentStyles() {

        if (
            document.getElementById(
                "qafiyahContentStyles"
            )
        ) {

            return;

        }


        const style =
            document.createElement(
                "style"
            );


        style.id =
            "qafiyahContentStyles";


        style.textContent = `

            .qafiyah-list-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 24px;
            }

            .qafiyah-content-card {
                overflow: hidden;
                transition: transform .2s ease, box-shadow .2s ease;
            }

            .qafiyah-content-card:hover {
                transform: translateY(-2px);
            }

            .qafiyah-card-image {
                display: block;
                width: 100%;
                aspect-ratio: 16 / 8;
                object-fit: cover;
            }

            .qafiyah-card-body {
                padding: 24px;
            }

            .qafiyah-card-title {
                margin: 12px 0 8px;
                line-height: 1.7;
            }

            .qafiyah-card-title a {
                color: inherit;
                text-decoration: none;
            }

            .qafiyah-card-title a:hover {
                text-decoration: underline;
                text-underline-offset: 5px;
            }

            .qafiyah-card-meta,
            .qafiyah-detail-meta,
            .qafiyah-meta-row,
            .qafiyah-poet-nickname,
            .qafiyah-detail-nickname {
                opacity: .72;
            }

            .qafiyah-card-summary {
                line-height: 2;
                margin: 14px 0 18px;
            }

            .qafiyah-read-more,
            .qafiyah-back-link {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                font-weight: 700;
                color: inherit;
                text-decoration: none;
            }

            .qafiyah-read-more:hover,
            .qafiyah-back-link:hover {
                text-decoration: underline;
                text-underline-offset: 5px;
            }

            .qafiyah-poet-card {
                display: grid;
                grid-template-columns: 150px 1fr;
                align-items: stretch;
            }

            .qafiyah-poet-image {
                width: 100%;
                height: 100%;
                min-height: 220px;
                object-fit: cover;
            }

            .qafiyah-content-status {
                padding: 34px 20px;
                text-align: center;
                line-height: 1.9;
                opacity: .7;
            }

            .qafiyah-content-error {
                opacity: 1;
            }

            .qafiyah-detail-main {
                min-height: 60vh;
            }

            .qafiyah-detail-shell {
                width: min(1000px, calc(100% - 32px));
                margin: 0 auto;
                padding: 46px 0 70px;
            }

            .qafiyah-detail-shell > .qafiyah-back-link {
                margin-bottom: 18px;
            }

            .qafiyah-detail-card {
                overflow: hidden;
            }

            .qafiyah-detail-image {
                width: 100%;
                max-height: 560px;
                object-fit: cover;
                display: block;
            }

            .qafiyah-detail-header {
                padding: 34px 36px 12px;
            }

            .qafiyah-detail-header h1 {
                margin: 12px 0 8px;
                font-size: clamp(30px, 5vw, 50px);
                line-height: 1.45;
            }

            .qafiyah-detail-summary {
                margin: 22px 0 0;
                line-height: 2;
                font-size: 1.08rem;
                opacity: .78;
            }

            .qafiyah-article-body {
                padding: 16px 36px 40px;
                line-height: 2.2;
                font-size: 1.05rem;
            }

            .qafiyah-article-body p {
                margin: 0 0 20px;
            }

            .qafiyah-meta-row {
                display: flex;
                flex-wrap: wrap;
                gap: 8px 14px;
                margin-top: 10px;
                font-size: .92rem;
            }

            .qafiyah-poet-profile {
                display: grid;
                grid-template-columns: minmax(220px, 320px) 1fr;
                gap: 34px;
                align-items: center;
                padding: 34px;
            }

            .qafiyah-poet-detail-image {
                width: 100%;
                aspect-ratio: 4 / 5;
                object-fit: cover;
                border-radius: 18px;
            }

            .qafiyah-poet-profile h1 {
                font-size: clamp(32px, 5vw, 52px);
                line-height: 1.4;
                margin: 12px 0 8px;
            }

            .qafiyah-biography {
                border-top: 1px solid rgba(0, 0, 0, .08);
                padding-top: 26px;
            }

            .qafiyah-biography > h2 {
                padding: 0 36px;
            }

            .qafiyah-related-section {
                margin-top: 38px;
            }

            .qafiyah-related-heading {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 15px;
                margin-bottom: 18px;
            }

            .qafiyah-poem-lines {
                padding: 22px 36px 40px;
            }

            .qafiyah-poem-lines p {
                margin: 0;
                padding: 11px 0;
                line-height: 2.2;
            }

            .qafiyah-poem-gap {
                height: 18px;
            }

            .qafiyah-audio-player {
                margin: 0 36px 22px;
            }

            .qafiyah-audio-toggle {
                display: inline-flex;
                align-items: center;
                gap: 10px;
                border: 1px solid rgba(128, 74, 45, .24);
                border-radius: 999px;
                padding: 9px 15px;
                color: var(--primary-color, #7b4229);
                background: rgba(128, 74, 45, .07);
                font: inherit;
                font-weight: 700;
                cursor: pointer;
                transition: background .2s ease, transform .2s ease;
            }

            .qafiyah-audio-toggle:hover {
                background: rgba(128, 74, 45, .13);
                transform: translateY(-1px);
            }

            .qafiyah-audio-toggle.is-playing {
                background: var(--primary-color, #7b4229);
                color: #fff;
            }

            .qafiyah-audio-icon {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                min-width: 14px;
                font-size: .82em;
            }

            .qafiyah-poem-audio {
                display: none;
            }

            .qafiyah-video-box {
                margin: 0 36px 38px;
            }

            .qafiyah-video-box iframe,
            .qafiyah-video-box video {
                width: 100%;
                aspect-ratio: 16 / 9;
                border: 0;
                border-radius: 16px;
                display: block;
            }

            .qafiyah-external-media {
                margin: 0 36px 38px;
            }

            .qafiyah-error-card {
                padding: 36px;
                text-align: center;
            }

            .qafiyah-error-card p {
                line-height: 2;
                opacity: .72;
            }

            @media (max-width: 780px) {

                .qafiyah-list-grid {
                    grid-template-columns: 1fr;
                }

                .qafiyah-poet-card {
                    grid-template-columns: 1fr;
                }

                .qafiyah-poet-image {
                    max-height: 320px;
                }

                .qafiyah-poet-profile {
                    grid-template-columns: 1fr;
                    padding: 24px;
                }

                .qafiyah-poet-detail-image {
                    max-width: 360px;
                    margin: 0 auto;
                }

                .qafiyah-detail-header,
                .qafiyah-article-body,
                .qafiyah-poem-lines {
                    padding-left: 22px;
                    padding-right: 22px;
                }

                .qafiyah-biography > h2 {
                    padding: 0 22px;
                }

                .qafiyah-audio-player,
                .qafiyah-video-box,
                .qafiyah-external-media {
                    margin-left: 22px;
                    margin-right: 22px;
                }

            }

        `;


        document.head.appendChild(
            style
        );

    }


})();
