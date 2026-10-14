//=========================================
// Google Apps Script API
//=========================================

const API =
"https://script.google.com/macros/s/AKfycbyosVeYETo-Is-nlPQ36BNOpBq5LbalpAQvSnEAakM8OJLI6b2x6LGFEWwv-EPLIHBc/exec";

//=========================================
// Variables
//=========================================

let currentStudent = null;
let videos = [];
let currentIndex = 0;

//=========================================
// Elements
//=========================================

const codeInput = document.getElementById("codeInput");
const passwordInput = document.getElementById("passwordInput");
const loginBtn = document.getElementById("loginBtn");
const loginError = document.getElementById("loginError");

const studentCard = document.getElementById("studentCard");
const videosCard = document.getElementById("videosCard");
const playerCard = document.getElementById("playerCard");
const videosContainer = document.getElementById("videosContainer");

const studentName = document.getElementById("studentName");
const studentGrade = document.getElementById("studentGrade");
const videoTitle = document.getElementById("videoTitle");
const videoFrame = document.getElementById("videoFrame");

const logoutBtn = document.getElementById("logoutBtn");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

//=========================================
// Events
//=========================================

loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);
backBtn.addEventListener("click", backToVideos);
nextBtn.addEventListener("click", nextLesson);
prevBtn.addEventListener("click", previousLesson);

codeInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        login();
    }
});

passwordInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        login();
    }
});

//=========================================
// تسجيل الدخول (نظام التحقق الصارم بالواتساب)
//=========================================

async function login() {
    const code = codeInput.value.trim();
    const phoneInput = passwordInput.value.trim();

    if (code === "" || phoneInput === "") {
        alert("برجاء إدخال كود الطالب ورقم الواتساب");
        return;
    }

    loginBtn.disabled = true;
    loginBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جارى تسجيل الدخول...';

    loginError.classList.add("hidden");

    try {
        const response = await fetch(
            API +
            "?code=" + encodeURIComponent(code) +
            "&phone=" + encodeURIComponent(phoneInput)
        );

        const data = await response.json();

        // إذا فشل تسجيل الدخول أو جاء خطأ من السيرفر
        if (!data.success) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> دخول المنصة';

            const errorMsgHeading = loginError.querySelector("h2");
            if (errorMsgHeading && data.message) {
                errorMsgHeading.textContent = data.message;
            }

            loginError.classList.remove("hidden");
            return;
        }

        // نجاح تسجيل الدخول
        currentStudent = data;
        studentName.textContent = data.name;
        studentGrade.textContent = data.grade;
        videos = data.videos || [];

        codeInput.value = "";
        passwordInput.value = "";

        if (videos.length === 0) {
            videosContainer.innerHTML = "<h2 style='text-align:center'>لا توجد فيديوهات لهذا الصف</h2>";
        } else {
            displayVideos();
        }

        studentCard.classList.remove("hidden");
        videosCard.classList.remove("hidden");
        playerCard.classList.add("hidden");

    } catch (error) {
        console.error(error);
        alert("حدث خطأ أثناء الاتصال بالخادم");
    }

    loginBtn.disabled = false;
    loginBtn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> دخول المنصة';
}

//=========================================
// عرض الفيديوهات مرتبة تصاعدياً
//=========================================

function displayVideos() {
    videos.sort(function(a, b) {
        return Number(a.order) - Number(b.order);
    });

    let html = "";
    const unitsMap = {};
    
    videos.forEach(function(video) {
        if (!unitsMap[video.unit]) {
            unitsMap[video.unit] = [];
        }
        unitsMap[video.unit].push(video);
    });

    for (const unitName in unitsMap) {
        html += `
        <div class="video-unit">
            <div class="video-unit-title">
                📚 ${unitName}
            </div>
        </div>
        `;

        unitsMap[unitName].forEach(function(video) {
            const originalIndex = videos.findIndex(v => v === video);

            html += `
            <div class="video-card" onclick="playVideo(${originalIndex})">
                <div class="video-header">
                    <div>
                        <div class="lesson-number">${video.lesson}</div>
                        <div class="lesson-name">${video.title}</div>
                    </div>
                    <div class="video-icon">
                        <i class="fa-solid fa-circle-play"></i>
                    </div>
                </div>
                <button class="watch-btn">▶ مشاهدة الفيديو</button>
            </div>
            `;
        });
    }

    videosContainer.innerHTML = html;
}

//=========================================
//=========================================
function playVideo(index) {
    currentIndex = index;
    const video = videos[index];

    document.querySelectorAll(".video-card").forEach(function(card) {
        card.classList.remove("active");
    });
    const cards = document.querySelectorAll(".video-card");
    if (cards[index]) {
        cards[index].classList.add("active");
    }

    videoTitle.textContent = video.title;

    let videoId = "";
    let rawUrl = video.video;
    if (rawUrl.includes("embed/")) {
        videoId = rawUrl.split("embed/")[1].split("?")[0];
    } else if (rawUrl.includes("youtu.be/")) {
        videoId = rawUrl.split("youtu.be/")[1].split("?")[0];
    } else if (rawUrl.includes("v=")) {
        videoId = rawUrl.split("v=")[1].split("&")[0];
    }

    const wrapper = document.querySelector(".video-wrapper");
    
    // وضع الـ iframe وتحته/فوقه طبقة الحماية الشفافة لمنع التفاعل المباشر ونسخ الروابط
    wrapper.innerHTML = `
        <div class="video-protection-overlay" oncontextmenu="return false;"></div>
        <iframe
        id="videoFrame"
        width="100%"
        height="420"
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&disablekb=1&modestbranding=1&rel=0&enablejsapi=1"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin">
        </iframe>
    `;

    videosCard.classList.add("hidden");
    playerCard.classList.remove("hidden");
    updateButtons();
}

// منع قسري لأي محاولة كليك يمين في الصفحة بالكامل أو داخل المشغل
document.addEventListener("contextmenu", function (e) {
    e.preventDefault();
});

//=========================================
// التنقل والتحكم بالأزرار
//=========================================

function updateButtons() {
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === videos.length - 1;
}

function nextLesson() {
    if (currentIndex < videos.length - 1) {
        playVideo(currentIndex + 1);
    }
}

function previousLesson() {
    if (currentIndex > 0) {
        playVideo(currentIndex - 1);
    }
}

function backToVideos() {
    playerCard.classList.add("hidden");
    videosCard.classList.remove("hidden");
    const frame = document.getElementById("videoFrame");
    if (frame) frame.src = "";
}

function logout() {
    currentStudent = null;
    videos = [];
    currentIndex = 0;
    studentCard.classList.add("hidden");
    videosCard.classList.add("hidden");
    playerCard.classList.add("hidden");
    loginError.classList.add("hidden");
    
    const frame = document.getElementById("videoFrame");
    if (frame) frame.src = "";

    videosContainer.innerHTML = "";
    codeInput.value = "";
    passwordInput.value = "";
    codeInput.focus();
}

window.addEventListener("beforeunload", function () {
    const frame = document.getElementById("videoFrame");
    if (frame) frame.src = "";
});
// منع النقر بزر الماوس الأيمن داخل مشغل الفيديوهات لمنع نسخ الرابط
document.addEventListener("contextmenu", function (e) {
    if (e.target.closest(".video-wrapper")) {
        e.preventDefault();
    }
});