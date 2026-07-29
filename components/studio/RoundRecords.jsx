"use client";

import StudioNav from "./StudioNav";

export default function RoundRecords() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <div className="font-head text-[13px] font-semibold uppercase tracking-[0.28em] text-accent">
            Round Archive · @dallu_golf
          </div>
          <a href="/" className="mt-1 block font-head text-[40px] font-bold uppercase leading-none tracking-tight text-txt transition hover:text-accent">
            Dallu Golf <span className="text-accent">Studio</span>
          </a>
          <p className="mt-2 text-sm text-txt-soft">라운딩 기록 저장과 불러오기는 준비 중입니다.</p>
        </div>
        <a href="/score-18"
          className="rounded-lg bg-accent px-4 py-2 font-head text-sm font-bold uppercase tracking-wide text-[#06210f] transition hover:bg-accent-2">
          18홀 입력
        </a>
      </div>

      <StudioNav active="records" />

      <div className="rounded-xl border border-line bg-panel p-8 text-center">
        <div className="font-head text-2xl font-bold text-txt">내 라운딩 준비 중</div>
        <p className="mt-2 text-sm text-txt-soft">
          사용자 인증과 DB 저장 구조를 확정하기 전까지 저장 기록 기능은 비활성화되어 있습니다.
        </p>
        <button type="button" disabled
          className="mt-5 inline-flex cursor-not-allowed rounded-lg border border-line bg-panel-2 px-4 py-2 text-sm font-bold text-txt-faint opacity-70">
          저장 기록 준비 중
        </button>
      </div>
    </main>
  );
}
