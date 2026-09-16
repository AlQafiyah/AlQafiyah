// ================================
// قافية - النظام الرئيسي
// ================================


// ================================
// عناصر القائمة
// ================================

const menuButton = document.getElementById("menuButton");
const sideMenu = document.getElementById("sideMenu");
const closeMenuButton = document.getElementById("closeMenuButton");
const menuOverlay = document.getElementById("menuOverlay");

function openMenu() {
    if (sideMenu) {
        sideMenu.classList.add("open");
        sideMenu.setAttribute("aria-hidden", "false");
    }

    if (menuOverlay) {
        menuOverlay.classList.add("show");
    }

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "true");
    }
}

function closeMenu() {
    if (sideMenu) {
        sideMenu.classList.remove("open");
        sideMenu.setAttribute("aria-hidden", "true");
    }

    if (menuOverlay) {
        menuOverlay.classList.remove("show");
    }

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
    }
}

if (menuButton) {
    menuButton.addEventListener("click", openMenu);
}

if (closeMenuButton) {
    closeMenuButton.addEventListener("click", closeMenu);
}

if (menuOverlay) {
    menuOverlay.addEventListener("click", closeMenu);
}


// ================================
// الإشعارات
// ================================

const notificationButton =
    document.getElementById("notificationButton");

const notificationPanel =
    document.getElementById("notificationPanel");

const notificationCount =
    document.getElementById("notificationCount");

const closeNotificationButton =
    document.getElementById("closeNotificationButton");

function updateNotificationCount(count) {
    if (!notificationCount) return;

    notificationCount.textContent = count;

    notificationCount.style.display =
        count > 0 ? "flex" : "none";
}

if (notificationButton) {
    notificationButton.addEventListener("click", () => {
        if (notificationPanel) {
            notificationPanel.classList.toggle("show");
        }
    });
}

if (closeNotificationButton) {
    closeNotificationButton.addEventListener("click", () => {
        if (notificationPanel) {
            notificationPanel.classList.remove("show");
        }
    });
}

updateNotificationCount(0);


// ================================
// نافذة الحساب
// ================================

const loginButton =
    document.getElementById("loginButton");

const loginModal =
    document.getElementById("loginModal");

const closeLoginButton =
    document.getElementById("closeLoginButton");

function openLoginModal() {
    if (!loginModal) return;

    loginModal.classList.add("show");
    loginModal.setAttribute("aria-hidden", "false");
}

function closeLoginModalFunction() {
    if (!loginModal) return;

    loginModal.classList.remove("show");
    loginModal.setAttribute("aria-hidden", "true");
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
        closeLoginModalFunction
    );
}

if (loginModal) {
    loginModal.addEventListener("click", (event) => {
        if (event.target === loginModal) {
            closeLoginModalFunction();
        }
    });
}


// ================================
// تبديل تسجيل الدخول / إنشاء الحساب
// ================================

const loginForm =
    document.getElementById("loginForm");

const registerForm =
    document.getElementById("registerForm");

const showRegisterButton =
    document.getElementById("showRegisterButton");

const showLoginButton =
    document.getElementById("showLoginButton");

function showRegisterForm() {
    if (loginForm) {
        loginForm.style.display = "none";
    }

    if (registerForm) {
        registerForm.style.display = "block";
    }
}

function showLoginForm() {
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
        showRegisterForm
    );
}

if (showLoginButton) {
    showLoginButton.addEventListener(
        "click",
        showLoginForm
    );
}


// ================================
// تجهيز أيام الميلاد
// ================================

const birthDay =
    document.getElementById("birthDay");

if (birthDay && birthDay.options.length <= 1) {
    for (let day = 1; day <= 31; day++) {
        const option =
            document.createElement("option");

        option.value = day;
        option.textContent = day;

        birthDay.appendChild(option);
    }
}


// ================================
// تجهيز سنوات الميلاد
// ================================

const birthYear =
    document.getElementById("birthYear");

if (birthYear && birthYear.options.length <= 1) {
    const currentYear =
        new Date().getFullYear();

    for (
        let year = currentYear;
        year >= 1900;
        year--
    ) {
        const option =
            document.createElement("option");

        option.value = year;
        option.textContent = year;

        birthYear.appendChild(option);
    }
}


// ================================
// بيانات إنشاء الحساب
// ================================

const firstName =
    document.getElementById("firstName");

const lastName =
    document.getElementById("lastName");

const birthMonth =
    document.getElementById("birthMonth");

const gender =
    document.getElementById("gender");

const emailRegister =
    document.getElementById("emailRegister");

const passwordRegister =
    document.getElementById("passwordRegister");

const confirmPasswordRegister =
    document.getElementById("confirmPasswordRegister");

