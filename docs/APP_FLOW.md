# Dallu Golf Studio 동작 구조

이 문서는 앱의 화면 트리, 데이터 소유권, 연결 관계를 고정하기 위한 기준 문서입니다.

## 핵심 원칙

- 홈은 작업 시작점만 제공한다.
- `내 라운드 기록`은 18홀 라운드 하나를 기준으로 18홀, 9홀, 3홀, 1홀 출력이 연동된다.
- `직접 만들기`는 18홀, 9홀, 3홀, 1홀이 모두 개별 입력으로 동작한다.
- 공개 배포 상태에서는 로그인, 내 라운딩 저장, 코스 DB 자동 불러오기를 비활성화한다.
- PNG 저장은 SVG 카드 노드만 투명 배경으로 내보낸다.

## 화면 트리

```text
/
├─ /rounds
│  ├─ /round
│  ├─ /score-9?source=linked
│  ├─ /score-3?source=linked
│  └─ /hole?source=linked
└─ /custom
   ├─ /score-18?source=custom
   ├─ /score-9?source=custom
   ├─ /score-3?source=custom
   └─ /hole?source=custom
```

## 홈

- `HomeHub`가 홈 화면을 렌더링한다.
- 홈에는 큰 흐름 2개만 둔다.
- `내 라운드 기록`: 라운드 입력 기반 연동 작업.
- `직접 만들기`: 라운드 저장과 분리된 수동 제작 작업.
- 로그인, 코스 DB, 내 라운드 저장은 준비 중 안내만 보여준다.

## 내 라운드 기록 트리

`sourceMode = "round"`인 흐름이다.

### 데이터 소유권

- 원본 데이터: `round`
- 저장 키: `sc-round`
- 1홀 보조 카드 저장 키: `sc-holecard`
- 3홀 선택 저장 키: `sc-linked-three`

### 연결 규칙

- `/round`에서 18홀 라운드 정보를 입력한다.
- `/score-9?source=linked`는 `round.holes`에서 전반/후반 9홀을 읽는다.
- `/score-3?source=linked`는 `round.holes`에서 선택된 연속 3홀을 읽는다.
- `/hole?source=linked`는 `round.holes`에서 선택 홀의 PAR, 현재 타수, 누적 토탈을 불러온다.
- 즉, 내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 반영되어야 한다.
- 이 트리는 절대 끊으면 안 된다.

### 현재 비활성 기능

- 코스 DB 자동 불러오기.
- 라운딩 기록 DB 저장 및 불러오기.
- 로그인 기반 사용자 저장.

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

## 주요 컴포넌트 역할

- `StudioApp`: 전체 상태, source 분기, 미리보기, PNG 저장.
- `StudioShell`: 공통 레이아웃.
- `StudioNav`: 18/9/3/1 상단 탭.
- `FlowHub`: `/rounds`, `/custom` 흐름 진입 화면.
- `ScoreEntryGrid`: 18/9/3 공통 스코어 입력 표.
- `ScoreInputs`: 타수/파대비 입력 로직, 포커스 시 전체 선택.
- `ManualScoreForms`: 9홀/3홀 직접 입력 폼.
- `HoleCardForm`: 1홀 입력 폼.
- `RoundSourcePanel`: 라운드 연동 데이터 안내.

## 저장소와 DB 상태

### localStorage

| 키 | 용도 |
| --- | --- |
| `sc-round` | 내 라운드 기록 18홀 입력 |
| `sc-holecard` | 라운드 기록 트리의 1홀 보조 입력 |
| `sc-linked-three` | 라운드 기록 트리의 3홀 선택 |
| `sc-custom-session` | 직접 만들기 전체 입력 묶음 |
| `sc-favorites` | 코스 즐겨찾기 |

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
- 공개 배포 전까지 로그인/DB 저장/코스 자동 불러오기는 준비 중 상태를 유지한다.
