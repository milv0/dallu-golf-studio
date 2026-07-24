# scoreCard Builder

골프 영상 편집용 **스코어카드 오버레이 이미지** 제작 웹앱. 메이저 대회 방송 그래픽 스타일로,
투명 배경 PNG를 만들어 유튜브·인스타 릴스 영상 위에 얹을 수 있습니다.

## 주요 기능
- **3개 레이아웃**: 라운드 스코어카드(YouTube 가로 / Reels 세로) + 홀 카드(현재 홀 라이브 오버레이)
- **입력**: 홀별 par(왼/가운데/오른쪽 클릭·드래그로 3/4/5) + 스코어(타수/파대비 토글), 선수·골프장·날짜
- **내 코스 저장/불러오기**: 골프장 이름 기준 par 기억 (localStorage) — 한국 코스 대응
- **투명 PNG 내보내기**: 1x/2x/3x 해상도, 방송 색상 코딩(버디=빨강·이글=골드·보기=파랑)
- **다크/라이트 테마**, 반응형(PC·모바일)

## 기술 스택
- Next.js (App Router) + Tailwind CSS v4
- 클라이언트 렌더 SVG → `html-to-image`로 투명 PNG 추출
- 정적 사이트(`output: export`) — 서버리스 불필요

## 개발
```bash
npm install
npm run dev      # http://localhost:3000
```

## 빌드 (정적)
```bash
npm run build    # out/ 에 정적 사이트 생성
```

## 배포 (Cloudflare Pages)
- 빌드 명령: `npm run build`
- 출력 디렉토리: `out`
- 프레임워크 프리셋: Next.js (Static HTML Export)