const registerSubmitButton =
    document.getElementById("registerSubmitButton");


// ================================
// إنشاء الحساب
// ================================

if (registerSubmitButton) {
    registerSubmitButton.addEventListener(
        "click",
        async () => {

            const firstNameValue =
                firstName
                    ? firstName.value.trim()
                    : "";

            const lastNameValue =
                lastName
                    ? lastName.value.trim()
                    : "";

            const birthDayValue =
                birthDay
                    ? birthDay.value
                    : "";

            const birthMonthValue =
                birthMonth
                    ? birthMonth.value
                    : "";

            const birthYearValue =
                birthYear
                    ? birthYear.value
                    : "";

            const genderValue =
                gender
                    ? gender.value
                    : "";

            const emailValue =
                emailRegister
                    ? emailRegister.value.trim()
                    : "";

            const passwordValue =
                passwordRegister
                    ? passwordRegister.value
                    : "";

            const confirmPasswordValue =
                confirmPasswordRegister
                    ? confirmPasswordRegister.value
                    : "";


            if (!firstNameValue) {
                alert("يرجى إدخال الاسم الأول.");
                return;
            }


            if (
                !birthDayValue ||
                !birthMonthValue ||
                !birthYearValue
            ) {
                alert("يرجى إدخال تاريخ الميلاد كاملًا.");
                return;
            }


            if (!genderValue) {
                alert("يرجى اختيار الجنس.");
                return;
            }


            if (
                !emailValue ||
                !emailValue.includes("@") ||
                !emailValue.includes(".")
            ) {
                alert("يرجى إدخال بريد إلكتروني صحيح.");
                return;
            }


            if (passwordValue.length < 6) {
                alert(
                    "كلمة المرور يجب أن تكون 6 أحرف على الأقل."
                );
                return;
            }


            if (
                passwordValue !==
                confirmPasswordValue
            ) {
                alert(
                    "كلمتا المرور غير متطابقتين."
                );
                return;
            }


            if (
                typeof supabaseClient === "undefined"
            ) {
                alert(
                    "تعذر الاتصال بالنظام. تأكد من ملف supabase.js."
                );
                return;
            }


            registerSubmitButton.disabled = true;

            registerSubmitButton.textContent =
                "جاري إنشاء الحساب...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth.signUp({
                        email: emailValue,
                        password: passwordValue
                    });


                if (error) {
                    console.error(error);

                    alert(
                        "تعذر إنشاء الحساب: " +
                        error.message
                    );

                    return;
                }


                if (!data || !data.user) {
                    alert(
                        "تعذر إنشاء الحساب. لم يتم إنشاء المستخدم."
                    );

                    return;
                }


                const {
                    error: profileError
                } =
                    await supabaseClient
                        .from("profiles")
                        .insert({
                            id: data.user.id,
                            first_name: firstNameValue,
                            last_name:
                                lastNameValue || null,
                            birth_day:
                                Number(birthDayValue),
                            birth_month:
                                Number(birthMonthValue),
                            birth_year:
                                Number(birthYearValue),
                            gender: genderValue,
                            avatar_url: null
                        });


                if (profileError) {
                    console.error(profileError);

                    alert(
                        "تم إنشاء الحساب، لكن تعذر حفظ بيانات الملف الشخصي: " +
                        profileError.message
                    );

                    return;
                }


                alert(
                    "تم إنشاء حسابك بنجاح."
                );


                window.location.href =
                    "profile.html";

            } catch (error) {

                console.error(error);

                alert(
                    "حدث خطأ غير متوقع. حاول مرة أخرى."
                );

            } finally {

                registerSubmitButton.disabled = false;

                registerSubmitButton.textContent =
                    "إنشاء الحساب";
            }
        }
    );
}


// ================================
// تسجيل الدخول
// ================================

const emailLogin =
    document.getElementById("emailLogin");

const passwordLogin =
    document.getElementById("passwordLogin");

const emailLoginButton =
    document.getElementById("emailLoginButton");


