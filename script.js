//=========================================
// Google Apps Script API
//=========================================

const API =
"https://script.google.com/macros/s/AKfycbz29A3DJIBlWRJ5Z7ZRYm0CvY7eRyCGQ9EXFVqJwWBLOsNuGObJePXZFNeE3zgqgxiH/exec";

//=========================================
// Variables
//=========================================

let currentStudent = null;
let videos = [];
let currentIndex = 0;

//=========================================
// Elements
//=========================================

const codeInput =
document.getElementById("codeInput");

const passwordInput =
document.getElementById("passwordInput");

const loginBtn =
document.getElementById("loginBtn");

const loginError =
document.getElementById("loginError");

const studentCard =
document.getElementById("studentCard");

const videosCard =
document.getElementById("videosCard");

const playerCard =
document.getElementById("playerCard");

const videosContainer =
document.getElementById("videosContainer");

const studentName =
document.getElementById("studentName");

const studentGrade =
document.getElementById("studentGrade");

const videoTitle =
document.getElementById("videoTitle");

const videoFrame =
document.getElementById("videoFrame");

const logoutBtn =
document.getElementById("logoutBtn");

const backBtn =
document.getElementById("backBtn");

const nextBtn =
document.getElementById("nextBtn");

const prevBtn =
document.getElementById("prevBtn");
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
// تسجيل الدخول
//=========================================

async function login() {

    const code = codeInput.value.trim();

    const password = passwordInput.value.trim();

    if (code === "" || password === "") {

        alert("برجاء إدخال كود الطالب والرقم السرى");

        return;

    }

    loginBtn.disabled = true;

    loginBtn.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> جارى تسجيل الدخول...';

    loginError.classList.add("hidden");

    try {

        const response = await fetch(

            API +
            "?action=login" +
            "&code=" + encodeURIComponent(code) +
            "&password=" + encodeURIComponent(password)

        );

        const student = await response.json();

        if (!student.success) {

            loginBtn.disabled = false;

            loginBtn.innerHTML =
                '<i class="fa-solid fa-right-to-bracket"></i> دخول المنصة';

            loginError.classList.remove("hidden");

            return;

        }

        currentStudent = student;

        studentName.textContent = student.name;

        studentGrade.textContent = student.grade;

        videos = student.videos || [];

        codeInput.value = "";

        passwordInput.value = "";

        if (videos.length === 0) {

            videosContainer.innerHTML =
                "<h2 style='text-align:center'>لا توجد فيديوهات لهذا الصف</h2>";

        } else {

            displayVideos();

        }

        studentCard.classList.remove("hidden");

        videosCard.classList.remove("hidden");

        playerCard.classList.add("hidden");

    }

    catch (error) {

        console.error(error);

        alert("حدث خطأ أثناء الاتصال بالخادم");

    }

    loginBtn.disabled = false;

    loginBtn.innerHTML =
        '<i class="fa-solid fa-right-to-bracket"></i> دخول المنصة';

}
//=========================================
//=========================================
// عرض الفيديوهات مرتبة حسب الوحدات و order
//=========================================

//=========================================
// عرض الفيديوهات مرتبة تصاعدياً حسب الوحدات والترتيب
//=========================================
//=========================================
// عرض الفيديوهات مرتبة تصاعدياً حسب الوحدات والترتيب
//=========================================

function displayVideos(){

    // 1. فرز المصفوفة بالكامل أساساً حسب order تصاعدياً
    videos.sort(function(a, b) {
        return Number(a.order) - Number(b.order);
    });

    let html = "";
    let currentUnit = "";

    // 2. تتبع الوحدات المعروضة لضمان عدم تكرارها وعرض الدروس تحت كل وحدة بانتظام
    // سنقوم بإنشاء خريطة (مجموعات) للوحدات
    const unitsMap = {};
    
    videos.forEach(function(video) {
        if (!unitsMap[video.unit]) {
            unitsMap[video.unit] = [];
        }
        unitsMap[video.unit].push(video);
    });

    // 3. المرور على كل وحدة وعرض دروسها المرتبة
    for (const unitName in unitsMap) {
        html += `
        <div class="video-unit">
            <div class="video-unit-title">
                📚 ${unitName}
            </div>
        </div>
        `;

        unitsMap[unitName].forEach(function(video) {
            // ايجاد الفهرس الحقيقي (Index) للفيديو في المصفوفة الأصلية لضمان التشغيل السليم
            const originalIndex = videos.findIndex(v => v === video);

            html += `
            <div
            class="video-card"
            onclick="playVideo(${originalIndex})">

                <div class="video-header">

                    <div>

                        <div class="lesson-number">

                            ${video.lesson}

                        </div>

                        <div class="lesson-name">

                            ${video.title}

                        </div>

                    </div>

                    <div class="video-icon">

                        <i class="fa-solid fa-circle-play"></i>

                    </div>

                </div>

                <button class="watch-btn">

                    ▶ مشاهدة الفيديو

                </button>

            </div>
            `;
        });
    }

    videosContainer.innerHTML = html;
}
//=========================================
// تشغيل الفيديو
//=========================================

