# Dallu Golf Studio 동작 구조

이 문서는 앱의 화면 트리, 데이터 소유권, 연결 관계를 고정하기 위한 기준 문서입니다.

## 핵심 원칙

- 홈은 작업 시작점만 제공한다.
- `내 라운드 기록`은 18홀 라운드 하나를 기준으로 18홀, 9홀, 3홀, 1홀 출력이 연동된다.
- `직접 만들기`는 18홀, 9홀, 3홀, 1홀이 모두 개별 입력으로 동작한다.
- 공개 배포 상태에서는 로그인, 서버 라운딩 저장·불러오기, 코스 DB 자동 불러오기를 비활성화한다.
- `내 라운드 기록` 구현은 유지하지만 공개 배포에서는 기능 플래그로 전체 비활성화한다.
- PNG 저장은 SVG 카드 노드만 투명 배경으로 내보낸다.
- iPhone/PWA에서는 사진앱 직접 저장 권한이 없으므로 `공유` 버튼을 우선 사용한다.

## 화면 트리

```text
/
├─ /rounds (비활성 시 redirect → /)
│  ├─ /round (비활성 시 redirect → /)
│  ├─ /round/Hole9 (비활성 시 redirect → /)
│  ├─ /round/Hole3 (비활성 시 redirect → /)
│  └─ /round/Hole1 (비활성 시 redirect → /)
└─ /custom (redirect → 마지막 직접 만들기 탭)
   ├─ /custom/Hole18
   ├─ /custom/Hole9
   ├─ /custom/Hole3
   └─ /custom/Hole1
```

경로 세그먼트로 `round`/`custom` 모드를 구분한다. 쿼리 파라미터를 사용하지 않는다.

## 홈

- `HomeHub`가 홈 화면을 렌더링한다.
- 홈에는 큰 흐름 2개만 둔다.
- `내 라운드 기록`: 라운드 입력 기반 연동 작업. 현재 비활성 카드로 표시한다.
- `직접 만들기`: 라운드 저장과 분리된 수동 제작 작업.
- 기능 플래그가 활성화되면 `내 라운드 기록`은 항상 `/round`(18홀)로 이동한다.
- `/custom`은 마지막 직접 만들기 탭으로 바로 이동한다. 마지막 기록이 없으면 `/custom/Hole18`으로 이동한다.
- `/rounds`는 항상 `/round`로 리다이렉트한다 (FlowHub 없이 `redirect()` 사용).
- 내 라운드 기록 전체, 로그인, 코스 DB, 내 라운드 저장은 공개 UI에서 비활성화한다.
- 비활성 버튼은 `로그인`, `내 라운딩`, `기록 불러오기`처럼 기능 이름을 유지하고, 버튼명에 `준비 중`을 붙이지 않는다.
- 상단바: 좌측 브랜드("Dallu Golf") + 우측 테마 토글/로그인. 탭(18/9/3/1홀)은 상단바 내 2행으로 통합. 하단 플로팅 탭바 없음.

## 내 라운드 기록 트리

`sourceMode = "round"`인 흐름이다.

### 데이터 소유권

- 원본 데이터: `round`
- 저장 키: `sc-round`
- 1홀 보조 카드 저장 키: `sc-holecard`
- 3홀 선택 저장 키: `sc-linked-three`

### 연결 규칙

- `/round`에서 18홀 라운드 정보를 입력한다.
- `/round/Hole9`는 `round.holes`에서 전반/후반 9홀을 읽는다.
- `/round/Hole3`는 `round.holes`에서 선택된 연속 3홀을 읽는다.
- `/round/Hole1`는 `round.holes`에서 선택 홀의 PAR, 현재 타수, 누적 토탈을 불러온다.
- 즉, 내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 반영되어야 한다.
- 이 트리는 절대 끊으면 안 된다.

### PAR 잠금

- 코스 프리셋을 불러오면 PAR 입력이 자동 잠금된다 (읽기 전용).
- "PAR 수정" 버튼을 누르면 잠금 해제되어 수동 수정이 가능하다.
- 직접 만들기에서는 PAR이 항상 편집 가능하다 (잠금 없음).

### 1홀 카드 (내 라운드 기록)

