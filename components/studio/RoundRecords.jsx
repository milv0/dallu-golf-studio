"use client";

import StudioNav from "./StudioNav";

export default function RoundRecords() {
  return (
    <main className="mx-auto max-w-[1180px] px-5 py-6 sm:px-6 sm:py-8">
      <div className="mb-5 flex flex-col items-start justify-between gap-4 border-b border-line pb-5 sm:mb-6 sm:flex-row sm:items-end">
        <div>
          <div className="font-head text-[11px] font-semibold uppercase leading-tight tracking-[0.14em] text-accent sm:text-[13px] sm:tracking-[0.28em]">
            Round Archive · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[34px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent sm:text-[40px]">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
          <p className="mt-2 text-sm text-txt-soft">라운딩 기록 저장과 불러오기는 현재 비활성화되어 있습니다.</p>
        </div>
        <a href="/Hole18"
          className="rounded-lg bg-accent px-3 py-1.5 font-head text-xs font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2 sm:px-4 sm:py-2 sm:text-sm">
          18홀 입력
        </a>
      </div>

      <StudioNav active="records" />

      <div className="rounded-xl border border-line bg-panel p-8 text-center">
        <div className="font-head text-2xl font-bold text-txt">내 라운딩</div>
        <p className="mt-2 text-sm text-txt-soft">
          사용자 인증과 DB 저장 구조를 확정하기 전까지 저장 기록 기능은 비활성화되어 있습니다.
        </p>
        <button type="button" disabled
          className="mt-5 inline-flex cursor-not-allowed rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm font-bold text-txt-faint opacity-70">
          기록 불러오기
        </button>
      </div>
    </main>
  );
}