if (emailLoginButton) {
    emailLoginButton.addEventListener(
        "click",
        async () => {

            const emailValue =
                emailLogin
                    ? emailLogin.value.trim()
                    : "";

            const passwordValue =
                passwordLogin
                    ? passwordLogin.value
                    : "";


            if (
                !emailValue ||
                !emailValue.includes("@")
            ) {
                alert(
                    "يرجى إدخال بريد إلكتروني صحيح."
                );

                return;
            }


            if (!passwordValue) {
                alert(
                    "يرجى إدخال كلمة المرور."
                );

                return;
            }


            if (
                typeof supabaseClient === "undefined"
            ) {
                alert(
                    "تعذر الاتصال بالنظام. تأكد من ملف supabase.js."
                );

                return;
            }


            emailLoginButton.disabled = true;

            emailLoginButton.textContent =
                "جاري تسجيل الدخول...";


            try {

                const {
                    data,
                    error
                } =
                    await supabaseClient.auth
                        .signInWithPassword({
                            email: emailValue,
                            password: passwordValue
                        });


                if (error) {
                    console.error(error);

                    alert(
                        "تعذر تسجيل الدخول: " +
                        error.message
                    );

                    return;
                }


                if (!data || !data.user) {
                    alert(
                        "تعذر تسجيل الدخول."
                    );

                    return;
                }


                window.location.href =
                    "profile.html";

            } catch (error) {

                console.error(error);

                alert(
                    "حدث خطأ غير متوقع. حاول مرة أخرى."
                );

            } finally {

                emailLoginButton.disabled = false;

                emailLoginButton.textContent =
                    "تسجيل الدخول";
            }
        }
    );
}


// ================================
// تسجيل الدخول باستخدام Apple
// ================================

const appleLoginButton =
    document.getElementById("appleLoginButton");

if (appleLoginButton) {
    appleLoginButton.addEventListener(
        "click",
        async () => {

            if (
                typeof supabaseClient === "undefined"
            ) {
                alert(
                    "تعذر الاتصال بالنظام. تأكد من ملف supabase.js."
                );

                return;
            }


            try {

                const {
                    error
                } =
                    await supabaseClient.auth
                        .signInWithOAuth({
                            provider: "apple",
                            options: {
                                redirectTo:
                                    window.location.origin +
                                    "/profile.html"
                            }
                        });


                if (error) {
                    console.error(error);

                    alert(
                        "تسجيل الدخول باستخدام Apple غير مفعّل حاليًا."
                    );
                }

            } catch (error) {

                console.error(error);

                alert(
                    "حدث خطأ أثناء تسجيل الدخول باستخدام Apple."
                );
            }
        }
    );
}


// ================================
// روابط القائمة
// ================================

const profileLink =
    document.getElementById("profileLink");

const favoritesLink =
    document.getElementById("favoritesLink");

const settingsLink =
    document.getElementById("settingsLink");


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


if (favoritesLink) {
    favoritesLink.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            alert(
                "المفضلة سيتم ربطها في الخطوة القادمة."
            );
        }
    );
}


if (settingsLink) {
    settingsLink.addEventListener(
        "click",
        (event) => {

            event.preventDefault();

            alert(
                "الإعدادات سيتم ربطها في الخطوة القادمة."
            );
        }
    );
}


// ================================
// الملف الشخصي
// ================================

