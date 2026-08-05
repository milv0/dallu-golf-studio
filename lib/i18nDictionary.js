// ko/en 번역 사전. JSX가 없는 순수 데이터 모듈이라 Node 테스트에서 직접 import할 수 있다.
export const dictionary = {
  ko: {
    // HomeHub
    "home.title": "Golf Studio",
    "home.subtitle": "골프 스코어카드를 이미지로 만들어 공유하세요",
    "home.roundTitle": "내 라운드 기록",
    "home.roundDesc": "18홀 라운드를 입력하고 9·3·1홀 카드를 자동 생성",
    "home.customTitle": "직접 만들기",
    "home.customDesc": "원하는 홀 수만큼 자유롭게 스코어카드 제작",
    "home.start": "시작하기",
    "home.preparing": "준비 중",
    "home.addToHome": "홈 화면에 추가",
    "home.installSteps": "Chrome · Safari → 공유 → 홈 화면에 추가",
    "home.guideLink": "사용 방법 · Q&A",
    "home.footer": "로그인 · 코스 DB · 라운드 저장 — 준비 중",
    "home.login": "로그인",

    // StudioNav / TopActions
    "nav.preparing": "준비 중",
    "nav.loginDisabled": "로그인 기능 준비 중",
    "nav.login": "로그인",
    "nav.logout": "로그아웃",
    "nav.outputSelect": "출력 선택",
    "theme.toLight": "라이트 테마로 전환",
    "theme.toDark": "다크 테마로 전환",

    // PreviewExportPanel
    "preview.title": "미리보기",
    "preview.share": "공유",
    "preview.download": "PNG 다운로드",
    "preview.inputRequired": "입력 필요",
    "preview.generating": "생성 중...",
    "preview.batchSave": "홀별 ${n}장 저장",
    "preview.output": "출력",
    "preview.inputFirst": "필수 항목을 먼저 입력하세요",
    "preview.iphoneHint": "iPhone: 공유 → 이미지 저장 선택",
    "preview.allScoresRequired": "모든 스코어를 먼저 입력하세요",
    "preview.batchToZip": "홀별 PNG를 ZIP으로 저장",
    "preview.retryBtn": "재시도",
    "preview.pngSpec": "PNG · ${w}x${h}px",
    "preview.range": "범위",
    "range.all": "전체 18홀",
    "range.front": "전반 OUT 9",
    "range.back": "후반 IN 9",

    // Tabs
    "tab.hole18": "18홀",
    "tab.hole9": "9홀",
    "tab.hole3": "3홀",
    "tab.hole1": "1홀",

    // ScoreInputs
    "score.relativeHint": "파 기준 입력: 버디 ",
    "score.par": " · 파 ",
    "score.bogey": " · 보기 ",
    "score.arrowHint": " · ←/→ 키로 조정",
    "score.strokes": "타수",
    "score.toPar": "파대비",

    // PanelHeader
    "panel.reset": "초기화",

    // HoleCardForm
    "hole.title": "현재 홀 정보",
    "hole.selector": "홀 선택 (PAR·토탈 자동 연동)",
    "hole.currentShot": "현재 타수",
    "hole.labelHole": "홀",
    "hole.par": "PAR",
    "hole.none": "없음",
    "hole.distance": "거리",
    "hole.forBanner": "FOR EAGLE/BIRDIE 표시",
    "hole.linkedHint": "홀 선택 시 PAR·토탈·타수 자동 반영 · 거리/클럽은 직접 입력",

    // BasicInfoPanel
    "info.title": "기본 정보",
    "info.player": "선수",
    "info.playerPlaceholder": "이름",
    "info.date": "날짜",
    "label.name": "이름",
    "label.parTotal": "OUT ${out} · IN ${in} · 합 ${total}",

    // StudioFields
    "field.course": "골프장",
    "field.coursePlaceholder": "골프장 이름 검색",
    "field.club": "선택 클럽",

    // Feedback
    "confirm.title": "확인",
    "confirm.cancel": "취소",
    "confirm.yes": "네",

    // ManualScoreForms
    "manual.nineTitle": "9홀 입력",
    "manual.threeTitle": "3홀 입력",
    "manual.threeSelect": "3홀 선택",
    "manual.toPar": "TO PAR 직접 입력",
    "manual.toParPlaceholder": "자동 계산",
    "manual.showHoleNumbers": "홀 번호 표시",
    "manual.threeHoleHint": "시작 홀을 누르면 연속 3홀 선택. 예: 2번 → 2·3·4",

    // RoundSourcePanel
    "source.selected": "선택된 라운드",
    "source.needScores": "홀별 스코어를 먼저 입력해주세요",
    "source.editLink": "18홀 입력/수정",

    // CoursePresets
    "course.title": "코스",
    "course.disabled": "코스 불러오기 준비 중 · PAR는 아래에서 직접 입력",
    "course.selectHint": "기본 정보에서 골프장 선택 시 코스 표시",
    "course.noCourses": "등록된 코스 없음",
    "course.favorite": "즐겨찾기",
    "course.favorites": "즐겨찾기",
    "course.refresh": "코스 목록 새로고침",
    "course.cache": "캐시",
    "course.sync": "동기화",
    "course.nineRepeat": "9H · OUT/IN 반복",
    "course.pick": "코스 선택",

    // RoundRecords
    "records.title": "내 라운딩",
    "records.disabled": "기록 저장·불러오기 기능 준비 중",
    "records.disabledDetail": "저장 기능 준비 중이에요. 조금만 기다려주세요!",

    // StudioApp (toasts and labels)
    "toast.reset18": "18홀 스코어카드를 초기화했습니다.",
    "toast.resetCustom18": "커스텀 18홀을 초기화했습니다.",
    "toast.reset9": "9홀 스코어카드를 초기화했습니다.",
    "toast.reset3": "3홀 스코어카드를 초기화했습니다.",
    "toast.reset1": "1홀 정보를 초기화했습니다.",
    "toast.resetCustom1": "커스텀 1홀 정보를 초기화했습니다.",
    "toast.downloadStart": "PNG 다운로드를 시작했습니다.",
    "toast.exportFail": "내보내기 실패 — 다시 시도해주세요.",
    "toast.shareFail": "공유에 실패했습니다. 다시 시도해주세요.",
    "toast.shareUnsupported": "공유 저장을 지원하지 않아 PNG 다운로드로 처리했습니다.",
    "toast.batchDone": "홀별 이미지 ${n}장을 ZIP으로 저장합니다.",
    "toast.batchFail": "홀별 저장에 실패했습니다. 다시 시도해주세요.",
    "label.scoreInput": "스코어 입력",
    "label.parEdit": "PAR 수정",
    "label.progress": "${n}/18홀 입력",
    "label.parWarning": "⚠ 표준 파72와 다름 (확인)",
    "block.needScores": "연동할 홀의 스코어를 먼저 입력하세요.",
    "block.needThreeHoles": "3홀은 정확히 3개 홀을 선택해야 합니다.",
    "block.needHoleInfo": "현재 홀 정보를 먼저 입력하세요.",

    // 확인 문구
    "confirm.reset18": "18홀 스코어카드를 초기화할까요?",
    "confirm.resetCustom18": "커스텀 18홀을 초기화할까요?",
    "confirm.reset9": "9홀 스코어카드를 초기화할까요?",
    "confirm.reset3": "3홀 스코어카드를 초기화할까요?",
    "confirm.reset1": "1홀 정보를 초기화할까요?",
    "confirm.resetCustom1": "커스텀 1홀 정보를 초기화할까요?",

    // 스크린리더 라벨
    "a11y.holeNumber": "${n}번째 홀 번호",
    "a11y.holePar": "${n}번 홀 PAR",
    "a11y.holeScore": "${n}번 홀 스코어",
    "a11y.holeDistance": "${n}번 홀 거리",
    "a11y.holeToPar": "${n}번 홀 파대비",
    "a11y.cardTheme": "카드 테마",
    "a11y.cardDark": "다크 카드",
    "a11y.cardLight": "라이트 카드",
    "a11y.outputQuality": "출력 품질",
    "label.sum": "합",
    "a11y.holeButton": "${n}번 홀 · PAR ${par}",
    "a11y.holeButtonScore": "${n}번 홀 · PAR ${par} · ${score}타",
    "a11y.threeGroup": "${a}-${b}번 홀 묶음 선택",

    // 404
    "notfound.title": "404",
    "notfound.message": "페이지를 찾을 수 없어요",
    "notfound.home": "홈으로 돌아가기",
  },
  en: {
    // HomeHub
    "home.title": "Golf Studio",
    "home.subtitle": "Create and share golf scorecard overlays",
    "home.roundTitle": "My Round",
    "home.roundDesc": "Enter 18-hole round and auto-generate 9·3·1 hole cards",
    "home.customTitle": "Custom",
    "home.customDesc": "Create scorecards freely for any number of holes",
    "home.start": "Start",
    "home.preparing": "Coming Soon",
    "home.addToHome": "Add to Home Screen",
    "home.installSteps": "Chrome · Safari → Share → Add to Home Screen",
    "home.guideLink": "Guide · Q&A",
    "home.footer": "Login · Course DB · Round save — Coming soon",
    "home.login": "Login",

    // StudioNav / TopActions
    "nav.preparing": "Coming Soon",
    "nav.loginDisabled": "Login coming soon",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.outputSelect": "Output",
    "theme.toLight": "Switch to light theme",
    "theme.toDark": "Switch to dark theme",

    // PreviewExportPanel
    "preview.title": "Preview",
    "preview.share": "Share",
    "preview.download": "PNG Download",
    "preview.inputRequired": "Input needed",
    "preview.generating": "Generating...",
    "preview.batchSave": "${n} by hole",
    "preview.output": "Output",
    "preview.inputFirst": "Fill required fields first",
    "preview.iphoneHint": "iPhone: Share → Save Image",
    "preview.allScoresRequired": "Fill all scores first",
    "preview.batchToZip": "Save hole-by-hole PNGs as ZIP",
    "preview.retryBtn": "Retry",
    "preview.pngSpec": "PNG · ${w}x${h}px",
    "preview.range": "Range",
    "range.all": "All 18",
    "range.front": "Front OUT 9",
    "range.back": "Back IN 9",

    // Tabs
    "tab.hole18": "18H",
    "tab.hole9": "9H",
    "tab.hole3": "3H",
    "tab.hole1": "1H",

    // ScoreInputs
    "score.relativeHint": "Relative to par: Birdie ",
    "score.par": " · Par ",
    "score.bogey": " · Bogey ",
    "score.arrowHint": " · ←/→ keys to adjust",
    "score.strokes": "Strokes",
    "score.toPar": "To Par",

    // PanelHeader
    "panel.reset": "Reset",

    // HoleCardForm
    "hole.title": "Current Hole Info",
    "hole.selector": "Hole Select (PAR·Total auto-linked)",
    "hole.currentShot": "Current Shot",
    "hole.labelHole": "Hole",
    "hole.par": "PAR",
    "hole.none": "None",
    "hole.distance": "Distance",
    "hole.forBanner": "Show FOR EAGLE/BIRDIE",
    "hole.linkedHint": "Select hole for auto PAR·Total·Shot · Enter distance/club manually",

    // BasicInfoPanel
    "info.title": "Info",
    "info.player": "Player",
    "info.playerPlaceholder": "Name",
    "info.date": "Date",
    "label.name": "Name",
    "label.parTotal": "OUT ${out} · IN ${in} · Total ${total}",

    // StudioFields
    "field.course": "Course",
    "field.coursePlaceholder": "Search course name",
    "field.club": "Club",

    // Feedback
    "confirm.title": "Confirm",
    "confirm.cancel": "Cancel",
    "confirm.yes": "Yes",

    // ManualScoreForms
    "manual.nineTitle": "9 Hole",
    "manual.threeTitle": "3 Hole",
    "manual.threeSelect": "3-Hole Select",
    "manual.toPar": "TO PAR Manual",
    "manual.toParPlaceholder": "Auto",
    "manual.showHoleNumbers": "Show hole numbers",
    "manual.threeHoleHint": "Tap start hole for 3 consecutive. e.g.: 2 → 2·3·4",

    // RoundSourcePanel
    "source.selected": "Selected Round",
    "source.needScores": "Enter hole scores first",
    "source.editLink": "Edit 18-hole",

    // CoursePresets
    "course.title": "Course",
    "course.disabled": "Course loading coming soon · Enter PAR manually below",
    "course.selectHint": "Select course in Info to show presets",
    "course.noCourses": "No courses registered",
    "course.favorite": "Favorite",
    "course.favorites": "Favorites",
    "course.refresh": "Refresh course list",
    "course.cache": "Cached",
    "course.sync": "Syncing",
    "course.nineRepeat": "9H · OUT/IN repeat",
    "course.pick": "Select course",

    // RoundRecords
    "records.title": "My Rounds",
    "records.disabled": "Save/load coming soon",
    "records.disabledDetail": "Save feature coming soon. Please wait!",

    // StudioApp (toasts and labels)
    "toast.reset18": "18-hole scorecard reset.",
    "toast.resetCustom18": "Custom 18-hole reset.",
    "toast.reset9": "9-hole scorecard reset.",
    "toast.reset3": "3-hole scorecard reset.",
    "toast.reset1": "1-hole info reset.",
    "toast.resetCustom1": "Custom 1-hole reset.",
    "toast.downloadStart": "PNG download started.",
    "toast.exportFail": "Export failed — please retry.",
    "toast.shareFail": "Share failed — please retry.",
    "toast.shareUnsupported": "Share not supported, downloaded as PNG.",
    "toast.batchDone": "${n} images saved as ZIP.",
    "toast.batchFail": "Batch save failed — please retry.",
    "label.scoreInput": "Score Entry",
    "label.parEdit": "Edit PAR",
    "label.progress": "${n}/18 entered",
    "label.parWarning": "⚠ Non-standard PAR (check)",
    "block.needScores": "Enter scores for the linked holes first.",
    "block.needThreeHoles": "Select exactly 3 holes.",
    "block.needHoleInfo": "Enter current hole info first.",

    // Confirm prompts
    "confirm.reset18": "Reset the 18-hole scorecard?",
    "confirm.resetCustom18": "Reset the custom 18-hole card?",
    "confirm.reset9": "Reset the 9-hole scorecard?",
    "confirm.reset3": "Reset the 3-hole scorecard?",
    "confirm.reset1": "Reset the 1-hole info?",
    "confirm.resetCustom1": "Reset the custom 1-hole info?",

    // Screen reader labels
    "a11y.holeNumber": "Hole number ${n}",
    "a11y.holePar": "Hole ${n} PAR",
    "a11y.holeScore": "Hole ${n} score",
    "a11y.holeDistance": "Hole ${n} distance",
    "a11y.holeToPar": "Hole ${n} to par",
    "a11y.cardTheme": "Card theme",
    "a11y.cardDark": "Dark card",
    "a11y.cardLight": "Light card",
    "a11y.outputQuality": "Output quality",
    "label.sum": "Sum",
    "a11y.holeButton": "Hole ${n} · PAR ${par}",
    "a11y.holeButtonScore": "Hole ${n} · PAR ${par} · ${score} strokes",
    "a11y.threeGroup": "Select holes ${a}-${b}",

    // 404
    "notfound.title": "404",
    "notfound.message": "Page not found",
    "notfound.home": "Go Home",
  },
};
