"use client";

import Link from "next/link";
import { useLang } from "../../lib/i18n";
import LangToggle from "./LangToggle";
import ThemeToggle from "./ThemeToggle";

const USAGE_STEPS_KO = [
  { step: "1", title: "스코어 입력", desc: "홈에서 '직접 만들기' 선택 → 탭(18홀/9홀/3홀/1홀) 선택 → PAR과 스코어 입력" },
  { step: "2", title: "미리보기 확인", desc: "스코어 입력 시 카드에 실시간 반영. 다크/라이트 테마와 출력 품질 선택 가능" },
  { step: "3", title: "공유 또는 다운로드", desc: "모바일: '공유' → 사진앱 저장 / 데스크탑: 'PNG 다운로드' 클릭" },
];

const USAGE_STEPS_EN = [
  { step: "1", title: "Score Entry", desc: "Select 'Custom' from home → Choose tab (18/9/3/1 hole) → Enter PAR and scores" },
  { step: "2", title: "Preview", desc: "Card updates in real-time as you enter scores. Choose dark/light theme and output quality" },
  { step: "3", title: "Share or Download", desc: "Mobile: 'Share' → Save Image / Desktop: Click 'PNG Download'" },
];

const QA_GENERAL_KO = [
  {
    q: "이 앱은 뭔가요?",
    a: "골프 스코어카드를 투명 배경 PNG 이미지로 만들어주는 도구입니다. 유튜브 영상이나 인스타 릴스 편집 시 오버레이로 올릴 수 있습니다.",
  },
  {
    q: "투명 배경 PNG란?",
    a: "배경이 없는 이미지입니다. 영상 편집 프로그램(프리미어, 캡컷 등)에서 오버레이로 올리면 스코어카드만 보이고 뒤 배경은 그대로 투과됩니다.",
  },
  {
    q: "스코어카드 저장은 어떻게 하나요?",
    a: "모바일(iPhone/Android)에서는 '공유' 버튼 → 공유 시트에서 '이미지 저장'을 선택합니다. 데스크탑에서는 'PNG 다운로드' 버튼을 누르면 자동으로 파일이 저장됩니다.",
  },
  {
    q: "Reels / YouTube / MAX 차이는?",
    a: "출력 해상도(픽셀 크기) 차이입니다. Reels는 1080p(릴스/틱톡용), YouTube는 4K(유튜브 영상용), MAX는 최고 해상도입니다. 릴스 편집용이라면 Reels로 충분합니다.",
  },
  {
    q: "Strokes / To Par 차이는?",
    a: "Strokes(타수)는 절대 타수를 직접 입력합니다 (예: 4, 5, 3). To Par는 PAR 대비 차이로 입력합니다 (예: -1은 버디, 0은 파, +1은 보기). 어느 모드로 입력해도 카드에는 동일하게 표시됩니다.",
  },
  {
    q: "18홀 카드와 9홀/3홀/1홀 차이는?",
    a: "18홀은 가로형(유튜브 16:9), 9홀·3홀은 세로형(릴스 9:16), 1홀은 현재 홀 상태를 보여주는 방송 스타일 오버레이입니다. 영상 포맷에 맞는 걸 선택하세요.",
  },
  {
    q: "홀별 N장 저장은 뭔가요?",
    a: "데스크탑에서만 제공되는 기능입니다. 18홀이면 1홀부터 18홀까지 순서대로 스코어가 추가되는 18장의 이미지를 ZIP 파일로 한 번에 다운로드합니다. 영상 편집 시 홀별로 갈아끼울 수 있습니다.",
  },
];

