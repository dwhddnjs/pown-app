// 다국어 사전 (ko/en). i18n 라이브러리는 쓰지 않는다 — 언어 2개, 복수형/ICU 불필요.
//
// 중요: 저장(AsyncStorage)되는 도메인 값은 항상 한국어가 정본이다.
// (progress "완료", equipment "바벨", condition "좋음", workout "벤치프레스", workoutList 태그)
// 아래 t*() 함수들은 렌더 시점에만 라벨을 바꾼다 — 저장값은 절대 바꾸지 않는다.

export type Lang = "ko" | "en"

export const LANG_LABEL: Record<Lang, string> = {
  ko: "한국어",
  en: "English",
}

const ko = {
  // 공통
  "common.cancel": "취소",
  "common.delete": "삭제",
  "common.deleteAction": "삭제하기",
  "common.edit": "수정",
  "common.save": "저장",
  "common.add": "추가",
  "common.addAction": "추가하기",
  "common.select": "선택하기",
  "common.optional": "(선택)",
  "common.goBack": "돌아가기",
  "common.allowPermission": "권한 허용하기",
  "common.count": "{n}회",
  "common.reps": "{n} 회",
  "common.days": "{n}일",

  // 탭 · 헤더
  "tab.workout": "운동계획",
  "tab.record": "기록",
  "tab.shorts": "내 숏츠",
  "tab.my": "마이페이지",
  "header.addRoutine": "루틴 추가",
  "header.userInfo": "내정보 작성",
  "header.themeMode": "컬러 모드 선택",
  "header.language": "언어 선택",
  "header.dataManage": "데이터 관리",
  "header.search": "운동 검색",
  "header.camera": "사진 찍기",
  "header.video": "비디오 촬영",
  "header.cheer": "🔥오늘도 화이팅!",

  // 드로어
  "drawer.title": "나의 운동 기록",
  "drawer.counts": "폴더 {folders}개,  파일 {files}개",
  "drawer.empty": "운동 폴더가 없습니다.",

  // 운동계획 목록
  "workout.lastPlan": "마지막 운동계획입니다.",
  "workout.addPlan": "운동계획 추가",
  "workout.setsDone": "{completed}/{total} 세트 완료",
  "workout.galleryPermission": "사진을 보려면 눌러서 갤러리 접근권한을 허용해주세요.",
  "workout.target": "목표 • {weight}kg",
  "workout.deleted": "운동계획이 삭제 되었습니다!",
  "workout.history": "운동 히스토리",

  // 계획 추가 / 수정
  "plan.requireFields": "운동과 목표 중량은 필수에요..",
  "plan.added": "운동 계획이 추가되었습니다!",
  "plan.addFailed": "운동 계획 저장 중 오류가 발생했습니다.",
  "plan.updated": "운동 계획이 수정되었습니다!",
  "plan.updateFailed": "운동 계획 수정 중 오류가 발생했습니다.",
  "plan.selectPart": "지금 어느 부위를 조질까?",
  "plan.whichWorkout": "🔥 어떤 운동 하실건가요?",
  "plan.equipment": "기구 종류",
  "plan.targetWeight": "목표 중량",
  "plan.condition": "지금 컨디션",
  "plan.setAndReps": "세트와 횟수",
  "plan.setType": "세트 유형",
  "plan.repCount": "반복 횟수",
  "plan.photo": "사진 추가",
  "plan.takePhoto": "사진찍기",
  "plan.photoMax": "최대 4개까지 가능합니다",
  "plan.quickNote": "퀵 노트",
  "plan.openFullNote": "전체노트 열기",
  "plan.notePlaceholder": "특이사항을 적어주세요 (선택)",
  "plan.titlePlaceholder": "제목 입력...",
  "plan.contentPlaceholder": "설명을 넣어주세요...",
  "plan.selectDate": "📆 날짜를 선택해주세요.",

  // 루틴(멀티 플랜)
  "routine.addedToRoutine": "루틴에 운동이 추가되었습니다!",
  "routine.noWorkout": "추가된 운동이 없어요..",
  "routine.savedCount": "{n}개 운동 계획이 추가되었습니다!!",
  "routine.emptyTitle": "추가된 운동이 없습니다",
  "routine.emptyDesc": "아래 버튼을 눌러 운동을 추가해보세요",
  "routine.addRoutine": "루틴 추가",
  "routine.addWorkout": "운동 추가",

  // 운동 태그
  "tag.searchPlaceholder": "찾으시는 운동계획이 있으신가요?",
  "tag.notFound": "음.. 찾으시는 운동이 없네요?",
  "tag.addTitle": "새로운 운동 종목을 추가를 원하나요?",
  "tag.namePlaceholder": "운동 이름을 기입해주세요..",
  "tag.exists": "이미 존재하는 운동인데요?",
  "tag.added": "운동이 추가되었습니다.",
  "tag.removed": "운동이 삭제 되었습니다.",
  "tag.removeTitle": "정말 선택된 운동을 삭제 할까요?",
  "tag.selectToRemove": "삭제하실 운동을 선택해주세요.",

  // 검색
  "search.cancel": "취소",
  "search.hint": "🔍  키워드를 입력해주세요.\n예:) 바벨, 등, 프레스",
  "search.noResult": "검색 결과가 없습니다.",

  // 차트 · 기록
  "chart.monthlySummary": "월간 요약",
  "chart.emptyMonth": "이번 달 운동 기록이 없습니다.",
  "chart.totalWorkout": "총 운동",
  "chart.workoutDays": "운동한 날",
  "chart.avgSets": "평균 세트",
  "chart.completionRate": "달성률",
  "chart.mostTrained": "가장 많이 훈련한 부위",
  "chart.openCalendar": "달력으로 보기",
  "chart.equipmentTitle": "주로 뭐로 운동했지?",
  "chart.equipmentEmpty": "기록된 운동장비 데이터가 없습니다.",
  "chart.partTitle": "주로 어느 부위 운동을 했지?",
  "chart.partEmpty": "기록된 운동부위 데이터가 없습니다.",
  "chart.sbdTitle": "3대중량의 변화",
  "chart.sbdLegend": "회색: 최초 기록  ·  컬러: 선택한 달의 마지막 기록",
  "chart.sbdEmpty": "기록된 3대중량 데이터가 없습니다.",
  "chart.bodyTitle": "몸무게의 변화",
  "chart.bodyEmpty": "기록된 몸무게 데이터가 없습니다.",
  "chart.conditionTitle": "컨디션 별 횟수",
  "chart.conditionEmpty": "기록된 컨디션 데이터가 없습니다.",
  "chart.countTitle": "기록한 운동 횟수",
  "chart.countEmpty": "기록된 운동 데이터가 없습니다.",

  // 캘린더
  "calendar.thisMonth": "이번달",
  "calendar.gymVisits": "헬스장 간 횟수",
  "calendar.hint": "운동한 날짜를 눌러서, 그날의 운동 기록을 확인해보세요.",

  // 숏츠
  "shorts.title": "내 운동 숏츠",
  "shorts.empty": "운동 숏츠가 없습니다. \n추가해주세요!",
  "shorts.added": "숏츠가 추가 되었습니다",
  "shorts.addFailed": "숏츠 저장 중 오류가 발생했습니다.",
  "shorts.removed": "숏츠가 삭제 되었습니다.",
  "shorts.removeTitle": "정말 숏츠 영상을 삭제 할까요?",
  "shorts.recordFailed": "녹화 중 오류가 발생했습니다.",
  "shorts.retake": "다시 찍기",
  "shorts.useVideo": "비디오 사용",
  "shorts.permission": "숏츠를 촬영하려면 카메라·마이크 접근 권한이 필요해요.",

  // 카메라
  "camera.retake": "다시 찍기",
  "camera.usePhoto": "사진 사용",
  "camera.permission": "사진을 찍으려면 카메라 접근 권한이 필요해요.",
  "camera.libraryPermission": "사진 보관함 권한이 없어 사진첩에는 저장되지 않아요.",

  // 마이페이지
  "my.general": "일반",
  "my.userInfo": "내정보 작성",
  "my.themeMode": "컬러모드 선택",
  "my.language": "언어",
  "my.calculator": "중량 계산기",
  "my.data": "데이터",
  "my.dataManage": "데이터 관리",
  "my.dataManageDesc": "백업 · 복원 · 초기화",
  "my.appInfo": "앱 정보",
  "my.contact": "문의하기",
  "my.contactSubject": "Pown 문의",
  "my.emailCopied": "메일 주소가 복사되었어요",
  "my.appVersion": "앱 버전",
  "my.theme.light": "라이트",
  "my.theme.dark": "다크",
  "my.theme.system": "시스템",

  // 컬러모드
  "theme.lightMode": "라이트 모드",
  "theme.darkMode": "다크 모드",
  "theme.systemMode": "시스템 기본 설정",
  "theme.title": "컬러모드를 선택해 보세요!",
  "theme.desc":
    "다크모드가 마음에 안 들면 라이트모드로 사용해보세요 밝은 화면과 좋은 눈뽕이 당신과 함께 할 것 입니다 하지만 다크모드를 권장합니다.",

  // 언어
  "language.title": "언어를 선택해 보세요!",
  "language.desc":
    "버튼도 차트도 잔소리도 전부 선택한 언어로 바뀝니다.\n이미 기록한 운동은 그대로 있으니 마음 편히 골라보세요.",

  // 내 정보
  "userInfo.title": "당신의 정보를 입력하세요.",
  "userInfo.desc":
    "3대 중량, 나이, 성별, 신체 정보를 기입해보세요. 또한 중량이 늘 때, 몸무게가 줄 때마다 기록을 갱신해보세요. 차트 데이터 기록에 도움됩니다.",
  "userInfo.sbd": "3대 중량",
  "userInfo.body": "신체 정보",
  "userInfo.height": "키",
  "userInfo.weight": "몸무게",
  "userInfo.age": "나이",
  "userInfo.ageUnit": "살",
  "userInfo.gender": "성별",
  "userInfo.male": "남자",
  "userInfo.female": "여자",
  "userInfo.required": "정보를 모두 기입해주세요!",
  "userInfo.saved": "내정보가 추가 되었습니다!",
  "userInfo.ageValue": "{n}세",
  "userInfo.emptyTitle": "3대 중량을 기록해보세요",
  "userInfo.emptyDesc":
    "내정보를 작성하면 스쿼트 · 벤치프레스 · 데드리프트\n기록이 여기에 표시돼요",
  "userInfo.goWrite": "작성하러 가기",

  // 데이터 관리
  "data.title": "당신이 기록한 운동 계획을 보관하세요.",
  "data.desc":
    "앱을 삭제하면 기록 했던 모든 운동 계획이 삭제됩니다. 나중에 당신이 돌아올 수 있다는 여지를 두기 위해 백업 파일로 저장해서 보관하는건 어떨까요?",
  "data.backupSection": "백업 · 복원",
  "data.backup": "백업",
  "data.backupDesc": ".pown 파일로 내보내기",
  "data.restore": "복원",
  "data.restoreDesc": ".pown 파일 불러오기",
  "data.resetSection": "초기화",
  "data.resetAll": "모든 데이터 초기화",
  "data.resetConfirm": "정말 모든 데이터를 삭제할까요?",
  "data.resetDone": "모든 데이터가 초기화 되었습니다",
  "data.shareUnavailable": "이 기기에서는 파일 공유를 사용할 수 없어요.",
  "data.backupFailed": "백업 파일 저장 중 오류가 발생했습니다.",
  "data.notBackupFile": "Pown 백업 파일이 아니에요. 파일을 확인해주세요.",
  "data.restored": "복원되었습니다",
  "data.restoreFailed": "복원 중 오류가 발생했습니다. 파일을 확인해주세요.",

  // 계산기
  "calc.kg": "킬로그램/kg",
  "calc.lb": "파운드/lb",
} as const