- 1~18번 홀 선택 버튼으로만 홀을 변경한다. 홀 번호 칸은 읽기 전용이다.
- 홀 선택 시 해당 홀의 PAR, 현재 타수, TO PAR가 자동으로 채워진다.

### 현재 비활성 기능

- 내 라운드 기록 전체 (`FEATURE_FLAGS.myRound = false`).
- 코스 DB 자동 불러오기.
- 라운딩 기록 DB 저장 및 불러오기.
- 로그인 기반 사용자 저장.
- `/round` 계열 주소로 직접 접근해도 홈으로 리다이렉트한다.
- 공개 UI에서는 위 기능을 disabled 상태와 보조 설명으로만 표현한다.

## 직접 만들기 트리

`sourceMode = "custom"`인 흐름이다.

### 데이터 소유권

직접 만들기에서는 각 출력 타입이 자기 데이터를 가진다.

| 출력 | 상태 | 의미 |
| --- | --- | --- |
| 18홀 | `customRound` | 18홀 카드 전용 입력 |
| 9홀 | `manualNine` | 9홀 카드 전용 입력 |
| 3홀 | `threeHole` | 3홀 카드 전용 입력 |
| 1홀 | `customHoleCard` | 1홀 카드 전용 입력 |

통합 저장 키는 `sc-custom-session`이다.

```json
{
  "round": "customRound",
  "manualNine": "manualNine",
  "threeHole": "threeHole",
  "holeCard": "customHoleCard"
}
```

### 연결 규칙

아래 규칙은 `직접 만들기`에만 적용된다. `내 라운드 기록` 트리에는 적용하지 않는다.

- 18홀에 입력한 스코어는 9홀, 3홀, 1홀에 반영되지 않는다.
- 9홀에 입력한 스코어는 18홀, 3홀, 1홀에 반영되지 않는다.
- 3홀에 입력한 스코어는 18홀, 9홀, 1홀에 반영되지 않는다.
- 1홀에 입력한 정보는 18홀, 9홀, 3홀에 반영되지 않는다.
- 이름도 필요한 카드별로 별도 입력한다.
- 직접 만들기 18홀에서 기본정보(이름/날짜/코스) 패널을 미리보기 아래 별도 섹션으로 분리하지 않는다. 스코어 입력 패널 안에 통합되어 있으며, 이 구조를 의도적으로 유지한다.

### 1홀 카드 (직접 만들기)

- 1~18 홀 선택 버튼을 표시하지 않는다 (연동할 데이터가 없으므로).
- 홀 번호는 직접 입력한다. 1~18 범위만 허용하고 그 외 값은 무시한다.
- 거리, 클럽, PAR, 현재 타수, TO PAR 등 모든 필드를 자유롭게 입력한다.

## 입력 UI 규칙

- 모바일 화면을 기준 UI로 삼고, 데스크탑은 같은 컴포넌트와 순서를 넓게 펼쳐서 보여준다.
- 모바일/데스크탑에서 서로 다른 작업 컴포넌트 트리를 만들지 않는다.
- 작업 화면 순서는 `미리보기/출력` 다음 `입력`이다.
- 18홀, 9홀, 3홀 스코어 입력은 `ScoreEntryGrid`를 공유한다.
- 표는 라벨 컬럼 없이 `홀 칸 + 합` 중심으로 구성한다.
- 3홀은 합계를 표시하지 않는다.
- 3홀의 홀 번호 표시는 기본 해제이며 직접 만들기와 라운드 연동 양쪽에서 선택할 수 있다.
- 3홀 홀 번호와 거리 표시는 같은 메타 영역을 사용하므로 한 번에 하나만 선택한다.
- 기본 입력 모드는 `타수`다.
- `파대비` 모드에서는 `-1`, `0`, `1`처럼 PAR 기준 차이를 입력한다.
- 스코어 입력칸은 포커스/터치 시 기존 값 전체를 선택한다.
- 선택된 상태에서 숫자를 입력하면 기존 값을 지우지 않고 바로 교체된다.
- 직접 만들기 초기화는 해당 카드의 점수/홀 정보를 지우되 선수명은 유지한다.
- 내 라운드 기록 18홀 초기화는 기본정보와 스코어를 포함한 라운드 전체를 지운다.
- 미리보기 영역은 모바일에서 접기/펼치기 토글을 제공한다 (데스크탑에서는 항상 표시).
- 내 라운드 기록 18홀에서는 기본정보/코스 패널이 미리보기 아래, 스코어 입력 위에 2컬럼(반반)으로 배치된다.

