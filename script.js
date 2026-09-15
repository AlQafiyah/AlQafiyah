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
// زر Apple
// ================================

const appleLoginButton = document.getElementById("appleLoginButton");

if (appleLoginButton) {

    appleLoginButton.addEventListener("click", function () {

        alert("سيتم تفعيل تسجيل الدخول باستخدام Apple بعد ربط نظام الحسابات.");

    });

}


// ================================
// تسجيل الدخول بالبريد الإلكتروني
// ================================

const emailLoginButton = document.getElementById("emailLoginButton");
const emailLogin = document.getElementById("emailLogin");


if (emailLoginButton) {

    emailLoginButton.addEventListener("click", function () {

        const email = emailLogin ? emailLogin.value.trim() : "";

        if (email === "") {

            alert("يرجى إدخال البريد الإلكتروني.");

            return;
        }


        if (!email.includes("@")) {

            alert("يرجى إدخال بريد إلكتروني صحيح.");

            return;
        }


        alert("سيتم تفعيل نظام تسجيل الدخول الحقيقي بعد ربط قاعدة البيانات.");

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