export type TKey = keyof typeof ko

const en: Record<TKey, string> = {
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.deleteAction": "Delete",
  "common.edit": "Edit",
  "common.save": "Save",
  "common.add": "Add",
  "common.addAction": "Add",
  "common.select": "Select",
  "common.optional": "(optional)",
  "common.goBack": "Go back",
  "common.allowPermission": "Allow access",
  "common.count": "{n}",
  "common.reps": "{n} reps",
  "common.days": "{n}",

  "tab.workout": "Workouts",
  "tab.record": "Records",
  "tab.shorts": "Shorts",
  "tab.my": "My",
  "header.addRoutine": "Add Routine",
  "header.userInfo": "My Profile",
  "header.themeMode": "Appearance",
  "header.language": "Language",
  "header.dataManage": "Manage Data",
  "header.search": "Search Workouts",
  "header.camera": "Take Photo",
  "header.video": "Record Video",
  "header.cheer": "🔥Let's go today!",

  "drawer.title": "My Workout Log",
  "drawer.counts": "{folders} folders,  {files} files",
  "drawer.empty": "No workout folders yet.",

  "workout.lastPlan": "That's the last workout plan.",
  "workout.addPlan": "Add workout plan",
  "workout.setsDone": "{completed}/{total} sets done",
  "workout.galleryPermission": "Tap to allow photo library access and view photos.",
  "workout.target": "Target • {weight}kg",
  "workout.deleted": "Workout plan deleted!",
  "workout.history": "Workout History",

  "plan.requireFields": "Workout and target weight are required.",
  "plan.added": "Workout plan added!",
  "plan.addFailed": "Something went wrong while saving the workout plan.",
  "plan.updated": "Workout plan updated!",
  "plan.updateFailed": "Something went wrong while updating the workout plan.",
  // 두 제목 모두 한 줄에 들어가야 한다 (아래는 검색 아이콘과 같은 줄)
  "plan.selectPart": "What are we hitting?",
  "plan.whichWorkout": "🔥 Today's lift?",
  "plan.equipment": "Equipment",
  "plan.targetWeight": "Target Weight",
  "plan.condition": "How do you feel?",
  "plan.setAndReps": "Sets & Reps",
  "plan.setType": "Set Type",
  "plan.repCount": "Reps",
  "plan.photo": "Add Photo",
  "plan.takePhoto": "Take photo",
  "plan.photoMax": "Up to 4 photos",
  "plan.quickNote": "Quick Note",
  "plan.openFullNote": "Open full note",
  "plan.notePlaceholder": "Anything to note? (optional)",
  "plan.titlePlaceholder": "Enter a title...",
  "plan.contentPlaceholder": "Write a description...",
  "plan.selectDate": "📆 Pick a date.",

  "routine.addedToRoutine": "Workout added to the routine!",
  "routine.noWorkout": "No workouts added yet.",
  "routine.savedCount": "{n} workout plans added!",
  "routine.emptyTitle": "No workouts added",
  "routine.emptyDesc": "Tap the button below to add a workout",
  "routine.addRoutine": "Add Routine",
  "routine.addWorkout": "Add Workout",

  "tag.searchPlaceholder": "Looking for a workout?",
  "tag.notFound": "Hmm, no workout found.",
  "tag.addTitle": "Add a new workout?",
  "tag.namePlaceholder": "Enter the workout name...",
  "tag.exists": "That workout already exists.",
  "tag.added": "Workout added.",
  "tag.removed": "Workout deleted.",
  "tag.removeTitle": "Delete the selected workout?",
  "tag.selectToRemove": "Select a workout to delete.",

  "search.cancel": "Cancel",
  "search.hint": "🔍  Type a keyword.\ne.g. Barbell, Back, Press",
  "search.noResult": "No results found.",

  "chart.monthlySummary": "Monthly Summary",
  "chart.emptyMonth": "No workouts recorded this month.",
  "chart.totalWorkout": "Total Workouts",
  "chart.workoutDays": "Days Trained",
  "chart.avgSets": "Avg. Sets",
  "chart.completionRate": "Completion",
  "chart.mostTrained": "Most trained muscle",
  "chart.openCalendar": "View calendar",
  "chart.equipmentTitle": "What did you train with?",
  "chart.equipmentEmpty": "No equipment data recorded.",
  "chart.partTitle": "Which muscles did you train?",
  "chart.partEmpty": "No muscle group data recorded.",
  "chart.sbdTitle": "Big 3 Progress",
  "chart.sbdLegend": "Gray: first record  ·  Color: latest record of the month",
  "chart.sbdEmpty": "No Big 3 data recorded.",
  "chart.bodyTitle": "Body Weight Progress",
  "chart.bodyEmpty": "No body weight data recorded.",
  "chart.conditionTitle": "Condition Breakdown",
  "chart.conditionEmpty": "No condition data recorded.",
  "chart.countTitle": "Workout Count",
  "chart.countEmpty": "No workout data recorded.",

  "calendar.thisMonth": "This month",
  "calendar.gymVisits": "gym visits",
  "calendar.hint": "Tap a day you trained to see that day's records.",

  "shorts.title": "My Workout Shorts",
  "shorts.empty": "No workout shorts yet. \nAdd one!",
  "shorts.added": "Short added",
  "shorts.addFailed": "Something went wrong while saving the short.",
  "shorts.removed": "Short deleted.",
  "shorts.removeTitle": "Delete this short?",
  "shorts.recordFailed": "Something went wrong while recording.",
  "shorts.retake": "Retake",
  "shorts.useVideo": "Use Video",
  "shorts.permission": "Camera and microphone access is required to record shorts.",

  "camera.retake": "Retake",
  "camera.usePhoto": "Use Photo",
  "camera.permission": "Camera access is required to take photos.",
  "camera.libraryPermission":
    "Without photo library access, photos won't be saved to your library.",

  "my.general": "General",
  "my.userInfo": "My Profile",
  "my.themeMode": "Appearance",
  "my.language": "Language",
  "my.calculator": "Weight Calculator",
  "my.data": "Data",
  "my.dataManage": "Manage Data",
  "my.dataManageDesc": "Backup · Restore · Reset",
  "my.appInfo": "About",
  "my.contact": "Contact us",
  "my.contactSubject": "Pown Inquiry",
  "my.emailCopied": "Email address copied",
  "my.appVersion": "App Version",
  "my.theme.light": "Light",
  "my.theme.dark": "Dark",
  "my.theme.system": "System",

  "theme.lightMode": "Light Mode",
  "theme.darkMode": "Dark Mode",
  "theme.systemMode": "System Default",
  "theme.title": "Pick your appearance!",
  "theme.desc":
    "If dark mode isn't your thing, try light mode — a bright screen awaits. We still recommend dark mode though.",

  "language.title": "Pick your language!",
  "language.desc":
    "Buttons, charts, and the nagging all switch to your pick.\nYour logged workouts stay exactly where they are, so go ahead.",

  "userInfo.title": "Tell us about yourself.",
  "userInfo.desc":
    "Fill in your Big 3 lifts, age, gender and body stats. Update them whenever your lifts go up or your weight goes down — it makes your charts much more useful.",
  "userInfo.sbd": "Big 3 Lifts",
  "userInfo.body": "Body Stats",
  "userInfo.height": "Height",
  "userInfo.weight": "Weight",
  "userInfo.age": "Age",
  "userInfo.ageUnit": "yrs",
  "userInfo.gender": "Gender",
  "userInfo.male": "Male",
  "userInfo.female": "Female",
  "userInfo.required": "Please fill in every field!",
  "userInfo.saved": "Profile saved!",
  "userInfo.ageValue": "{n} yrs",
  "userInfo.emptyTitle": "Record your Big 3",
  "userInfo.emptyDesc":
    "Fill in your profile and your Squat · Bench Press · Deadlift\nrecords will show up here",
  "userInfo.goWrite": "Fill it in",

  "data.title": "Keep the workout plans you've logged.",
  "data.desc":
    "Deleting the app wipes every workout plan you've logged. Why not export a backup file so you can pick things up again later?",
  "data.backupSection": "Backup · Restore",
  "data.backup": "Backup",
  "data.backupDesc": "Export as a .pown file",
  "data.restore": "Restore",
  "data.restoreDesc": "Import a .pown file",
  "data.resetSection": "Reset",
  "data.resetAll": "Reset all data",
  "data.resetConfirm": "Delete all data for real?",
  "data.resetDone": "All data has been reset",
  "data.shareUnavailable": "File sharing isn't available on this device.",
  "data.backupFailed": "Something went wrong while saving the backup file.",
  "data.notBackupFile": "That's not a Pown backup file. Please check the file.",
  "data.restored": "Restored",
  "data.restoreFailed": "Something went wrong while restoring. Please check the file.",

  "calc.kg": "Kilograms/kg",
  "calc.lb": "Pounds/lb",
}

