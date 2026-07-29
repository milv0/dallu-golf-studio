# scoreCard Builder

골프 영상 편집용 **스코어카드 오버레이 이미지** 제작 웹앱. 메이저 대회 방송 그래픽 스타일로,
투명 배경 PNG를 만들어 유튜브·인스타 릴스 영상 위에 얹을 수 있습니다.

## 주요 기능
- **라운드 입력**: 선수·골프장·날짜와 18홀 PAR/스코어를 `/round`에서 관리
- **내 라운딩**: 사용자 인증과 기록 저장 기능은 현재 준비 중 상태로 비활성화
- **로그인**: 공개 배포 상태에서는 비활성화, 추후 이메일 매직링크 인증 연결 예정
- **릴스 오버레이**: 라운드 연동 또는 직접 입력으로 9홀/3홀 스코어 오버레이 제작
- **홀 카드**: `/hole`에서 현재 홀, 거리, 타수, 클럽을 보여주는 라이브 오버레이 제작
- **코스 DB**: 관리자 화면에서 골프장 나인/조합/PAR 데이터를 편집하고 KV에 저장. 공개 UI 자동 불러오기는 현재 비활성화
- **투명 PNG 내보내기**: 1x/2x/3x 해상도, 방송 색상 코딩(버디=빨강·이글=골드·보기=파랑)
- **다크/라이트 테마**, 반응형(PC·모바일)

## 동작 구조
앱의 화면 트리, 라운드 연동/직접 만들기 분리 규칙, localStorage/DB 상태는 [docs/APP_FLOW.md](docs/APP_FLOW.md)를 기준으로 관리합니다.

## 기술 스택
- Next.js (App Router) + Tailwind CSS v4
- 클라이언트 렌더 SVG → `html-to-image`로 투명 PNG 추출
- 정적 사이트(`output: export`) + Cloudflare Pages Function/KV 코스 DB + D1 라운딩 기록 DB

## 구조
- `app/`: 홈, 라운드, 릴스, 홀 카드, 내 라운딩, 관리자 라우트
- `components/studio/`: 홈 허브와 작업 화면 UI
- `components/presets/`: PNG로 내보내는 SVG 오버레이 프리셋
- `lib/`: 스코어 계산, 코스 DB 변환/검증, API 유틸
- `functions/api/`: Cloudflare Pages Function

## 개발
UI만 빠르게 개발할 때:
```bash
npm install
npm run dev      # http://localhost:3000
```

Cloudflare Pages Function(`/api/db`, `/api/auth/login`, `/api/round-records`)까지 함께 확인할 때:
```bash
npm run build
npx wrangler pages dev out
```

로컬 Pages Function 저장 테스트에는 `.dev.vars` 파일에 관리자 토큰을 둡니다.
```bash
ADMIN_TOKEN=local-admin-token
```

## 테스트
```bash
npm test
```

## 빌드 (정적)
```bash
npm run build    # out/ 에 정적 사이트 생성
```

## 배포 (Cloudflare Pages)
- 빌드 명령: `npm run build`
- 출력 디렉토리: `out`
- 프레임워크 프리셋: Next.js (Static HTML Export)
- KV 바인딩: `COURSE_KV`
- D1 바인딩: `APP_DB`
- 관리자 저장용 secret 필수:
```bash
npx wrangler pages secret put ADMIN_TOKEN --project-name=dallu-golf-studio
```
