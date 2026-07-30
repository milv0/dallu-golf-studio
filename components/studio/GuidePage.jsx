"use client";

import { useState, useEffect } from "react";
import { Moon, Sun } from "lucide-react";
import Link from "next/link";

const USAGE_STEPS = [
  { step: "1", title: "스코어 입력", desc: "홈에서 '직접 만들기'를 선택하고 18홀/9홀/3홀/1홀 탭을 선택합니다. PAR과 스코어를 입력하세요." },
  { step: "2", title: "미리보기 확인", desc: "입력한 스코어가 실시간으로 카드에 반영됩니다. 다크/라이트 테마와 출력 품질을 선택하세요." },
  { step: "3", title: "공유 또는 다운로드", desc: "모바일에서는 '공유' 버튼으로 사진앱에 저장하고, 데스크탑에서는 'PNG 다운로드' 버튼을 사용하세요." },
];

const QA_GENERAL = [
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

const QA_CUSTOM = [
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
    q: "FOR EAGLE / FOR BIRDIE 배너는?",
    a: "1홀 카드에서 현재 타수를 입력하면 자동으로 판단됩니다. 예: PAR 5에서 3번째 샷이면 FOR EAGLE, PAR 4에서 3번째 샷이면 FOR BIRDIE가 표시됩니다.",
  },
];

const QA_ROUND = [
  {
    q: "내 라운드 기록은 뭔가요?",
    a: "18홀 라운드를 한 번 입력하면 9홀·3홀·1홀 카드가 자동으로 연동되어 생성되는 모드입니다. 현재 준비 중이며, 곧 활성화됩니다.",
  },
  {
    q: "직접 만들기와 뭐가 다른가요?",
    a: "내 라운드 기록에서는 18홀에 입력한 스코어와 PAR가 9홀, 3홀, 1홀에 자동 반영됩니다. 직접 만들기에서는 각 카드가 독립적입니다.",
  },
  {
    q: "코스 불러오기란?",
    a: "등록된 골프장의 PAR 정보를 한 번에 불러오는 기능입니다. 코스를 선택하면 18홀 PAR이 자동으로 채워지고 잠금됩니다. PAR 수정이 필요하면 'PAR 수정' 버튼으로 잠금 해제할 수 있습니다.",
  },
  {
    q: "언제 사용할 수 있나요?",
    a: "로그인, 코스 DB, 라운드 저장 기능이 모두 준비되면 활성화됩니다. 현재는 직접 만들기를 사용해주세요.",
  },
];

export default function GuidePage() {
  const [theme, setTheme] = useState("light");
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className="mx-auto max-w-[640px] px-4 pb-12 pt-[calc(env(safe-area-inset-top)+1rem)] md:px-6">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="font-head text-[13px] font-bold uppercase tracking-[0.15em] text-accent transition active:opacity-80">
          Dallu Golf
        </Link>
        <button type="button" onClick={toggleTheme}
          aria-label={theme === "dark" ? "라이트 테마로 전환" : "다크 테마로 전환"}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-panel text-txt-soft transition hover:border-accent hover:text-txt active:scale-95">
          {theme === "dark" ? <Sun size={16} strokeWidth={2.2} /> : <Moon size={16} strokeWidth={2.2} />}
        </button>
      </header>

      <h1 className="font-head text-[32px] font-bold uppercase leading-none text-txt">Guide</h1>
      <p className="mt-2 text-sm text-txt-soft">사용 방법과 자주 묻는 질문</p>

      <section className="mt-8">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">사용 방법</h2>
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

      <section className="mt-10">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">Q&A — 공통</h2>
        <div className="flex flex-col gap-3">
          {QA_GENERAL.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-panel p-4">
              <div className="font-head text-[14px] font-bold text-txt">{item.q}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">Q&A — 직접 만들기</h2>
        <div className="flex flex-col gap-3">
          {QA_CUSTOM.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-panel p-4">
              <div className="font-head text-[14px] font-bold text-txt">{item.q}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="mb-4 font-head text-[14px] font-semibold uppercase tracking-widest text-accent">Q&A — 내 라운드 기록</h2>
        <div className="flex flex-col gap-3">
          {QA_ROUND.map((item, i) => (
            <div key={i} className="rounded-xl border border-line bg-panel p-4">
              <div className="font-head text-[14px] font-bold text-txt">{item.q}</div>
              <div className="mt-2 text-[13px] leading-relaxed text-txt-soft">{item.a}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 text-center">
        <Link href="/" className="inline-block rounded-lg bg-accent px-5 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
          홈으로 돌아가기
        </Link>
      </div>
    </main>
  );
}
