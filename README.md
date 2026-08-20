# scoreCard Builder

골프 영상 편집용 **스코어카드 오버레이 이미지** 제작 웹앱. 메이저 대회 방송 그래픽 스타일로,
투명 배경 PNG를 만들어 유튜브·인스타 릴스 영상 위에 얹을 수 있습니다.

## 주요 기능
- **라운드 연동 출력**: 구현은 유지하지만 현재 공개 배포에서는 진입과 직접 URL을 비활성화
- **내 라운딩 저장**: 사용자 인증과 서버 기록 저장·불러오기는 현재 비활성화
- **로그인**: 공개 배포 상태에서는 비활성화, 추후 이메일 매직링크 인증 연결 예정
- **릴스 오버레이**: 직접 입력으로 9홀/3홀 스코어 오버레이 제작
- **홀 카드**: `/round/Hole1` 또는 `/custom/Hole1`에서 현재 홀, 거리, 타수, 클럽 오버레이 제작
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
- `app/`: 홈, 라운드 연동, 직접 만들기, 가이드, 내 라운딩, 관리자 라우트
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
ADMIN_ALLOWED_IPS=*
```

`ADMIN_ALLOWED_IPS`는 fail-closed입니다. 비어 있으면 `/admin`과 관리자 API가 403이 되므로, 로컬/프리뷰에서는 `*`(제한 해제)로 두고 운영에서는 허용 IP를 쉼표로 나열합니다.

## 테스트
```bash
npm test
npm run test:e2e  # 홈·가이드·작업 화면의 Chrome 스모크 테스트
```

## 빌드 (정적)
```bash
npm run build    # out/ 에 정적 사이트 생성
```

## 배포 (Cloudflare Pages)
배포는 `main` 푸시로만 이루어집니다. 로컬에서 `wrangler pages deploy`로 직접 올리지 않습니다 —
커밋되지 않은 빌드가 프로덕션에 올라가 `main`과 라이브가 어긋납니다.

- 빌드 명령: `npm run build`
- 출력 디렉토리: `out`
- 프레임워크 프리셋: Next.js (Static HTML Export)
- KV 바인딩: `COURSE_KV`
- D1 바인딩: `APP_DB`
- 관리자 저장용 secret 필수:
```bash
npx wrangler pages secret put ADMIN_TOKEN --project-name=dallu-golf-studio
```
- 관리자 IP 허용 목록 필수(비면 관리자 접근 전면 차단):
```bash
# 특정 IP만 허용
npx wrangler pages secret put ADMIN_ALLOWED_IPS --project-name=dallu-golf-studio   # 예: 203.0.113.7,198.51.100.4
# IP 제한을 쓰지 않으려면 명시적으로 해제
npx wrangler pages secret put ADMIN_ALLOWED_IPS --project-name=dallu-golf-studio   # 값: *
```
