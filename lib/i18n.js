"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "sc-lang";
const DEFAULT_LANG = "ko";

const dictionary = {
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
    "home.guideLink": "사용 방법 · Q&A",
    "home.footer": "로그인 · 코스 DB · 라운드 저장 — 준비 중",
    "home.login": "로그인",
    "home.logout": "로그아웃",
    "home.loginDisabled": "로그인 기능 준비 중",

    // StudioNav / TopActions
    "nav.preparing": "준비 중",
    "nav.loginDisabled": "로그인 기능 준비 중",
    "nav.login": "로그인",
    "nav.logout": "로그아웃",
    "nav.outputSelect": "출력 선택",

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
    "preview.placement": "실제 배치 미리보기",
    "preview.landscape": "16:9 영상 기준",
    "preview.portrait": "9:16 영상 기준",
    "preview.pngSpec": "PNG · ${w}x${h}px",
    "preview.colorHint": "버디=빨강 / 이글=골드 / 보기=파랑",

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

    // PanelHeader
    "panel.reset": "초기화",

    // HoleCardForm
    "hole.title": "현재 홀 정보",
    "hole.selector": "홀 선택 (PAR·토탈 자동 연동)",
    "hole.currentShot": "현재 타수",
    "hole.labelHole": "홀",
    "hole.labelShot": "타",
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

    // RoundRecords
    "records.title": "내 라운딩",
    "records.disabled": "기록 저장·불러오기 기능 준비 중",
    "records.disabledDetail": "저장 기능 준비 중이에요. 조금만 기다려주세요!",

    // StudioApp (toasts and labels)
    "toast.saved": "내 라운딩에 저장됨",
    "toast.reset18": "18홀 스코어카드를 초기화했습니다.",
    "toast.resetCustom18": "커스텀 18홀을 초기화했습니다.",
    "toast.reset9": "9홀 스코어카드를 초기화했습니다.",
    "toast.reset3": "3홀 스코어카드를 초기화했습니다.",
    "toast.reset1": "1홀 정보를 초기화했습니다.",
    "toast.resetCustom1": "커스텀 1홀 정보를 초기화했습니다.",
    "toast.downloadStart": "PNG 다운로드를 시작했습니다.",
    "toast.exportFail": "내보내기 실패 — 다시 시도해주세요.",
    "toast.shareFail": "공유 실패: ",
    "toast.shareUnsupported": "공유 저장을 지원하지 않아 PNG 다운로드로 처리했습니다.",
    "toast.batchDone": "홀별 이미지 ${n}장을 ZIP으로 저장합니다.",
    "toast.batchFail": "홀별 저장 실패: ",
    "label.scoreInput": "스코어 입력",
    "label.parEdit": "PAR 수정",
    "label.progress": "${n}/18홀 입력",
    "label.parWarning": "⚠ 표준 파72와 다름 (확인)",
    "block.needScores": "18홀 스코어에서 홀 스코어를 먼저 입력하세요.",
    "block.needThreeHoles": "3홀은 정확히 3개 홀을 선택해야 합니다.",
    "block.needHoleInfo": "현재 홀 정보를 먼저 입력하세요.",

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
    "home.guideLink": "Guide · Q&A",
    "home.footer": "Login · Course DB · Round save — Coming soon",
    "home.login": "Login",
    "home.logout": "Logout",
    "home.loginDisabled": "Login coming soon",

    // StudioNav / TopActions
    "nav.preparing": "Coming Soon",
    "nav.loginDisabled": "Login coming soon",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.outputSelect": "Output",

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
    "preview.placement": "Placement Preview",
    "preview.landscape": "16:9 landscape",
    "preview.portrait": "9:16 portrait",
    "preview.pngSpec": "PNG · ${w}x${h}px",
    "preview.colorHint": "Birdie=Red / Eagle=Gold / Bogey=Blue",

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

    // PanelHeader
    "panel.reset": "Reset",

    // HoleCardForm
    "hole.title": "Current Hole Info",
    "hole.selector": "Hole Select (PAR·Total auto-linked)",
    "hole.currentShot": "Current Shot",
    "hole.labelHole": "Hole",
    "hole.labelShot": "Shot",
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

    // RoundRecords
    "records.title": "My Rounds",
    "records.disabled": "Save/load coming soon",
    "records.disabledDetail": "Save feature coming soon. Please wait!",

    // StudioApp (toasts and labels)
    "toast.saved": "Saved to My Rounds",
    "toast.reset18": "18-hole scorecard reset.",
    "toast.resetCustom18": "Custom 18-hole reset.",
    "toast.reset9": "9-hole scorecard reset.",
    "toast.reset3": "3-hole scorecard reset.",
    "toast.reset1": "1-hole info reset.",
    "toast.resetCustom1": "Custom 1-hole reset.",
    "toast.downloadStart": "PNG download started.",
    "toast.exportFail": "Export failed — please retry.",
    "toast.shareFail": "Share failed: ",
    "toast.shareUnsupported": "Share not supported, downloaded as PNG.",
    "toast.batchDone": "${n} images saved as ZIP.",
    "toast.batchFail": "Batch save failed: ",
    "label.scoreInput": "Score Entry",
    "label.parEdit": "Edit PAR",
    "label.progress": "${n}/18 entered",
    "label.parWarning": "⚠ Non-standard PAR (check)",
    "block.needScores": "Enter hole scores from 18-hole first.",
    "block.needThreeHoles": "Select exactly 3 holes.",
    "block.needHoleInfo": "Enter current hole info first.",

    // 404
    "notfound.title": "404",
    "notfound.message": "Page not found",
    "notfound.home": "Go Home",
  },
};

export const LangContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  t: (key) => key,
});

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(DEFAULT_LANG);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "en" || stored === "ko") {
        setLangState(stored);
      }
    } catch {}
  }, []);

  const setLang = useCallback((next) => {
    const value = next === "en" ? "en" : "ko";
    setLangState(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {}
  }, []);

  const t = useCallback(
    (key, params) => {
      const dict = dictionary[lang] || dictionary[DEFAULT_LANG];
      let str = dict[key] ?? dictionary[DEFAULT_LANG][key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          str = str.replace(`\${${k}}`, String(v));
        }
      }
      return str;
    },
    [lang]
  );

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
