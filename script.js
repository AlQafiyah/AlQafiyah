// ============================================================
// القافيه - النظام الرئيسي
// Supabase Auth + Profiles + Account UI + Menu + Notifications
// Profile + Avatar Management
// ============================================================

(function () {
    "use strict";

    // ============================================================
    // منع تشغيل السكربت أكثر من مرة
    // ============================================================

    if (window.__ALQAFIYAH_SCRIPT_STARTED__) {
        return;
    }

    window.__ALQAFIYAH_SCRIPT_STARTED__ = true;

    // ============================================================
    // أدوات عامة
    // ============================================================

    function getCurrentPage() {
        return window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();
    }

    function escapeHtml(value) {
        const div = document.createElement("div");

        div.textContent = value ?? "";

        return div.innerHTML;
    }

    function defaultUserIcon() {
        return `
            <svg
                xmlns="http://www.w3.org/2000/svg"
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
    // هوية القافيه + أدوات تسجيل الدخول
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

    function getOAuthRedirectUrl() {
        const url = new URL(
            window.location.href
        );

        url.hash = "";

        [
            "code",
            "state",
            "error",
            "error_code",
            "error_description"
        ].forEach(
            function (key) {
                url.searchParams.delete(
                    key
                );
            }
        );

        return url.toString();
    }

    function normalizePhoneNumber(
        value
    ) {
        let phone = String(
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
            phone.startsWith("05") &&
            phone.length === 10
        ) {
            phone =
                `+966${phone.slice(1)}`;
        } else if (
            phone.startsWith("5") &&
            phone.length === 9
        ) {
            phone =
                `+966${phone}`;
        }

        if (
            !phone.startsWith("+")
        ) {
            return "";
        }

        if (
            !/^\+\d{8,15}$/.test(
                phone
            )
        ) {
            return "";
        }

        return phone;
    }

    function injectAuthStyles() {

        if (
            document.getElementById(
                "alqafiyahAuthStyles"
            )
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "alqafiyahAuthStyles";

        style.textContent = `
            .alqafiyah-auth-method {
                display: flex !important;
                align-items: center;
                justify-content: center;
                gap: 10px;
                width: 100%;
                min-height: 46px;
            }

            .alqafiyah-auth-icon {
                width: 20px;
                height: 20px;
                flex: 0 0 20px;
            }

            #googleLoginButton {
                background: #fff;
                color: #202124;
                border: 1px solid #dadce0;
            }

            #appleLoginButton {
                background: #000;
                color: #fff;
                border: 1px solid #000;
            }

            #phoneLoginButton {
                background: #fff;
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

            .alqafiyah-side-logout {
                cursor: pointer;
            }

            .alqafiyah-profile-logout {
                margin-inline-start: 10px;
            }
        `;

        document.head.appendChild(
            style
        );
    }

    function renameVisibleBrand() {

        if (document.title) {
            document.title =
                document.title.replace(
                    /قافية/g,
                    "القافيه"
                );
        }

        const selectors = [
            ".side-menu-header h2",
            ".footer-logo",
            ".site-logo",
            ".logo",
            ".header-logo",
            "#loginForm > p",
            "#registerForm > p",
            ".side-navigation a[href='about.html'] span:last-child",
            ".footer-links a[href='about.html']"
        ];

        document
            .querySelectorAll(
                selectors.join(",")
            )
            .forEach(
                function (
                    element
                ) {

                    if (
                        element
                            .textContent
                            ?.includes(
                                "قافية"
                            )
                    ) {
                        element.textContent =
                            element
                                .textContent
                                .replace(
                                    /قافية/g,
                                    "القافيه"
                                );
                    }
                }
            );
    }

    function ensureSocialAuthUI() {

        const loginForm =
            document.getElementById(
                "loginForm"
            );

        if (!loginForm) {
            return;
        }

        injectAuthStyles();

        let appleButton =
            document.getElementById(
                "appleLoginButton"
            );

        const divider =
            loginForm.querySelector(
                ".login-divider"
            );

        if (!appleButton) {

            appleButton =
                document.createElement(
                    "button"
                );

            appleButton.type =
                "button";

            appleButton.id =
                "appleLoginButton";

            appleButton.className =
                "login-method";

            if (divider) {
                loginForm.insertBefore(
                    appleButton,
                    divider
                );
            } else {
                loginForm.appendChild(
                    appleButton
                );
            }
        }

        appleButton.classList.add(
            "alqafiyah-auth-method"
        );

        appleButton.innerHTML =
            `${appleIcon()}<span>تسجيل الدخول باستخدام Apple</span>`;

        let googleButton =
            document.getElementById(
                "googleLoginButton"
            );

        if (!googleButton) {

            googleButton =
                document.createElement(
                    "button"
                );

            googleButton.type =
                "button";

            googleButton.id =
                "googleLoginButton";

            googleButton.className =
                "login-method alqafiyah-auth-method";

            appleButton
                .parentNode
                .insertBefore(
                    googleButton,
                    appleButton
                );
        }

        googleButton.innerHTML =
            `${googleIcon()}<span>تسجيل الدخول باستخدام Google</span>`;

        let phoneButton =
            document.getElementById(
                "phoneLoginButton"
            );

        if (!phoneButton) {

            phoneButton =
                document.createElement(
                    "button"
                );

            phoneButton.type =
                "button";

            phoneButton.id =
                "phoneLoginButton";

            phoneButton.className =
                "login-method alqafiyah-auth-method";

            appleButton.insertAdjacentElement(
                "afterend",
                phoneButton
            );
        }

        phoneButton.innerHTML =
            `${phoneIcon()}<span>تسجيل الدخول برقم الجوال</span>`;

        let phonePanel =
            document.getElementById(
                "phoneAuthPanel"
            );

        if (!phonePanel) {

            phonePanel =
                document.createElement(
                    "div"
                );

            phonePanel.id =
                "phoneAuthPanel";

            phonePanel.className =
                "alqafiyah-phone-panel";

            phonePanel.innerHTML = `
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

            phoneButton.insertAdjacentElement(
                "afterend",
                phonePanel
            );
        }
    }

    function setPhoneAuthStatus(
        message,
        isError = false
    ) {

        const status =
            document.getElementById(
                "phoneAuthStatus"
            );

        if (!status) {
            return;
        }

        status.textContent =
            message || "";

        status.classList.toggle(
            "error",
            Boolean(isError)
        );
    }

    function resetPhoneAuthUI() {

        document
            .getElementById(
                "phoneAuthPanel"
            )
            ?.classList.remove(
                "open"
            );

        const codeFields =
            document.getElementById(
                "phoneOtpFields"
            );

        if (codeFields) {
            codeFields.style.display =
                "none";
        }

        const code =
            document.getElementById(
                "phoneOtpCode"
            );

        if (code) {
            code.value = "";
        }

        setPhoneAuthStatus("");
    }

    // ============================================================
    // بدء النظام
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        initAlQafiyah
    );

    // ============================================================
    // النظام الرئيسي
    // ============================================================

    async function initAlQafiyah() {

        console.log(
            "القافيه: بدء تشغيل النظام..."
        );

        // ========================================================
        // التأكد من Supabase
        // ========================================================

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "القافيه: supabaseClient غير موجود."
            );

            return;
        }

        // ========================================================
        // عناصر الواجهة
        // ========================================================

        const menuButton =
            document.getElementById(
                "menuButton"
            );

        const sideMenu =
            document.getElementById(
                "sideMenu"
            );

        const closeMenuButton =
            document.getElementById(
                "closeMenuButton"
            ) ||
            document.getElementById(
                "closeMenu"
            );

        const menuOverlay =
            document.getElementById(
                "menuOverlay"
            );

        const notificationButton =
            document.getElementById(
                "notificationButton"
            );

        const notificationPanel =
            document.getElementById(
                "notificationPanel"
            );

        const closeNotificationButton =
            document.getElementById(
                "closeNotificationButton"
            );

        const notificationCount =
            document.getElementById(
                "notificationCount"
            );

        const loginButton =
            document.getElementById(
                "loginButton"
            );

        const loginModal =
            document.getElementById(
                "loginModal"
            );

        const closeLoginButton =
            document.getElementById(
                "closeLoginButton"
            ) ||
            document.getElementById(
                "closeLoginModal"
            );

        const showRegisterButton =
            document.getElementById(
                "showRegisterButton"
            );

        const showLoginButton =
            document.getElementById(
                "showLoginButton"
            );

        const profileLink =
            document.getElementById(
                "profileLink"
            );

        let currentAuthUser =
            null;

        // ============================================================
        // القائمة الجانبية
        // ============================================================

        function openSideMenu() {

            sideMenu?.classList.add(
                "open"
            );

            menuOverlay?.classList.add(
                "active"
            );

            sideMenu?.setAttribute(
                "aria-hidden",
                "false"
            );

            document.body.classList.add(
                "menu-open"
            );
        }

        function closeSideMenu() {

            sideMenu?.classList.remove(
                "open"
            );

            menuOverlay?.classList.remove(
                "active"
            );

            sideMenu?.setAttribute(
                "aria-hidden",
                "true"
            );

            document.body.classList.remove(
                "menu-open"
            );
        }

        menuButton?.addEventListener(
            "click",
            openSideMenu
        );

        closeMenuButton?.addEventListener(
            "click",
            closeSideMenu
        );

        menuOverlay?.addEventListener(
            "click",
            closeSideMenu
        );

        // ============================================================
        // الإشعارات
        // ============================================================

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

        notificationButton?.addEventListener(
            "click",
            openNotifications
        );

        closeNotificationButton?.addEventListener(
            "click",
            closeNotifications
        );

        // ============================================================
        // نافذة تسجيل الدخول
        // ============================================================

        function showLogin() {

            const login =
                document.getElementById(
                    "loginForm"
                );

            const register =
                document.getElementById(
                    "registerForm"
                );

            if (login) {
                login.style.display =
                    "block";
            }

            if (register) {
                register.style.display =
                    "none";
            }
        }

        function showRegister() {

            const login =
                document.getElementById(
                    "loginForm"
                );

            const register =
                document.getElementById(
                    "registerForm"
                );

            if (login) {
                login.style.display =
                    "none";
            }

            if (register) {
                register.style.display =
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

            resetPhoneAuthUI();
        }

        loginButton?.addEventListener(
            "click",
            openLoginModal
        );

        closeLoginButton?.addEventListener(
            "click",
            closeLoginModal
        );

        loginModal?.addEventListener(
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

        showRegisterButton?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showRegister();
            }
        );

        showLoginButton?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showLogin();
            }
        );

        renameVisibleBrand();
        ensureSocialAuthUI();

        // ============================================================
        // حساب الهيدر
        // ============================================================

        let accountArea =
            document.getElementById(
                "accountArea"
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

            loginButton.parentNode.insertBefore(
                accountArea,
                loginButton
            );

            accountArea.style.display =
                "none";
        }

        let accountDropdown =
            document.getElementById(
                "accountDropdown"
            );

        // ============================================================
        // جلب بيانات Profile
        // ============================================================

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
                    .from("profiles")
                    .select("*")
                    .eq(
                        "id",
                        userId
                    )
                    .maybeSingle();

            if (error) {

                console.error(
                    "القافيه: خطأ في جلب profiles:",
                    error
                );

                return null;
            }

            return data;
        }

        // ============================================================
        // تسجيل الخروج
        // ============================================================

        async function logoutUser() {

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

                accountDropdown?.classList.remove(
                    "open"
                );

                currentAuthUser =
                    null;

                updateAccountUI(
                    null,
                    null
                );

                updateSideMenuUser(
                    null,
                    null
                );

                updateSideLogoutVisibility(
                    false
                );

                if (
                    getCurrentPage() ===
                    "profile.html"
                ) {

                    window.location.replace(
                        "index.html"
                    );

                    return;
                }

            } catch (error) {

                console.error(
                    "القافيه: خطأ في تسجيل الخروج:",
                    error
                );

                alert(
                    error?.message ||
                    "تعذر تسجيل الخروج."
                );
            }
        }

        // ============================================================
        // إنشاء قائمة الحساب
        // ============================================================

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

            accountDropdown.innerHTML = `
                <button
                    type="button"
                    id="accountProfileButton">

                    الملف الشخصي

                </button>

                <button
                    type="button"
                    id="accountLogoutButton">

                    تسجيل الخروج

                </button>
            `;

            document.body.appendChild(
                accountDropdown
            );

            document
                .getElementById(
                    "accountProfileButton"
                )
                ?.addEventListener(
                    "click",
                    function () {

                        window.location.href =
                            "profile.html";
                    }
                );

            document
                .getElementById(
                    "accountLogoutButton"
                )
                ?.addEventListener(
                    "click",
                    logoutUser
                );
        }

        createAccountDropdown();

        function getUserAvatar(
            user,
            profile
        ) {

            return (
                profile?.avatar_url ||
                user?.user_metadata?.avatar_url ||
                user?.user_metadata?.picture ||
                null
            );
        }

        // ============================================================
        // تحديث حساب الهيدر
        // ============================================================

        function updateAccountUI(
            user,
            profile
        ) {

            if (
                !accountArea ||
                !loginButton
            ) {
                return;
            }

            // --------------------------------------------------------
            // لا يوجد مستخدم
            // --------------------------------------------------------

            if (!user) {

                accountArea.style.display =
                    "none";

                loginButton.style.display =
                    "";

                accountDropdown?.classList.remove(
                    "open"
                );

                return;
            }

            // --------------------------------------------------------
            // يوجد مستخدم
            // --------------------------------------------------------

            loginButton.style.display =
                "none";

            accountArea.style.display =
                "";

            accountArea.innerHTML = `
                <button
                    type="button"
                    id="headerAccountAvatar"
                    class="qafiyah-header-avatar"
                    aria-label="الحساب"
                    title="الحساب">

                    ${
                        getUserAvatar(
                            user,
                            profile
                        )
                        ? `
                            <img
                                src="${escapeHtml(
                                    getUserAvatar(
                                        user,
                                        profile
                                    )
                                )}"
                                alt="الصورة الشخصية"
                                loading="eager">
                        `
                        :
                        defaultUserIcon()
                    }

                </button>
            `;

            const avatar =
                document.getElementById(
                    "headerAccountAvatar"
                );

            avatar?.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    if (!accountDropdown) {
                        return;
                    }

                    const isOpen =
                        accountDropdown.classList.contains(
                            "open"
                        );

                    if (isOpen) {

                        accountDropdown.classList.remove(
                            "open"
                        );

                        return;
                    }

                    const rect =
                        avatar.getBoundingClientRect();

                    accountDropdown.style.top =
                        `${rect.bottom + 10}px`;

                    accountDropdown.style.right =
                        `${Math.max(
                            10,
                            window.innerWidth -
                            rect.right
                        )}px`;

                    accountDropdown.classList.add(
                        "open"
                    );
                }
            );
        }

        // ============================================================
        // إغلاق قائمة الحساب عند الضغط خارجها
        // ============================================================

        document.addEventListener(
            "click",
            function (event) {

                if (!accountDropdown) {
                    return;
                }

                const avatar =
                    document.getElementById(
                        "headerAccountAvatar"
                    );

                if (
                    avatar &&
                    avatar.contains(
                        event.target
                    )
                ) {
                    return;
                }

                if (
                    accountDropdown.contains(
                        event.target
                    )
                ) {
                    return;
                }

                accountDropdown.classList.remove(
                    "open"
                );
            }
        );

        // ============================================================
        // مستخدم القائمة الجانبية
        // ============================================================

        function updateSideMenuUser(
            user,
            profile
        ) {

            const name =
                document.getElementById(
                    "menuUserName"
                );

            const email =
                document.getElementById(
                    "menuUserEmail"
                );

            const avatar =
                document.querySelector(
                    ".side-menu .user-avatar"
                );

            // --------------------------------------------------------
            // زائر
            // --------------------------------------------------------

            if (!user) {

                if (name) {
                    name.textContent =
                        "مرحبًا بك";
                }

                if (email) {
                    email.textContent =
                        "سجّل الدخول للوصول إلى حسابك";
                }

                if (avatar) {
                    avatar.innerHTML =
                        defaultUserIcon();
                }

                return;
            }

            // --------------------------------------------------------
            // اسم المستخدم
            // --------------------------------------------------------

            const fullName =
                [
                    profile?.first_name,
                    profile?.last_name
                ]
                    .filter(Boolean)
                    .join(" ")
                    .trim();

            if (name) {

                name.textContent =
                    fullName ||
                    user.email ||
                    user.phone ||
                    "المستخدم";
            }

            if (email) {

                email.textContent =
                    user.email ||
                    user.phone ||
                    "";
            }

            // --------------------------------------------------------
            // صورة المستخدم
            // --------------------------------------------------------

            if (avatar) {

                avatar.innerHTML =
                    getUserAvatar(
                        user,
                        profile
                    )
                    ? `
                        <img
                            src="${escapeHtml(
                                getUserAvatar(
                                    user,
                                    profile
                                )
                            )}"
                            alt="الصورة الشخصية"
                            loading="eager">
                    `
                    :
                    defaultUserIcon();
            }
        }

        // ============================================================
        // إنشاء Profile
        // ============================================================

        async function createProfile(
            user,
            profileData
        ) {

            if (!user?.id) {

                throw new Error(
                    "تعذر تحديد حساب المستخدم."
                );
            }

            const {
                error
            } =
                await supabaseClient
                    .from("profiles")
                    .insert({

                        id:
                            user.id,

                        first_name:
                            profileData.firstName,

                        last_name:
                            profileData.lastName ||
                            null,

                        birth_day:
                            Number(
                                profileData.birthDay
                            ),

                        birth_month:
                            Number(
                                profileData.birthMonth
                            ),

                        birth_year:
                            Number(
                                profileData.birthYear
                            ),

                        gender:
                            profileData.gender,

                        avatar_url:
                            null,

                        phone:
                            null
                    });

            if (error) {

                console.error(
                    "القافيه: فشل إنشاء profiles:",
                    error
                );

                throw error;
            }

            console.log(
                "القافيه: تم إنشاء profiles بنجاح."
            );
        }

        async function ensureUserProfile(
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
                ).trim();

            const nameParts =
                rawName
                ? rawName.split(/\s+/)
                : [];

            const firstName =
                metadata.first_name ||
                metadata.given_name ||
                nameParts.shift() ||
                null;

            const lastName =
                metadata.last_name ||
                metadata.family_name ||
                (
                    nameParts.length
                    ? nameParts.join(" ")
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
                        .from("profiles")
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
                    "القافيه: تعذر إنشاء ملف شخصي تلقائي لمستخدم OAuth/Phone:",
                    error
                );
            }

            return profile;
        }

        // ============================================================
        // تسجيل حساب جديد
        // ============================================================

        const registerButton =
            document.getElementById(
                "registerSubmitButton"
            );

        registerButton?.addEventListener(
            "click",
            async function () {

                const firstName =
                    document
                        .getElementById(
                            "firstName"
                        )
                        ?.value
                        .trim();

                const lastName =
                    document
                        .getElementById(
                            "lastName"
                        )
                        ?.value
                        .trim();

                const birthDay =
                    document.getElementById(
                        "birthDay"
                    )?.value;

                const birthMonth =
                    document.getElementById(
                        "birthMonth"
                    )?.value;

                const birthYear =
                    document.getElementById(
                        "birthYear"
                    )?.value;

                const gender =
                    document.getElementById(
                        "gender"
                    )?.value;

                const email =
                    document
                        .getElementById(
                            "emailRegister"
                        )
                        ?.value
                        .trim();

                const password =
                    document.getElementById(
                        "passwordRegister"
                    )?.value;

                const confirmPassword =
                    document.getElementById(
                        "confirmPasswordRegister"
                    )?.value;

                // ----------------------------------------------------
                // التحقق من البيانات
                // ----------------------------------------------------

                if (
                    !firstName ||
                    !birthDay ||
                    !birthMonth ||
                    !birthYear ||
                    !gender ||
                    !email ||
                    !password ||
                    !confirmPassword
                ) {

                    alert(
                        "يرجى تعبئة جميع البيانات المطلوبة."
                    );

                    return;
                }

                if (
                    password !==
                    confirmPassword
                ) {

                    alert(
                        "كلمتا المرور غير متطابقتين."
                    );

                    return;
                }

                if (
                    password.length < 6
                ) {

                    alert(
                        "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                    );

                    return;
                }

                registerButton.disabled =
                    true;

                try {

                    // ------------------------------------------------
                    // إنشاء الحساب في Auth
                    // ------------------------------------------------

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signUp({
                                email,
                                password
                            });

                    if (error) {
                        throw error;
                    }

                    if (!data?.user) {

                        throw new Error(
                            "لم يتم إنشاء المستخدم في Supabase."
                        );
                    }

                    // ------------------------------------------------
                    // الحصول على Session
                    // ------------------------------------------------

                    let session =
                        data.session ||
                        null;

                    if (!session) {

                        const {
                            data:
                                sessionData,
                            error:
                                sessionError
                        } =
                            await supabaseClient
                                .auth
                                .getSession();

                        if (sessionError) {
                            throw sessionError;
                        }

                        session =
                            sessionData?.session ||
                            null;
                    }

                    // ------------------------------------------------
                    // Confirm Email
                    // ------------------------------------------------

                    if (!session) {

                        throw new Error(
                            "تم إنشاء الحساب، لكن لم يتم تسجيل الدخول تلقائيًا. تأكد من أن Confirm email مغلق في Supabase."
                        );
                    }

                    const user =
                        session.user;

                    // ------------------------------------------------
                    // البحث عن Profile
                    // ------------------------------------------------

                    let profile =
                        await getProfile(
                            user.id
                        );

                    // ------------------------------------------------
                    // إنشاء Profile
                    // ------------------------------------------------

                    if (!profile) {

                        await createProfile(
                            user,
                            {
                                firstName,
                                lastName,
                                birthDay,
                                birthMonth,
                                birthYear,
                                gender
                            }
                        );

                        profile =
                            await getProfile(
                                user.id
                            );
                    }

                    // ------------------------------------------------
                    // تحديث الواجهة
                    // ------------------------------------------------

                    currentAuthUser =
                        user;

                    updateAccountUI(
                        user,
                        profile
                    );

                    updateSideMenuUser(
                        user,
                        profile
                    );

                    updateSideLogoutVisibility(
                        true
                    );

                    closeLoginModal();

                    alert(
                        "تم إنشاء حسابك وتسجيل الدخول بنجاح."
                    );

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في إنشاء الحساب:",
                        error
                    );

                    const message =
                        String(
                            error?.message ||
                            ""
                        );

                    const lowerMessage =
                        message.toLowerCase();

                    if (
                        lowerMessage.includes(
                            "user already registered"
                        )
                    ) {

                        alert(
                            "هذا البريد الإلكتروني مسجل مسبقًا."
                        );

                    } else if (
                        lowerMessage.includes(
                            "row-level security"
                        )
                    ) {

                        alert(
                            "تم إنشاء الحساب، لكن صلاحيات جدول profiles تمنع حفظ بياناته."
                        );

                    } else {

                        alert(
                            message ||
                            "حدث خطأ أثناء إنشاء الحساب."
                        );
                    }

                } finally {

                    registerButton.disabled =
                        false;
                }
            }
        );

        // ============================================================
        // تسجيل الدخول بالبريد وكلمة المرور
        // ============================================================

        const emailLoginButton =
            document.getElementById(
                "emailLoginButton"
            );

        emailLoginButton?.addEventListener(
            "click",
            async function () {

                const email =
                    document
                        .getElementById(
                            "emailLogin"
                        )
                        ?.value
                        .trim();

                const password =
                    document.getElementById(
                        "passwordLogin"
                    )?.value;

                if (
                    !email ||
                    !password
                ) {

                    alert(
                        "أدخل البريد الإلكتروني وكلمة المرور."
                    );

                    return;
                }

                emailLoginButton.disabled =
                    true;

                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithPassword({
                                email,
                                password
                            });

                    if (error) {
                        throw error;
                    }

                    if (!data?.user) {

                        throw new Error(
                            "تعذر تسجيل الدخول."
                        );
                    }

                    const profile =
                        await ensureUserProfile(
                            data.user
                        );

                    currentAuthUser =
                        data.user;

                    updateAccountUI(
                        data.user,
                        profile
                    );

                    updateSideMenuUser(
                        data.user,
                        profile
                    );

                    updateSideLogoutVisibility(
                        true
                    );

                    closeLoginModal();

                    console.log(
                        "القافيه: تم تسجيل الدخول بنجاح."
                    );

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في تسجيل الدخول:",
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

                    emailLoginButton.disabled =
                        false;
                }
            }
        );

        // ============================================================
        // تسجيل الدخول بواسطة Google / Apple / Phone OTP
        // ============================================================

        const googleLoginButton =
            document.getElementById(
                "googleLoginButton"
            );

        const appleLoginButton =
            document.getElementById(
                "appleLoginButton"
            );

        const phoneLoginButton =
            document.getElementById(
                "phoneLoginButton"
            );

        async function signInWithProvider(
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
                        .signInWithOAuth({

                            provider,

                            options: {
                                redirectTo:
                                    getOAuthRedirectUrl()
                            }
                        });

                if (error) {
                    throw error;
                }

            } catch (error) {

                console.error(
                    `القافيه: خطأ ${provider}:`,
                    error
                );

                alert(
                    error?.message ||
                    `تعذر تسجيل الدخول باستخدام ${
                        provider === "google"
                        ? "Google"
                        : "Apple"
                    }.`
                );

                button.disabled =
                    false;
            }
        }

        googleLoginButton?.addEventListener(
            "click",
            function () {

                signInWithProvider(
                    "google",
                    googleLoginButton
                );
            }
        );

        appleLoginButton?.addEventListener(
            "click",
            function () {

                signInWithProvider(
                    "apple",
                    appleLoginButton
                );
            }
        );

        phoneLoginButton?.addEventListener(
            "click",
            function () {

                const panel =
                    document.getElementById(
                        "phoneAuthPanel"
                    );

                if (!panel) {
                    return;
                }

                panel.classList.toggle(
                    "open"
                );

                if (
                    panel.classList.contains(
                        "open"
                    )
                ) {

                    document
                        .getElementById(
                            "phoneAuthNumber"
                        )
                        ?.focus();
                }
            }
        );

        const sendPhoneOtpButton =
            document.getElementById(
                "sendPhoneOtpButton"
            );

        sendPhoneOtpButton?.addEventListener(
            "click",
            async function () {

                const phone =
                    normalizePhoneNumber(
                        document
                            .getElementById(
                                "phoneAuthNumber"
                            )
                            ?.value
                    );

                if (!phone) {

                    setPhoneAuthStatus(
                        "أدخل رقم جوال صحيحًا بصيغة 05XXXXXXXX أو بصيغة دولية تبدأ بـ +.",
                        true
                    );

                    return;
                }

                sendPhoneOtpButton.disabled =
                    true;

                setPhoneAuthStatus(
                    "جارٍ إرسال رمز التحقق..."
                );

                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithOtp({

                                phone,

                                options: {
                                    shouldCreateUser:
                                        true
                                }
                            });

                    if (error) {
                        throw error;
                    }

                    const otpFields =
                        document.getElementById(
                            "phoneOtpFields"
                        );

                    if (otpFields) {
                        otpFields.style.display =
                            "block";
                    }

                    setPhoneAuthStatus(
                        "تم إرسال رمز التحقق إلى رقم الجوال."
                    );

                    document
                        .getElementById(
                            "phoneOtpCode"
                        )
                        ?.focus();

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في إرسال OTP:",
                        error
                    );

                    setPhoneAuthStatus(
                        error?.message ||
                        "تعذر إرسال رمز التحقق. تأكد من تفعيل مزود الرسائل في Supabase.",
                        true
                    );

                } finally {

                    sendPhoneOtpButton.disabled =
                        false;
                }
            }
        );

        const verifyPhoneOtpButton =
            document.getElementById(
                "verifyPhoneOtpButton"
            );

        verifyPhoneOtpButton?.addEventListener(
            "click",
            async function () {

                const phone =
                    normalizePhoneNumber(
                        document
                            .getElementById(
                                "phoneAuthNumber"
                            )
                            ?.value
                    );

                const token =
                    String(
                        document
                            .getElementById(
                                "phoneOtpCode"
                            )
                            ?.value ||
                        ""
                    ).trim();

                if (!phone) {

                    setPhoneAuthStatus(
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

                    setPhoneAuthStatus(
                        "أدخل رمز التحقق المرسل إلى جوالك.",
                        true
                    );

                    return;
                }

                verifyPhoneOtpButton.disabled =
                    true;

                setPhoneAuthStatus(
                    "جارٍ التحقق من الرمز..."
                );

                try {

                    const {
                        data,
                        error
                    } =
                        await supabaseClient
                            .auth
                            .verifyOtp({

                                phone,

                                token,

                                type:
                                    "sms"
                            });

                    if (error) {
                        throw error;
                    }

                    if (!data?.user) {

                        throw new Error(
                            "تم التحقق من الرمز لكن تعذر تحميل الحساب."
                        );
                    }

                    const profile =
                        await ensureUserProfile(
                            data.user
                        );

                    currentAuthUser =
                        data.user;

                    updateAccountUI(
                        data.user,
                        profile
                    );

                    updateSideMenuUser(
                        data.user,
                        profile
                    );

                    updateSideLogoutVisibility(
                        true
                    );

                    closeLoginModal();

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في التحقق من OTP:",
                        error
                    );

                    setPhoneAuthStatus(
                        error?.message ||
                        "رمز التحقق غير صحيح أو انتهت صلاحيته.",
                        true
                    );

                } finally {

                    verifyPhoneOtpButton.disabled =
                        false;
                }
            }
        );

        // ============================================================
        // الملف الشخصي والقائمة الجانبية
        // ============================================================

        profileLink?.remove();

        let sideLogoutButton =
            document.getElementById(
                "sideLogoutButton"
            );

        if (!sideLogoutButton) {

            const sideNavigation =
                sideMenu?.querySelector(
                    ".side-navigation"
                );

            if (sideNavigation) {

                sideLogoutButton =
                    document.createElement(
                        "a"
                    );

                sideLogoutButton.href =
                    "#";

                sideLogoutButton.id =
                    "sideLogoutButton";

                sideLogoutButton.className =
                    "alqafiyah-side-logout";

                sideLogoutButton.innerHTML = `
                    <span aria-hidden="true">
                        ↪
                    </span>

                    <span>
                        تسجيل الخروج
                    </span>
                `;

                sideNavigation.appendChild(
                    sideLogoutButton
                );
            }
        }

        function updateSideLogoutVisibility(
            isLoggedIn
        ) {

            if (!sideLogoutButton) {
                return;
            }

            sideLogoutButton.style.display =
                isLoggedIn
                ? ""
                : "none";
        }

        sideLogoutButton?.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();

                closeSideMenu();

                await logoutUser();
            }
        );

        function handleSideUserClick() {

            closeSideMenu();

            if (currentAuthUser) {

                window.location.href =
                    "profile.html";

                return;
            }

            openLoginModal();
        }

        const sideUserAreas = [
            document.querySelector(
                ".user-section"
            ),
            document.querySelector(
                ".side-menu-user"
            )
        ].filter(Boolean);

        [
            ...new Set(
                sideUserAreas
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
                    handleSideUserClick
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

                            handleSideUserClick();
                        }
                    }
                );
            }
        );

        // ============================================================
        // تحديث الحساب
        // ============================================================

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
                    data?.session?.user ||
                    null;

                let profile =
                    null;

                if (user) {

                    profile =
                        await ensureUserProfile(
                            user
                        );
                }

                currentAuthUser =
                    user;

                updateAccountUI(
                    user,
                    profile
                );

                updateSideMenuUser(
                    user,
                    profile
                );

                updateSideLogoutVisibility(
                    Boolean(user)
                );

                return {
                    user,
                    profile
                };

            } catch (error) {

                console.error(
                    "القافيه: خطأ في تحميل الحساب:",
                    error
                );

                currentAuthUser =
                    null;

                updateAccountUI(
                    null,
                    null
                );

                updateSideMenuUser(
                    null,
                    null
                );

                updateSideLogoutVisibility(
                    false
                );

                return {
                    user:
                        null,

                    profile:
                        null
                };
            }
        }

        // ============================================================
        // مراقبة تغييرات Auth
        // ============================================================

        supabaseClient
            .auth
            .onAuthStateChange(
                function (event) {

                    console.log(
                        "القافيه - Auth Event:",
                        event
                    );

                    if (
                        event ===
                        "SIGNED_IN" ||

                        event ===
                        "SIGNED_OUT" ||

                        event ===
                        "INITIAL_SESSION" ||

                        event ===
                        "USER_UPDATED"
                    ) {

                        setTimeout(
                            refreshAccount,
                            0
                        );
                    }
                }
            );

        // ============================================================
        // الإشعارات
        // ============================================================

        if (notificationCount) {

            notificationCount.textContent =
                "0";

            notificationCount.style.display =
                "none";
        }

        // ============================================================
        // أيام الميلاد - التسجيل
        // ============================================================

        const birthDay =
            document.getElementById(
                "birthDay"
            );

        if (
            birthDay &&
            birthDay.options.length === 1
        ) {

            for (
                let day = 1;
                day <= 31;
                day++
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    day;

                option.textContent =
                    day;

                birthDay.appendChild(
                    option
                );
            }
        }

        // ============================================================
        // سنوات الميلاد - التسجيل
        // ============================================================

        const birthYear =
            document.getElementById(
                "birthYear"
            );

        if (
            birthYear &&
            birthYear.options.length === 1
        ) {

            const currentYear =
                new Date()
                    .getFullYear();

            for (
                let year =
                    currentYear;
                year >= 1900;
                year--
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    year;

                option.textContent =
                    year;

                birthYear.appendChild(
                    option
                );
            }
        }

        // ============================================================
        // صفحة الملف الشخصي
        // ============================================================

        if (
            document.querySelector(
                ".profile-page"
            )
        ) {

            try {

                await initializeProfilePage(
                    logoutUser
                );

            } catch (error) {

                console.error(
                    "القافيه: خطأ في صفحة الملف الشخصي:",
                    error
                );
            }
        }

        // ============================================================
        // زر Escape
        // ============================================================

        document.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key ===
                    "Escape"
                ) {

                    closeSideMenu();

                    closeNotifications();

                    closeLoginModal();

                    accountDropdown?.classList.remove(
                        "open"
                    );
                }
            }
        );

        // ============================================================
        // التشغيل الأول
        // ============================================================

        await refreshAccount();

        console.log(
            "القافيه - الواجهة ونظام الحساب جاهزان للعمل."
        );
    }

    // ============================================================
    // صفحة الملف الشخصي
    // ============================================================

    async function initializeProfilePage(
        logoutUser
    ) {

        // ============================================================
        // عناصر الصفحة
        // ============================================================

        const profileAvatar =
            document.getElementById(
                "profileAvatar"
            );

        const avatarInput =
            document.getElementById(
                "avatarInput"
            );

        const deleteAvatarButton =
            document.getElementById(
                "deleteAvatarButton"
            );

        const profileForm =
            document.getElementById(
                "profileForm"
            );

        const firstName =
            document.getElementById(
                "profileFirstName"
            );

        const lastName =
            document.getElementById(
                "profileLastName"
            );

        const email =
            document.getElementById(
                "profileEmailDetails"
            );

        const phone =
            document.getElementById(
                "profilePhone"
            );

        const birthDay =
            document.getElementById(
                "profileBirthDay"
            );

        const birthMonth =
            document.getElementById(
                "profileBirthMonth"
            );

        const birthYear =
            document.getElementById(
                "profileBirthYear"
            );

        const gender =
            document.getElementById(
                "profileGender"
            );

        const saveButton =
            document.getElementById(
                "saveProfileButton"
            );

        let logoutButton =
            document.getElementById(
                "logoutButton"
            );

        if (
            !logoutButton &&
            saveButton?.parentElement
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

            saveButton.insertAdjacentElement(
                "afterend",
                logoutButton
            );
        }

        const message =
            document.getElementById(
                "profileMessage"
            );

        // ============================================================
        // التأكد من Supabase
        // ============================================================

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "القافيه: supabaseClient غير موجود في صفحة الملف الشخصي."
            );

            return;
        }

        // ============================================================
        // رسائل الصفحة
        // ============================================================

        function showMessage(
            text,
            isError = false
        ) {

            if (!message) {
                return;
            }

            message.textContent =
                text;

            message.classList.toggle(
                "error",
                isError
            );
        }

        // ============================================================
        // الأيقونة الافتراضية
        // ============================================================

        function defaultIcon() {
            return `
                <svg
                    xmlns="http://www.w3.org/2000/svg"
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
        // عرض الصورة الشخصية
        // ============================================================

        function setAvatar(
            url
        ) {

            if (!profileAvatar) {
                return;
            }

            profileAvatar.innerHTML =
                "";

            if (url) {

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
                            defaultIcon();
                    };

                profileAvatar.appendChild(
                    image
                );

            } else {

                profileAvatar.innerHTML =
                    defaultIcon();
            }
        }

        // ============================================================
        // أيام الميلاد
        // ============================================================

        if (
            birthDay &&
            birthDay.options.length === 1
        ) {

            for (
                let day = 1;
                day <= 31;
                day++
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    day;

                option.textContent =
                    day;

                birthDay.appendChild(
                    option
                );
            }
        }

        // ============================================================
        // سنوات الميلاد
        // ============================================================

        if (
            birthYear &&
            birthYear.options.length === 1
        ) {

            const currentYear =
                new Date()
                    .getFullYear();

            for (
                let year =
                    currentYear;
                year >= 1900;
                year--
            ) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    year;

                option.textContent =
                    year;

                birthYear.appendChild(
                    option
                );
            }
        }

        // ============================================================
        // المستخدم الحالي
        // ============================================================

        const {
            data,
            error
        } =
            await supabaseClient
                .auth
                .getSession();

        if (
            error ||
            !data?.session?.user
        ) {

            window.location.replace(
                "index.html"
            );

            return;
        }

        const user =
            data.session.user;

        // ============================================================
        // تسجيل الخروج
        // ============================================================

        logoutButton?.addEventListener(
            "click",
            async function () {

                logoutButton.disabled =
                    true;

                try {

                    await logoutUser();

                } finally {

                    logoutButton.disabled =
                        false;
                }
            }
        );

        // ============================================================
        // البريد الإلكتروني
        // ============================================================

        if (email) {

            email.value =
                user.email ||
                "";
        }

        // ============================================================
        // تحميل بيانات Profile
        // ============================================================

        const {
            data:
                profile,
            error:
                profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq(
                    "id",
                    user.id
                )
                .maybeSingle();

        if (profileError) {

            console.error(
                "القافيه: خطأ في تحميل الملف:",
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

        // ============================================================
        // تعبئة البيانات
        // ============================================================

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

        // ============================================================
        // عرض الصورة
        // ============================================================

        setAvatar(
            profile.avatar_url
        );

        // ============================================================
        // حفظ الملف الشخصي
        // ============================================================

        profileForm?.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                if (saveButton) {

                    saveButton.disabled =
                        true;
                }

                showMessage(
                    "جارٍ حفظ التغييرات..."
                );

                try {

                    // ------------------------------------------------
                    // التحقق من الحقول
                    // ------------------------------------------------

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

                    // ------------------------------------------------
                    // تحديث البيانات
                    // ------------------------------------------------

                    const {
                        error
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({

                                first_name:
                                    firstName
                                        .value
                                        .trim(),

                                last_name:
                                    lastName
                                        .value
                                        .trim() ||
                                    null,

                                birth_day:
                                    Number(
                                        birthDay.value
                                    ),

                                birth_month:
                                    Number(
                                        birthMonth.value
                                    ),

                                birth_year:
                                    Number(
                                        birthYear.value
                                    ),

                                gender:
                                    gender.value,

                                phone:
                                    phone
                                        ?.value
                                        .trim() ||
                                    null
                            })
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
                        "القافيه: خطأ في حفظ الملف:",
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

        // ============================================================
        // رفع / تغيير الصورة الشخصية
        // ============================================================

        avatarInput?.addEventListener(
            "change",
            async function () {

                const file =
                    avatarInput
                        .files?.[0];

                if (!file) {
                    return;
                }

                // ----------------------------------------------------
                // أنواع الصور المسموحة
                // ----------------------------------------------------

                const allowedTypes = [
                    "image/jpeg",
                    "image/png",
                    "image/webp"
                ];

                if (
                    !allowedTypes.includes(
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

                // ----------------------------------------------------
                // الحد الأقصى 5MB
                // ----------------------------------------------------

                if (
                    file.size >
                    5 * 1024 * 1024
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

                    // ------------------------------------------------
                    // مسار الصورة
                    // ------------------------------------------------

                    const filePath =
                        `${user.id}/profile.jpg`;

                    // ------------------------------------------------
                    // رفع الصورة
                    // ------------------------------------------------

                    const {
                        error:
                            uploadError
                    } =
                        await supabaseClient
                            .storage
                            .from("avatars")
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

                    if (uploadError) {
                        throw uploadError;
                    }

                    // ------------------------------------------------
                    // الحصول على الرابط العام
                    // ------------------------------------------------

                    const {
                        data:
                            publicData
                    } =
                        supabaseClient
                            .storage
                            .from("avatars")
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

                    // ------------------------------------------------
                    // منع ظهور نسخة قديمة من Cache
                    // ------------------------------------------------

                    const publicUrl =
                        `${publicData.publicUrl}?t=${Date.now()}`;

                    // ------------------------------------------------
                    // حفظ الرابط في Profile
                    // ------------------------------------------------

                    const {
                        error:
                            updateError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({

                                avatar_url:
                                    publicUrl
                            })
                            .eq(
                                "id",
                                user.id
                            );

                    if (updateError) {
                        throw updateError;
                    }

                    // ------------------------------------------------
                    // عرض الصورة مباشرة
                    // ------------------------------------------------

                    setAvatar(
                        publicUrl
                    );

                    showMessage(
                        "تم تحديث الصورة الشخصية بنجاح."
                    );

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في رفع/تغيير الصورة:",
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

        // ============================================================
        // حذف الصورة الشخصية
        // ============================================================

        deleteAvatarButton?.addEventListener(
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

                    // ------------------------------------------------
                    // مسار الصورة
                    // ------------------------------------------------

                    const filePath =
                        `${user.id}/profile.jpg`;

                    // ------------------------------------------------
                    // حذف الصورة من Storage
                    // ------------------------------------------------

                    const {
                        error:
                            removeError
                    } =
                        await supabaseClient
                            .storage
                            .from("avatars")
                            .remove([
                                filePath
                            ]);

                    if (removeError) {
                        throw removeError;
                    }

                    // ------------------------------------------------
                    // حذف الرابط من Profile
                    // ------------------------------------------------

                    const {
                        error:
                            updateError
                    } =
                        await supabaseClient
                            .from("profiles")
                            .update({

                                avatar_url:
                                    null
                            })
                            .eq(
                                "id",
                                user.id
                            );

                    if (updateError) {
                        throw updateError;
                    }

                    // ------------------------------------------------
                    // إعادة الأيقونة الافتراضية
                    // ------------------------------------------------

                    setAvatar(
                        null
                    );

                    showMessage(
                        "تم حذف الصورة الشخصية بنجاح."
                    );

                } catch (error) {

                    console.error(
                        "القافيه: خطأ في حذف الصورة:",
                        error
                    );

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