//=========================================
// تشغيل الفيديو
//=========================================

function playVideo(index){
    currentIndex=index;
    const video=videos[index];

    document.querySelectorAll(".video-card").forEach(function(card){
        card.classList.remove("active");
    });
    document.querySelectorAll(".video-card")[index].classList.add("active");

    videoTitle.textContent=video.title;

    // استخراج معرف الفيديو وتكوين رابط نظيف ومحدث
    let videoId = "";
    let rawUrl = video.video;
    if (rawUrl.includes("embed/")) {
        videoId = rawUrl.split("embed/")[1].split("?")[0];
    } else if (rawUrl.includes("youtu.be/")) {
        videoId = rawUrl.split("youtu.be/")[1].split("?")[0];
    } else if (rawUrl.includes("v=")) {
        videoId = rawUrl.split("v=")[1].split("&")[0];
    }

    // إعادة بناء الـ iframe بالكامل برمجياً لضمان تفاعل يوتيوب الفوري
    const wrapper = document.querySelector(".video-wrapper");
    wrapper.innerHTML = `
        <iframe
        id="videoFrame"
        width="100%"
        height="420"
        src="https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        referrerpolicy="no-referrer-when-downgrade"
        allowfullscreen>
        </iframe>
    `;

    videosCard.classList.add("hidden");
    playerCard.classList.remove("hidden");
    updateButtons();
}



//=========================================
// تحديث الأزرار
//=========================================

function updateButtons(){

    prevBtn.disabled=currentIndex===0;

    nextBtn.disabled=currentIndex===videos.length-1;

}



//=========================================
// الدرس التالى
//=========================================

function nextLesson(){

    if(currentIndex<videos.length-1){

        playVideo(currentIndex+1);

    }

}



//=========================================
// الدرس السابق
//=========================================

function previousLesson(){

    if(currentIndex>0){

        playVideo(currentIndex-1);

    }

}
//=========================================
// الرجوع إلى قائمة الفيديوهات
//=========================================

function backToVideos(){

    playerCard.classList.add("hidden");

    videosCard.classList.remove("hidden");

    videoFrame.src="";

}



//=========================================
// تسجيل الخروج
//=========================================

function logout(){

    currentStudent=null;

    videos=[];

    currentIndex=0;

    studentCard.classList.add("hidden");

    videosCard.classList.add("hidden");

    playerCard.classList.add("hidden");

    loginError.classList.add("hidden");

    videoFrame.src="";

    videosContainer.innerHTML="";

    codeInput.value="";

    passwordInput.value="";

    codeInput.focus();

}



//=========================================
// البحث داخل الفيديوهات
//=========================================

function searchVideos(keyword){

    keyword=keyword.trim().toLowerCase();

    const cards=document.querySelectorAll(".video-card");

    cards.forEach(function(card,index){

        const text=(

            videos[index].title+

            videos[index].lesson+

            videos[index].unit

        ).toLowerCase();

        if(text.includes(keyword)){

            card.style.display="block";

        }

        else{

            card.style.display="none";

        }

    });

}



//=========================================
// تشغيل أول فيديو (اختيارى)
//=========================================

function openFirstVideo(){

    if(videos.length>0){

        playVideo(0);

    }

}
//=========================================
// إيقاف الفيديو عند مغادرة الصفحة
//=========================================

window.addEventListener("beforeunload", function () {

    videoFrame.src = "";

});



//=========================================
// رسالة التحميل
//=========================================

function showLoading(text){

    videosContainer.innerHTML =

    `
    <div class="loading">

        <i class="fa-solid fa-spinner fa-spin"></i>

        <br><br>

        ${text}

    </div>
    `;

}



//=========================================
// رسالة عدم وجود فيديوهات
//=========================================

function showEmpty(){

    videosContainer.innerHTML =

    `
    <div class="not-found">

        <i class="fa-solid fa-video-slash"></i>

        <h2>

            لا توجد فيديوهات متاحة حالياً

        </h2>

    </div>
    `;

}



//=========================================
// الضغط المزدوج على البطاقة
//=========================================

document.addEventListener("dblclick", function(e){

    const card = e.target.closest(".video-card");

    if(card){

        card.click();

    }

});



//=========================================
// زر ESC
//=========================================

document.addEventListener("keydown", function(e){

    if(e.key==="Escape"){

        if(!playerCard.classList.contains("hidden")){

            backToVideos();

        }

    }

});



//=========================================
// الأسهم للتنقل
//=========================================

document.addEventListener("keydown", function(e){

    if(playerCard.classList.contains("hidden")) return;

    if(e.key==="ArrowLeft"){

        nextLesson();

    }

    if(e.key==="ArrowRight"){

        previousLesson();

    }

});