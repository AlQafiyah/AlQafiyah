// ================================
// قافية - النظام الأساسي للواجهة
// ================================


// ================================
// عناصر الصفحة
// ================================

const menuButton = document.getElementById("menuButton");
const closeMenuButton = document.getElementById("closeMenuButton");
const menuOverlay = document.getElementById("menuOverlay");
const sideMenu = document.getElementById("sideMenu");

const notificationButton = document.getElementById("notificationButton");
const closeNotificationButton = document.getElementById("closeNotificationButton");
const notificationPanel = document.getElementById("notificationPanel");

const loginButton = document.getElementById("loginButton");
const closeLoginButton = document.getElementById("closeLoginButton");
const loginModal = document.getElementById("loginModal");


// ================================
// القائمة الجانبية
// ================================

function openMenu() {
    if (!sideMenu || !menuOverlay) return;

    sideMenu.classList.add("open");
    menuOverlay.classList.add("active");

    sideMenu.setAttribute("aria-hidden", "false");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "true");
    }

    document.body.style.overflow = "hidden";
}


function closeMenu() {
    if (!sideMenu || !menuOverlay) return;

    sideMenu.classList.remove("open");
    menuOverlay.classList.remove("active");

    sideMenu.setAttribute("aria-hidden", "true");

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
    }

    document.body.style.overflow = "";
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

function openNotifications() {
    if (!notificationPanel) return;

    notificationPanel.classList.add("open");
    notificationPanel.setAttribute("aria-hidden", "false");
}


function closeNotifications() {
    if (!notificationPanel) return;

    notificationPanel.classList.remove("open");
    notificationPanel.setAttribute("aria-hidden", "true");
}


if (notificationButton) {
    notificationButton.addEventListener("click", function () {

        if (notificationPanel.classList.contains("open")) {
            closeNotifications();
        } else {
            openNotifications();
        }

    });
}


if (closeNotificationButton) {
    closeNotificationButton.addEventListener("click", closeNotifications);
}


// ================================
// تسجيل الدخول
// ================================

function openLogin() {
    if (!loginModal) return;

    loginModal.classList.add("open");
    loginModal.setAttribute("aria-hidden", "false");

    document.body.style.overflow = "hidden";
}


function closeLogin() {
    if (!loginModal) return;

    loginModal.classList.remove("open");
    loginModal.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";
}


if (loginButton) {
    loginButton.addEventListener("click", openLogin);
}


if (closeLoginButton) {
    closeLoginButton.addEventListener("click", closeLogin);
}


// ================================
// إغلاق النوافذ عند الضغط خارجها
// ================================

if (loginModal) {

    loginModal.addEventListener("click", function (event) {

        if (event.target === loginModal) {
            closeLogin();
        }

    });

}

// ================================
// تسجيل الدخول وإنشاء الحساب
// ================================

const appleLoginButton = document.getElementById("appleLoginButton");
const emailLoginButton = document.getElementById("emailLoginButton");
const registerButton = document.getElementById("registerButton");

const emailLogin = document.getElementById("emailLogin");
const passwordLogin = document.getElementById("passwordLogin");


// ================================
// تسجيل الدخول باستخدام Apple
// ================================

if (appleLoginButton) {
    appleLoginButton.addEventListener("click", async () => {

        const { error } = await supabaseClient.auth.signInWithOAuth({
            provider: "apple"
        });

        if (error) {
            console.error(error);
            alert("تعذر تسجيل الدخول باستخدام Apple.");
        }
    });
}


// ================================
// تسجيل الدخول بالبريد وكلمة المرور
// ================================

if (emailLoginButton) {
    emailLoginButton.addEventListener("click", async () => {

        const email = emailLogin ? emailLogin.value.trim() : "";
        const password = passwordLogin ? passwordLogin.value : "";

        if (!email || !email.includes("@")) {
            alert("يرجى إدخال بريد إلكتروني صحيح.");
            return;
        }

        if (!password) {
            alert("يرجى إدخال كلمة المرور.");
            return;
        }

        const { data, error } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

        if (error) {
            console.error(error);
            alert("تعذر تسجيل الدخول: " + error.message);
            return;
        }

        alert("تم تسجيل الدخول بنجاح.");

        console.log("قافية: تم تسجيل الدخول", data.user);

        closeLoginModalFunction();
    });
}


// ================================
// إنشاء حساب جديد
// ================================

if (registerButton) {
    registerButton.addEventListener("click", async () => {

        const email = emailLogin ? emailLogin.value.trim() : "";
        const password = passwordLogin ? passwordLogin.value : "";

        if (!email || !email.includes("@")) {
            alert("يرجى إدخال بريد إلكتروني صحيح.");
            return;
        }

        if (password.length < 6) {
            alert("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
            return;
        }

        const { data, error } =
            await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

        if (error) {
            console.error(error);
            alert("تعذر إنشاء الحساب: " + error.message);
            return;
        }

        alert("تم إنشاء الحساب بنجاح.");

        console.log("قافية: تم إنشاء الحساب", data.user);
    });
}

// ================================
// زر الملف الشخصي
// ================================

const profileLink = document.getElementById("profileLink");

if (profileLink) {

    profileLink.addEventListener("click", function (event) {

        event.preventDefault();

        alert("صفحة الملف الشخصي سيتم تفعيلها مع نظام الحسابات.");

    });

}


// ================================
// زر المفضلة
// ================================

const favoritesLink = document.getElementById("favoritesLink");

if (favoritesLink) {

    favoritesLink.addEventListener("click", function (event) {

        event.preventDefault();

        alert("نظام المفضلة سيتم تفعيله بعد ربط حسابات المستخدمين وقاعدة البيانات.");

    });

}


// ================================
// زر الإعدادات
// ================================

const settingsLink = document.getElementById("settingsLink");

if (settingsLink) {

    settingsLink.addEventListener("click", function (event) {

        event.preventDefault();

        alert("صفحة الإعدادات سيتم تفعيلها مع نظام الحسابات.");

    });

}


// ================================
// زر Escape
// ================================

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeMenu();
        closeNotifications();
        closeLogin();

    }

});


// ================================
// تجهيز الإشعارات
// ================================

function updateNotificationCount(count) {

    const notificationCount =
        document.getElementById("notificationCount");

    if (!notificationCount) return;


    if (count > 0) {

        notificationCount.textContent = count;
        notificationCount.style.display = "flex";

    } else {

        notificationCount.textContent = "";
        notificationCount.style.display = "none";

    }

}


// لا توجد إشعارات حقيقية حاليًا
updateNotificationCount(0);


// ================================
// جاهزية الموقع
// ================================

console.log("قافية - الواجهة جاهزة للعمل.");