## 출력 카드

| 출력 | 컴포넌트 | 용도 |
| --- | --- | --- |
| 18홀 | `HoleByHoleStrip` | 유튜브/가로형 전체 스코어카드 |
| 9홀 | `ReelsScorecard` | 릴스용 9홀 카드 |
| 3홀 | `ReelsThreeHoleCard` | 릴스용 3홀 카드 |
| 1홀 | `HoleCard`, `HoleCardMinimal` | 현재 홀 오버레이 (일반/미니멀) |

### 저장 흐름

- 모바일/PWA에서는 `공유` 버튼이 기본 저장 동선이다.
- iPhone에서는 공유 시트에서 `이미지 저장`을 선택해야 사진앱에 저장된다.
- 데스크탑에서는 `PNG 다운로드`가 기본 저장 동선이다.
- 데스크탑에서만 `홀별 N장 저장` 버튼을 제공한다.
- `홀별 N장 저장`은 18홀은 18장, 9홀은 9장, 3홀은 3장을 하나의 ZIP 파일로 다운로드한다.
- `홀별 N장 저장` 버튼은 해당 스코어카드의 모든 스코어가 채워졌을 때만 활성화된다.
- 홀별 저장은 원본 입력값을 바꾸지 않고, N홀 이후 스코어를 빈 값으로 둔 복사본으로 합계와 TO PAR를 다시 계산한다.
- 파일명은 `Hole18.png`, `Hole9.png`, `Hole3.png`, `Hole1.png`로 단순화한다.
- 홀별 파일명은 `Hole18-01.png`, `Hole9-01.png`, `Hole3-01.png` 형식을 사용한다.

## 주요 컴포넌트 역할

- `StudioApp`: 전체 상태 조립, source 분기, 입력 패널 연결.
- `StudioShell`: 공통 레이아웃 (상단바 + 탭 + 메인 콘텐츠).
- `StudioNav`: 상단바 + 탭 통합 렌더링. 활성 탭은 크기/두께로 강조.
- `BasicInfoPanel`: 기본 정보(선수명/골프장/날짜) 입력 패널 (별도 파일).
- `FlowHub`: `/custom` 리다이렉트 전용 (localStorage에서 마지막 탭 복원).
- `PreviewExportPanel`: 카드 미리보기(접기 토글 포함), 공유/다운로드/홀별 ZIP 버튼.
- `useStudioPersistence`: 작업 중 입력값 복원과 localStorage 자동 저장.
- `useStudioExport`: 단일 PNG, 모바일 공유, 데스크탑 홀별 ZIP 생성. `html-to-image`는 동적 import.
- `ScoreEntryGrid`: 18/9/3 공통 스코어 입력 표. `parLocked` prop으로 PAR 잠금 지원.
- `ScoreInputs`: 타수/파대비 입력 로직, 포커스 시 전체 선택, Enter 이동용 `useScoreInputRefs`.
- `PlayerNameControl`: 직접 만들기 카드에서 공유하는 선수명 입력.
- `ThemeToggle`: 홈, 작업 화면, 가이드에서 공유하는 사이트 테마 전환 버튼.
- `ManualScoreForms`: 9홀/3홀 직접 입력 폼.
- `HoleCardForm`: 1홀 입력 폼. `linked` prop으로 홀 선택 버튼 표시/숨김 결정.
- `RoundSourcePanel`: 라운드 연동 데이터 안내.
- `CoursePresets`: 코스 프리셋 목록/즐겨찾기. 공개 배포에서는 `disabled` 상태로만 표시한다.
- `Providers`: `LangProvider`(i18n) + `ThemeProvider`(사이트 테마)를 한 번에 감싼다.
- `useStudioResets`: 6개 초기화 액션(18/커스텀18/9/3/1/커스텀1)을 `확인 → 초기화 → 토스트` 형태로 통일한다.
- `lib/studioModes.js`: 라우트(mode)+출처(source) 조합에서 화면 플래그를 계산하는 순수 함수와 setter 팩토리.

### 분리 원칙