const QA_GENERAL_EN = [
  {
    q: "What is this app?",
    a: "A tool that creates golf scorecards as transparent PNG images. Use them as overlays when editing YouTube videos or Instagram Reels.",
  },
  {
    q: "What is a transparent PNG?",
    a: "An image with no background. When placed as an overlay in editing software (Premiere, CapCut, etc.), only the scorecard is visible while the video shows through.",
  },
  {
    q: "How do I save the scorecard?",
    a: "Mobile (iPhone/Android): Tap 'Share' → select 'Save Image' from the share sheet. Desktop: Click 'PNG Download' and the file saves automatically.",
  },
  {
    q: "Reels / YouTube / MAX difference?",
    a: "Output resolution difference. Reels is 1080p (for Reels/TikTok), YouTube is 4K (for video overlays), MAX is highest resolution. Reels is sufficient for short-form editing.",
  },
  {
    q: "Strokes vs To Par?",
    a: "Strokes enters absolute shot count (e.g. 4, 5, 3). To Par enters the difference from PAR (e.g. -1 for birdie, 0 for par, +1 for bogey). Both modes produce the same card.",
  },
  {
    q: "18-hole vs 9/3/1 hole cards?",
    a: "18-hole is landscape (YouTube 16:9), 9/3-hole is portrait (Reels 9:16), 1-hole shows current hole status in broadcast style. Choose based on your video format.",
  },
  {
    q: "What is hole-by-hole batch save?",
    a: "Desktop-only feature. For 18 holes, it downloads 18 images as a ZIP — each image adds one more hole's score progressively. Swap them per-hole during video editing.",
  },
];

const QA_CUSTOM_KO = [
  {
    q: "직접 만들기는 뭔가요?",
    a: "18홀/9홀/3홀/1홀 카드를 각각 독립적으로 만드는 모드입니다. 각 탭의 입력은 서로 연동되지 않으며, 원하는 카드만 자유롭게 제작할 수 있습니다.",
  },
  {
    q: "PAR은 어떻게 입력하나요?",
    a: "스코어 입력 표의 두 번째 행(P)을 터치하면 PAR을 입력할 수 있습니다. 3, 4, 5, 6만 허용됩니다.",
  },
  {
    q: "1홀 카드에서 홀 번호는?",
    a: "직접 만들기에서는 홀 번호를 숫자로 직접 입력합니다 (1~18). 라운드 데이터와 연동되지 않으므로 자유롭게 설정하세요.",
  },
  {
    q: "FOR EAGLE / FOR BIRDIE / FOR BOGEY 배너는?",
    a: "1홀 카드에서 현재 타수를 입력하면 자동 판단됩니다. PAR 5에서 3번째 샷 = FOR EAGLE, PAR 4에서 3번째 샷 = FOR BIRDIE, PAR+1 = FOR BOGEY, PAR+2 = FOR DOUBLE BOGEY.",
  },
  {
    q: "PAR을 안 넣으면?",
    a: "커스텀 모드에서는 PAR이 빈 상태로 시작합니다. PAR 없이 스코어만 입력하면 TO PAR이 '–'로 표시됩니다. PAR을 먼저 입력하세요.",
  },
  {
    q: "홀별 저장 버튼이 비활성인데?",
    a: "모든 홀의 스코어가 채워져야 홀별 저장 버튼이 활성화됩니다. 빈 홀이 있으면 비활성 상태입니다.",
  },
];

const QA_CUSTOM_EN = [
  {
    q: "What is Custom mode?",
    a: "A mode to create 18/9/3/1 hole cards independently. Each tab's input is separate, so you can freely create just the cards you need.",
  },
  {
    q: "How do I enter PAR?",
    a: "Tap the second row (P) in the score table to enter PAR. Only 3, 4, 5, 6 are accepted.",
  },
  {
    q: "Hole number in 1-hole card?",
    a: "In Custom mode, enter the hole number directly (1-18). It is not linked to round data, so set it freely.",
  },
  {
    q: "FOR EAGLE / BIRDIE / BOGEY banner?",
    a: "Auto-determined by current shot. PAR 5 3rd shot = FOR EAGLE, PAR 4 3rd shot = FOR BIRDIE, PAR+1 = FOR BOGEY, PAR+2 = FOR DOUBLE BOGEY.",
  },
  {
    q: "What if I don't enter PAR?",
    a: "Custom mode starts with empty PAR. If you enter scores without PAR, TO PAR shows '–'. Enter PAR first.",
  },
  {
    q: "Batch save button is disabled?",
    a: "All holes must have scores filled before the batch save button activates. Check for empty holes.",
  },
];