export const translations: Record<Lang, Record<TKey, string>> = { ko, en }

export const interpolate = (
  text: string,
  vars?: Record<string, string | number>,
) =>
  vars
    ? text.replace(/\{(\w+)\}/g, (m, k) => String(vars[k] ?? m))
    : text

export const translate = (
  lang: Lang,
  key: TKey,
  vars?: Record<string, string | number>,
) => interpolate(translations[lang][key] ?? key, vars)

// ---------------------------------------------------------------------------
// 도메인 값 사전 — 저장값(한국어)을 키로 받아 표시 라벨을 돌려준다.
// 사전에 없으면 입력 그대로 반환 (사용자가 직접 추가한 운동 태그 대응).
// ---------------------------------------------------------------------------

const EQUIPMENT_EN: Record<string, string> = {
  바벨: "Barbell",
  덤벨: "Dumbbell",
  머신: "Machine",
  스미스: "Smith",
  케이블: "Cable",
  맨몸: "Bodyweight",
}

// 기구 선택 탭은 한 줄 6칸 고정 폭이라 풀네임이 안 들어간다 — 거기서만 쓰는 축약형
const EQUIPMENT_SHORT_EN: Record<string, string> = {
  바벨: "BB",
  덤벨: "DB",
  머신: "Mach",
  스미스: "Smith",
  케이블: "Cable",
  맨몸: "Body",
}