- `StudioApp`에는 화면 전체를 조립하는 상태와 분기만 둔다.
- localStorage 복원/자동 저장은 `useStudioPersistence`에서만 처리한다.
- 단일 PNG, 모바일 공유, 홀별 ZIP 생성은 `useStudioExport`에서만 처리한다.
- 미리보기 카드와 출력 버튼은 `PreviewExportPanel`에 둔다. `실제 배치 미리보기(PlacementPreview)`는 제거했으므로 다시 추가하지 않는다.
- 기본 입력 데이터 모양은 `studioDefaults`에서 관리한다.
- 스코어 유효성, 범위 선택, TO PAR 계산, 홀별 진행 이미지 데이터 생성은 `lib/score.js`의 순수 함수를 사용한다.
- 스코어 입력 UI를 수정할 때는 `ScoreEntryGrid`, `ScoreInputs`, `ManualScoreForms`, `HoleCardForm` 중 기존 책임에 맞는 파일을 먼저 수정한다.
- 새 기능을 추가할 때 `StudioApp`이 700줄을 다시 넘기면 훅 또는 패널 컴포넌트로 분리할 후보로 본다.
- 내보내기 저장 파일명이나 ZIP 구조를 바꿀 때는 `lib/exportImage.js`를 우선 수정한다.
- 저장 키나 localStorage 정책을 바꿀 때는 `lib/studioStorage.js`와 `useStudioPersistence`를 함께 확인한다.

## 다국어(i18n)와 테마

- 번역 사전은 `lib/i18nDictionary.js`(순수 데이터), Provider와 `t()`는 `lib/i18n.js`에 둔다.
- 사전을 데이터 모듈로 분리한 이유는 `tests/i18n.test.mjs`에서 ko/en 키 대칭성을 직접 검증하기 위함이다.
- 지원 언어는 `ko`, `en` 두 개다. 한쪽에만 키를 추가하면 테스트가 실패한다.
- 치환은 `${n}` 형태를 쓰고, 같은 키의 치환 변수 이름은 두 언어가 동일해야 한다.
- 화면에 보이는 문자열, `aria-label`, `title`은 모두 `t()`를 거친다. 한글 리터럴을 컴포넌트에 직접 쓰지 않는다.
- 언어는 `sc-lang`, 사이트 테마는 `sc-theme`에 저장한다.
- `app/layout.js`의 인라인 스크립트가 첫 페인트 전에 `sc-theme`/`sc-lang`을 읽어 `data-theme`과 `<html lang>`을 적용한다 (FOUC 방지).
- `LangProvider`는 언어 변경 시 `<html lang>`도 함께 갱신한다.

## 입력 이동 규칙

- 표 형태 입력의 좌우/Tab/Enter 이동은 `lib/useGridNav.js`가 담당한다.
- 어떤 키가 어떤 이동을 하는지는 순수 함수 `lib/gridNavAction.js`가 결정하고, 훅은 결과대로 포커스만 옮긴다.
- 마지막 칸에서는 `preventDefault`를 하지 않는다. Tab이 표를 빠져나가지 못하면 키보드 사용자가 갇힌다.
- 입력값 허용 범위는 `lib/inputValidators.js`에 모은다 (PAR 3~6, 스코어 1~12, 홀 1~18, 거리 숫자만, 타수 최대 PAR×2).

## 1홀 카드 스타일

- `Classic`(`HoleCard`)과 `Minimal`(`HoleCardMinimal`) 두 스타일을 토글로 고른다. 기본값은 `Minimal`이다.
- `Minimal`은 380×88 로어서드다. 클럽 필드를 쓰지 않으므로 입력 폼에서 해당 칸을 `disabled` 처리한다.
- `Minimal` 하단 행은 `홀 → 거리 → SHOT` 순서이며, SHOT 영역은 `svgText.textWidth()`로 TO PAR 폭을 미리 비워 두고 남은 폭에 맞춰 간격/반지름/글자 크기를 줄인다. 자릿수가 커져도 겹치지 않게 하기 위한 계산이므로 고정 픽셀로 되돌리지 않는다.
- 3홀 메타 표시 모드는 `metaMode`로 관리한다: `par`(PAR만) / `holePar`(홀 번호 + PAR) / `parDist`(PAR + 거리). 홀 번호와 거리는 같은 영역을 쓰므로 동시에 켜지지 않는다.
- 모든 출력 카드 우하단에는 `DALLU GOLF` 워터마크를 넣는다.

