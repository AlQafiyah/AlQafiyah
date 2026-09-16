// ============================================================
// قافية - النظام الرئيسي
// Supabase Auth + Profiles + Account UI + Menu + Notifications
// Profile + Avatar Management
// ============================================================

(function () {

    "use strict";


    // ============================================================
    // منع تشغيل السكربت أكثر من مرة
    // ============================================================

    if (window.__QAFIYAH_SCRIPT_STARTED__) {
        return;
    }

    window.__QAFIYAH_SCRIPT_STARTED__ = true;


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

        const div =
            document.createElement("div");

        div.textContent =
            value ?? "";

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
    // بدء النظام
    // ============================================================

    document.addEventListener(
        "DOMContentLoaded",
        initQafiyah
    );


    // ============================================================
    // النظام الرئيسي
    // ============================================================

    async function initQafiyah() {

        console.log(
            "قافية: بدء تشغيل النظام..."
        );


        // ========================================================
        // التأكد من Supabase
        // ========================================================

        if (
            typeof supabaseClient ===
            "undefined"
        ) {

            console.error(
                "قافية: supabaseClient غير موجود."
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
                    "قافية: خطأ في جلب profiles:",
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


                updateAccountUI(
                    null,
                    null
                );


                updateSideMenuUser(
                    null,
                    null
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
                    "قافية: خطأ في تسجيل الخروج:",
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
                        profile?.avatar_url
                            ? `

                                <img
                                    src="${escapeHtml(
                                        profile.avatar_url
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
                    "المستخدم";
            }


            if (email) {

                email.textContent =
                    user.email ||
                    "";
            }


            // --------------------------------------------------------
            // صورة المستخدم
            // --------------------------------------------------------

            if (avatar) {

                avatar.innerHTML =
                    profile?.avatar_url
                        ? `

                            <img
                                src="${escapeHtml(
                                    profile.avatar_url
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
                    "قافية: فشل إنشاء profiles:",
                    error
                );

                throw error;
            }


            console.log(
                "قافية: تم إنشاء profiles بنجاح."
            );
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

                    updateAccountUI(
                        user,
                        profile
                    );


                    updateSideMenuUser(
                        user,
                        profile
                    );


                    closeLoginModal();


                    alert(
                        "تم إنشاء حسابك وتسجيل الدخول بنجاح."
                    );


                } catch (error) {

                    console.error(
                        "قافية: خطأ في إنشاء الحساب:",
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
                        await getProfile(
                            data.user.id
                        );


                    updateAccountUI(
                        data.user,
                        profile
                    );


                    updateSideMenuUser(
                        data.user,
                        profile
                    );


                    closeLoginModal();


                    console.log(
                        "قافية: تم تسجيل الدخول بنجاح."
                    );


                } catch (error) {

                    console.error(
                        "قافية: خطأ في تسجيل الدخول:",
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
        // تسجيل الدخول بواسطة Apple
        // ============================================================

        const appleLoginButton =
            document.getElementById(
                "appleLoginButton"
            );


        appleLoginButton?.addEventListener(
            "click",
            async function () {

                appleLoginButton.disabled =
                    true;


                try {

                    const {
                        error
                    } =
                        await supabaseClient
                            .auth
                            .signInWithOAuth({

                                provider:
                                    "apple",

                                options: {

                                    redirectTo:
                                        window.location.href

                                }

                            });


                    if (error) {
                        throw error;
                    }


                } catch (error) {

                    console.error(
                        "قافية: خطأ Apple:",
                        error
                    );


                    alert(
                        error?.message ||
                        "تسجيل الدخول باستخدام Apple غير مفعّل حاليًا."
                    );


                } finally {

                    appleLoginButton.disabled =
                        false;
                }
            }
        );


        // ============================================================
        // رابط الملف الشخصي
        // ============================================================

        profileLink?.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                window.location.href =
                    "profile.html";
            }
        );


        // ============================================================
        // منطقة المستخدم في القائمة
        // ============================================================

        document
            .querySelector(
                ".user-section"
            )
            ?.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "profile.html";
                }
            );


        document
            .querySelector(
                ".side-menu-user"
            )
            ?.addEventListener(
                "click",
                function () {

                    window.location.href =
                        "profile.html";
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
                        await getProfile(
                            user.id
                        );
                }


                updateAccountUI(
                    user,
                    profile
                );


                updateSideMenuUser(
                    user,
                    profile
                );


                return {
                    user,
                    profile
                };


            } catch (error) {

                console.error(
                    "قافية: خطأ في تحميل الحساب:",
                    error
                );


                updateAccountUI(
                    null,
                    null
                );


                updateSideMenuUser(
                    null,
                    null
                );


                return {
                    user: null,
                    profile: null
                };
            }
        }


        // ============================================================
        // مراقبة تغييرات Auth
        // ============================================================

        supabaseClient.auth.onAuthStateChange(
            function (event) {

                console.log(
                    "قافية - Auth Event:",
                    event
                );


                if (
                    event === "SIGNED_IN" ||
                    event === "SIGNED_OUT" ||
                    event === "INITIAL_SESSION" ||
                    event === "USER_UPDATED"
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
                new Date().getFullYear();


            for (
                let year = currentYear;
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
                    "قافية: خطأ في صفحة الملف الشخصي:",
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
            "قافية - الواجهة ونظام الحساب جاهزان للعمل."
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


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


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
                "قافية: supabaseClient غير موجود في صفحة الملف الشخصي."
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

        function setAvatar(url) {

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
                new Date().getFullYear();


            for (
                let year = currentYear;
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
        // يوضع مبكرًا حتى يعمل حتى عند حدوث خطأ لاحق
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
            data: profile,
            error: profileError
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
                "قافية: خطأ في تحميل الملف:",
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
                        !firstName?.value.trim() ||
                        !birthDay?.value ||
                        !birthMonth?.value ||
                        !birthYear?.value ||
                        !gender?.value
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
                                    firstName.value.trim(),

                                last_name:
                                    lastName.value.trim() ||
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
                                    phone?.value.trim() ||
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
                        "قافية: خطأ في حفظ الملف:",
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
                    avatarInput.files?.[0];


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
                        error: uploadError
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
                        !publicData?.publicUrl
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
                        "قافية: خطأ في رفع/تغيير الصورة:",
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
                        "قافية: خطأ في حذف الصورة:",
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