// 가이드/FAQ 본문. 사전(lib/i18nDictionary.js)에 넣으면 키가 비대해져서 분리했지만,
// 같은 ko/en 구조를 유지해 tests/guideContent.test.mjs가 사전과 동일한 파리티 검사를 걸 수 있다.
// JSX가 없는 순수 데이터 모듈이라 Node 테스트에서 직접 import한다.

export const GUIDE_SECTION_IDS = ["general", "custom", "round"];

export const guideContent = {
  ko: {
    subtitle: "사용 방법과 자주 묻는 질문",
    usageTitle: "사용 방법",
    steps: [
      { step: "1", title: "스코어 입력", desc: "홈에서 원하는 카드 형식(18홀/9홀/3홀/1홀)을 선택 → PAR과 스코어 입력" },
      { step: "2", title: "미리보기 확인", desc: "스코어 입력 시 카드에 실시간 반영. 다크/라이트 테마와 출력 품질 선택 가능" },
      { step: "3", title: "공유 또는 다운로드", desc: "모바일: '공유' → 사진앱 저장 / 데스크탑: 'PNG 다운로드' 클릭" },
    ],
    sections: [
      {
        id: "general",
        title: "Q&A — 공통",
        items: [
          {
            q: "이 앱은 무엇인가요?",
            a: "골프 스코어카드를 투명 배경 PNG 이미지로 만들어주는 도구입니다. 유튜브 영상이나 인스타 릴스 편집 시 오버레이로 올릴 수 있습니다.",
          },
          {
            q: "스코어카드 저장은 어떻게 하나요?",
            a: "모바일(iPhone/Android)에서는 '공유' 버튼 → 공유 시트에서 '이미지 저장'을 선택합니다. 데스크탑에서는 'PNG 다운로드' 버튼을 누르면 자동으로 파일이 저장됩니다.",
          },
          {
            q: "Reels / YouTube / MAX의 차이는 무엇인가요?",
            a: "출력 배율 차이입니다. Reels는 1배, YouTube는 2배, MAX는 3배로 내보냅니다. 카드마다 원본 크기가 달라 절대 해상도가 고정되어 있지는 않으니, 미리보기 아래 '출력' 줄에서 실제 픽셀 크기를 확인하세요. 릴스 편집용이라면 Reels로 충분하고, 크게 확대해 쓸 계획이면 YouTube나 MAX를 고르세요.",
          },
          {
            q: "Strokes / To Par의 차이는 무엇인가요?",
            a: "Strokes(타수)는 절대 타수를 직접 입력합니다 (예: 4, 5, 3). To Par는 PAR 대비 차이로 입력합니다 (예: -1은 버디, 0은 파, +1은 보기). 어느 모드로 입력해도 카드에는 동일하게 표시됩니다.",
          },
          {
            q: "홀별 N장 저장은 무엇인가요?",
            a: "데스크탑에서만 제공되는 기능입니다. 18홀이면 1홀부터 18홀까지 순서대로 스코어가 추가되는 18장의 이미지를 ZIP 파일로 한 번에 다운로드합니다. 9홀·3홀에서도 같은 방식으로 동작하며, 1홀 카드에는 없습니다. 영상 편집 시 홀별로 갈아끼울 수 있습니다.",
          },
          {
            q: "앱처럼 설치할 수 있나요?",
            a: "네. 모바일 브라우저에서 홈 화면에 추가하면 주소창 없이 전체 화면으로 열립니다. 홈 화면 아래쪽 '홈 화면에 추가' 안내대로 Chrome이나 Safari의 공유 메뉴에서 '홈 화면에 추가'를 누르세요.",
          },
        ],
      },
      {
        id: "custom",
        title: "Q&A — 직접 만들기",
        items: [
          {
            q: "직접 만들기는 무엇인가요?",
            a: "18홀/9홀/3홀/1홀 카드를 각각 독립적으로 만드는 모드입니다. 각 탭의 입력은 서로 연동되지 않으며, 원하는 카드만 자유롭게 제작할 수 있습니다.",
          },
          {
            q: "PAR은 어떻게 입력하나요?",
            a: "18홀·9홀·3홀에서는 스코어 입력 표의 두 번째 행(P)을 터치해 입력합니다. 1홀 카드에서는 PAR 버튼(3·4·5·6)을 눌러 고릅니다. 어느 쪽이든 3, 4, 5, 6만 허용됩니다.",
          },
          {
            q: "1홀 카드의 홀 번호는 어떻게 입력하나요?",
            a: "직접 만들기에서는 홀 번호를 숫자로 직접 입력합니다 (1~18). 라운드 데이터와 연동되지 않으므로 자유롭게 설정하세요.",
          },
          {
            q: "PAR을 입력하지 않으면 어떻게 되나요?",
            a: "커스텀 모드에서는 PAR이 빈 상태로 시작합니다. PAR 없이 스코어만 입력하면 TO PAR이 '–'로 표시됩니다. PAR을 먼저 입력하세요.",
          },
          {
            q: "홀별 저장 버튼이 비활성화되는 이유는 무엇인가요?",
            a: "모든 홀의 스코어가 채워져야 홀별 저장 버튼이 활성화됩니다. 빈 홀이 있으면 비활성 상태입니다.",
          },
          {
            q: "1홀 카드의 Classic과 Minimal의 차이는 무엇인가요?",
            a: "Classic은 홀 번호·거리·클럽과 FOR 배너까지 담은 큰 카드이고, Minimal은 이름·홀·거리·타수·TO PAR만 담은 한 줄 띠입니다. Minimal에서 클럽 입력이 흐려지는 건 미니멀 카드에 클럽을 표시할 자리가 없어서입니다.",
          },
          {
            q: "거리 단위와 FOR 배너를 바꿀 수 있나요?",
            a: "거리 입력 옆 M / YD 버튼으로 단위를 바꿉니다. 'FOR EAGLE/BIRDIE 표시' 체크를 끄면 배너가 사라지고 Classic 카드는 배너 없는 낮은 높이로 줄어듭니다. Minimal 카드에는 배너가 없습니다.",
          },
        ],
      },
      {
        id: "round",
        title: "Q&A — 내 라운드 기록",
        items: [
          {
            q: "내 라운드 기록은 무엇인가요?",
            a: "18홀을 한 번 입력하면 같은 PAR와 스코어로 9홀·3홀·1홀 카드를 만드는 연동 모드입니다. 현재 공개 버전에서는 비활성화되어 있습니다.",
          },
          {
            q: "직접 만들기와 어떤 차이가 있나요?",
            a: "내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 자동 반영됩니다. 직접 만들기에서는 각 카드가 독립적입니다.",
          },
          {
            q: "코스 불러오기는 무엇인가요?",
            a: "등록된 골프장의 PAR 정보를 한 번에 채우는 기능이며 현재 비활성화되어 있습니다.",
          },
          {
            q: "현재 사용할 수 없는 기능은 무엇인가요?",
            a: "내 라운드 기록 전체와 로그인, 코스 DB 자동 불러오기, 서버 라운드 저장·불러오기가 비활성화되어 있습니다. 현재는 직접 만들기를 사용해주세요.",
          },
        ],
      },
    ],
  },

  en: {
    subtitle: "How to use & FAQ",
    usageTitle: "How to Use",
    steps: [
      { step: "1", title: "Score Entry", desc: "Choose a card format (18/9/3/1 hole) from home → Enter PAR and scores" },
      { step: "2", title: "Preview", desc: "Card updates in real-time as you enter scores. Choose dark/light theme and output quality" },
      { step: "3", title: "Share or Download", desc: "Mobile: 'Share' → Save Image / Desktop: Click 'PNG Download'" },
    ],
    sections: [
      {
        id: "general",
        title: "Q&A — General",
        items: [
          {
            q: "What is this app?",
            a: "A tool that creates golf scorecards as transparent PNG images. Use them as overlays when editing YouTube videos or Instagram Reels.",
          },
          {
            q: "How do I save the scorecard?",
            a: "Mobile (iPhone/Android): Tap 'Share' → select 'Save Image' from the share sheet. Desktop: Click 'PNG Download' and the file saves automatically.",
          },
          {
            q: "Reels / YouTube / MAX difference?",
            a: "Output scale difference. Reels exports at 1x, YouTube at 2x, MAX at 3x. Each card has its own base size, so the absolute resolution is not fixed — check the 'Output' line under the preview for the actual pixel size. Reels is enough for short-form editing; pick YouTube or MAX if you plan to scale the card up.",
          },
          {
            q: "Strokes vs To Par?",
            a: "Strokes enters absolute shot count (e.g. 4, 5, 3). To Par enters the difference from PAR (e.g. -1 for birdie, 0 for par, +1 for bogey). Both modes produce the same card.",
          },
          {
            q: "What is hole-by-hole batch save?",
            a: "Desktop-only feature. For 18 holes, it downloads 18 images as a ZIP — each image adds one more hole's score progressively. It works the same way for 9 and 3 holes, and is not available for the 1-hole card. Swap them per-hole during video editing.",
          },
          {
            q: "Can I install it like an app?",
            a: "Yes. Add it to your home screen from a mobile browser and it opens full-screen with no address bar. Follow the 'Add to Home Screen' hint on the home page — use the share menu in Chrome or Safari and tap 'Add to Home Screen'.",
          },
        ],
      },
      {
        id: "custom",
        title: "Q&A — Custom",
        items: [
          {
            q: "What is Custom mode?",
            a: "A mode to create 18/9/3/1 hole cards independently. Each tab's input is separate, so you can freely create just the cards you need.",
          },
          {
            q: "How do I enter PAR?",
            a: "For 18/9/3 holes, tap the second row (P) in the score table. For the 1-hole card, tap a PAR button (3/4/5/6). Either way, only 3, 4, 5, 6 are accepted.",
          },
          {
            q: "Hole number in 1-hole card?",
            a: "In Custom mode, enter the hole number directly (1-18). It is not linked to round data, so set it freely.",
          },
          {
            q: "What if I don't enter PAR?",
            a: "Custom mode starts with empty PAR. If you enter scores without PAR, TO PAR shows '–'. Enter PAR first.",
          },
          {
            q: "Batch save button is disabled?",
            a: "All holes must have scores filled before the batch save button activates. Check for empty holes.",
          },
          {
            q: "Classic vs Minimal for the 1-hole card?",
            a: "Classic is a larger card carrying hole number, distance, club and the FOR banner. Minimal is a single bar with only name, hole, distance, shots and TO PAR. Club input is greyed out in Minimal because the minimal card has no room to show it.",
          },
          {
            q: "Can I change the distance unit and the FOR banner?",
            a: "Use the M / YD buttons next to the distance input to switch units. Unchecking 'Show FOR EAGLE/BIRDIE' removes the banner, and the Classic card shrinks to its shorter no-banner height. The Minimal card has no banner.",
          },
        ],
      },
      {
        id: "round",
        title: "Q&A — My Round",
        items: [
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
        ],
      },
    ],
  },
};

// 지원하지 않는 언어가 들어와도 한국어로 떨어뜨린다 (사전의 DEFAULT_LANG와 같은 규칙).
export function guideFor(lang) {
  return guideContent[lang] || guideContent.ko;
}
