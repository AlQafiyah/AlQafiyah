// ============================================================
// قافية - النظام الرئيسي
// Supabase Auth + Profiles + Account UI + Menu + Notifications
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {

    // ========================================================
    // العناصر الأساسية
    // ========================================================

    const menuButton = document.getElementById("menuButton");
    const sideMenu = document.getElementById("sideMenu");
    const closeMenuButton = document.getElementById("closeMenuButton");
    const menuOverlay = document.getElementById("menuOverlay");

    const notificationButton =
        document.getElementById("notificationButton");

    const notificationPanel =
        document.getElementById("notificationPanel");

    const notificationCount =
        document.getElementById("notificationCount");

    const closeNotificationButton =
        document.getElementById("closeNotificationButton");

    const loginButton =
        document.getElementById("loginButton");

    const loginModal =
        document.getElementById("loginModal");

    const closeLoginButton =
        document.getElementById("closeLoginButton");

    const loginForm =
        document.getElementById("loginForm");

    const registerForm =
        document.getElementById("registerForm");

    const showRegisterButton =
        document.getElementById("showRegisterButton");

    const showLoginButton =
        document.getElementById("showLoginButton");

    const profileLink =
        document.getElementById("profileLink");

    const favoritesLink =
        document.getElementById("favoritesLink");

    const settingsLink =
        document.getElementById("settingsLink");


    // ========================================================
    // أدوات مساعدة
    // ========================================================

    function getCurrentPage() {
        return window.location.pathname.split("/").pop().toLowerCase();
    }


    function showElement(element) {
        if (element) {
            element.style.display = "";
        }
    }


    function hideElement(element) {
        if (element) {
            element.style.display = "none";
        }
    }


    function escapeHtml(value) {
        const div = document.createElement("div");
        div.textContent = value ?? "";
        return div.innerHTML;
    }


    // ========================================================
    // القائمة الجانبية
    // ========================================================

    function openSideMenu() {
        if (sideMenu) {
            sideMenu.classList.add("active");
        }

        if (menuOverlay) {
            menuOverlay.classList.add("active");
        }

        document.body.classList.add("menu-open");
    }


    function closeSideMenu() {
        if (sideMenu) {
            sideMenu.classList.remove("active");
        }

        if (menuOverlay) {
            menuOverlay.classList.remove("active");
        }

        document.body.classList.remove("menu-open");
    }


    if (menuButton) {
        menuButton.addEventListener("click", openSideMenu);
    }


    if (closeMenuButton) {
        closeMenuButton.addEventListener("click", closeSideMenu);
    }


    if (menuOverlay) {
        menuOverlay.addEventListener("click", closeSideMenu);
    }


    // ========================================================
    // الإشعارات
    // ========================================================

    function openNotifications() {
        if (notificationPanel) {
            notificationPanel.classList.add("active");
        }
    }


    function closeNotifications() {
        if (notificationPanel) {
            notificationPanel.classList.remove("active");
        }
    }


    if (notificationButton) {
        notificationButton.addEventListener(
            "click",
            openNotifications
        );
    }


    if (closeNotificationButton) {
        closeNotificationButton.addEventListener(
            "click",
            closeNotifications
        );
    }


    // ========================================================
    // نافذة تسجيل الدخول
    // ========================================================

    function openLoginModal() {
        if (loginModal) {
            loginModal.classList.add("active");
            loginModal.style.display = "flex";
        }
    }


    function closeLoginModal() {
        if (loginModal) {
            loginModal.classList.remove("active");
            loginModal.style.display = "none";
        }
    }


    if (loginButton) {
        loginButton.addEventListener(
            "click",
            openLoginModal
        );
    }


    if (closeLoginButton) {
        closeLoginButton.addEventListener(
            "click",
            closeLoginModal
        );
    }


    if (loginModal) {
        loginModal.addEventListener("click", (event) => {
            if (event.target === loginModal) {
                closeLoginModal();
            }
        });
    }


    // ========================================================
    // التبديل بين تسجيل الدخول وإنشاء الحساب
    // ========================================================

    function showRegister() {
        if (loginForm) {
            loginForm.style.display = "none";
        }

        if (registerForm) {
            registerForm.style.display = "block";
        }
    }


    function showLogin() {
        if (registerForm) {
            registerForm.style.display = "none";
        }

        if (loginForm) {
            loginForm.style.display = "block";
        }
    }


    if (showRegisterButton) {
        showRegisterButton.addEventListener(
            "click",
            showRegister
        );
    }


    if (showLoginButton) {
        showLoginButton.addEventListener(
            "click",
            showLogin
        );
    }


    // ========================================================
    // إنشاء عناصر الحساب في الهيدر
    // ========================================================

    let accountArea = document.getElementById("accountArea");

    if (!accountArea && loginButton) {

        accountArea = document.createElement("div");

        accountArea.id = "accountArea";
        accountArea.className = "qafiyah-account-area";

        loginButton.parentNode.insertBefore(
            accountArea,
            loginButton
        );

        hideElement(accountArea);
    }


    // ========================================================
    // قائمة الحساب
    // ========================================================

    let accountDropdown =
        document.getElementById("accountDropdown");


    function createAccountDropdown() {

        if (accountDropdown) {
            return;
        }

        accountDropdown =
            document.createElement("div");

        accountDropdown.id =
            "accountDropdown";

        accountDropdown.className =
            "qafiyah-account-dropdown";

        accountDropdown.innerHTML = `
            <button type="button" id="accountProfileButton">
                الملف الشخصي
            </button>

            <button type="button" id="accountLogoutButton">
                تسجيل الخروج
            </button>
        `;

        document.body.appendChild(accountDropdown);


        const accountProfileButton =
            document.getElementById(
                "accountProfileButton"
            );


        const accountLogoutButton =
            document.getElementById(
                "accountLogoutButton"
            );


        accountProfileButton.addEventListener(
            "click",
            () => {
                window.location.href = "profile.html";
            }
        );


        accountLogoutButton.addEventListener(
            "click",
            async () => {
                await logoutUser();
            }
        );
    }


    createAccountDropdown();


    // ========================================================
    // فتح وإغلاق قائمة الحساب
    // ========================================================

    document.addEventListener("click", (event) => {

        const avatar =
            document.getElementById("headerAccountAvatar");

        if (!avatar || !accountDropdown) {
            return;
        }

        if (
            avatar.contains(event.target) ||
            accountDropdown.contains(event.target)
        ) {
            return;
        }

        accountDropdown.classList.remove("active");
    });


    // ========================================================
    // إنشاء أيقونة المستخدم الافتراضية
    // ========================================================

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

                <circle cx="12" cy="8" r="4"></circle>

                <path
                    d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7">
                </path>

            </svg>
        `;
    }


    // ========================================================
    // تحديث واجهة الحساب
    // ========================================================

    function updateAccountUI(user, profile) {

        if (!accountArea || !loginButton) {
            return;
        }


        if (!user) {

            hideElement(accountArea);
            showElement(loginButton);

            if (accountDropdown) {
                accountDropdown.classList.remove("active");
            }

            return;
        }


        hideElement(loginButton);
        showElement(accountArea);


        accountArea.innerHTML = `
            <button
                type="button"
                id="headerAccountAvatar"
                class="qafiyah-header-avatar"
                aria-label="حسابي">

                ${
                    profile?.avatar_url
                        ? `
                            <img
                                src="${escapeHtml(profile.avatar_url)}"
                                alt="الصورة الشخصية">
                          `
                        : defaultUserIcon()
                }

            </button>
        `;


        const avatar =
            document.getElementById(
                "headerAccountAvatar"
            );


        if (avatar) {

            avatar.addEventListener(
                "click",
                (event) => {

                    event.stopPropagation();

                    accountDropdown.classList.toggle(
                        "active"
                    );

                    const rect =
                        avatar.getBoundingClientRect();

                    accountDropdown.style.top =
                        `${rect.bottom + 10}px`;

                    accountDropdown.style.right =
                        `${Math.max(
                            10,
                            window.innerWidth - rect.right
                        )}px`;
                }
            );
        }
    }


    // ========================================================
    // تحديث معلومات المستخدم داخل القائمة الجانبية
    // ========================================================

    function updateSideMenuUser(user, profile) {

        const menuUserName =
            document.getElementById(
                "menuUserName"
            );

        const menuUserEmail =
            document.getElementById(
                "menuUserEmail"
            );

        const menuUserAvatar =
            document.querySelector(
                ".side-menu .user-avatar"
            );


        if (!user) {

            if (menuUserName) {
                menuUserName.textContent =
                    "مرحبًا بك";
            }

            if (menuUserEmail) {
                menuUserEmail.textContent =
                    "سجّل الدخول للمتابعة";
            }

            if (menuUserAvatar) {
                menuUserAvatar.innerHTML =
                    defaultUserIcon();
            }

            return;
        }


        const fullName =
            [
                profile?.first_name,
                profile?.last_name
            ]
                .filter(Boolean)
                .join(" ")
                .trim();


        if (menuUserName) {
            menuUserName.textContent =
                fullName ||
                user.email ||
                "المستخدم";
        }


        if (menuUserEmail) {
            menuUserEmail.textContent =
                user.email || "";
        }


        if (menuUserAvatar) {

            menuUserAvatar.innerHTML =
                profile?.avatar_url
                    ? `
                        <img
                            src="${escapeHtml(profile.avatar_url)}"
                            alt="الصورة الشخصية">
                      `
                    : defaultUserIcon();
        }
    }


    // ========================================================
    // جلب بيانات الملف الشخصي
    // ========================================================

    async function getProfile(userId) {

        if (!userId) {
            return null;
        }


        const {
            data,
            error
        } = await supabaseClient
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .maybeSingle();


        if (error) {

            console.error(
                "خطأ في جلب الملف الشخصي:",
                error
            );

            return null;
        }


        return data;
    }


    // ========================================================
    // إنشاء ملف شخصي إذا لم يكن موجودًا
    // ========================================================

    async function ensureProfile(user) {

        if (!user) {
            return null;
        }


        let profile =
            await getProfile(user.id);


        if (profile) {
            return profile;
        }


        /*
         * الحسابات التي تأتي من OAuth قد لا تملك
         * بيانات الملف الإضافية بعد.
         *
         * لذلك لا ننشئ سجلًا ناقصًا هنا لأن حقول
         * profiles الأساسية حاليًا غير قابلة لـ NULL.
         *
         * سيتم إنشاء الملف عند اكتمال بيانات التسجيل.
         */

        return null;
    }


    // ========================================================
    // تسجيل مستخدم جديد
    // ========================================================

    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const firstName =
                    document.getElementById(
                        "firstName"
                    )?.value.trim();


                const lastName =
                    document.getElementById(
                        "lastName"
                    )?.value.trim();


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
                    document.getElementById(
                        "emailRegister"
                    )?.value.trim();


                const password =
                    document.getElementById(
                        "passwordRegister"
                    )?.value;


                const confirmPassword =
                    document.getElementById(
                        "confirmPasswordRegister"
                    )?.value;


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


                if (password !== confirmPassword) {

                    alert(
                        "كلمتا المرور غير متطابقتين."
                    );

                    return;
                }


                if (password.length < 6) {

                    alert(
                        "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                    );

                    return;
                }


                const submitButton =
                    document.getElementById(
                        "registerSubmitButton"
                    );


                if (submitButton) {
                    submitButton.disabled = true;
                }


                try {

                    const {
                        data,
                        error
                    } = await supabaseClient.auth.signUp({
                        email,
                        password
                    });


                    if (error) {
                        throw error;
                    }


                    if (!data.user) {
                        throw new Error(
                            "تعذر إنشاء الحساب."
                        );
                    }


                    /*
                     * مع تأكيد البريد معطل،
                     * يجب أن تكون الجلسة موجودة عادة.
                     */

                    const {
                        error: profileError
                    } = await supabaseClient
                        .from("profiles")
                        .insert({
                            id: data.user.id,
                            first_name: firstName,
                            last_name: lastName || null,
                            birth_day: Number(birthDay),
                            birth_month: Number(birthMonth),
                            birth_year: Number(birthYear),
                            gender,
                            phone: null,
                            avatar_url: null
                        });


                    if (profileError) {
                        throw profileError;
                    }


                    alert(
                        "تم إنشاء حسابك بنجاح."
                    );


                    await refreshAccount();


                    closeLoginModal();

                } catch (error) {

                    console.error(
                        "خطأ في إنشاء الحساب:",
                        error
                    );


                    alert(
                        error.message ||
                        "حدث خطأ أثناء إنشاء الحساب."
                    );

                } finally {

                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }
            }
        );
    }


    // ========================================================
    // تسجيل الدخول
    // ========================================================

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async (event) => {

                event.preventDefault();


                const email =
                    document.getElementById(
                        "emailLogin"
                    )?.value.trim();


                const password =
                    document.getElementById(
                        "passwordLogin"
                    )?.value;


                if (!email || !password) {

                    alert(
                        "أدخل البريد الإلكتروني وكلمة المرور."
                    );

                    return;
                }


                const submitButton =
                    document.getElementById(
                        "emailLoginButton"
                    );


                if (submitButton) {
                    submitButton.disabled = true;
                }


                try {

                    const {
                        error
                    } = await supabaseClient.auth.signInWithPassword({
                        email,
                        password
                    });


                    if (error) {
                        throw error;
                    }


                    await refreshAccount();

                    closeLoginModal();

                } catch (error) {

                    console.error(
                        "خطأ في تسجيل الدخول:",
                        error
                    );


                    alert(
                        error.message ||
                        "البريد الإلكتروني أو كلمة المرور غير صحيحة."
                    );

                } finally {

                    if (submitButton) {
                        submitButton.disabled = false;
                    }
                }
            }
        );
    }


    // ========================================================
    // تسجيل Apple
    // ========================================================

    const appleLoginButton =
        document.getElementById(
            "appleLoginButton"
        );


    if (appleLoginButton) {

        appleLoginButton.addEventListener(
            "click",
            async () => {

                try {

                    const {
                        error
                    } = await supabaseClient.auth.signInWithOAuth({
                        provider: "apple",
                        options: {
                            redirectTo:
                                window.location.origin +
                                "/profile.html"
                        }
                    });


                    if (error) {
                        throw error;
                    }

                } catch (error) {

                    console.error(
                        "خطأ في تسجيل Apple:",
                        error
                    );


                    alert(
                        error.message ||
                        "تعذر تسجيل الدخول باستخدام Apple."
                    );
                }
            }
        );
    }


    // ========================================================
    // تسجيل الخروج
    // ========================================================

    async function logoutUser() {

        try {

            const {
                error
            } = await supabaseClient.auth.signOut();


            if (error) {
                throw error;
            }


            if (accountDropdown) {
                accountDropdown.classList.remove("active");
            }


            await refreshAccount();


            if (
                getCurrentPage() ===
                "profile.html"
            ) {

                window.location.href =
                    "index.html";
            }

        } catch (error) {

            console.error(
                "خطأ في تسجيل الخروج:",
                error
            );


            alert(
                error.message ||
                "تعذر تسجيل الخروج."
            );
        }
    }


    // ========================================================
    // رابط الملف الشخصي
    // ========================================================

    if (profileLink) {

        profileLink.addEventListener(
            "click",
            (event) => {

                event.preventDefault();

                window.location.href =
                    "profile.html";
            }
        );
    }


    // ========================================================
    // قسم المستخدم أعلى القائمة الجانبية
    // ========================================================

    const userSection =
        document.querySelector(
            ".user-section"
        );


    if (userSection) {

        userSection.style.cursor = "pointer";

        userSection.addEventListener(
            "click",
            () => {

                window.location.href =
                    "profile.html";
            }
        );
    }


    // ========================================================
    // تحميل الحساب الحالي
    // ========================================================

    async function refreshAccount() {

        try {

            const {
                data,
                error
            } = await supabaseClient.auth.getUser();


            if (error) {
                throw error;
            }


            const user =
                data?.user || null;


            let profile = null;


            if (user) {

                profile =
                    await ensureProfile(user);
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
                "خطأ في تحميل الحساب:",
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


    // ========================================================
    // مراقبة حالة تسجيل الدخول
    // ========================================================

    supabaseClient.auth.onAuthStateChange(
        async (event, session) => {

            if (
                event === "SIGNED_IN" ||
                event === "SIGNED_OUT" ||
                event === "INITIAL_SESSION" ||
                event === "USER_UPDATED"
            ) {

                setTimeout(
                    () => {
                        refreshAccount();
                    },
                    0
                );
            }
        }
    );


    // ========================================================
    // الإشعارات - العدد
    // ========================================================

    async function loadNotificationCount() {

        if (!notificationCount) {
            return;
        }


        try {

            const {
                count,
                error
            } = await supabaseClient
                .from("notifications")
                .select(
                    "id",
                    {
                        count: "exact",
                        head: true
                    }
                )
                .eq(
                    "is_read",
                    false
                );


            if (error) {
                throw error;
            }


            notificationCount.textContent =
                count || 0;


        } catch (error) {

            console.error(
                "خطأ في الإشعارات:",
                error
            );
        }
    }


    // ========================================================
    // تعبئة السنوات
    // ========================================================

    const birthYear =
        document.getElementById(
            "birthYear"
        );


    if (birthYear && birthYear.options.length <= 1) {

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

            option.value = year;
            option.textContent = year;

            birthYear.appendChild(option);
        }
    }


    // ========================================================
    // تعبئة الأيام
    // ========================================================

    const birthDay =
        document.getElementById(
            "birthDay"
        );


    if (birthDay && birthDay.options.length <= 1) {

        for (
            let day = 1;
            day <= 31;
            day++
        ) {

            const option =
                document.createElement(
                    "option"
                );

            option.value = day;
            option.textContent = day;

            birthDay.appendChild(option);
        }
    }


    // ========================================================
    // إغلاق الأشياء عند الضغط على Escape
    // ========================================================

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key !== "Escape") {
                return;
            }

            closeSideMenu();
            closeNotifications();
            closeLoginModal();

            if (accountDropdown) {
                accountDropdown.classList.remove(
                    "active"
                );
            }
        }
    );


    // ========================================================
    // تشغيل النظام
    // ========================================================

    await refreshAccount();

    await loadNotificationCount();


    console.log(
        "قافية - الواجهة ونظام الحساب جاهزان للعمل."
    );

});