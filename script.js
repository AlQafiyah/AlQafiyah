// ============================================================
// القافية - script.js النهائي
// Auth + Account + Profile + Menu + Notifications
// ============================================================

(function () {
    "use strict";

    if (window.__ALQAFIYAH_SCRIPT_STARTED__) return;
    window.__ALQAFIYAH_SCRIPT_STARTED__ = true;

    const $ = (id) => document.getElementById(id);
    const q = (selector, root = document) => root.querySelector(selector);
    const qa = (selector, root = document) => [...root.querySelectorAll(selector)];

    const USER_ICON = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"
             stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"></path>
        </svg>`;

    const ICONS = {
        home: `
            <path d="M3 11.5 12 4l9 7.5"></path>
            <path d="M5 10.5V20h5v-6h4v6h5v-9.5"></path>
        `,

        poems: `
            <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z"></path>
            <path d="M8 7h8"></path>
            <path d="M8 11h8"></path>
            <path d="M8 15h5"></path>
        `,

        poets: `
            <path d="M4 20h6"></path>
            <path d="M14.5 4.5a2.12 2.12 0 0 1 3 3L9 16l-4 1 1-4Z"></path>
        `,

        articles: `
            <path d="M6 3h9l3 3v15H6Z"></path>
            <path d="M14 3v4h4"></path>
            <path d="M9 11h6"></path>
            <path d="M9 15h6"></path>
        `,

        star: `
            <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2 7.5 14 3 9.6l6.2-.9Z"></path>
        `,

        settings: `
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3A1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"></path>
        `,

        info: `
            <circle cx="12" cy="12" r="9"></circle>
            <path d="M12 10v6"></path>
            <path d="M12 7h.01"></path>
        `,

        user: `
            <circle cx="12" cy="8" r="4"></circle>
            <path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"></path>
        `,

        logout: `
            <path d="M10 17l5-5-5-5"></path>
            <path d="M15 12H3"></path>
            <path d="M14 3h5a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-5"></path>
        `,

        shield: `
            <path d="M12 3 20 6v5c0 5.1-3.4 8.5-8 10-4.6-1.5-8-4.9-8-10V6Z"></path>
            <path d="m9 12 2 2 4-4"></path>
        `
    };

    function icon(name, className = "alqafiyah-ui-icon") {
        return `
            <svg
                class="${className}"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true">

                ${ICONS[name] || ICONS.info}

            </svg>
        `;
    }

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

    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }

    function currentPage() {
        return location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    }

    function injectStyles() {
        if ($("alqafiyahRuntimeStyles")) return;

        const style =
            document.createElement("style");

        style.id =
            "alqafiyahRuntimeStyles";

        style.textContent = `

            /*
                مهم:
                لا نغير body إلى اللون الأبيض.
                الأبيض هنا لخلفية المتصفح خلف الصفحة فقط
                عند السحب الزائد أعلى أو أسفل الصفحة.
            */

            html {
                background: #ffffff !important;
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
                display: none !important;
                min-width: 205px;
                padding: 7px;
                background: #ffffff;
                border: 1px solid rgba(62,39,35,.12);
                border-radius: 14px;
                box-shadow: 0 12px 34px rgba(0,0,0,.15);
                z-index: 2147483647 !important;
                direction: rtl;
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

    function normalizeBrandText(text) {
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
                const value =
                    meta.getAttribute(
                        "content"
                    );

                if (value) {
                    meta.setAttribute(
                        "content",
                        normalizeBrandText(
                            value
                        )
                    );
                }
            }
        );

        if (!root) return;

        const walker =
            document.createTreeWalker(
                root,
                NodeFilter.SHOW_TEXT
            );

        let node;

        while (
            (
                node =
                    walker.nextNode()
            )
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
                continue;
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
        }
    }

    function applyClassicMenuIcons() {
        qa(
            ".side-navigation a"
        ).forEach(
            function (link) {
                const text =
                    (
                        link.textContent ||
                        ""
                    )
                        .replace(
                            /\s+/g,
                            " "
                        )
                        .trim();

                const holder =
                    q(
                        "span:first-child",
                        link
                    );

                if (!holder) {
                    return;
                }

                let name =
                    null;

                if (
                    text.includes(
                        "الرئيسية"
                    )
                ) {
                    name =
                        "home";

                } else if (
                    text.includes(
                        "القصائد"
                    )
                ) {
                    name =
                        "poems";

                } else if (
                    text.includes(
                        "الشعراء"
                    )
                ) {
                    name =
                        "poets";

                } else if (
                    text.includes(
                        "المقالات"
                    )
                ) {
                    name =
                        "articles";

                } else if (
                    text.includes(
                        "المفضلة"
                    )
                ) {
                    name =
                        "star";

                } else if (
                    text.includes(
                        "الإعدادات"
                    )
                ) {
                    name =
                        "settings";

                } else if (
                    text.includes(
                        "نبذة"
                    )
                ) {
                    name =
                        "info";

                } else if (
                    text.includes(
                        "وحدة الإدارة"
                    )
                ) {
                    name =
                        "shield";

                } else if (
                    text.includes(
                        "تسجيل الخروج"
                    )
                ) {
                    name =
                        "logout";
                }

                if (name) {
                    holder.innerHTML =
                        icon(
                            name
                        );
                }
            }
        );

        qa(
            ".side-menu .user-avatar"
        ).forEach(
            function (avatar) {
                if (
                    !q(
                        "img",
                        avatar
                    )
                ) {
                    avatar.innerHTML =
                        USER_ICON;
                }
            }
        );
    }

    function styleHomeAboutSection() {
        const path =
            location
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

        if (!isHome) return;

        const aboutLink =
            qa(
                'a[href$="about.html"]'
            ).find(
                function (a) {
                    const text =
                        (
                            a.textContent ||
                            ""
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
            aboutLink
                ?.closest(
                    "section," +
                    ".home-about," +
                    ".about-preview," +
                    ".intro-section," +
                    ".site-intro"
                ) ||
            null;

        if (!section) {
            const textNode =
                qa(
                    "h1,h2,h3,p"
                ).find(
                    function (el) {
                        const text =
                            el.textContent ||
                            "";

                        return (
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
                textNode
                    ?.closest(
                        "section," +
                        ".home-about," +
                        ".about-preview," +
                        ".intro-section," +
                        ".site-intro"
                    ) ||
                null;
        }

        if (section) {
            section.classList.add(
                "alqafiyah-home-about"
            );
        }
    }

    function oauthRedirectUrl() {
        const url =
            new URL(
                location.href
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
            function (key) {
                url
                    .searchParams
                    .delete(
                        key
                    );
            }
        );

        return url.toString();
    }

    function normalizePhone(value) {
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

        return /^\+\d{8,15}$/.test(
            phone
        )
            ? phone
            : "";
    }

    function ensureAuthMethods() {
        const loginForm =
            $("loginForm");

        if (!loginForm) {
            return;
        }

        const divider =
            q(
                ".login-divider",
                loginForm
            );

        let apple =
            $("appleLoginButton");

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
                <label for="phoneAuthNumber">
                    رقم الجوال
                </label>

                <input
                    type="tel"
                    id="phoneAuthNumber"
                    dir="ltr"
                    inputmode="tel"
                    autocomplete="tel"
                    placeholder="05XXXXXXXX">

                <div class="alqafiyah-phone-actions">

                    <button
                        type="button"
                        class="login-submit"
                        id="sendPhoneOtpButton">

                        إرسال رمز التحقق

                    </button>

                </div>

                <div
                    id="phoneOtpFields"
                    style="display:none">

                    <label
                        for="phoneOtpCode"
                        style="margin-top:12px">

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

                    <div class="alqafiyah-phone-actions">

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

    function setPhoneStatus(
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

        element.classList.toggle(
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

        setPhoneStatus();
    }

    function populateSelect(
        id,
        from,
        to,
        descending = false
    ) {
        const select =
            $(id);

        if (
            !select ||
            select.options.length !==
            1
        ) {
            return;
        }

        if (descending) {
            for (
                let number = from;
                number >= to;
                number--
            ) {
                select.add(
                    new Option(
                        number,
                        number
                    )
                );
            }

        } else {
            for (
                let number = from;
                number <= to;
                number++
            ) {
                select.add(
                    new Option(
                        number,
                        number
                    )
                );
            }
        }
    }

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
        ensureAuthMethods();
        normalizeBrand();
        styleHomeAboutSection();

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
            null;

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

            document.body.classList.add(
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

            document.body.classList.remove(
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

        function openNotifications() {
            if (!notificationPanel) {
                return;
            }

            notificationPanel.classList.add(
                "open"
            );

            notificationPanel.setAttribute(
                "aria-hidden",
                "false"
            );
        }

        function closeNotifications() {
            if (!notificationPanel) {
                return;
            }

            notificationPanel.classList.remove(
                "open"
            );

            notificationPanel.setAttribute(
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

            loginModal.classList.add(
                "open"
            );

            loginModal.setAttribute(
                "aria-hidden",
                "false"
            );

            showLogin();
        }

        function closeLoginModal() {
            if (!loginModal) {
                return;
            }

            loginModal.classList.remove(
                "open"
            );

            loginModal.setAttribute(
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
                function (event) {
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
                function (event) {
                    event.preventDefault();
                    showRegister();
                }
            );

        showLoginButton
            ?.addEventListener(
                "click",
                function (event) {
                    event.preventDefault();
                    showLogin();
                }
            );

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

            const parts =
                String(
                    metadata.full_name ||
                    metadata.name ||
                    ""
                )
                    .trim()
                    .split(
                        /\s+/
                    )
                    .filter(
                        Boolean
                    );

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
                        ? parts.join(
                            " "
                        )
                        : null
                );

            const avatar =
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
                                    avatar
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

        const getAvatar =
            function (
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
            };

        function closeAccountDropdown() {
            if (!accountDropdown) {
                return;
            }

            accountDropdown
                .style
                .setProperty(
                    "display",
                    "none",
                    "important"
                );

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
                .style
                .setProperty(
                    "display",
                    "block",
                    "important"
                );

            accountDropdown
                .style
                .setProperty(
                    "visibility",
                    "hidden",
                    "important"
                );

            const width =
                accountDropdown
                    .offsetWidth;

            const left =
                Math.max(
                    10,
                    Math.min(
                        rect.right -
                        width,

                        innerWidth -
                        width -
                        10
                    )
                );

            accountDropdown
                .style
                .setProperty(
                    "left",
                    `${left}px`,
                    "important"
                );

            accountDropdown
                .style
                .setProperty(
                    "right",
                    "auto",
                    "important"
                );

            accountDropdown
                .style
                .setProperty(
                    "top",
                    `${rect.bottom + 8}px`,
                    "important"
                );

            accountDropdown
                .style
                .setProperty(
                    "visibility",
                    "visible",
                    "important"
                );

            accountDropdown
                .setAttribute(
                    "aria-hidden",
                    "false"
                );

            avatar.setAttribute(
                "aria-expanded",
                "true"
            );
        }

        function toggleAccountDropdown(
            avatar
        ) {
            const isOpen =
                accountDropdown
                    ?.getAttribute(
                        "aria-hidden"
                    ) ===
                "false";

            if (isOpen) {
                closeAccountDropdown();

            } else {
                openAccountDropdown(
                    avatar
                );
            }
        }

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

                await updateAdminMenu(
                    null
                );

                if (
                    currentPage() ===
                    "profile.html"
                ) {
                    location.replace(
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
            $("accountDropdown")
                ?.remove();

            accountDropdown =
                document.createElement(
                    "div"
                );

            accountDropdown.id =
                "accountDropdown";

            accountDropdown.className =
                "qafiyah-account-dropdown";

            accountDropdown.setAttribute(
                "role",
                "menu"
            );

            accountDropdown.setAttribute(
                "aria-hidden",
                "true"
            );

            accountDropdown.innerHTML = `
                <button
                    type="button"
                    id="accountProfileButton"
                    role="menuitem">

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
                    id="accountLogoutButton"
                    role="menuitem">

                    ${icon("logout")}

                    <span>
                        تسجيل الخروج
                    </span>

                </button>
            `;

            accountDropdown
                .style
                .setProperty(
                    "display",
                    "none",
                    "important"
                );

            document.body.appendChild(
                accountDropdown
            );

            $("accountProfileButton")
                ?.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();

                        closeAccountDropdown();

                        location.href =
                            "profile.html";
                    }
                );

            $("accountLogoutButton")
                ?.addEventListener(
                    "click",
                    async function (
                        event
                    ) {
                        event.preventDefault();
                        await logout();
                    }
                );
        }

        createAccountDropdown();

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

            const avatar =
                getAvatar(
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
                        avatar
                            ? `
                                <img
                                    src="${escapeHtml(avatar)}"
                                    alt="الصورة الشخصية"
                                    loading="eager">
                            `
                            :
                            USER_ICON
                    }

                </button>
            `;

            $("headerAccountAvatar")
                ?.addEventListener(
                    "click",
                    function (event) {
                        event.preventDefault();
                        event.stopPropagation();

                        toggleAccountDropdown(
                            event.currentTarget
                        );
                    }
                );
        }

        function updateSideUser(
            user,
            profile
        ) {
            const name =
                $("menuUserName");

            const contact =
                $("menuUserEmail");

            const avatarElement =
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

                if (avatarElement) {
                    avatarElement.innerHTML =
                        USER_ICON;
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

            if (avatarElement) {
                const avatar =
                    getAvatar(
                        user,
                        profile
                    );

                avatarElement.innerHTML =
                    avatar
                        ? `
                            <img
                                src="${escapeHtml(avatar)}"
                                alt="الصورة الشخصية"
                                loading="eager">
                        `
                        :
                        USER_ICON;
            }
        }

        document.addEventListener(
            "click",
            function (event) {
                const avatar =
                    $("headerAccountAvatar");

                if (
                    avatar
                        ?.contains(
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

        addEventListener(
            "resize",
            closeAccountDropdown
        );

        addEventListener(
            "scroll",
            closeAccountDropdown,
            true
        );

        $("profileLink")
            ?.remove();

        const navigation =
            sideMenu
                ?.querySelector(
                    ".side-navigation"
                );

        let adminMenuLink =
            $("adminMenuLink");

        if (
            !adminMenuLink &&
            navigation
        ) {
            adminMenuLink =
                document.createElement(
                    "a"
                );

            adminMenuLink.href =
                "admin.html";

            adminMenuLink.id =
                "adminMenuLink";

            adminMenuLink.style.display =
                "none";

            adminMenuLink.setAttribute(
                "aria-hidden",
                "true"
            );

            adminMenuLink.innerHTML = `
                <span aria-hidden="true">
                    ${icon("shield")}
                </span>

                <span>
                    وحدة الإدارة
                </span>
            `;

            const settingsLink =
                $("settingsLink");

            const aboutLink =
                navigation.querySelector(
                    'a[href="about.html"]'
                );

            navigation.insertBefore(
                adminMenuLink,
                settingsLink ||
                aboutLink ||
                null
            );
        }

        let adminMenuCheck = 0;

        async function updateAdminMenu(
            user
        ) {
            const check =
                ++adminMenuCheck;

            if (adminMenuLink) {
                adminMenuLink.style.display =
                    "none";

                adminMenuLink.setAttribute(
                    "aria-hidden",
                    "true"
                );
            }

            if (
                !user ||
                !adminMenuLink
            ) {
                return;
            }

            try {
                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .rpc(
                            "get_my_admin_role"
                        );

                if (
                    check !==
                    adminMenuCheck
                ) {
                    return;
                }

                const admin =
                    Array.isArray(data)
                        ? data[0]
                        : null;

                const allowed =
                    !error &&
                    admin?.is_active === true &&
                    [
                        "admin",
                        "super_admin"
                    ].includes(
                        admin?.role
                    );

                if (allowed) {
                    adminMenuLink.style.display =
                        "";

                    adminMenuLink.setAttribute(
                        "aria-hidden",
                        "false"
                    );
                }

            } catch (error) {
                console.warn(
                    "القافية: تعذر التحقق من صلاحية الإدارة:",
                    error
                );
            }
        }

        let sideLogout =
            $("sideLogoutButton");

        if (!sideLogout) {
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
                    <span aria-hidden="true">
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
                sideLogout.style.display =
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
                    location.href =
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
            function (element) {
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
                    function (event) {
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
                            (
                                await supabaseClient
                                    .auth
                                    .getSession()
                            )
                                .data
                                ?.session ||
                            null;

                        if (!session) {
                            throw new Error(
                                "تم إنشاء الحساب، لكن لم يتم تسجيل الدخول تلقائيًا. تأكد من إعداد Confirm email في Supabase."
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

        $("phoneLoginButton")
            ?.addEventListener(
                "click",
                function () {
                    const panel =
                        $("phoneAuthPanel");

                    panel
                        ?.classList
                        .toggle(
                            "open"
                        );

                    if (
                        panel
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
                        setPhoneStatus(
                            "أدخل رقم جوال صحيحًا بصيغة 05XXXXXXXX أو بصيغة دولية تبدأ بـ +.",
                            true
                        );

                        return;
                    }

                    this.disabled =
                        true;

                    setPhoneStatus(
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

                        setPhoneStatus(
                            "تم إرسال رمز التحقق إلى رقم الجوال."
                        );

                        $("phoneOtpCode")
                            ?.focus();

                    } catch (error) {
                        setPhoneStatus(
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
                        setPhoneStatus(
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
                        setPhoneStatus(
                            "أدخل رمز التحقق المرسل إلى جوالك.",
                            true
                        );

                        return;
                    }

                    this.disabled =
                        true;

                    setPhoneStatus(
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
                        setPhoneStatus(
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

        populateSelect(
            "birthDay",
            1,
            31
        );

        populateSelect(
            "birthYear",
            new Date()
                .getFullYear(),
            1900,
            true
        );

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

                await updateAdminMenu(
                    user
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

                await updateAdminMenu(
                    null
                );

                return {
                    user:
                        null,

                    profile:
                        null
                };
            }
        }

        supabaseClient
            .auth
            .onAuthStateChange(
                function (event) {
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

        if (notificationCount) {
            notificationCount.textContent =
                "0";

            notificationCount.style.display =
                "none";
        }

        document.addEventListener(
            "keydown",
            function (event) {
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

        if (
            q(
                ".profile-page"
            )
        ) {
            await initProfilePage(
                logout
            );
        }

        await refreshAccount();

        normalizeBrand();
        applyClassicMenuIcons();
        styleHomeAboutSection();
    }

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

        const showMessage =
            function (
                text,
                error = false
            ) {
                if (!message) {
                    return;
                }

                message.textContent =
                    text;

                message.classList.toggle(
                    "error",
                    error
                );
            };

        const setAvatar =
            function (url) {
                if (!profileAvatar) {
                    return;
                }

                if (!url) {
                    profileAvatar.innerHTML =
                        USER_ICON;

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
                            USER_ICON;
                    };

                profileAvatar.appendChild(
                    image
                );
            };

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
            location.replace(
                "index.html"
            );

            return;
        }

        const user =
            data.session.user;

        logoutButton
            ?.addEventListener(
                "click",
                async function () {
                    this.disabled =
                        true;

                    try {
                        await logout();

                    } finally {
                        this.disabled =
                            false;
                    }
                }
            );

        if (email) {
            email.value =
                user.email ||
                "";
        }

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
            console.error(
                "القافية: خطأ في تحميل الملف الشخصي:",
                profileError
            );

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
                        console.error(
                            "القافية: خطأ في حفظ الملف الشخصي:",
                            error
                        );

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
                        console.error(
                            "القافية: خطأ في رفع الصورة:",
                            error
                        );

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

                    this.disabled =
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
                        console.error(
                            "القافية: خطأ في حذف الصورة:",
                            error
                        );

                        showMessage(
                            error?.message ||
                            "تعذر حذف الصورة.",
                            true
                        );

                    } finally {
                        this.disabled =
                            false;
                    }
                }
            );
    }

})();
