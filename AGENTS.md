# Dallu Golf Studio

골프 스코어카드 오버레이 생성기. Next.js 16 App Router · `output: "export"` 정적 빌드 → Cloudflare Pages.
구조·화면 트리·데이터 소유권은 `docs/APP_FLOW.md`에 있다. 구조를 바꾸는 작업이면 먼저 읽고, 바꾼 뒤 그 문서도 갱신한다.

## 검증

커밋 전 두 개를 모두 통과시킨다.

```bash
npx next build   # exit 0
npm test         # node --test tests/*.test.mjs
```

사용자 흐름·접근성·반응형 UI를 바꿨으면 추가로 실행한다.

```bash
npm run test:e2e # Playwright: Chrome에서 홈·가이드·작업 화면 스모크 테스트
```

## 테스트가 JSX를 읽지 못한다

`npm test`는 번들러 없이 `node --test`로 돈다. `"use client"`나 JSX가 있는 모듈을 import하면
`SyntaxError: Unexpected token '<'`로 죽는다.

그래서 테스트할 로직은 JSX 없는 순수 모듈로 분리한다 — `lib/score.js`, `lib/studioModes.js`,
`lib/gridNavAction.js`, `lib/inputValidators.js`, `lib/i18nDictionary.js`가 그 패턴이다.
컴포넌트나 훅에서 판단 로직을 빼야 할 때는 `lib/`에 순수 함수로 두고 훅이 위임하게 한다
(`lib/useGridNav.js` → `lib/gridNavAction.js`).

## i18n

사용자에게 보이는 문자열은 예외 없이 `t()`를 거친다. 하드코딩하면 한국어 UI에 영어가,
영어 UI에 한국어가 새는 버그가 된다 — 이 클래스 버그가 두 번 나왔다.

- 사전은 `lib/i18nDictionary.js` 하나. ko·en **양쪽에** 키를 추가한다.
- `tests/i18n.test.mjs`가 키 집합 일치, 빈 값, `${}` 치환 변수 일치, 영문 사전의 한글 잔존을 막는다.
- 새 키를 추가하기 전에 기존 키를 grep한다. 비슷한 키가 이미 있는 경우가 많다.

**언어는 URL이 결정한다.** `/`는 한국어, `/en`은 영어다. `app/`에 루트 레이아웃이 두 개
(`(ko)/layout.js`, `(en)/layout.js`)이고 `app/layout.js`는 없다 — `<html lang>`을 라우트별로 바꾸는
유일한 방법이다. 공통 부분은 `components/RootShell.jsx`에 있다.

- 영어 URL을 내보내는 라우트 목록은 `lib/langRoutes.js`의 `MIRRORED_ROUTES`가 유일한 기준이다.
  메타데이터·hreflang·사이트맵·언어 토글이 다 이걸 본다. 새 공개 라우트는 `(ko)`/`(en)` 양쪽에 만들고
  `MIRRORED_ROUTES`와 `lib/seo.js`의 `PAGE_SEO`에 등록한다.
- 내부 링크는 `useLang().href(path)`를 거친다. `/en`에서 `href="/guide"`를 쓰면 한국어로 튕긴다.
- 테마 부트스트랩 스크립트는 언어를 건드리지 않는다. `sc-lang`이 `<html lang>`을 덮으면
  `/en` 정적 HTML(영어)과 화면(한국어)이 어긋난다.

## 가이드 본문은 코드와 자동으로 맞춰지지 않는다

`tests/guideContent.test.mjs`는 ko/en 구조 파리티만 본다 — 본문이 실제 동작과 맞는지는 검증하지 못한다.
그래서 카드 크기나 배율 설명이 실제 코드와 어긋난 채 오래 남아 있었다(`QUALITY` 배율, 프리셋 `SIZE`).
프리셋 크기·출력 배율·입력 UI를 바꿨으면 `lib/guideContent.js`의 해당 답변을 다시 읽고 고친다.

## 기능 플래그

`lib/features.js`. **`myRound`는 `false`로 유지한다** — 공개 배포에서 내 라운드 기록/로그인은 비활성이다.
플래그가 꺼진 라우트(`/round/*`, `/records`, `/login`, `/rounds`)는 서버에서 `redirect("/")` 가드를 넣는다.
새 비활성 라우트도 같은 가드가 필요하다.

## 관리자 접근

`functions/_shared/adminAccess.js`. `ADMIN_ALLOWED_IPS`는 **fail-closed**다 — 비면 403이고,
IP 제한을 끄려면 `*`를 명시해야 한다. 토큰은 SHA-256 다이제스트로 상수시간 비교하고,
IP당 실패 8회면 10분간 429다.

Cloudflare Pages는 환경변수를 **배포 시점에 스냅샷**하므로 secret을 바꿔도 재배포 전까지 반영되지 않는다.
`npx wrangler pages secret list --project-name=dallu-golf-studio`로 존재 여부만 확인할 수 있다(값은 암호화).
인증 스로틀은 프로덕션에서 시험하지 않는다 — IP 단위라 본인이 잠긴다.

## 코드 스타일

- 주석은 한국어로, 주변 밀도에 맞춘다. *무엇*이 아니라 *왜*를 쓴다.
- 상태 저장은 `lib/studioStorage.js`를 쓴다. 별도 localStorage 계층을 새로 만들지 않는다.
  쓰기는 `scheduleJsonStorage`(300ms 디바운스)이고, 즉시 반영이 필요하면 `flushJsonStorage`나
  `writeJsonStorage`를 직접 쓴다.
- 테마·색은 CSS 변수 토큰(`--c-bg`, `--c-panel`, `text-txt-soft` 등)을 쓴다. 하드코딩한 hex를 새로 넣지 않는다.
- 공통 동작은 `ScoreEntryGrid`, `ScoreInputs`, `PanelHeader` 같은 공유 컴포넌트로 올린다.

## 배포

`main` 푸시로 Cloudflare Pages가 빌드한다. **이것이 유일한 배포 경로다.**
`wrangler pages deploy`로 로컬 빌드를 직접 올리면 커밋되지 않은 산출물이 프로덕션에 올라가
`main`과 라이브가 어긋난다 — 그래서 `deploy` 스크립트를 두지 않는다. 배포하려면 `main`에 머지해 푸시한다.

배포가 실제로 반영됐는지는 라이브 HTML에서
새 빌드만 내보내는 문자열을 grep해 확인한다 — 상태 코드만으로는 구버전과 구분되지 않는다.

검색 노출은 배포와 별개다. Search Console 속성 등록·소유권 인증은 이미 끝났고 DNS TXT 방식이므로
**인증 태그를 코드에 넣지 않는다.** 남는 수동 작업은 `MIRRORED_ROUTES`에 공개 라우트를 추가했을 때
사이트맵을 **다시 제출**하는 것이다. 절차는 `docs/APP_FLOW.md`의 `검색 노출(SEO) → Search Console`에 있다.