async function loadProfilePage() {

    const profileFullName =
        document.getElementById("profileFullName");

    const profileEmail =
        document.getElementById("profileEmail");

    const profileFirstName =
        document.getElementById("profileFirstName");

    const profileLastName =
        document.getElementById("profileLastName");

    const profileEmailDetails =
        document.getElementById("profileEmailDetails");

    const profileBirthDate =
        document.getElementById("profileBirthDate");

    const profileGender =
        document.getElementById("profileGender");

    const profileAvatar =
        document.getElementById("profileAvatar");

    const logoutButton =
        document.getElementById("logoutButton");


    if (
        !profileFullName &&
        !profileEmail &&
        !profileFirstName &&
        !profileLastName &&
        !profileEmailDetails &&
        !profileBirthDate &&
        !profileGender &&
        !profileAvatar &&
        !logoutButton
    ) {
        return;
    }


    if (
        typeof supabaseClient === "undefined"
    ) {
        console.error(
            "Supabase غير متاح."
        );

        return;
    }


    try {

        const {
            data: sessionData,
            error: sessionError
        } =
            await supabaseClient.auth.getSession();


        if (sessionError) {
            console.error(sessionError);

            window.location.href =
                "index.html";

            return;
        }


        const session =
            sessionData.session;


        if (!session || !session.user) {

            window.location.href =
                "index.html";

            return;
        }


        const user =
            session.user;


        const {
            data: profile,
            error: profileError
        } =
            await supabaseClient
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();


        if (profileError) {
            console.error(profileError);

            alert(
                "تعذر تحميل بيانات الملف الشخصي."
            );

            return;
        }


        const firstNameValue =
            profile.first_name || "";

        const lastNameValue =
            profile.last_name || "";

        const fullName =
            [firstNameValue, lastNameValue]
                .filter(Boolean)
                .join(" ");


        if (profileFullName) {
            profileFullName.textContent =
                fullName || "المستخدم";
        }


        if (profileEmail) {
            profileEmail.textContent =
                user.email || "-";
        }


        if (profileFirstName) {
            profileFirstName.textContent =
                firstNameValue || "-";
        }


        if (profileLastName) {
            profileLastName.textContent =
                lastNameValue || "-";
        }


        if (profileEmailDetails) {
            profileEmailDetails.textContent =
                user.email || "-";
        }


        if (profileBirthDate) {

            const day =
                profile.birth_day;

            const month =
                profile.birth_month;

            const year =
                profile.birth_year;

            if (
                day &&
                month &&
                year
            ) {
                profileBirthDate.textContent =
                    `${day}/${month}/${year}`;
            } else {
                profileBirthDate.textContent =
                    "-";
            }
        }


        if (profileGender) {

            if (profile.gender === "male") {
                profileGender.textContent =
                    "ذكر";
            } else if (
                profile.gender === "female"
            ) {
                profileGender.textContent =
                    "أنثى";
            } else {
                profileGender.textContent =
                    profile.gender || "-";
            }
        }


        if (profileAvatar) {

            if (profile.avatar_url) {

                profileAvatar.innerHTML = "";

                const image =
                    document.createElement("img");

                image.src =
                    profile.avatar_url;

                image.alt =
                    "الصورة الشخصية";

                profileAvatar.appendChild(image);

            } else {

                profileAvatar.textContent =
                    "👤";
            }
        }


        const menuUserName =
            document.getElementById("menuUserName");

        const menuUserEmail =
            document.getElementById("menuUserEmail");

        if (menuUserName) {
            menuUserName.textContent =
                fullName || "المستخدم";
        }

        if (menuUserEmail) {
            menuUserEmail.textContent =
                user.email || "";
        }


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                async () => {

                    logoutButton.disabled =
                        true;

                    logoutButton.textContent =
                        "جاري تسجيل الخروج...";


                    try {

                        const {
                            error
                        } =
                            await supabaseClient.auth
                                .signOut();


                        if (error) {
                            console.error(error);

                            alert(
                                "تعذر تسجيل الخروج: " +
                                error.message
                            );

                            logoutButton.disabled =
                                false;

                            logoutButton.textContent =
                                "تسجيل الخروج";

                            return;
                        }


                        window.location.href =
                            "index.html";

                    } catch (error) {

                        console.error(error);

                        alert(
                            "حدث خطأ أثناء تسجيل الخروج."
                        );

                        logoutButton.disabled =
                            false;

                        logoutButton.textContent =
                            "تسجيل الخروج";
                    }
                }
            );
        }

    } catch (error) {

        console.error(error);

        alert(
            "حدث خطأ أثناء تحميل الملف الشخصي."
        );
    }
}

loadProfilePage();


// ================================
// تحديث حالة الحساب في القائمة
// ================================

async function updateAccountUI() {

    if (
        typeof supabaseClient === "undefined"
    ) {
        return;
    }


    const menuUserName =
        document.getElementById("menuUserName");

    const menuUserEmail =
        document.getElementById("menuUserEmail");

    try {

        const {
            data
        } =
            await supabaseClient.auth.getSession();


        const session =
            data.session;


        if (!session || !session.user) {

            if (menuUserName) {
                menuUserName.textContent =
                    "مرحبًا بك";
            }

            if (menuUserEmail) {
                menuUserEmail.textContent =
                    "سجّل الدخول للوصول إلى حسابك";
            }

            return;
        }


        const user =
            session.user;


        const {
            data: profile
        } =
            await supabaseClient
                .from("profiles")
                .select("first_name,last_name,avatar_url")
                .eq("id", user.id)
                .maybeSingle();


        const fullName =
            profile
                ? [
                    profile.first_name,
                    profile.last_name
                ]
                    .filter(Boolean)
                    .join(" ")
                : "";


        if (menuUserName) {
            menuUserName.textContent =
                fullName || "المستخدم";
        }


        if (menuUserEmail) {
            menuUserEmail.textContent =
                user.email || "";
        }

    } catch (error) {

        console.error(
            "تعذر تحديث بيانات الحساب:",
            error
        );
    }
}

updateAccountUI();


// ================================
// مراقبة حالة تسجيل الدخول
// ================================

if (
    typeof supabaseClient !== "undefined"
) {

    supabaseClient.auth.onAuthStateChange(
        (event, session) => {

            console.log(
                "قافية - حالة الحساب:",
                event,
                session
                    ? session.user.email
                    : "غير مسجل"
            );

            updateAccountUI();
        }
    );
}


// ================================
// Escape
// ================================

document.addEventListener(
    "keydown",
    (event) => {

        if (event.key === "Escape") {

            closeMenu();

            if (notificationPanel) {
                notificationPanel.classList.remove("show");
            }

            closeLoginModalFunction();
        }
    }
);


// ================================
// جاهزية النظام
// ================================

console.log(
    "قافية - نظام الحسابات والواجهة جاهز."
);