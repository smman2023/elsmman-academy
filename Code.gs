//==================================================
// أكاديمية مستر السمان
// Code.gs
// النسخة المحسنة
//==================================================

const STUDENTS_SHEET = "Students";
const VIDEOS_SHEET = "Videos";

// مدة حفظ الكاش (6 ساعات)
const CACHE_TIME = 21600;


//==================================================
// API
//==================================================

function doGet(e) {

  try {

    const action = String(e.parameter.action || "").trim();

    switch (action) {

      case "login":
        return login(e);

      case "videos":
        return getVideos(e);

      default:
        return output({
          success: false,
          message: "Invalid Action"
        });

    }

  } catch (err) {

    return output({
      success: false,
      message: err.toString()
    });

  }

}


//==================================================
// JSON Output
//==================================================

function output(obj) {

  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);

}


//==================================================
// قراءة الطلاب من الكاش
//==================================================

function getStudentsData() {

  const cache = CacheService.getScriptCache();

  const cached = cache.get("students");

  if (cached) {

    return JSON.parse(cached);

  }

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(STUDENTS_SHEET);

  if (!sheet) {

    throw new Error("Students sheet not found");

  }

  const data =
    sheet
      .getDataRange()
      .getValues();

  cache.put(
    "students",
    JSON.stringify(data),
    CACHE_TIME
  );

  return data;

}


//==================================================
// قراءة الفيديوهات من الكاش
//==================================================

function getVideosData() {

  const cache = CacheService.getScriptCache();

  const cached = cache.get("videos");

  if (cached) {

    return JSON.parse(cached);

  }

  const sheet =
    SpreadsheetApp
      .getActiveSpreadsheet()
      .getSheetByName(VIDEOS_SHEET);

  if (!sheet) {

    throw new Error("Videos sheet not found");

  }

  const data =
    sheet
      .getDataRange()
      .getValues();

  cache.put(
    "videos",
    JSON.stringify(data),
    CACHE_TIME
  );

  return data;

}
//==================================================
// Login + تحميل الفيديوهات فى طلب واحد
//==================================================

function login(e) {

  const code =
    String(e.parameter.code || "").trim();

  const password =
    String(e.parameter.password || "").trim();

  const students =
    getStudentsData();

  let student = null;

  for (let i = 1; i < students.length; i++) {

    if (

      String(students[i][0]).trim() === code &&

      String(students[i][1]).trim() === password

    ) {

      student = {

        success: true,

        code: String(students[i][0]).trim(),

        name: String(students[i][2]).trim(),

        grade: String(students[i][3]).trim()

      };

      break;

    }

  }

  if (!student) {

    return output({

      success: false,

      message: "Wrong code or password"

    });

  }

  //------------------------------------------------
  // استخراج فيديوهات الصف
  //------------------------------------------------

  const allVideos =
    getVideosData();

  const result = [];

  for (let i = 1; i < allVideos.length; i++) {

    const rowGrade =
      String(allVideos[i][0]).trim();

    if (rowGrade !== student.grade)
      continue;

    result.push({

      unit:
        String(allVideos[i][1]).trim(),

      lesson:
        String(allVideos[i][2]).trim(),

      title:
        String(allVideos[i][3]).trim(),

      video:
        String(allVideos[i][4]).trim(),

      order:
        Number(allVideos[i][5]) || 0

    });

  }

  result.sort(function (a, b) {

    return a.order - b.order;

  });

  student.videos = result;

  return output(student);

}
//==================================================
// جلب الفيديوهات (للتوافق مع النسخ القديمة)
//==================================================

function getVideos(e) {

  const grade =
    String(e.parameter.grade || "").trim();

  const allVideos =
    getVideosData();

  const result = [];

  for (let i = 1; i < allVideos.length; i++) {

    const rowGrade =
      String(allVideos[i][0]).trim();

    if (rowGrade !== grade)
      continue;

    result.push({

      unit:
        String(allVideos[i][1]).trim(),

      lesson:
        String(allVideos[i][2]).trim(),

      title:
        String(allVideos[i][3]).trim(),

      video:
        String(allVideos[i][4]).trim(),

      order:
        Number(allVideos[i][5]) || 0

    });

  }

  result.sort(function (a, b) {

    return a.order - b.order;

  });

  return output(result);

}


//==================================================
// مسح الكاش بعد تعديل الجداول
//==================================================

function clearCache() {

  const cache = CacheService.getScriptCache();

  cache.remove("students");
  cache.remove("videos");

  return "Cache Cleared";

}