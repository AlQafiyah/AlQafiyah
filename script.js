// ============================================================
// القافية - النظام الرئيسي
// Supabase Auth + Profiles + Account UI + Menu + Notifications
// Profile + Avatar Management
// ============================================================

(function () {
    "use strict";

    if (window.__ALQAFIYAH_SCRIPT_STARTED__) return;
    window.__ALQAFIYAH_SCRIPT_STARTED__ = true;

    const $ = (id) => document.getElementById(id);
    const q = (selector, root = document) =>
        root.querySelector(selector);

    const qa = (selector, root = document) =>
        Array.from(
            root.querySelectorAll(selector)
        );

    // ============================================================
    // أدوات عامة
    // ============================================================

    function currentPage() {
        return window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    }

    function escapeHtml(value) {
        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

        return div.innerHTML;
    }

    // ============================================================
    // أيقونة المستخدم
    // ============================================================

    function userIcon() {
        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true">

                <circle
                    cx="12"
                    cy="8"
                    r="4">
                </circle>

                <path
                    d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7">
                </path>

            </svg>
        `;
    }

    // ============================================================
    // شعار Google
    // ============================================================

    function googleIcon() {
        return `
            <svg
                class="alqafiyah-auth-icon"
                viewBox="0 0 24 24"
                aria-hidden="true">

                <path
                    fill="#4285F4"
                    d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.87h5.38a4.6 4.6 0 0 1-1.99 3.02v2.51h3.22c1.88-1.73 2.99-4.28 2.99-7.35Z">
                </path>

                <path
                    fill="#34A853"
                    d="M12 22c2.7 0 4.96-.89 6.61-2.42l-3.22-2.51c-.89.6-2.03.96-3.39.96-2.6 0-4.8-1.76-5.59-4.12H3.08v2.59A9.99 9.99 0 0 0 12 22Z">
                </path>

                <path
                    fill="#FBBC05"
                    d="M6.41 13.91A6.02 6.02 0 0 1 6.09 12c0-.66.11-1.3.32-1.91V7.5H3.08A10 10 0 0 0 2 12c0 1.61.39 3.14 1.08 4.5l3.33-2.59Z">
                </path>

                <path
                    fill="#EA4335"
                    d="M12 5.97c1.47 0 2.79.51 3.83 1.5l2.87-2.87C16.95 2.97 14.7 2 12 2a9.99 9.99 0 0 0-8.92 5.5l3.33 2.59C7.2 7.73 9.4 5.97 12 5.97Z">
                </path>

            </svg>
        `;
    }

    // ============================================================
    // شعار Apple
    // ============================================================

    function appleIcon() {
        return `
            <svg
                class="alqafiyah-auth-icon"
                viewBox="0 0 24 24"
                aria-hidden="true">

                <path
                    fill="currentColor"
                    d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.79 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.1v-.01ZM12.03 7.25C11.88 5.02 13.69 3.18 15.77 3c.29 2.58-2.34 4.5-3.74 4.25Z">
                </path>

            </svg>
        `;
    }

    // ============================================================
    // أيقونة الهاتف
    // ============================================================

    function phoneIcon() {
        return `
            <svg
                class="alqafiyah-auth-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.9"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true">

                <path
                    d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92Z">
                </path>

            </svg>
        `;
    }

    // ============================================================
    // الأيقونات الكلاسيكية
    // ============================================================

    function icon(name) {

        const paths = {

            home: `
                <path
                    d="M3 11.5 12 4l9 7.5">
                </path>

                <path
                    d="M5 10.5V20h5v-6h4v6h5v-9.5">
                </path>
            `,

            poems: `
                <path
                    d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z">
                </path>

                <path d="M8 7h8"></path>
                <path d="M8 11h8"></path>
                <path d="M8 15h5"></path>
            `,

            poets: `
                <path d="M4 20h6"></path>

                <path
                    d="M14.5 4.5a2.12 2.12 0 0 1 3 3L9 16l-4 1 1-4Z">
                </path>
            `,

            articles: `
                <path
                    d="M6 3h9l3 3v15H6Z">
                </path>

                <path d="M14 3v4h4"></path>
                <path d="M9 11h6"></path>
                <path d="M9 15h6"></path>
            `,

            star: `
                <path
                    d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9Z">
                </path>
            `,

            settings: `
                <circle
                    cx="12"
                    cy="12"
                    r="3">
                </circle>

                <path
                    d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z">
                </path>
            `,

            info: `
                <circle
                    cx="12"
                    cy="12"
                    r="9">
                </circle>

                <path d="M12 10v6"></path>
                <path d="M12 7h.01"></path>
            `,

            user: `
                <circle
                    cx="12"
                    cy="8"
                    r="4">
                </circle>

                <path
                    d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7">
                </path>
            `,

            logout: `
                <path
                    d="M10 17l5-5-5-5">
                </path>

                <path
                    d="M15 12H3">
                </path>

                <path
                    d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5">
                </path>
            `
        };

        return `
            <svg
                class="alqafiyah-ui-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true">

                ${
                    paths[name] ||
                    paths.info
                }

            </svg>
        `;
    }

    // ============================================================
    // التنسيقات
    // ============================================================

    function injectStyles() {

        if (
            $("alqafiyahRuntimeStyles")
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "alqafiyahRuntimeStyles";

        style.textContent = `

            html,
            body {
                background: #ffffff !important;
            }

            body {
                min-height: 100vh;
            }

            .site-footer {
                flex: 0 0 auto !important;
                height: auto !important;
                min-height: 0 !important;
            }

            .alqafiyah-auth-method {
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                min-height: 46px;
            }

            .alqafiyah-auth-icon,
            .alqafiyah-ui-icon {
                width: 20px;
                height: 20px;
                flex: 0 0 20px;
                display: block;
            }

            .side-navigation a > span:first-child {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                width: 24px;
                min-width: 24px;
            }

            #googleLoginButton {
                background: #ffffff;
                color: #202124;
                border: 1px solid #dadce0;
            }

            #appleLoginButton {
                background: #000000;
                color: #ffffff;
                border: 1px solid #000000;
            }

            #phoneLoginButton {
                background: #ffffff;
                color: #3E2723;
                border: 1px solid rgba(62,39,35,.28);
            }

            .alqafiyah-phone-panel {
                display: none;
                margin: 12px 0 4px;
                padding: 14px;
                border: 1px solid rgba(62,39,35,.16);
                border-radius: 12px;
                background: rgba(255,232,214,.28);
            }

            .alqafiyah-phone-panel.open {
                display: block;
            }

            .alqafiyah-phone-panel label {
                display: block;
                margin: 0 0 6px;
            }

            .alqafiyah-phone-panel input {
                width: 100%;
                box-sizing: border-box;
            }

            .alqafiyah-phone-actions {
                display: flex;
                gap: 8px;
                margin-top: 10px;
            }

            .alqafiyah-phone-actions button {
                flex: 1;
            }

            .alqafiyah-phone-status {
                min-height: 20px;
                margin: 8px 0 0;
                font-size: .9rem;
            }

            .alqafiyah-phone-status.error {
                color: #a61b1b;
            }

            .qafiyah-account-area {
                position: relative;
            }

            .qafiyah-account-dropdown {
                position: fixed !important;
                display: none;
                min-width: 205px;
                padding: 7px;
                background: #ffffff;
                border: 1px solid rgba(62,39,35,.12);
                border-radius: 14px;
                box-shadow: 0 12px 34px rgba(0,0,0,.15);
                z-index: 1000000;
                direction: rtl;
            }

            .qafiyah-account-dropdown.open {
                display: block !important;
            }

            .qafiyah-account-dropdown button {
                width: 100%;
                min-height: 44px;
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px 12px;
                border: 0;
                border-radius: 9px;
                background: transparent;
                color: #3E2723;
                font: inherit;
                text-align: right;
                cursor: pointer;
            }

            .qafiyah-account-dropdown button:hover,
            .qafiyah-account-dropdown button:focus-visible {
                background: #f5f5f5;
                outline: none;
            }

            .account-dropdown-divider {
                height: 1px;
                background: rgba(62,39,35,.10);
                margin: 4px 3px;
            }

            .alqafiyah-home-about {
                max-width: 900px !important;
                margin: 54px auto 82px !important;
                padding: 22px 24px !important;
                text-align: center !important;
            }

            .alqafiyah-home-about > * {
                margin-inline-left: auto;
                margin-inline-right: auto;
            }

            .alqafiyah-home-about a[href$="about.html"] {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                margin-top: 14px;
            }

            .alqafiyah-side-logout {
                cursor: pointer;
            }

            .alqafiyah-profile-logout {
                margin-inline-start: 10px;
            }

            @media (max-width: 640px) {

                .qafiyah-account-dropdown {
                    min-width: 185px;
                }

                .alqafiyah-home-about {
                    margin-top: 38px !important;
                    margin-bottom: 64px !important;
                    padding-inline: 18px !important;
                }
            }
        `;

        document.head.appendChild(
            style
        );
    }

    // ============================================================
    // توحيد اسم القافية
    // ============================================================

    function normalizeBrandText(
        text
    ) {

        const marker =
            "__ALQAFIYAH_BRAND__";

        return String(
            text || ""
        )
            .replace(
                /القافيه/g,
                marker
            )
            .replace(
                /القافية/g,
                marker
            )
            .replace(
                /قافية/g,
                marker
            )
            .replaceAll(
                marker,
                "القافية"
            );
    }

    function normalizeBrand(
        root = document.body
    ) {

        if (document.title) {

            document.title =
                normalizeBrandText(
                    document.title
                );
        }

        qa(
            'meta[name="description"],' +
            'meta[property="og:title"],' +
            'meta[property="og:description"],' +
            'meta[name="twitter:title"],' +
            'meta[name="twitter:description"]'
        ).forEach(
            function (meta) {

                const content =
                    meta.getAttribute(
                        "content"
                    );

                if (content) {

                    meta.setAttribute(
                        "content",
                        normalizeBrandText(
                            content
                        )
                    );
                }
            }
        );

        function normalizeNode(
            node
        ) {

            if (!node) {
                return;
            }

            if (
                node.nodeType ===
                Node.TEXT_NODE
            ) {

                const parent =
                    node.parentElement;

                if (
                    !parent ||
                    parent.closest(
                        "script," +
                        "style," +
                        "textarea," +
                        "input," +
                        "select," +
                        "option"
                    )
                ) {
                    return;
                }

                const next =
                    normalizeBrandText(
                        node.nodeValue
                    );

                if (
                    next !==
                    node.nodeValue
                ) {

                    node.nodeValue =
                        next;
                }

                return;
            }

            const walker =
                document.createTreeWalker(
                    node,
                    NodeFilter.SHOW_TEXT
                );

            let textNode;

            while (
                (
                    textNode =
                        walker.nextNode()
                )
            ) {

                normalizeNode(
                    textNode
                );
            }
        }

        normalizeNode(
            root
        );

        if (
            !window
                .__ALQAFIYAH_BRAND_OBSERVER__
        ) {

            const observer =
                new MutationObserver(
                    function (
                        mutations
                    ) {

                        mutations.forEach(
                            function (
                                mutation
                            ) {

                                if (
                                    mutation.type ===
                                    "characterData"
                                ) {

                                    normalizeNode(
                                        mutation.target
                                    );
                                }

                                mutation
                                    .addedNodes
                                    ?.forEach(
                                        normalizeNode
                                    );
                            }
                        );
                    }
                );

            observer.observe(
                document.body,
                {
                    childList: true,
                    subtree: true,
                    characterData: true
                }
            );

            window
                .__ALQAFIYAH_BRAND_OBSERVER__ =
                observer;
        }
    }

    // ============================================================
    // استبدال إيموجيات القائمة بأيقونات كلاسيكية
    // ============================================================

    function applyClassicMenuIcons() {

        const mappings = [

            [
                '.side-navigation a[href="index.html"]',
                "home"
            ],

            [
                '.side-navigation a[href="Poems.html"]',
                "poems"
            ],

            [
                '.side-navigation a[href="poets.html"]',
                "poets"
            ],

            [
                '.side-navigation a[href="articles.html"]',
                "articles"
            ],

            [
                "#favoritesLink",
                "star"
            ],

            [
                "#settingsLink",
                "settings"
            ],

            [
                '.side-navigation a[href="about.html"]',
                "info"
            ],

            [
                "#sideLogoutButton",
                "logout"
            ]
        ];

        mappings.forEach(
            function (
                [
                    selector,
                    name
                ]
            ) {

                qa(
                    selector
                ).forEach(
                    function (
                        link
                    ) {

                        const holder =
                            q(
                                "span:first-child",
                                link
                            );

                        if (holder) {

                            holder.innerHTML =
                                icon(
                                    name
                                );
                        }
                    }
                );
            }
        );

        qa(
            ".side-menu .user-avatar"
        ).forEach(
            function (
                avatar
            ) {

                if (
                    !q(
                        "img",
                        avatar
                    )
                ) {

                    avatar.innerHTML =
                        userIcon();
                }
            }
        );
    }

    // ============================================================
    // جزء "تعرف على القافية" في الرئيسية
    // ============================================================

    function styleHomeAboutSection() {

        const path =
            window
                .location
                .pathname
                .toLowerCase();

        const isHome =
            path === "/" ||
            path.endsWith(
                "/index.html"
            ) ||
            path.endsWith(
                "index.html"
            );

        if (!isHome) {
            return;
        }

        const link =
            qa(
                'a[href$="about.html"]'
            ).find(
                function (
                    element
                ) {

                    const text =
                        String(
                            element
                                .textContent ||
                            ""
                        )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();

                    return (
                        text.includes(
                            "تعرف"
                        ) ||
                        text.includes(
                            "تعرّف"
                        )
                    );
                }
            );

        let section =
            link?.closest(
                "section," +
                ".home-about," +
                ".about-preview," +
                ".intro-section," +
                ".site-intro," +
                "div"
            ) ||
            null;

        if (!section) {

            const heading =
                qa(
                    "h1,h2,h3,p"
                ).find(
                    function (
                        element
                    ) {

                        const text =
                            String(
                                element
                                    .textContent ||
                                ""
                            );

                        return (
                            text.includes(
                                "يلتقي"
                            ) &&
                            text.includes(
                                "الشعر"
                            ) &&
                            text.includes(
                                "التاريخ"
                            )
                        );
                    }
                );

            section =
                heading?.closest(
                    "section," +
                    ".home-about," +
                    ".about-preview," +
                    ".intro-section," +
                    ".site-intro," +
                    "div"
                ) ||
                null;
        }

        if (section) {

            section.classList.add(
                "alqafiyah-home-about"
            );
        }
    }

    // ============================================================
    // OAuth Redirect
    // ============================================================

    function oauthRedirectUrl() {

        const url =
            new URL(
                window.location.href
            );

        url.hash =
            "";

        [
            "code",
            "state",
            "error",
            "error_code",
            "error_description"
        ].forEach(
            function (
                key
            ) {

                url
                    .searchParams
                    .delete(
                        key
                    );
            }
        );

        return url.toString();
    }

    // ============================================================
    // رقم الهاتف
    // ============================================================

    function normalizePhone(
        value
    ) {

        let phone =
            String(
                value || ""
            )
                .trim()
                .replace(
                    /[\s()-]/g,
                    ""
                );

        if (!phone) {
            return "";
        }

        if (
            phone.startsWith(
                "00"
            )
        ) {

            phone =
                `+${phone.slice(2)}`;
        }

        if (
            phone.startsWith(
                "05"
            ) &&
            phone.length === 10
        ) {

            phone =
                `+966${phone.slice(1)}`;

        } else if (
            phone.startsWith(
                "5"
            ) &&
            phone.length === 9
        ) {

            phone =
                `+966${phone}`;
        }

        if (
            /^\+\d{8,15}$/.test(
                phone
            )
        ) {

            return phone;
        }

        return "";
    }

    // ============================================================
    // إنشاء أزرار طرق الدخول
    // ============================================================

    function ensureAuthMethods() {

        const loginForm =
            $("loginForm");

        if (!loginForm) {
            return;
        }

        let apple =
            $("appleLoginButton");

        const divider =
            q(
                ".login-divider",
                loginForm
            );

        if (!apple) {

            apple =
                document.createElement(
                    "button"
                );

            apple.type =
                "button";

            apple.id =
                "appleLoginButton";

            apple.className =
                "login-method";

            if (divider) {

                loginForm.insertBefore(
                    apple,
                    divider
                );

            } else {

                loginForm.appendChild(
                    apple
                );
            }
        }

        apple.classList.add(
            "alqafiyah-auth-method"
        );

        apple.innerHTML =
            `${appleIcon()}<span>تسجيل الدخول باستخدام Apple</span>`;

        let google =
            $("googleLoginButton");

        if (!google) {

            google =
                document.createElement(
                    "button"
                );

            google.type =
                "button";

            google.id =
                "googleLoginButton";

            google.className =
                "login-method alqafiyah-auth-method";

            apple
                .parentNode
                .insertBefore(
                    google,
                    apple
                );
        }

        google.innerHTML =
            `${googleIcon()}<span>تسجيل الدخول باستخدام Google</span>`;

        let phone =
            $("phoneLoginButton");

        if (!phone) {

            phone =
                document.createElement(
                    "button"
                );

            phone.type =
                "button";

            phone.id =
                "phoneLoginButton";

            phone.className =
                "login-method alqafiyah-auth-method";

            apple
                .insertAdjacentElement(
                    "afterend",
                    phone
                );
        }

        phone.innerHTML =
            `${phoneIcon()}<span>تسجيل الدخول برقم الجوال</span>`;

        if (
            !$("phoneAuthPanel")
        ) {

            const panel =
                document.createElement(
                    "div"
                );

            panel.id =
                "phoneAuthPanel";

            panel.className =
                "alqafiyah-phone-panel";

            panel.innerHTML = `

                <label
                    for="phoneAuthNumber">

                    رقم الجوال

                </label>

                <input
                    type="tel"
                    id="phoneAuthNumber"
                    dir="ltr"
                    inputmode="tel"
                    autocomplete="tel"
                    placeholder="05XXXXXXXX">

                <div
                    class="alqafiyah-phone-actions">

                    <button
                        type="button"
                        class="login-submit"
                        id="sendPhoneOtpButton">

                        إرسال رمز التحقق

                    </button>

                </div>

                <div
                    id="phoneOtpFields"
                    style="display:none;">

                    <label
                        for="phoneOtpCode"
                        style="margin-top:12px;">

                        رمز التحقق

                    </label>

                    <input
                        type="text"
                        id="phoneOtpCode"
                        dir="ltr"
                        inputmode="numeric"
                        autocomplete="one-time-code"
                        maxlength="8"
                        placeholder="أدخل الرمز">

                    <div
                        class="alqafiyah-phone-actions">

                        <button
                            type="button"
                            class="login-submit"
                            id="verifyPhoneOtpButton">

                            تأكيد الرمز

                        </button>

                    </div>

                </div>

                <p
                    id="phoneAuthStatus"
                    class="alqafiyah-phone-status"
                    aria-live="polite">
                </p>
            `;

            phone
                .insertAdjacentElement(
                    "afterend",
                    panel
                );
        }
    }

    function phoneStatus(
        text = "",
        error = false
    ) {

        const element =
            $("phoneAuthStatus");

        if (!element) {
            return;
        }

        element.textContent =
            text;

        element
            .classList
            .toggle(
                "error",
                error
            );
    }

    function resetPhoneUI() {

        $("phoneAuthPanel")
            ?.classList
            .remove(
                "open"
            );

        if (
            $("phoneOtpFields")
        ) {

            $("phoneOtpFields")
                .style
                .display =
                "none";
        }

        if (
            $("phoneOtpCode")
        ) {

            $("phoneOtpCode")
                .value =
                "";
        }

        phoneStatus();
    }

    // ============================================================
    // بدء النظام
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        init
    );

    async function init() {

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "القافية: supabaseClient غير موجود."
            );

            return;
        }

        injectStyles();
        normalizeBrand();
        ensureAuthMethods();
        styleHomeAboutSection();

        // ========================================================
        // عناصر الصفحة
        // ========================================================

        const menuButton =
            $("menuButton");

        const sideMenu =
            $("sideMenu");

        const closeMenuButton =
            $("closeMenuButton") ||
            $("closeMenu");

        const menuOverlay =
            $("menuOverlay");

        const notificationButton =
            $("notificationButton");

        const notificationPanel =
            $("notificationPanel");

        const closeNotificationButton =
            $("closeNotificationButton");

        const notificationCount =
            $("notificationCount");

        const loginButton =
            $("loginButton");

        const loginModal =
            $("loginModal");

        const closeLoginButton =
            $("closeLoginButton") ||
            $("closeLoginModal");

        const showRegisterButton =
            $("showRegisterButton");

        const showLoginButton =
            $("showLoginButton");

        let currentUser =
            null;

        let accountArea =
            $("accountArea");

        let accountDropdown =
            $("accountDropdown");

        // ========================================================
        // القائمة الجانبية
        // ========================================================

        function openSideMenu() {

            sideMenu
                ?.classList
                .add(
                    "open"
                );

            menuOverlay
                ?.classList
                .add(
                    "active"
                );

            sideMenu
                ?.setAttribute(
                    "aria-hidden",
                    "false"
                );

            document
                .body
                .classList
                .add(
                    "menu-open"
                );
        }

        function closeSideMenu() {

            sideMenu
                ?.classList
                .remove(
                    "open"
                );

            menuOverlay
                ?.classList
                .remove(
                    "active"
                );

            sideMenu
                ?.setAttribute(
                    "aria-hidden",
                    "true"
                );

            document
                .body
                .classList
                .remove(
                    "menu-open"
                );
        }

        menuButton
            ?.addEventListener(
                "click",
                openSideMenu
            );

        closeMenuButton
            ?.addEventListener(
                "click",
                closeSideMenu
            );

        menuOverlay
            ?.addEventListener(
                "click",
                closeSideMenu
            );

        // ========================================================
        // الإشعارات
        // ========================================================

        function openNotifications() {

            if (!notificationPanel) {
                return;
            }

            notificationPanel
                .classList
                .add(
                    "open"
                );

            notificationPanel
                .setAttribute(
                    "aria-hidden",
                    "false"
                );
        }

        function closeNotifications() {

            if (!notificationPanel) {
                return;
            }

            notificationPanel
                .classList
                .remove(
                    "open"
                );

            notificationPanel
                .setAttribute(
                    "aria-hidden",
                    "true"
                );
        }

        notificationButton
            ?.addEventListener(
                "click",
                openNotifications
            );

        closeNotificationButton
            ?.addEventListener(
                "click",
                closeNotifications
            );

        // ========================================================
        // نافذة تسجيل الدخول
        // ========================================================

        function showLogin() {

            if (
                $("loginForm")
            ) {

                $("loginForm")
                    .style
                    .display =
                    "block";
            }

            if (
                $("registerForm")
            ) {

                $("registerForm")
                    .style
                    .display =
                    "none";
            }
        }

        function showRegister() {

            if (
                $("loginForm")
            ) {

                $("loginForm")
                    .style
                    .display =
                    "none";
            }

            if (
                $("registerForm")
            ) {

                $("registerForm")
                    .style
                    .display =
                    "block";
            }
        }

        function openLoginModal() {

            if (!loginModal) {
                return;
            }

            loginModal.style.display =
                "flex";

            loginModal
                .classList
                .add(
                    "open"
                );

            loginModal
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            showLogin();
        }

        function closeLoginModal() {

            if (!loginModal) {
                return;
            }

            loginModal
                .classList
                .remove(
                    "open"
                );

            loginModal
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            loginModal.style.display =
                "none";

            resetPhoneUI();
        }

        loginButton
            ?.addEventListener(
                "click",
                openLoginModal
            );

        closeLoginButton
            ?.addEventListener(
                "click",
                closeLoginModal
            );

        loginModal
            ?.addEventListener(
                "click",
                function (
                    event
                ) {

                    if (
                        event.target ===
                        loginModal
                    ) {

                        closeLoginModal();
                    }
                }
            );

        showRegisterButton
            ?.addEventListener(
                "click",
                function (
                    event
                ) {

                    event.preventDefault();

                    showRegister();
                }
            );

        showLoginButton
            ?.addEventListener(
                "click",
                function (
                    event
                ) {

                    event.preventDefault();

                    showLogin();
                }
            );

        // ========================================================
        // منطقة الحساب في الهيدر
        // ========================================================

        if (
            !accountArea &&
            loginButton
        ) {

            accountArea =
                document.createElement(
                    "div"
                );

            accountArea.id =
                "accountArea";

            accountArea.className =
                "qafiyah-account-area";

            accountArea.style.display =
                "none";

            loginButton
                .parentNode
                .insertBefore(
                    accountArea,
                    loginButton
                );
        }

        // ========================================================
        // Profiles
        // ========================================================

        async function getProfile(
            userId
        ) {

            if (!userId) {
                return null;
            }

            const {
                data,
                error
            } =
                await supabaseClient
                    .from(
                        "profiles"
                    )
                    .select(
                        "*"
                    )
                    .eq(
                        "id",
                        userId
                    )
                    .maybeSingle();

            if (error) {

                console.error(
                    "القافية: خطأ في جلب الملف الشخصي:",
                    error
                );

                return null;
            }

            return data;
        }

        async function ensureProfile(
            user
        ) {

            if (!user?.id) {
                return null;
            }

            let profile =
                await getProfile(
                    user.id
                );

            if (profile) {
                return profile;
            }

            const metadata =
                user.user_metadata ||
                {};

            const rawName =
                String(
                    metadata.full_name ||
                    metadata.name ||
                    ""
                )
                    .trim();

            const parts =
                rawName
                ? rawName.split(
                    /\s+/
                )
                : [];

            const firstName =
                metadata.first_name ||
                metadata.given_name ||
                parts.shift() ||
                null;

            const lastName =
                metadata.last_name ||
                metadata.family_name ||
                (
                    parts.length
                    ? parts.join(" ")
                    : null
                );

            const avatarUrl =
                metadata.avatar_url ||
                metadata.picture ||
                null;

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .from(
                            "profiles"
                        )
                        .upsert(
                            {
                                id:
                                    user.id,

                                first_name:
                                    firstName,

                                last_name:
                                    lastName,

                                phone:
                                    user.phone ||
                                    null,

                                avatar_url:
                                    avatarUrl
                            },
                            {
                                onConflict:
                                    "id"
                            }
                        );

                if (error) {
                    throw error;
                }

                profile =
                    await getProfile(
                        user.id
                    );

            } catch (error) {

                console.warn(
                    "القافية: تعذر إنشاء ملف شخصي تلقائي:",
                    error
                );
            }

            return profile;
        }

        function avatarUrl(
            user,
            profile
        ) {

            return (
                profile?.avatar_url ||
                user
                    ?.user_metadata
                    ?.avatar_url ||
                user
                    ?.user_metadata
                    ?.picture ||
                null
            );
        }

        // ========================================================
        // قائمة الحساب الصغيرة
        // ========================================================

        function closeAccountDropdown() {

            if (!accountDropdown) {
                return;
            }

            accountDropdown
                .classList
                .remove(
                    "open"
                );

            accountDropdown
                .style
                .visibility =
                "";

            accountDropdown
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            $("headerAccountAvatar")
                ?.setAttribute(
                    "aria-expanded",
                    "false"
                );
        }

        function openAccountDropdown(
            avatar
        ) {

            if (
                !accountDropdown ||
                !avatar
            ) {
                return;
            }

            const rect =
                avatar
                    .getBoundingClientRect();

            accountDropdown
                .classList
                .add(
                    "open"
                );

            accountDropdown
                .style
                .visibility =
                "hidden";

            const width =
                accountDropdown
                    .offsetWidth;

            let left =
                rect.right -
                width;

            if (left < 10) {
                left = 10;
            }

            if (
                left +
                width >
                window.innerWidth -
                10
            ) {

                left =
                    window.innerWidth -
                    width -
                    10;
            }

            accountDropdown
                .style
                .left =
                `${left}px`;

            accountDropdown
                .style
                .right =
                "auto";

            accountDropdown
                .style
                .top =
                `${rect.bottom + 8}px`;

            accountDropdown
                .style
                .visibility =
                "visible";

            accountDropdown
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            avatar
                .setAttribute(
                    "aria-expanded",
                    "true"
                );
        }

        function toggleAccountDropdown(
            avatar
        ) {

            if (
                accountDropdown
                    ?.classList
                    .contains(
                        "open"
                    )
            ) {

                closeAccountDropdown();

            } else {

                openAccountDropdown(
                    avatar
                );
            }
        }

        // ========================================================
        // تسجيل الخروج
        // ========================================================

        async function logout() {

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signOut();

                if (error) {
                    throw error;
                }

                closeAccountDropdown();

                currentUser =
                    null;

                updateHeader(
                    null,
                    null
                );

                updateSideUser(
                    null,
                    null
                );

                updateSideLogout(
                    false
                );

                if (
                    currentPage() ===
                    "profile.html"
                ) {

                    window.location.replace(
                        "index.html"
                    );
                }

            } catch (error) {

                console.error(
                    "القافية: خطأ في تسجيل الخروج:",
                    error
                );

                alert(
                    error?.message ||
                    "تعذر تسجيل الخروج."
                );
            }
        }

        function createAccountDropdown() {

            if (accountDropdown) {
                return;
            }

            accountDropdown =
                document.createElement(
                    "div"
                );

            accountDropdown.id =
                "accountDropdown";

            accountDropdown.className =
                "qafiyah-account-dropdown";

            accountDropdown
                .setAttribute(
                    "aria-hidden",
                    "true"
                );

            accountDropdown.innerHTML = `

                <button
                    type="button"
                    id="accountProfileButton">

                    ${icon("user")}

                    <span>
                        الملف الشخصي
                    </span>

                </button>

                <div
                    class="account-dropdown-divider"
                    aria-hidden="true">
                </div>

                <button
                    type="button"
                    id="accountLogoutButton">

                    ${icon("logout")}

                    <span>
                        تسجيل الخروج
                    </span>

                </button>
            `;

            document.body.appendChild(
                accountDropdown
            );

            $("accountProfileButton")
                ?.addEventListener(
                    "click",
                    function () {

                        closeAccountDropdown();

                        window.location.href =
                            "profile.html";
                    }
                );

            $("accountLogoutButton")
                ?.addEventListener(
                    "click",
                    logout
                );
        }

        createAccountDropdown();

        // ========================================================
        // تحديث دائرة الحساب
        // ========================================================

        function updateHeader(
            user,
            profile
        ) {

            if (
                !accountArea ||
                !loginButton
            ) {
                return;
            }

            if (!user) {

                accountArea.innerHTML =
                    "";

                accountArea.style.display =
                    "none";

                loginButton.style.display =
                    "";

                closeAccountDropdown();

                return;
            }

            loginButton.style.display =
                "none";

            accountArea.style.display =
                "";

            const url =
                avatarUrl(
                    user,
                    profile
                );

            accountArea.innerHTML = `

                <button
                    type="button"
                    id="headerAccountAvatar"
                    class="qafiyah-header-avatar"
                    aria-label="فتح قائمة الحساب"
                    aria-haspopup="menu"
                    aria-expanded="false"
                    title="الحساب">

                    ${
                        url
                        ? `
                            <img
                                src="${escapeHtml(url)}"
                                alt="الصورة الشخصية"
                                loading="eager">
                        `
                        :
                        userIcon()
                    }

                </button>
            `;

            $("headerAccountAvatar")
                ?.addEventListener(
                    "click",
                    function (
                        event
                    ) {

                        event.preventDefault();
                        event.stopPropagation();

                        toggleAccountDropdown(
                            event.currentTarget
                        );
                    }
                );
        }

        // ========================================================
        // معلومات المستخدم في القائمة
        // ========================================================

        function updateSideUser(
            user,
            profile
        ) {

            const name =
                $("menuUserName");

            const contact =
                $("menuUserEmail");

            const avatar =
                q(
                    ".side-menu .user-avatar"
                );

            if (!user) {

                if (name) {

                    name.textContent =
                        "مرحبًا بك";
                }

                if (contact) {

                    contact.textContent =
                        "سجّل الدخول للوصول إلى حسابك";
                }

                if (avatar) {

                    avatar.innerHTML =
                        userIcon();
                }

                return;
            }

            const fullName =
                [
                    profile?.first_name,
                    profile?.last_name
                ]
                    .filter(
                        Boolean
                    )
                    .join(
                        " "
                    )
                    .trim();

            if (name) {

                name.textContent =
                    fullName ||
                    user.email ||
                    user.phone ||
                    "المستخدم";
            }

            if (contact) {

                contact.textContent =
                    user.email ||
                    user.phone ||
                    "";
            }

            if (avatar) {

                const url =
                    avatarUrl(
                        user,
                        profile
                    );

                avatar.innerHTML =
                    url
                    ? `
                        <img
                            src="${escapeHtml(url)}"
                            alt="الصورة الشخصية"
                            loading="eager">
                    `
                    :
                    userIcon();
            }
        }

        // ========================================================
        // إغلاق قائمة الحساب خارجها
        // ========================================================

        document.addEventListener(
            "click",
            function (
                event
            ) {

                const avatar =
                    $("headerAccountAvatar");

                if (
                    avatar?.contains(
                        event.target
                    ) ||
                    accountDropdown
                        ?.contains(
                            event.target
                        )
                ) {
                    return;
                }

                closeAccountDropdown();
            }
        );

        window.addEventListener(
            "resize",
            closeAccountDropdown
        );

        window.addEventListener(
            "scroll",
            closeAccountDropdown,
            true
        );

        // ========================================================
        // حذف رابط الملف الشخصي المنفصل
        // ========================================================

        $("profileLink")
            ?.remove();

        // ========================================================
        // تسجيل الخروج بالقائمة الجانبية
        // ========================================================

        let sideLogout =
            $("sideLogoutButton");

        if (!sideLogout) {

            const navigation =
                sideMenu
                    ?.querySelector(
                        ".side-navigation"
                    );

            if (navigation) {

                sideLogout =
                    document.createElement(
                        "a"
                    );

                sideLogout.href =
                    "#";

                sideLogout.id =
                    "sideLogoutButton";

                sideLogout.className =
                    "alqafiyah-side-logout";

                sideLogout.innerHTML = `

                    <span
                        aria-hidden="true">

                        ${icon("logout")}

                    </span>

                    <span>
                        تسجيل الخروج
                    </span>
                `;

                navigation.appendChild(
                    sideLogout
                );
            }
        }

        function updateSideLogout(
            loggedIn
        ) {

            if (sideLogout) {

                sideLogout
                    .style
                    .display =
                    loggedIn
                    ? ""
                    : "none";
            }
        }

        sideLogout
            ?.addEventListener(
                "click",
                async function (
                    event
                ) {

                    event.preventDefault();

                    closeSideMenu();

                    await logout();
                }
            );

        // ========================================================
        // اللوح الكبير في القائمة
        // ========================================================

        async function sideUserClick(
            event
        ) {

            event?.preventDefault();
            event?.stopPropagation();

            closeSideMenu();

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .getSession();

                if (error) {
                    throw error;
                }

                const user =
                    data
                        ?.session
                        ?.user ||
                    null;

                currentUser =
                    user;

                if (user) {

                    window.location.href =
                        "profile.html";

                    return;
                }

            } catch (error) {

                console.error(
                    "القافية: تعذر التحقق من جلسة المستخدم:",
                    error
                );
            }

            openLoginModal();
        }

        [
            ...new Set(
                [
                    q(
                        ".user-section"
                    ),

                    q(
                        ".side-menu-user"
                    )
                ]
                    .filter(
                        Boolean
                    )
            )
        ].forEach(
            function (
                element
            ) {

                element.style.cursor =
                    "pointer";

                element.setAttribute(
                    "role",
                    "button"
                );

                element.setAttribute(
                    "tabindex",
                    "0"
                );

                element.addEventListener(
                    "click",
                    sideUserClick
                );

                element.addEventListener(
                    "keydown",
                    function (
                        event
                    ) {

                        if (
                            event.key ===
                            "Enter" ||
                            event.key ===
                            " "
                        ) {

                            event.preventDefault();

                            sideUserClick(
                                event
                            );
                        }
                    }
                );
            }
        );

        applyClassicMenuIcons();

        // ========================================================
        // إنشاء Profile لحساب البريد
        // ========================================================

        async function createEmailProfile(
            user,
            values
        ) {

            const {
                error
            } =
                await supabaseClient
                    .from(
                        "profiles"
                    )
                    .insert(
                        {
                            id:
                                user.id,

                            first_name:
                                values.firstName,

                            last_name:
                                values.lastName ||
                                null,

                            birth_day:
                                Number(
                                    values.birthDay
                                ),

                            birth_month:
                                Number(
                                    values.birthMonth
                                ),

                            birth_year:
                                Number(
                                    values.birthYear
                                ),

                            gender:
                                values.gender,

                            avatar_url:
                                null,

                            phone:
                                null
                        }
                    );

            if (error) {
                throw error;
            }
        }

        // ========================================================
        // إنشاء حساب جديد
        // ========================================================

        $("registerSubmitButton")
            ?.addEventListener(
                "click",
                async function () {

                    const button =
                        this;

                    const values = {

                        firstName:
                            $("firstName")
                                ?.value
                                .trim(),

                        lastName:
                            $("lastName")
                                ?.value
                                .trim(),

                        birthDay:
                            $("birthDay")
                                ?.value,

                        birthMonth:
                            $("birthMonth")
                                ?.value,

                        birthYear:
                            $("birthYear")
                                ?.value,

                        gender:
                            $("gender")
                                ?.value,

                        email:
                            $("emailRegister")
                                ?.value
                                .trim(),

                        password:
                            $("passwordRegister")
                                ?.value,

                        confirmPassword:
                            $("confirmPasswordRegister")
                                ?.value
                    };

                    if (
                        !values.firstName ||
                        !values.birthDay ||
                        !values.birthMonth ||
                        !values.birthYear ||
                        !values.gender ||
                        !values.email ||
                        !values.password ||
                        !values.confirmPassword
                    ) {

                        alert(
                            "يرجى تعبئة جميع البيانات المطلوبة."
                        );

                        return;
                    }

                    if (
                        values.password !==
                        values.confirmPassword
                    ) {

                        alert(
                            "كلمتا المرور غير متطابقتين."
                        );

                        return;
                    }

                    if (
                        values
                            .password
                            .length <
                        6
                    ) {

                        alert(
                            "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                        );

                        return;
                    }

                    button.disabled =
                        true;

                    try {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signUp(
                                    {
                                        email:
                                            values.email,

                                        password:
                                            values.password
                                    }
                                );

                        if (error) {
                            throw error;
                        }

                        if (
                            !data?.user
                        ) {

                            throw new Error(
                                "لم يتم إنشاء المستخدم في Supabase."
                            );
                        }

                        let session =
                            data.session ||
                            null;

                        if (!session) {

                            const result =
                                await supabaseClient
                                    .auth
                                    .getSession();

                            session =
                                result
                                    .data
                                    ?.session ||
                                null;
                        }

                        if (!session) {

                            throw new Error(
                                "تم إنشاء الحساب، لكن لم يتم تسجيل الدخول تلقائيًا. تأكد من أن Confirm email مغلق في Supabase."
                            );
                        }

                        let profile =
                            await getProfile(
                                session
                                    .user
                                    .id
                            );

                        if (!profile) {

                            await createEmailProfile(
                                session.user,
                                values
                            );

                            profile =
                                await getProfile(
                                    session
                                        .user
                                        .id
                                );
                        }

                        currentUser =
                            session.user;

                        updateHeader(
                            session.user,
                            profile
                        );

                        updateSideUser(
                            session.user,
                            profile
                        );

                        updateSideLogout(
                            true
                        );

                        closeLoginModal();

                        alert(
                            "تم إنشاء حسابك وتسجيل الدخول بنجاح."
                        );

                    } catch (error) {

                        console.error(
                            "القافية: خطأ في إنشاء الحساب:",
                            error
                        );

                        const message =
                            String(
                                error?.message ||
                                ""
                            );

                        if (
                            message
                                .toLowerCase()
                                .includes(
                                    "user already registered"
                                )
                        ) {

                            alert(
                                "هذا البريد الإلكتروني مسجل مسبقًا."
                            );

                        } else {

                            alert(
                                message ||
                                "حدث خطأ أثناء إنشاء الحساب."
                            );
                        }

                    } finally {

                        button.disabled =
                            false;
                    }
                }
            );

        // ========================================================
        // تسجيل الدخول بالبريد
        // ========================================================

        $("emailLoginButton")
            ?.addEventListener(
                "click",
                async function () {

                    const button =
                        this;

                    const email =
                        $("emailLogin")
                            ?.value
                            .trim();

                    const password =
                        $("passwordLogin")
                            ?.value;

                    if (
                        !email ||
                        !password
                    ) {

                        alert(
                            "أدخل البريد الإلكتروني وكلمة المرور."
                        );

                        return;
                    }

                    button.disabled =
                        true;

                    try {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signInWithPassword(
                                    {
                                        email,
                                        password
                                    }
                                );

                        if (error) {
                            throw error;
                        }

                        const profile =
                            await ensureProfile(
                                data.user
                            );

                        currentUser =
                            data.user;

                        updateHeader(
                            data.user,
                            profile
                        );

                        updateSideUser(
                            data.user,
                            profile
                        );

                        updateSideLogout(
                            true
                        );

                        closeLoginModal();

                    } catch (error) {

                        const message =
                            String(
                                error?.message ||
                                ""
                            );

                        if (
                            message
                                .toLowerCase()
                                .includes(
                                    "invalid login credentials"
                                )
                        ) {

                            alert(
                                "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                            );

                        } else {

                            alert(
                                message ||
                                "تعذر تسجيل الدخول."
                            );
                        }

                    } finally {

                        button.disabled =
                            false;
                    }
                }
            );

        // ========================================================
        // Google + Apple OAuth
        // ========================================================

        async function oauth(
            provider,
            button
        ) {

            if (!button) {
                return;
            }

            button.disabled =
                true;

            try {

                const {
                    error
                } =
                    await supabaseClient
                        .auth
                        .signInWithOAuth(
                            {
                                provider,

                                options: {
                                    redirectTo:
                                        oauthRedirectUrl()
                                }
                            }
                        );

                if (error) {
                    throw error;
                }

            } catch (error) {

                alert(
                    error?.message ||
                    `تعذر تسجيل الدخول باستخدام ${
                        provider ===
                        "google"
                        ? "Google"
                        : "Apple"
                    }.`
                );

                button.disabled =
                    false;
            }
        }

        $("googleLoginButton")
            ?.addEventListener(
                "click",
                function () {

                    oauth(
                        "google",
                        $("googleLoginButton")
                    );
                }
            );

        $("appleLoginButton")
            ?.addEventListener(
                "click",
                function () {

                    oauth(
                        "apple",
                        $("appleLoginButton")
                    );
                }
            );

        // ========================================================
        // إظهار تسجيل الدخول بالرقم
        // ========================================================

        $("phoneLoginButton")
            ?.addEventListener(
                "click",
                function () {

                    $("phoneAuthPanel")
                        ?.classList
                        .toggle(
                            "open"
                        );

                    if (
                        $("phoneAuthPanel")
                            ?.classList
                            .contains(
                                "open"
                            )
                    ) {

                        $("phoneAuthNumber")
                            ?.focus();
                    }
                }
            );

        // ========================================================
        // إرسال OTP
        // ========================================================

        $("sendPhoneOtpButton")
            ?.addEventListener(
                "click",
                async function () {

                    const phone =
                        normalizePhone(
                            $("phoneAuthNumber")
                                ?.value
                        );

                    if (!phone) {

                        phoneStatus(
                            "أدخل رقم جوال صحيحًا بصيغة 05XXXXXXXX أو بصيغة دولية تبدأ بـ +.",
                            true
                        );

                        return;
                    }

                    this.disabled =
                        true;

                    phoneStatus(
                        "جارٍ إرسال رمز التحقق..."
                    );

                    try {

                        const {
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signInWithOtp(
                                    {
                                        phone,

                                        options: {
                                            shouldCreateUser:
                                                true
                                        }
                                    }
                                );

                        if (error) {
                            throw error;
                        }

                        if (
                            $("phoneOtpFields")
                        ) {

                            $("phoneOtpFields")
                                .style
                                .display =
                                "block";
                        }

                        phoneStatus(
                            "تم إرسال رمز التحقق إلى رقم الجوال."
                        );

                        $("phoneOtpCode")
                            ?.focus();

                    } catch (error) {

                        phoneStatus(
                            error?.message ||
                            "تعذر إرسال رمز التحقق. تأكد من تفعيل مزود الرسائل في Supabase.",
                            true
                        );

                    } finally {

                        this.disabled =
                            false;
                    }
                }
            );

        // ========================================================
        // تأكيد OTP
        // ========================================================

        $("verifyPhoneOtpButton")
            ?.addEventListener(
                "click",
                async function () {

                    const phone =
                        normalizePhone(
                            $("phoneAuthNumber")
                                ?.value
                        );

                    const token =
                        String(
                            $("phoneOtpCode")
                                ?.value ||
                            ""
                        )
                            .trim();

                    if (!phone) {

                        phoneStatus(
                            "رقم الجوال غير صحيح.",
                            true
                        );

                        return;
                    }

                    if (
                        !/^\d{4,8}$/.test(
                            token
                        )
                    ) {

                        phoneStatus(
                            "أدخل رمز التحقق المرسل إلى جوالك.",
                            true
                        );

                        return;
                    }

                    this.disabled =
                        true;

                    phoneStatus(
                        "جارٍ التحقق من الرمز..."
                    );

                    try {

                        const {
                            data,
                            error
                        } =
                            await supabaseClient
                                .auth
                                .verifyOtp(
                                    {
                                        phone,
                                        token,
                                        type:
                                            "sms"
                                    }
                                );

                        if (error) {
                            throw error;
                        }

                        if (
                            !data?.user
                        ) {

                            throw new Error(
                                "تم التحقق من الرمز لكن تعذر تحميل الحساب."
                            );
                        }

                        const profile =
                            await ensureProfile(
                                data.user
                            );

                        currentUser =
                            data.user;

                        updateHeader(
                            data.user,
                            profile
                        );

                        updateSideUser(
                            data.user,
                            profile
                        );

                        updateSideLogout(
                            true
                        );

                        closeLoginModal();

                    } catch (error) {

                        phoneStatus(
                            error?.message ||
                            "رمز التحقق غير صحيح أو انتهت صلاحيته.",
                            true
                        );

                    } finally {

                        this.disabled =
                            false;
                    }
                }
            );

        // ========================================================
        // قوائم تاريخ الميلاد
        // ========================================================

        function populateBirth(
            selectId,
            start,
            end,
            descending = false
        ) {

            const select =
                $(selectId);

            if (
                !select ||
                select.options.length !==
                1
            ) {
                return;
            }

            if (descending) {

                for (
                    let value = start;
                    value >= end;
                    value--
                ) {

                    select.add(
                        new Option(
                            value,
                            value
                        )
                    );
                }

            } else {

                for (
                    let value = start;
                    value <= end;
                    value++
                ) {

                    select.add(
                        new Option(
                            value,
                            value
                        )
                    );
                }
            }
        }

        populateBirth(
            "birthDay",
            1,
            31
        );

        populateBirth(
            "birthYear",
            new Date()
                .getFullYear(),
            1900,
            true
        );

        // ========================================================
        // تحديث الحساب الحالي
        // ========================================================

        async function refreshAccount() {

            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .auth
                        .getSession();

                if (error) {
                    throw error;
                }

                const user =
                    data
                        ?.session
                        ?.user ||
                    null;

                const profile =
                    user
                    ? await ensureProfile(
                        user
                    )
                    : null;

                currentUser =
                    user;

                updateHeader(
                    user,
                    profile
                );

                updateSideUser(
                    user,
                    profile
                );

                updateSideLogout(
                    Boolean(
                        user
                    )
                );

                applyClassicMenuIcons();
                normalizeBrand();

                return {
                    user,
                    profile
                };

            } catch (error) {

                console.error(
                    "القافية: خطأ في تحميل الحساب:",
                    error
                );

                currentUser =
                    null;

                updateHeader(
                    null,
                    null
                );

                updateSideUser(
                    null,
                    null
                );

                updateSideLogout(
                    false
                );

                return {
                    user: null,
                    profile: null
                };
            }
        }

        // ========================================================
        // مراقبة Auth
        // ========================================================

        supabaseClient
            .auth
            .onAuthStateChange(
                function (
                    event
                ) {

                    if (
                        [
                            "SIGNED_IN",
                            "SIGNED_OUT",
                            "INITIAL_SESSION",
                            "USER_UPDATED"
                        ].includes(
                            event
                        )
                    ) {

                        setTimeout(
                            refreshAccount,
                            0
                        );
                    }
                }
            );

        // ========================================================
        // الإشعارات الحالية
        // ========================================================

        if (notificationCount) {

            notificationCount.textContent =
                "0";

            notificationCount.style.display =
                "none";
        }

        // ========================================================
        // Escape
        // ========================================================

        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key !==
                    "Escape"
                ) {
                    return;
                }

                closeSideMenu();
                closeNotifications();
                closeLoginModal();
                closeAccountDropdown();
            }
        );

        // ========================================================
        // صفحة الملف الشخصي
        // ========================================================

        if (
            q(
                ".profile-page"
            )
        ) {

            await initProfilePage(
                logout
            );
        }

        // ========================================================
        // التشغيل الأول
        // ========================================================

        await refreshAccount();

        normalizeBrand();
        applyClassicMenuIcons();
        styleHomeAboutSection();
    }

    // ============================================================
    // صفحة الملف الشخصي
    // ============================================================

    async function initProfilePage(
        logout
    ) {

        const profileAvatar =
            $("profileAvatar");

        const avatarInput =
            $("avatarInput");

        const deleteAvatarButton =
            $("deleteAvatarButton");

        const profileForm =
            $("profileForm");

        const firstName =
            $("profileFirstName");

        const lastName =
            $("profileLastName");

        const email =
            $("profileEmailDetails");

        const phone =
            $("profilePhone");

        const birthDay =
            $("profileBirthDay");

        const birthMonth =
            $("profileBirthMonth");

        const birthYear =
            $("profileBirthYear");

        const gender =
            $("profileGender");

        const saveButton =
            $("saveProfileButton");

        const message =
            $("profileMessage");

        let logoutButton =
            $("logoutButton");

        // ========================================================
        // إنشاء زر الخروج إن لم يكن موجودًا
        // ========================================================

        if (
            !logoutButton &&
            saveButton
                ?.parentElement
        ) {

            logoutButton =
                document.createElement(
                    "button"
                );

            logoutButton.type =
                "button";

            logoutButton.id =
                "logoutButton";

            logoutButton.className =
                "alqafiyah-profile-logout";

            logoutButton.textContent =
                "تسجيل الخروج";

            saveButton
                .insertAdjacentElement(
                    "afterend",
                    logoutButton
                );
        }

        function showMessage(
            text,
            error = false
        ) {

            if (!message) {
                return;
            }

            message.textContent =
                text;

            message
                .classList
                .toggle(
                    "error",
                    error
                );
        }

        function setAvatar(
            url
        ) {

            if (!profileAvatar) {
                return;
            }

            if (!url) {

                profileAvatar.innerHTML =
                    userIcon();

                return;
            }

            profileAvatar.innerHTML =
                "";

            const image =
                document.createElement(
                    "img"
                );

            image.src =
                url;

            image.alt =
                "الصورة الشخصية";

            image.loading =
                "eager";

            image.decoding =
                "async";

            image.onerror =
                function () {

                    profileAvatar.innerHTML =
                        userIcon();
                };

            profileAvatar.appendChild(
                image
            );
        }

        // ========================================================
        // قوائم الميلاد
        // ========================================================

        if (
            birthDay &&
            birthDay.options.length ===
            1
        ) {

            for (
                let day = 1;
                day <= 31;
                day++
            ) {

                birthDay.add(
                    new Option(
                        day,
                        day
                    )
                );
            }
        }

        if (
            birthYear &&
            birthYear.options.length ===
            1
        ) {

            for (
                let year =
                    new Date()
                        .getFullYear();

                year >= 1900;

                year--
            ) {

                birthYear.add(
                    new Option(
                        year,
                        year
                    )
                );
            }
        }

        // ========================================================
        // المستخدم الحالي
        // ========================================================

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();

        if (
            error ||
            !data
                ?.session
                ?.user
        ) {

            window.location.replace(
                "index.html"
            );

            return;
        }

        const user =
            data.session.user;

        // ========================================================
        // تسجيل الخروج
        // ========================================================

        logoutButton
            ?.addEventListener(
                "click",
                async function () {

                    logoutButton.disabled =
                        true;

                    try {

                        await logout();

                    } finally {

                        logoutButton.disabled =
                            false;
                    }
                }
            );

        // ========================================================
        // البريد
        // ========================================================

        if (email) {

            email.value =
                user.email ||
                "";
        }

        // ========================================================
        // جلب Profile
        // ========================================================

        const {
            data:
                profile,
            error:
                profileError
        } =
            await supabaseClient
                .from(
                    "profiles"
                )
                .select(
                    "*"
                )
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();

        if (profileError) {

            showMessage(
                "تعذر تحميل بيانات الحساب.",
                true
            );

            return;
        }

        if (!profile) {

            showMessage(
                "لا توجد بيانات الملف الشخصي لهذا الحساب.",
                true
            );

            return;
        }

        // ========================================================
        // تعبئة البيانات
        // ========================================================

        if (firstName) {

            firstName.value =
                profile.first_name ||
                "";
        }

        if (lastName) {

            lastName.value =
                profile.last_name ||
                "";
        }

        if (phone) {

            phone.value =
                profile.phone ||
                user.phone ||
                "";
        }

        if (birthDay) {

            birthDay.value =
                profile.birth_day ||
                "";
        }

        if (birthMonth) {

            birthMonth.value =
                profile.birth_month ||
                "";
        }

        if (birthYear) {

            birthYear.value =
                profile.birth_year ||
                "";
        }

        if (gender) {

            gender.value =
                profile.gender ||
                "";
        }

        setAvatar(
            profile.avatar_url ||
            user
                .user_metadata
                ?.avatar_url ||
            user
                .user_metadata
                ?.picture ||
            null
        );

        // ========================================================
        // حفظ البيانات
        // ========================================================

        profileForm
            ?.addEventListener(
                "submit",
                async function (
                    event
                ) {

                    event.preventDefault();

                    if (saveButton) {

                        saveButton.disabled =
                            true;
                    }

                    showMessage(
                        "جارٍ حفظ التغييرات..."
                    );

                    try {

                        if (
                            !firstName
                                ?.value
                                .trim() ||

                            !birthDay
                                ?.value ||

                            !birthMonth
                                ?.value ||

                            !birthYear
                                ?.value ||

                            !gender
                                ?.value
                        ) {

                            throw new Error(
                                "يرجى تعبئة جميع البيانات المطلوبة."
                            );
                        }

                        const {
                            error
                        } =
                            await supabaseClient
                                .from(
                                    "profiles"
                                )
                                .update(
                                    {
                                        first_name:
                                            firstName
                                                .value
                                                .trim(),

                                        last_name:
                                            lastName
                                                ?.value
                                                .trim() ||
                                            null,

                                        birth_day:
                                            Number(
                                                birthDay
                                                    .value
                                            ),

                                        birth_month:
                                            Number(
                                                birthMonth
                                                    .value
                                            ),

                                        birth_year:
                                            Number(
                                                birthYear
                                                    .value
                                            ),

                                        gender:
                                            gender
                                                .value,

                                        phone:
                                            phone
                                                ?.value
                                                .trim() ||
                                            null
                                    }
                                )
                                .eq(
                                    "id",
                                    user.id
                                );

                        if (error) {
                            throw error;
                        }

                        showMessage(
                            "تم حفظ التغييرات بنجاح."
                        );

                    } catch (error) {

                        showMessage(
                            error?.message ||
                            "تعذر حفظ التغييرات.",
                            true
                        );

                    } finally {

                        if (saveButton) {

                            saveButton.disabled =
                                false;
                        }
                    }
                }
            );

        // ========================================================
        // رفع الصورة الشخصية
        // ========================================================

        avatarInput
            ?.addEventListener(
                "change",
                async function () {

                    const file =
                        avatarInput
                            .files
                            ?.[0];

                    if (!file) {
                        return;
                    }

                    if (
                        ![
                            "image/jpeg",
                            "image/png",
                            "image/webp"
                        ].includes(
                            file.type
                        )
                    ) {

                        alert(
                            "يرجى اختيار صورة JPG أو PNG أو WebP."
                        );

                        avatarInput.value =
                            "";

                        return;
                    }

                    if (
                        file.size >
                        5 *
                        1024 *
                        1024
                    ) {

                        alert(
                            "حجم الصورة يجب ألا يتجاوز 5MB."
                        );

                        avatarInput.value =
                            "";

                        return;
                    }

                    try {

                        showMessage(
                            "جارٍ رفع الصورة..."
                        );

                        const filePath =
                            `${user.id}/profile.jpg`;

                        const {
                            error:
                                uploadError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "avatars"
                                )
                                .upload(
                                    filePath,
                                    file,
                                    {
                                        cacheControl:
                                            "3600",

                                        upsert:
                                            true,

                                        contentType:
                                            file.type
                                    }
                                );

                        if (
                            uploadError
                        ) {
                            throw uploadError;
                        }

                        const {
                            data:
                                publicData
                        } =
                            supabaseClient
                                .storage
                                .from(
                                    "avatars"
                                )
                                .getPublicUrl(
                                    filePath
                                );

                        if (
                            !publicData
                                ?.publicUrl
                        ) {

                            throw new Error(
                                "تعذر الحصول على رابط الصورة."
                            );
                        }

                        const publicUrl =
                            `${publicData.publicUrl}?t=${Date.now()}`;

                        const {
                            error:
                                updateError
                        } =
                            await supabaseClient
                                .from(
                                    "profiles"
                                )
                                .update(
                                    {
                                        avatar_url:
                                            publicUrl
                                    }
                                )
                                .eq(
                                    "id",
                                    user.id
                                );

                        if (
                            updateError
                        ) {
                            throw updateError;
                        }

                        setAvatar(
                            publicUrl
                        );

                        showMessage(
                            "تم تحديث الصورة الشخصية بنجاح."
                        );

                    } catch (error) {

                        showMessage(
                            error?.message ||
                            "تعذر رفع الصورة.",
                            true
                        );

                    } finally {

                        avatarInput.value =
                            "";
                    }
                }
            );

        // ========================================================
        // حذف الصورة الشخصية
        // ========================================================

        deleteAvatarButton
            ?.addEventListener(
                "click",
                async function () {

                    if (
                        !confirm(
                            "هل تريد حذف الصورة الشخصية؟"
                        )
                    ) {
                        return;
                    }

                    deleteAvatarButton.disabled =
                        true;

                    try {

                        showMessage(
                            "جارٍ حذف الصورة..."
                        );

                        const filePath =
                            `${user.id}/profile.jpg`;

                        const {
                            error:
                                removeError
                        } =
                            await supabaseClient
                                .storage
                                .from(
                                    "avatars"
                                )
                                .remove(
                                    [
                                        filePath
                                    ]
                                );

                        if (
                            removeError
                        ) {
                            throw removeError;
                        }

                        const {
                            error:
                                updateError
                        } =
                            await supabaseClient
                                .from(
                                    "profiles"
                                )
                                .update(
                                    {
                                        avatar_url:
                                            null
                                    }
                                )
                                .eq(
                                    "id",
                                    user.id
                                );

                        if (
                            updateError
                        ) {
                            throw updateError;
                        }

                        setAvatar(
                            null
                        );

                        showMessage(
                            "تم حذف الصورة الشخصية بنجاح."
                        );

                    } catch (error) {

                        showMessage(
                            error?.message ||
                            "تعذر حذف الصورة.",
                            true
                        );

                    } finally {

                        deleteAvatarButton.disabled =
                            false;
                    }
                }
            );
    }

})();

// ============================================================
// القافية - الإصلاح النهائي للواجهة والحساب
// Account Menu + Index Icons + Bottom Overscroll
// ============================================================

(function () {
    "use strict";

    // ============================================================
    // أيقونات كلاسيكية
    // ============================================================

    function finalIcon(name) {

        const icons = {

            menu: `
                <path d="M4 7h16"></path>
                <path d="M4 12h16"></path>
                <path d="M4 17h16"></path>
            `,

            home: `
                <path d="M3 11.5 12 4l9 7.5"></path>
                <path d="M5 10.5V20h5v-6h4v6h5v-9.5"></path>
            `,

            poems: `
                <path
                    d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z">
                </path>

                <path d="M8 7h8"></path>
                <path d="M8 11h8"></path>
                <path d="M8 15h5"></path>
            `,

            poets: `
                <path d="M4 20h6"></path>

                <path
                    d="M14.5 4.5a2.12 2.12 0 0 1 3 3L9 16l-4 1 1-4Z">
                </path>
            `,

            articles: `
                <path d="M6 3h9l3 3v15H6Z"></path>
                <path d="M14 3v4h4"></path>
                <path d="M9 11h6"></path>
                <path d="M9 15h6"></path>
            `,

            star: `
                <path
                    d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9Z">
                </path>
            `,

            settings: `
                <circle
                    cx="12"
                    cy="12"
                    r="3">
                </circle>

                <path
                    d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z">
                </path>
            `,

            info: `
                <circle
                    cx="12"
                    cy="12"
                    r="9">
                </circle>

                <path d="M12 10v6"></path>
                <path d="M12 7h.01"></path>
            `,

            logout: `
                <path d="M10 17l5-5-5-5"></path>
                <path d="M15 12H3"></path>

                <path
                    d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5">
                </path>
            `,

            user: `
                <circle
                    cx="12"
                    cy="8"
                    r="4">
                </circle>

                <path
                    d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7">
                </path>
            `
        };

        return `
            <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
                style="
                    width:20px;
                    height:20px;
                    display:block;
                ">

                ${
                    icons[name] ||
                    icons.info
                }

            </svg>
        `;
    }

    // ============================================================
    // إصلاح الخلفية
    //
    // مهم:
    // لا نجعل BODY أبيض.
    // نترك الصفحة بتصميمها الأصلي.
    // الأبيض يكون فقط خلف الصفحة عند السحب الزائد.
    // ============================================================

    function fixOverscrollBackground() {

        const runtimeStyle =
            document.getElementById(
                "alqafiyahRuntimeStyles"
            );

        if (runtimeStyle) {

            runtimeStyle.textContent =
                runtimeStyle.textContent.replace(

                    /html\s*,\s*body\s*\{\s*background\s*:\s*#(?:ffffff|fff)\s*!important\s*;\s*\}/gi,

                    `
                    html {
                        background: #ffffff !important;
                    }
                    `
                );
        }

        let style =
            document.getElementById(
                "alqafiyahFinalOverscrollStyle"
            );

        if (!style) {

            style =
                document.createElement(
                    "style"
                );

            style.id =
                "alqafiyahFinalOverscrollStyle";

            style.textContent = `
                html {
                    background-color:
                        #ffffff !important;
                }
            `;

            document.head.appendChild(
                style
            );
        }
    }

    // ============================================================
    // إصلاح الأيقونات في index.html
    // يعتمد على اسم العنصر وليس رابط HTML
    // لذلك يعمل حتى لو اختلف شكل الرابط في الرئيسية
    // ============================================================

    function fixMenuIcons() {

        const menuButton =
            document.getElementById(
                "menuButton"
            );

        if (
            menuButton &&
            !menuButton.querySelector(
                "svg"
            )
        ) {

            menuButton.innerHTML =
                finalIcon(
                    "menu"
                );
        }

        document
            .querySelectorAll(
                ".side-navigation a"
            )
            .forEach(
                function (
                    link
                ) {

                    const text =
                        String(
                            link.textContent ||
                            ""
                        )
                            .replace(
                                /\s+/g,
                                " "
                            )
                            .trim();

                    const iconHolder =
                        link.querySelector(
                            "span:first-child"
                        );

                    if (
                        !iconHolder
                    ) {
                        return;
                    }

                    let iconName =
                        null;

                    if (
                        text.includes(
                            "الرئيسية"
                        )
                    ) {

                        iconName =
                            "home";

                    } else if (
                        text.includes(
                            "القصائد"
                        )
                    ) {

                        iconName =
                            "poems";

                    } else if (
                        text.includes(
                            "الشعراء"
                        )
                    ) {

                        iconName =
                            "poets";

                    } else if (
                        text.includes(
                            "المقالات"
                        )
                    ) {

                        iconName =
                            "articles";

                    } else if (
                        text.includes(
                            "المفضلة"
                        )
                    ) {

                        iconName =
                            "star";

                    } else if (
                        text.includes(
                            "الإعدادات"
                        )
                    ) {

                        iconName =
                            "settings";

                    } else if (
                        text.includes(
                            "نبذة"
                        )
                    ) {

                        iconName =
                            "info";

                    } else if (
                        text.includes(
                            "تسجيل الخروج"
                        )
                    ) {

                        iconName =
                            "logout";
                    }

                    if (!iconName) {
                        return;
                    }

                    iconHolder.innerHTML =
                        finalIcon(
                            iconName
                        );
                }
            );

        // --------------------------------------------------------
        // صورة المستخدم الافتراضية بدل 👤
        // --------------------------------------------------------

        const sideAvatar =
            document.querySelector(
                ".side-menu .user-avatar"
            );

        if (
            sideAvatar &&
            !sideAvatar.querySelector(
                "img"
            )
        ) {

            sideAvatar.innerHTML =
                finalIcon(
                    "user"
                );
        }
    }

    // ============================================================
    // إخفاء قائمة الحساب القديمة
    // ============================================================

    function hideOldAccountMenu() {

        const oldMenu =
            document.getElementById(
                "accountDropdown"
            );

        if (!oldMenu) {
            return;
        }

        oldMenu.classList.remove(
            "open"
        );

        oldMenu.style.setProperty(
            "display",
            "none",
            "important"
        );
    }

    // ============================================================
    // إنشاء القائمة النهائية للدائرة
    // ============================================================

    function createFinalAccountMenu() {

        let menu =
            document.getElementById(
                "alqafiyahFinalAccountMenu"
            );

        if (menu) {
            return menu;
        }

        menu =
            document.createElement(
                "div"
            );

        menu.id =
            "alqafiyahFinalAccountMenu";

        menu.setAttribute(
            "aria-hidden",
            "true"
        );

        menu.innerHTML = `

            <button
                type="button"
                id="alqafiyahFinalProfileButton">

                ${finalIcon("user")}

                <span>
                    الملف الشخصي
                </span>

            </button>

            <div
                class="alqafiyah-final-account-divider">
            </div>

            <button
                type="button"
                id="alqafiyahFinalLogoutButton">

                ${finalIcon("logout")}

                <span>
                    تسجيل الخروج
                </span>

            </button>
        `;

        Object.assign(
            menu.style,
            {
                position:
                    "fixed",

                display:
                    "none",

                minWidth:
                    "205px",

                padding:
                    "7px",

                background:
                    "#ffffff",

                border:
                    "1px solid rgba(62,39,35,.12)",

                borderRadius:
                    "14px",

                boxShadow:
                    "0 12px 34px rgba(0,0,0,.15)",

                zIndex:
                    "2147483647",

                direction:
                    "rtl"
            }
        );

        menu
            .querySelectorAll(
                "button"
            )
            .forEach(
                function (
                    button
                ) {

                    Object.assign(
                        button.style,
                        {
                            width:
                                "100%",

                            minHeight:
                                "44px",

                            display:
                                "flex",

                            alignItems:
                                "center",

                            gap:
                                "10px",

                            padding:
                                "10px 12px",

                            border:
                                "0",

                            borderRadius:
                                "9px",

                            background:
                                "transparent",

                            color:
                                "#3E2723",

                            font:
                                "inherit",

                            textAlign:
                                "right",

                            cursor:
                                "pointer"
                        }
                    );

                    button.addEventListener(
                        "mouseenter",
                        function () {

                            button.style.background =
                                "#f5f5f5";
                        }
                    );

                    button.addEventListener(
                        "mouseleave",
                        function () {

                            button.style.background =
                                "transparent";
                        }
                    );
                }
            );

        const divider =
            menu.querySelector(
                ".alqafiyah-final-account-divider"
            );

        Object.assign(
            divider.style,
            {
                height:
                    "1px",

                margin:
                    "4px 3px",

                background:
                    "rgba(62,39,35,.10)"
            }
        );

        document.body.appendChild(
            menu
        );

        // --------------------------------------------------------
        // الملف الشخصي
        // --------------------------------------------------------

        document
            .getElementById(
                "alqafiyahFinalProfileButton"
            )
            ?.addEventListener(
                "click",
                function () {

                    closeFinalAccountMenu();

                    window.location.href =
                        "profile.html";
                }
            );

        // --------------------------------------------------------
        // تسجيل الخروج
        // --------------------------------------------------------

        document
            .getElementById(
                "alqafiyahFinalLogoutButton"
            )
            ?.addEventListener(
                "click",
                async function () {

                    const button =
                        this;

                    button.disabled =
                        true;

                    try {

                        const {
                            error
                        } =
                            await supabaseClient
                                .auth
                                .signOut();

                        if (error) {
                            throw error;
                        }

                        closeFinalAccountMenu();

                        if (
                            window
                                .location
                                .pathname
                                .toLowerCase()
                                .endsWith(
                                    "profile.html"
                                )
                        ) {

                            window.location.replace(
                                "index.html"
                            );

                        } else {

                            window.location.reload();
                        }

                    } catch (error) {

                        button.disabled =
                            false;

                        alert(
                            error?.message ||
                            "تعذر تسجيل الخروج."
                        );
                    }
                }
            );

        return menu;
    }

    // ============================================================
    // إغلاق قائمة الدائرة
    // ============================================================

    function closeFinalAccountMenu() {

        const menu =
            document.getElementById(
                "alqafiyahFinalAccountMenu"
            );

        if (!menu) {
            return;
        }

        menu.style.display =
            "none";

        menu.setAttribute(
            "aria-hidden",
            "true"
        );

        document
            .getElementById(
                "headerAccountAvatar"
            )
            ?.setAttribute(
                "aria-expanded",
                "false"
            );
    }

    // ============================================================
    // فتح قائمة الدائرة أسفلها مباشرة
    // ============================================================

    function openFinalAccountMenu(
        avatar
    ) {

        const menu =
            createFinalAccountMenu();

        const rect =
            avatar.getBoundingClientRect();

        menu.style.display =
            "block";

        menu.style.visibility =
            "hidden";

        const menuWidth =
            menu.offsetWidth;

        let left =
            rect.right -
            menuWidth;

        left =
            Math.max(
                10,
                Math.min(
                    left,
                    window.innerWidth -
                    menuWidth -
                    10
                )
            );

        menu.style.left =
            `${left}px`;

        menu.style.right =
            "auto";

        menu.style.top =
            `${rect.bottom + 8}px`;

        menu.style.visibility =
            "visible";

        menu.setAttribute(
            "aria-hidden",
            "false"
        );

        avatar.setAttribute(
            "aria-expanded",
            "true"
        );
    }

    // ============================================================
    // ربط دائرة الحساب
    //
    // نعمل Clone للدائرة حتى نحذف أي listener قديم
    // وهذا يمنع التعارض مع المحاولة السابقة.
    // ============================================================

    function bindFinalAccountAvatar() {

        const oldAvatar =
            document.getElementById(
                "headerAccountAvatar"
            );

        if (
            !oldAvatar ||
            oldAvatar.dataset
                .finalAccountBound ===
                "true"
        ) {
            return;
        }

        const avatar =
            oldAvatar.cloneNode(
                true
            );

        avatar.dataset
            .finalAccountBound =
            "true";

        avatar.setAttribute(
            "aria-haspopup",
            "menu"
        );

        avatar.setAttribute(
            "aria-expanded",
            "false"
        );

        oldAvatar.replaceWith(
            avatar
        );

        avatar.addEventListener(
            "click",
            function (
                event
            ) {

                event.preventDefault();

                event.stopPropagation();

                event.stopImmediatePropagation();

                const menu =
                    createFinalAccountMenu();

                const isOpen =
                    menu.style.display ===
                    "block";

                if (isOpen) {

                    closeFinalAccountMenu();

                } else {

                    openFinalAccountMenu(
                        avatar
                    );
                }
            }
        );
    }

    // ============================================================
    // تشغيل الإصلاحات
    // ============================================================

    function runFinalFixes() {

        fixOverscrollBackground();

        hideOldAccountMenu();

        fixMenuIcons();

        bindFinalAccountAvatar();
    }

    // ============================================================
    // بدء الإصلاح
    // ============================================================

    function startFinalFix() {

        runFinalFixes();

        // --------------------------------------------------------
        // لأن نظام الحساب يعيد إنشاء الدائرة بعد تسجيل الدخول،
        // نراقب فقط تغيرات العناصر ونعيد ربطها عند الحاجة.
        // --------------------------------------------------------

        const observer =
            new MutationObserver(
                function () {

                    runFinalFixes();
                }
            );

        observer.observe(
            document.body,
            {
                childList:
                    true,

                subtree:
                    true
            }
        );

        // --------------------------------------------------------
        // الضغط خارج القائمة
        // --------------------------------------------------------

        document.addEventListener(
            "click",
            function (
                event
            ) {

                const menu =
                    document.getElementById(
                        "alqafiyahFinalAccountMenu"
                    );

                const avatar =
                    document.getElementById(
                        "headerAccountAvatar"
                    );

                if (
                    menu?.contains(
                        event.target
                    ) ||
                    avatar?.contains(
                        event.target
                    )
                ) {
                    return;
                }

                closeFinalAccountMenu();
            }
        );

        // --------------------------------------------------------
        // Escape
        // --------------------------------------------------------

        document.addEventListener(
            "keydown",
            function (
                event
            ) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeFinalAccountMenu();
                }
            }
        );

        // --------------------------------------------------------
        // تغيير حجم الشاشة أو التمرير
        // --------------------------------------------------------

        window.addEventListener(
            "resize",
            closeFinalAccountMenu
        );

        window.addEventListener(
            "scroll",
            closeFinalAccountMenu,
            true
        );
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            startFinalFix,
            {
                once:
                    true
            }
        );

    } else {

        startFinalFix();
    }

})();