## 저장소와 DB 상태

### localStorage

| 키 | 용도 |
| --- | --- |
| `sc-round` | 내 라운드 기록 18홀 입력 |
| `sc-holecard` | 라운드 기록 트리의 1홀 보조 입력 |
| `sc-linked-three` | 라운드 기록 트리의 3홀 선택 |
| `sc-custom-session` | 직접 만들기 전체 입력 묶음 |
| `sc-favorites` | 코스 즐겨찾기 |
| `sc-par-locked` | 코스 프리셋 적용에 따른 PAR 잠금 상태 |
| `sc-lang` | 화면 언어 (`ko`/`en`) |
| `sc-theme` | 사이트 테마 (`dark`/`light`) |
| `sc-last-custom-route` | `/custom` 진입 시 복원할 마지막 탭 |

직접 만들기 데이터는 `sc-custom-session` 하나로만 저장한다. 이전에 쓰던 개별 custom 키는 더 이상 사용하지 않는다.

자동 저장은 `scheduleJsonStorage()`로 300ms 디바운스한다. 타이핑 한 글자마다 직렬화하지 않기 위한 것이며, 탭 이탈(`pagehide`/`visibilitychange`)과 언마운트 시 `flushJsonStorage()`로 대기 중인 값을 즉시 기록한다. 초기화처럼 즉시 반영이 필요한 경로만 `writeJsonStorage()`를 직접 쓴다.

`useStudioPersistence`는 localStorage 복원을 마친 뒤에만 자동 저장을 시작한다. 초기 기본값이 기존 입력을 덮지 않도록 이 순서를 유지한다. 라운드 연동 3홀 선택은 0~17 범위의 연속된 세 인덱스만 복원하며, `홀 번호 표시` 설정도 함께 보존한다.

### Cloudflare

- `APP_DB`: D1 바인딩. 사용자 라운딩 저장 기능 준비용.
- `COURSE_KV`: 코스 DB 관리용 KV.
- 현재 공개 UI에서는 사용자 라운드 저장/불러오기를 막아둔다.
- `/api/round-records`는 읽기/쓰기/삭제 모두 비활성 상태다.

## 개발 시 주의

- `직접 만들기`의 18/9/3/1 사이에 새 자동 연동을 추가하지 않는다.
- `내 라운드 기록`의 18/9/3/1 연동은 유지한다.
- 입력 UI를 바꿀 때는 18홀만 고치지 말고 9홀, 3홀, 1홀까지 같이 확인한다.
- 공통 동작은 `ScoreEntryGrid`, `ScoreInputs`, `PanelHeader` 같은 공유 컴포넌트로 올린다.
- `lib/roundHistory.js` 같은 별도 localStorage 기록 저장소를 다시 만들지 않는다. 향후 사용자 기록은 인증 후 `/api/round-records`와 D1을 단일 기준으로 사용한다.
- 공개 배포 전까지 내 라운드 기록/로그인/DB 저장/코스 자동 불러오기는 비활성 상태를 유지한다.
- 내 라운드 기록을 공개할 때는 `lib/features.js`의 `myRound`만 활성화하고 전체 연동 테스트 후 배포한다.
- 기능 플래그가 꺼진 라우트(`/round/*`, `/records`, `/login`, `/rounds`)는 모두 서버에서 `redirect("/")` 한다. 새 비활성 라우트를 추가할 때도 같은 가드를 넣는다.
- CSP는 `public/_headers`에서만 관리한다. `'unsafe-eval'`은 쓰지 않고, AdSense용으로 Google 도메인 와일드카드를 `script-src`/`img-src`/`frame-src`/`connect-src`에 둔다.
- `/admin`은 `X-Robots-Tag: noindex`와 `app/robots.js`의 `Disallow`로 색인에서 제외한다.
- 관리자 IP 제한(`ADMIN_ALLOWED_IPS`)은 값이 비면 검사를 건너뛰는 의도적 fail-open이다. 쓰기는 항상 `ADMIN_TOKEN`으로 막히며, 운영에서 IP까지 제한하려면 Cloudflare 환경변수를 반드시 설정한다.
- 배포 전 `npx next build`와 `npm test`를 모두 통과시킨다.
