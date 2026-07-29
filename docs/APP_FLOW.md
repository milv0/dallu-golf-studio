# Dallu Golf Studio 동작 구조

이 문서는 앱의 화면 트리, 데이터 소유권, 연결 관계를 고정하기 위한 기준 문서입니다.

## 핵심 원칙

- 홈은 작업 시작점만 제공한다.
- `내 라운드 기록`은 18홀 라운드 하나를 기준으로 18홀, 9홀, 3홀, 1홀 출력이 연동된다.
- `직접 만들기`는 18홀, 9홀, 3홀, 1홀이 모두 개별 입력으로 동작한다.
- 공개 배포 상태에서는 로그인, 내 라운딩 저장, 코스 DB 자동 불러오기를 비활성화한다.
- PNG 저장은 SVG 카드 노드만 투명 배경으로 내보낸다.
- iPhone/PWA에서는 사진앱 직접 저장 권한이 없으므로 `공유` 버튼을 우선 사용한다.

## 화면 트리

```text
/
├─ /rounds (redirect-only)
│  ├─ /round
│  ├─ /Hole9?source=linked
│  ├─ /Hole3?source=linked
│  └─ /hole?source=linked
└─ /custom (redirect-only)
   ├─ /Hole18?source=custom
   ├─ /Hole9?source=custom
   ├─ /Hole3?source=custom
   └─ /hole?source=custom
```

`/Hole9`, `/Hole3`, `/hole`처럼 `source` query 없이 직접 진입하면 `직접 만들기` 흐름으로 처리한다. `내 라운드 기록` 흐름은 반드시 `/rounds` 탭 또는 `source=linked` 링크를 통해 진입한다.

## 홈

- `HomeHub`가 홈 화면을 렌더링한다.
- 홈에는 큰 흐름 2개만 둔다.
- `내 라운드 기록`: 라운드 입력 기반 연동 작업.
- `직접 만들기`: 라운드 저장과 분리된 수동 제작 작업.
- 홈 카드는 `/rounds`, `/custom` 중간 화면을 거치지 않고 마지막 작업 탭으로 바로 이동한다.
- `/custom`은 마지막 직접 만들기 탭으로 바로 이동한다. 마지막 기록이 없으면 `/Hole18?source=custom`으로 이동한다.
- `/rounds`는 마지막 내 라운드 기록 탭으로 바로 이동한다. 마지막 기록이 없으면 `/round`로 이동한다.
- `/custom`, `/rounds`는 직접 주소로 들어온 경우를 위한 리다이렉트 전용 경로이며 화면을 렌더링하지 않는다.
- 로그인, 코스 DB, 내 라운드 저장은 공개 UI에서 비활성화한다.
- 비활성 버튼은 `로그인`, `내 라운딩`, `기록 불러오기`처럼 기능 이름을 유지하고, 버튼명에 `준비 중`을 붙이지 않는다.
- 상단바에는 홈, 현재 작업명, 테마 전환, 로그인 액션을 둔다.

## 내 라운드 기록 트리

`sourceMode = "round"`인 흐름이다.

### 데이터 소유권

- 원본 데이터: `round`
- 저장 키: `sc-round`
- 1홀 보조 카드 저장 키: `sc-holecard`
- 3홀 선택 저장 키: `sc-linked-three`

### 연결 규칙

- `/round`에서 18홀 라운드 정보를 입력한다.
- `/Hole9?source=linked`는 `round.holes`에서 전반/후반 9홀을 읽는다.
- `/Hole3?source=linked`는 `round.holes`에서 선택된 연속 3홀을 읽는다.
- `/hole?source=linked`는 `round.holes`에서 선택 홀의 PAR, 현재 타수, 누적 토탈을 불러온다.
- 즉, 내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 반영되어야 한다.
- 이 트리는 절대 끊으면 안 된다.

### 현재 비활성 기능

- 코스 DB 자동 불러오기.
- 라운딩 기록 DB 저장 및 불러오기.
- 로그인 기반 사용자 저장.
- 공개 UI에서는 위 기능의 버튼명을 유지하되 disabled 상태와 보조 설명으로만 비활성 상태를 표현한다.

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
- 1홀의 홀 선택 버튼은 홀 번호만 선택한다. 18홀 커스텀 입력값을 불러오지 않는다.

## 입력 UI 규칙

- 모바일 화면을 기준 UI로 삼고, 데스크탑은 같은 컴포넌트와 순서를 넓게 펼쳐서 보여준다.
- 모바일/데스크탑에서 서로 다른 작업 컴포넌트 트리를 만들지 않는다.
- 작업 화면 순서는 `미리보기/출력` 다음 `입력`이다.
- `실제 배치 미리보기`는 데스크탑에서만 보이며 작업 화면 최하단에 둔다.
- 18홀, 9홀, 3홀 스코어 입력은 `ScoreEntryGrid`를 공유한다.
- 표는 라벨 컬럼 없이 `홀 칸 + 합` 중심으로 구성한다.
- 3홀은 합계를 표시하지 않는다.
- 기본 입력 모드는 `타수`다.
- `파대비` 모드에서는 `-1`, `0`, `1`처럼 PAR 기준 차이를 입력한다.
- 스코어 입력칸은 포커스/터치 시 기존 값 전체를 선택한다.
- 선택된 상태에서 숫자를 입력하면 기존 값을 지우지 않고 바로 교체된다.