const CONDITION_EN: Record<string, string> = {
  좋음: "Good",
  피곤함: "Tired",
  화남: "Angry",
  아픔: "Sore",
  슬픔: "Sad",
  신남: "Pumped",
  상쾌함: "Fresh",
  양호함: "Fine",
  짜증남: "Annoyed",
  // 현재 conditionData에는 없지만 기존 기록에 남아 있는 값
  가벼움: "Light",
}

const PROGRESS_EN: Record<string, string> = {
  진행중: "In progress",
  완료: "Done",
}

const SET_TYPE_EN: Record<string, string> = {
  웜업: "Warm-up",
  "본 세트": "Working",
  PR: "PR",
  연습: "Practice",
}

const BODY_PART: Record<Lang, Record<string, string>> = {
  ko: { back: "등", chest: "가슴", shoulder: "어깨", leg: "하체", arm: "팔" },
  en: {
    back: "Back",
    chest: "Chest",
    shoulder: "Shoulders",
    leg: "Legs",
    arm: "Arms",
  },
}

const WORKOUT_EN: Record<string, string> = {
  // back
  데드리프트: "Deadlift",
  로우: "Row",
  풀업: "Pull-up",
  친업: "Chin-up",
  랫풀다운: "Lat Pulldown",
  암풀다운: "Straight-arm Pulldown",
  컨벤셔널데드: "Conventional Deadlift",
  루마니안데드: "Romanian Deadlift",
  렉풀: "Rack Pull",
  티바로우: "T-Bar Row",
  하이로우: "High Row",
  로우로우: "Low Row",
  원암로우: "One-arm Row",
  벤트오버로우: "Bent-over Row",
  펜들레이로우: "Pendlay Row",
  시티드로우: "Seated Row",
  프론트로우: "Front Row",
  슈러그: "Shrug",
  // chest
  벤치프레스: "Bench Press",
  인클라인프레스: "Incline Press",
  디클라인프레스: "Decline Press",
  체스트프레스: "Chest Press",
  클로즈그립프레스: "Close-grip Press",
  와이드프레스: "Wide-grip Press",
  시티드프레스: "Seated Press",
  플랫프레스: "Flat Press",
  팩덱플라이: "Pec Deck Fly",
  펙덱플라이: "Pec Deck Fly",
  플라이: "Fly",
  딥스: "Dips",
  풀오버: "Pullover",
  // shoulder
  오버헤드프레스: "Overhead Press",
  밀리터리프레스: "Military Press",
  숄더프레스: "Shoulder Press",
  푸쉬프레스: "Push Press",
  비하인드넥프레스: "Behind Neck Press",
  프론트레이즈: "Front Raise",
  사이드레터럴레이즈: "Lateral Raise",
  벤트오버레이즈: "Bent-over Raise",
  업라이트로우: "Upright Row",
  페이스풀: "Face Pull",
  // leg
  스쿼트: "Squat",
  백스쿼트: "Back Squat",
  핵스쿼트: "Hack Squat",
  브이스쿼트: "V-Squat",
  레그프레스: "Leg Press",
  레그익스텐션: "Leg Extension",
  레그컬: "Leg Curl",
  런지: "Lunge",
  스티프데드: "Stiff-leg Deadlift",
  스모데드: "Sumo Deadlift",
  인어싸이: "Hip Adduction",
  아웃싸이: "Hip Abduction",
  프론트스쿼트: "Front Squat",
  스플릿스쿼트: "Split Squat",
  와이드스쿼트: "Wide Squat",
  펜듈럼스쿼트: "Pendulum Squat",
  힙쓰러스트: "Hip Thrust",
  카프레이즈: "Calf Raise",
  하이바스쿼트: "High-bar Squat",
  로우바스쿼트: "Low-bar Squat",
  킥백: "Kickback",
  // arm
  컬: "Curl",
  해머컬: "Hammer Curl",
  푸쉬다운: "Pushdown",
  스컬크러셔: "Skull Crusher",
  삼두익스텐션: "Triceps Extension",
  리버스컬: "Reverse Curl",
  리스트컬: "Wrist Curl",
  프리쳐컬: "Preacher Curl",
  스파이더컬: "Spider Curl",
  리버스리스트컬: "Reverse Wrist Curl",
  컨센트레이션컬: "Concentration Curl",
  바벨컬: "Barbell Curl",
  덤벨컬: "Dumbbell Curl",
  케이블컬: "Cable Curl",
}

const lookup =
  (dict: Record<string, string>) =>
  (value: string, lang: Lang): string =>
    lang === "ko" ? value : (dict[value] ?? value)

export const tWorkout = lookup(WORKOUT_EN)
export const tEquipment = lookup(EQUIPMENT_EN)
export const tEquipmentShort = lookup(EQUIPMENT_SHORT_EN)
export const tCondition = lookup(CONDITION_EN)
export const tProgress = lookup(PROGRESS_EN)
export const tSetType = lookup(SET_TYPE_EN)

export const tBodyPart = (type: string, lang: Lang): string =>
  BODY_PART[lang][type] ?? type