const QA_ROUND_KO = [
  {
    q: "내 라운드 기록은 뭔가요?",
    a: "18홀을 한 번 입력하면 같은 PAR와 스코어로 9홀·3홀·1홀 카드를 만드는 연동 모드입니다. 현재 공개 버전에서는 비활성화되어 있습니다.",
  },
  {
    q: "직접 만들기와 뭐가 다른가요?",
    a: "내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 자동 반영됩니다. 직접 만들기에서는 각 카드가 독립적입니다.",
  },
  {
    q: "코스 불러오기란?",
    a: "등록된 골프장의 PAR 정보를 한 번에 채우는 기능이며 현재 비활성화되어 있습니다.",
  },
  {
    q: "현재 사용할 수 없는 기능은?",
    a: "내 라운드 기록 전체와 로그인, 코스 DB 자동 불러오기, 서버 라운드 저장·불러오기가 비활성화되어 있습니다. 현재는 직접 만들기를 사용해주세요.",
  },
];

const QA_ROUND_EN = [
  {
    q: "What is My Round?",
    a: "A linked mode that uses one 18-hole PAR and score entry to create 9/3/1-hole cards. It is disabled in the current public release.",
  },
  {
    q: "How is it different from Custom?",
    a: "In My Round, scores and PAR entered for 18 holes automatically reflect in 9/3/1 hole cards. In Custom mode, each card is independent.",
  },
  {
    q: "What is Load Course?",
    a: "A feature that fills registered course PAR data at once. It is currently disabled.",
  },
  {
    q: "Which features are unavailable?",
    a: "My Round, login, automatic course DB loading, and server-side round save/load are disabled. Use Custom mode for now.",
  },
];

function FaqSection({ title, items }) {
  return (
    <section className="mt-10">
      <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">
        {title}
      </h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <div key={item.q} className="rounded-xl border border-line bg-panel p-4">
            <div className="font-head text-[14px] font-bold text-txt">{item.q}</div>
            <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">{item.a}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function GuidePage() {
  const { lang, t } = useLang();

  const USAGE_STEPS = lang === "en" ? USAGE_STEPS_EN : USAGE_STEPS_KO;
  const QA_GENERAL = lang === "en" ? QA_GENERAL_EN : QA_GENERAL_KO;
  const QA_CUSTOM = lang === "en" ? QA_CUSTOM_EN : QA_CUSTOM_KO;
  const QA_ROUND = lang === "en" ? QA_ROUND_EN : QA_ROUND_KO;

  return (
    <main className="mx-auto max-w-[640px] px-4 pb-12 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-6">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent transition active:opacity-80">
          Dallu Golf
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle
            iconSize={16}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition hover:border-accent hover:text-txt active:scale-95"
          />
          <LangToggle />
        </div>
      </header>

      <h1 className="font-head text-[32px] font-bold uppercase leading-none text-txt">Guide</h1>
      <p className="mt-2 text-sm text-txt-soft">{lang === "en" ? "How to use & FAQ" : "사용 방법과 자주 묻는 질문"}</p>

      <section className="mt-8">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">{lang === "en" ? "How to Use" : "사용 방법"}</h2>
        <div className="flex flex-col gap-3">
          {USAGE_STEPS.map((s) => (
            <div key={s.step} className="flex gap-3 rounded-xl border border-line bg-panel p-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 font-head text-[15px] font-bold text-accent">
                {s.step}
              </div>
              <div>
                <div className="font-head text-[15px] font-bold text-txt">{s.title}</div>
                <div className="mt-1 text-[13px] leading-relaxed text-txt-soft">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <FaqSection title={lang === "en" ? "Q&A — General" : "Q&A — 공통"} items={QA_GENERAL} />
      <FaqSection title={lang === "en" ? "Q&A — Custom" : "Q&A — 직접 만들기"} items={QA_CUSTOM} />
      <FaqSection title={lang === "en" ? "Q&A — My Round" : "Q&A — 내 라운드 기록"} items={QA_ROUND} />

      <div className="mt-10 text-center">
        <Link href="/" className="inline-block rounded-lg bg-accent px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
          {t("notfound.home")}
        </Link>
      </div>
    </main>
  );
}