## 출력 카드

| 출력 | 컴포넌트 | 용도 |
| --- | --- | --- |
| 18홀 | `HoleByHoleStrip` | 유튜브/가로형 전체 스코어카드 |
| 9홀 | `ReelsScorecard` | 릴스용 9홀 카드 |
| 3홀 | `ReelsThreeHoleCard` | 릴스용 3홀 카드 |
| 1홀 | `HoleCard` | 현재 홀 오버레이 |

### 저장 흐름

- 모바일/PWA에서는 `공유` 버튼이 기본 저장 동선이다.
- iPhone에서는 공유 시트에서 `이미지 저장`을 선택해야 사진앱에 저장된다.
- 데스크탑에서는 `PNG 다운로드`가 기본 저장 동선이다.
- 데스크탑에서만 `홀별 N장 저장` 버튼을 제공한다.
- `홀별 N장 저장`은 18홀은 18장, 9홀은 9장, 3홀은 3장을 하나의 ZIP 파일로 다운로드한다.
- 홀별 저장은 원본 입력값을 바꾸지 않고, N홀 이후 스코어를 빈 값으로 둔 복사본으로 합계와 TO PAR를 다시 계산한다.
- 파일명은 `Hole18.png`, `Hole9.png`, `Hole3.png`, `Hole1.png`로 단순화한다.
- 홀별 파일명은 `Hole18-01.png`, `Hole9-01.png`, `Hole3-01.png` 형식을 사용한다.

## 주요 컴포넌트 역할

- `StudioApp`: 전체 상태 조립, source 분기, 입력 패널 연결.
- `StudioShell`: 공통 레이아웃.
- `StudioNav`: 18/9/3/1 상단 탭.
- `FlowHub`: `/rounds`, `/custom` 리다이렉트 전용 진입 경로.
- `PreviewExportPanel`: 미리보기, 공유/다운로드/홀별 ZIP 버튼, 데스크탑 배치 미리보기.
- `useStudioPersistence`: 작업 중 입력값 복원과 localStorage 자동 저장.
- `useStudioExport`: 단일 PNG, 모바일 공유, 데스크탑 홀별 ZIP 생성.
- `ScoreEntryGrid`: 18/9/3 공통 스코어 입력 표.
- `ScoreInputs`: 타수/파대비 입력 로직, 포커스 시 전체 선택.
- `ManualScoreForms`: 9홀/3홀 직접 입력 폼.
- `HoleCardForm`: 1홀 입력 폼.
- `RoundSourcePanel`: 라운드 연동 데이터 안내.

### 분리 원칙

- `StudioApp`에는 화면 전체를 조립하는 상태와 분기만 둔다.
- localStorage 복원/자동 저장은 `useStudioPersistence`에서만 처리한다.
- 단일 PNG, 모바일 공유, 홀별 ZIP 생성은 `useStudioExport`에서만 처리한다.
- 미리보기 카드, 출력 버튼, 데스크탑 배치 미리보기 UI는 `PreviewExportPanel`에 둔다.
- 기본 입력 데이터 모양은 `studioDefaults`에서 관리한다.
- 스코어 입력 UI를 수정할 때는 `ScoreEntryGrid`, `ScoreInputs`, `ManualScoreForms`, `HoleCardForm` 중 기존 책임에 맞는 파일을 먼저 수정한다.
- 새 기능을 추가할 때 `StudioApp`이 700줄을 다시 넘기면 훅 또는 패널 컴포넌트로 분리할 후보로 본다.
- 내보내기 저장 파일명이나 ZIP 구조를 바꿀 때는 `lib/exportImage.js`를 우선 수정한다.
- 저장 키나 localStorage 정책을 바꿀 때는 `lib/studioStorage.js`와 `useStudioPersistence`를 함께 확인한다.

## 저장소와 DB 상태

### localStorage

| 키 | 용도 |
| --- | --- |
| `sc-round` | 내 라운드 기록 18홀 입력 |
| `sc-holecard` | 라운드 기록 트리의 1홀 보조 입력 |
| `sc-linked-three` | 라운드 기록 트리의 3홀 선택 |
| `sc-custom-session` | 직접 만들기 전체 입력 묶음 |
| `sc-favorites` | 코스 즐겨찾기 |

직접 만들기 데이터는 `sc-custom-session` 하나로만 저장한다. 이전에 쓰던 개별 custom 키는 더 이상 사용하지 않는다.

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
- 공개 배포 전까지 로그인/DB 저장/코스 자동 불러오기는 비활성 상태를 유지한다.
